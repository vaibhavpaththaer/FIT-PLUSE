package controller;


import dao.NotificationDAO;
import dao.UserDAO;
import dao.WorkoutDAO;
import model.User;
import model.Workout;
import model.WorkoutExercise;
import util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Date;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Controller servlet for Workout & Exercise management.
 * Handles user workout viewing, exercise details, starting, completing,
 * workout history, and coach workout creation/assignment/editing/deleting.
 */
@WebServlet(name = "WorkoutServlet", urlPatterns = {"/api/workouts", "/api/workouts/*", "/workouts"})
public class WorkoutServlet extends HttpServlet {

    private final WorkoutDAO workoutDAO = new WorkoutDAO();
    private final UserDAO userDAO = new UserDAO();

    private final NotificationDAO notificationDAO = new NotificationDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setupResponse(resp);
        PrintWriter out = resp.getWriter();

        User user = getAuthenticatedUser(req);
        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required. Please sign in.\"}");
            return;
        }

        String pathInfo = req.getPathInfo();
        String typeParam = req.getParameter("type");
        String idParam = req.getParameter("id");
        int userId = user.getId();
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        try {
            // 1. GET /api/workouts/today (or ?type=today)
            if ("/today".equalsIgnoreCase(pathInfo) || "today".equalsIgnoreCase(typeParam)) {
                Date today = new Date(System.currentTimeMillis());
                Workout workout = workoutDAO.getWorkoutByDate(userId, today);
                if (workout == null) {
                    List<Workout> pending = workoutDAO.getPendingWorkoutsByUserId(userId);
                    if (!pending.isEmpty()) {
                        workout = pending.get(0);
                    } else {
                        List<Workout> all = workoutDAO.getWorkoutsByUserId(userId);
                        if (!all.isEmpty()) {
                            workout = all.get(0);
                        }
                    }
                }
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"workout\":" + (workout != null ? JsonUtil.workoutToJson(workout) : "null") + "}");
                return;
            }

            // 2. GET /api/workouts/history (or ?type=history)
            if ("/history".equalsIgnoreCase(pathInfo) || "history".equalsIgnoreCase(typeParam)) {
                String limitStr = req.getParameter("limit");
                int limit = (limitStr != null && !limitStr.isEmpty()) ? Integer.parseInt(limitStr) : 20;
                List<Workout> history = workoutDAO.getRecentWorkoutHistory(userId, limit);
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"workouts\":" + JsonUtil.workoutListToJson(history) + "}");
                return;
            }

            // 3. GET /api/workouts/pending (or ?type=pending)
            if ("/pending".equalsIgnoreCase(pathInfo) || "pending".equalsIgnoreCase(typeParam)) {
                List<Workout> pending = workoutDAO.getPendingWorkoutsByUserId(userId);
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"workouts\":" + JsonUtil.workoutListToJson(pending) + "}");
                return;
            }

            // 4. GET /api/workouts/coach (or coach viewing their assigned workouts)
            if ("/coach".equalsIgnoreCase(pathInfo) || "coach".equalsIgnoreCase(typeParam)) {
                if (!isCoach) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"Coach authorization required.\"}");
                    return;
                }
                List<Workout> coachWorkouts = workoutDAO.getWorkoutsByCoachId(userId);
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"workouts\":" + JsonUtil.workoutListToJson(coachWorkouts) + "}");
                return;
            }

            // 5. GET /api/workouts/{id} or /api/workouts?id=X
            Integer workoutId = extractId(pathInfo, idParam);
            if (workoutId != null) {
                Workout workout = workoutDAO.getWorkoutById(workoutId);
                if (workout == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"success\":false,\"message\":\"Workout not found.\"}");
                    return;
                }

                // Authorization check: User can only access own workout unless Coach/Admin
                boolean isOwner = workout.getUserId() == userId;
                boolean isAssigningCoach = workout.getCoachId() != null && workout.getCoachId() == userId;
                if (!isOwner && !isCoach && !isAssigningCoach) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"Access denied. You do not have permission to view this workout.\"}");
                    return;
                }

                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"workout\":" + JsonUtil.workoutToJson(workout) + "}");
                return;
            }

            // 6. GET /api/workouts (Default List)
            // If Coach requests specific user workouts via ?userId=X
            String targetUserStr = req.getParameter("userId");
            if (targetUserStr != null && !targetUserStr.trim().isEmpty()) {
                int targetUserId = Integer.parseInt(targetUserStr.trim());
                if (!isCoach && targetUserId != userId) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"Access denied. You can only view your own workouts.\"}");
                    return;
                }
                List<Workout> userWorkouts = workoutDAO.getWorkoutsByUserId(targetUserId);
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"workouts\":" + JsonUtil.workoutListToJson(userWorkouts) + "}");
                return;
            }

            // Default athlete view: return own workouts
            List<Workout> userWorkouts = workoutDAO.getWorkoutsByUserId(userId);
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"workouts\":" + JsonUtil.workoutListToJson(userWorkouts) + "}");

        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid numeric ID parameter.\"}");
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setupResponse(resp);
        PrintWriter out = resp.getWriter();

        User user = getAuthenticatedUser(req);
        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required. Please sign in.\"}");
            return;
        }

        String pathInfo = req.getPathInfo();
        String action = req.getParameter("action");
        String body = readRequestBody(req);
        Map<String, String> jsonParams = JsonUtil.parseSimpleJson(body);

        int userId = user.getId();
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        try {
            // 1. Complete Workout: POST /api/workouts/complete or action=complete
            if ("/complete".equalsIgnoreCase(pathInfo) || "complete".equalsIgnoreCase(action) || (pathInfo != null && pathInfo.endsWith("/complete"))) {
                int workoutId = parseWorkoutId(req, pathInfo, jsonParams);
                if (workoutId <= 0) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Missing or invalid workoutId.\"}");
                    return;
                }

                Workout existing = workoutDAO.getWorkoutById(workoutId);
                if (existing == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"success\":false,\"message\":\"Workout not found.\"}");
                    return;
                }

                // Verify Ownership
                if (existing.getUserId() != userId && !isCoach) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"You can only complete your own workouts.\"}");
                    return;
                }

                int calories = parseParamInt(req, jsonParams, "caloriesBurned", existing.getCaloriesBurned());
                if (calories <= 0) calories = existing.getCaloriesBurned() > 0 ? existing.getCaloriesBurned() : 350;
                int duration = parseParamInt(req, jsonParams, "durationMin", existing.getDurationMin());
                if (duration <= 0) duration = existing.getDurationMin() > 0 ? existing.getDurationMin() : 45;

                boolean success = workoutDAO.completeWorkout(workoutId, existing.getUserId(), calories, duration);
                if (success) {
                    // Auto-create notification for workout completion
                    try {
                        model.Notification notif = new model.Notification(
                                existing.getUserId(),
                                "\uD83C\uDFCB\uFE0F Workout Completed",
                                "Great job! You completed \"" + existing.getTitle() + "\" and burned " + calories + " kcal in " + duration + " min.",
                                "workout",
                                "progress"
                        );
                        notificationDAO.createNotification(notif);
                    } catch (Exception ignored) {}

                    // Fetch updated user stats for instant UI sync
                    User updatedUser = userDAO.getUserById(userId);
                    if (updatedUser != null) {
                        req.getSession().setAttribute("user", updatedUser);
                    }
                    resp.setStatus(HttpServletResponse.SC_OK);
                    out.write("{\"success\":true,\"message\":\"Workout marked as completed! Metrics synchronized.\",\"workoutId\":" + workoutId + ",\"caloriesBurned\":" + calories + ",\"durationMin\":" + duration + "}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\":false,\"message\":\"Failed to update workout completion status.\"}");
                }
                return;
            }

            // 2. Start Workout: POST /api/workouts/start or action=start
            if ("/start".equalsIgnoreCase(pathInfo) || "start".equalsIgnoreCase(action) || (pathInfo != null && pathInfo.endsWith("/start"))) {
                int workoutId = parseWorkoutId(req, pathInfo, jsonParams);
                Workout existing = (workoutId > 0) ? workoutDAO.getWorkoutById(workoutId) : null;
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"message\":\"Workout session started.\",\"workoutId\":" + workoutId + ",\"startTime\":" + System.currentTimeMillis() + ",\"workout\":" + (existing != null ? JsonUtil.workoutToJson(existing) : "null") + "}");
                return;
            }

            // 3. Update Workout: POST /api/workouts/update or action=update
            if ("/update".equalsIgnoreCase(pathInfo) || "update".equalsIgnoreCase(action)) {
                handleWorkoutUpdate(req, resp, out, body, jsonParams, userId, isCoach);
                return;
            }

            // 4. Delete Workout: POST /api/workouts/delete or action=delete
            if ("/delete".equalsIgnoreCase(pathInfo) || "delete".equalsIgnoreCase(action)) {
                handleWorkoutDelete(req, resp, out, jsonParams, userId, isCoach);
                return;
            }

            // 5. Create / Assign Workout: POST /api/workouts
            handleWorkoutCreate(req, resp, out, body, jsonParams, userId, isCoach);

        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setupResponse(resp);
        PrintWriter out = resp.getWriter();

        User user = getAuthenticatedUser(req);
        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required. Please sign in.\"}");
            return;
        }

        String body = readRequestBody(req);
        Map<String, String> jsonParams = JsonUtil.parseSimpleJson(body);
        int userId = user.getId();
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        try {
            handleWorkoutUpdate(req, resp, out, body, jsonParams, userId, isCoach);
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        setupResponse(resp);
        PrintWriter out = resp.getWriter();

        User user = getAuthenticatedUser(req);
        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required. Please sign in.\"}");
            return;
        }

        Map<String, String> jsonParams = JsonUtil.parseSimpleJson(readRequestBody(req));
        int userId = user.getId();
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        try {
            handleWorkoutDelete(req, resp, out, jsonParams, userId, isCoach);
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    // =========================================================================
    // HELPER HANDLERS
    // =========================================================================

    private void handleWorkoutCreate(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                     String body, Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        String title = parseParam(req, jsonParams, "title");
        if (title == null || title.trim().isEmpty()) {
            title = parseParam(req, jsonParams, "workoutTitle");
        }
        if (title == null || title.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Workout title is required.\"}");
            return;
        }

        String category = parseParam(req, jsonParams, "category");
        if (category == null || category.trim().isEmpty()) category = "Strength & Hypertrophy";

        String targetMuscle = parseParam(req, jsonParams, "targetMuscle");
        if (targetMuscle == null || targetMuscle.trim().isEmpty()) targetMuscle = "Full Body";

        String difficulty = parseParam(req, jsonParams, "difficulty");
        if (difficulty == null || difficulty.trim().isEmpty()) difficulty = "intermediate";

        int durationMin = parseParamInt(req, jsonParams, "durationMin", 45);
        int caloriesBurned = parseParamInt(req, jsonParams, "caloriesBurned", 350);

        String scheduledDateStr = parseParam(req, jsonParams, "scheduledDate");
        Date scheduledDate = (scheduledDateStr != null && !scheduledDateStr.isEmpty())
                ? Date.valueOf(scheduledDateStr)
                : new Date(System.currentTimeMillis());

        String scheduledTime = parseParam(req, jsonParams, "scheduledTime");
        if (scheduledTime == null || scheduledTime.trim().isEmpty()) scheduledTime = "18:00";

        String notes = parseParam(req, jsonParams, "notes");

        // Target User Assignment
        int targetUserId = userId;
        String targetUserStr = parseParam(req, jsonParams, "userId");
        if (targetUserStr != null && !targetUserStr.trim().isEmpty()) {
            int requestedTarget = Integer.parseInt(targetUserStr.trim());
            if (isCoach) {
                targetUserId = requestedTarget;
            } else if (requestedTarget != userId) {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.write("{\"success\":false,\"message\":\"Only coaches can assign workouts to other users.\"}");
                return;
            }
        }

        Workout workout = new Workout();
        if (isCoach) {
            workout.setCoachId(userId);
        }
        workout.setUserId(targetUserId);
        workout.setTitle(title.trim());
        workout.setCategory(category.trim());
        workout.setTargetMuscle(targetMuscle.trim());
        workout.setDifficulty(difficulty.toLowerCase().trim());
        workout.setDurationMin(durationMin);
        workout.setCaloriesBurned(caloriesBurned);
        workout.setScheduledDate(scheduledDate);
        workout.setScheduledTime(scheduledTime);
        workout.setCompleted(false);
        workout.setNotes(notes);

        // Parse Exercises from request if present
        List<WorkoutExercise> exercises = parseExercisesFromBody(body);
        if (exercises.isEmpty()) {
            exercises = parseExercisesFromParams(req);
        }
        workout.setExercises(exercises);

        int newId = workoutDAO.createWorkoutWithExercises(workout);
        if (newId > 0) {
            // Auto-create notification for new workout assignment
            try {
                model.Notification notif = new model.Notification(
                        workout.getUserId(),
                        "\uD83D\uDD14 New Workout Assigned",
                        "New workout assigned: " + workout.getTitle() + " (" + workout.getCategory() + ", " + workout.getDurationMin() + " min)",
                        "workout",
                        "workouts"
                );
                notificationDAO.createNotification(notif);
            } catch (Exception ignored) {}

            resp.setStatus(HttpServletResponse.SC_CREATED);
            out.write("{\"success\":true,\"message\":\"Workout created successfully!\",\"workoutId\":" + newId + ",\"workout\":" + JsonUtil.workoutToJson(workoutDAO.getWorkoutById(newId)) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to create workout in database.\"}");
        }
    }

    private void handleWorkoutUpdate(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                     String body, Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        int workoutId = parseWorkoutId(req, req.getPathInfo(), jsonParams);
        if (workoutId <= 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing workout ID for update.\"}");
            return;
        }

        Workout existing = workoutDAO.getWorkoutById(workoutId);
        if (existing == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Workout not found.\"}");
            return;
        }

        boolean isOwner = existing.getUserId() == userId;
        boolean isAssigningCoach = existing.getCoachId() != null && existing.getCoachId() == userId;
        if (!isOwner && !isCoach && !isAssigningCoach) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You do not have permission to edit this workout.\"}");
            return;
        }

        String title = parseParam(req, jsonParams, "title");
        if (title != null && !title.trim().isEmpty()) existing.setTitle(title.trim());

        String category = parseParam(req, jsonParams, "category");
        if (category != null && !category.trim().isEmpty()) existing.setCategory(category.trim());

        String targetMuscle = parseParam(req, jsonParams, "targetMuscle");
        if (targetMuscle != null && !targetMuscle.trim().isEmpty()) existing.setTargetMuscle(targetMuscle.trim());

        String difficulty = parseParam(req, jsonParams, "difficulty");
        if (difficulty != null && !difficulty.trim().isEmpty()) existing.setDifficulty(difficulty.trim());

        int durationMin = parseParamInt(req, jsonParams, "durationMin", existing.getDurationMin());
        existing.setDurationMin(durationMin);

        int calories = parseParamInt(req, jsonParams, "caloriesBurned", existing.getCaloriesBurned());
        existing.setCaloriesBurned(calories);

        String scheduledDateStr = parseParam(req, jsonParams, "scheduledDate");
        if (scheduledDateStr != null && !scheduledDateStr.isEmpty()) {
            existing.setScheduledDate(Date.valueOf(scheduledDateStr));
        }

        String scheduledTime = parseParam(req, jsonParams, "scheduledTime");
        if (scheduledTime != null && !scheduledTime.trim().isEmpty()) existing.setScheduledTime(scheduledTime.trim());

        String notes = parseParam(req, jsonParams, "notes");
        if (notes != null) existing.setNotes(notes);

        String isCompletedStr = parseParam(req, jsonParams, "isCompleted");
        if (isCompletedStr != null) {
            existing.setCompleted(Boolean.parseBoolean(isCompletedStr));
        }

        // Exercises update if present
        List<WorkoutExercise> newExercises = parseExercisesFromBody(body);
        if (!newExercises.isEmpty()) {
            existing.setExercises(newExercises);
        }

        boolean updated = workoutDAO.updateWorkoutWithExercises(existing);
        if (updated) {
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Workout updated successfully.\",\"workout\":" + JsonUtil.workoutToJson(workoutDAO.getWorkoutById(workoutId)) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to update workout.\"}");
        }
    }

    private void handleWorkoutDelete(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                     Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        int workoutId = parseWorkoutId(req, req.getPathInfo(), jsonParams);
        if (workoutId <= 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing workout ID for deletion.\"}");
            return;
        }

        Workout existing = workoutDAO.getWorkoutById(workoutId);
        if (existing == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Workout not found.\"}");
            return;
        }

        boolean isOwner = existing.getUserId() == userId;
        boolean isAssigningCoach = existing.getCoachId() != null && existing.getCoachId() == userId;
        if (!isOwner && !isCoach && !isAssigningCoach) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You do not have permission to delete this workout.\"}");
            return;
        }

        boolean deleted = workoutDAO.deleteWorkout(workoutId);
        if (deleted) {
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Workout deleted successfully.\",\"workoutId\":" + workoutId + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to delete workout.\"}");
        }
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    private User getAuthenticatedUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute("user");
    }

    private void setupResponse(HttpServletResponse resp) {
        resp.setContentType("application/json; charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        resp.setHeader("Pragma", "no-cache");
    }

    private String readRequestBody(HttpServletRequest req) {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        } catch (Exception ignored) {}
        return sb.toString().trim();
    }

    private Integer extractId(String pathInfo, String idParam) {
        if (idParam != null && !idParam.trim().isEmpty()) {
            try {
                return Integer.parseInt(idParam.trim());
            } catch (NumberFormatException ignored) {}
        }
        if (pathInfo != null && pathInfo.length() > 1) {
            String clean = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
            if (!clean.equalsIgnoreCase("today") && !clean.equalsIgnoreCase("history") &&
                    !clean.equalsIgnoreCase("pending") && !clean.equalsIgnoreCase("coach") &&
                    !clean.equalsIgnoreCase("complete") && !clean.equalsIgnoreCase("start") &&
                    !clean.equalsIgnoreCase("update") && !clean.equalsIgnoreCase("delete")) {
                try {
                    return Integer.parseInt(clean);
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
    }

    private int parseWorkoutId(HttpServletRequest req, String pathInfo, Map<String, String> jsonParams) {
        String idStr = parseParam(req, jsonParams, "workoutId");
        if (idStr == null) idStr = parseParam(req, jsonParams, "id");
        if (idStr != null && !idStr.trim().isEmpty()) {
            try {
                return Integer.parseInt(idStr.trim());
            } catch (NumberFormatException ignored) {}
        }
        if (pathInfo != null && pathInfo.contains("/")) {
            String[] parts = pathInfo.split("/");
            for (String part : parts) {
                if (part.matches("\\d+")) {
                    return Integer.parseInt(part);
                }
            }
        }
        return -1;
    }

    private String parseParam(HttpServletRequest req, Map<String, String> jsonParams, String name) {
        String val = req.getParameter(name);
        if (val == null && jsonParams != null) {
            val = jsonParams.get(name);
        }
        return val;
    }

    private int parseParamInt(HttpServletRequest req, Map<String, String> jsonParams, String name, int defaultVal) {
        String val = parseParam(req, jsonParams, name);
        if (val != null && !val.trim().isEmpty()) {
            try {
                return Integer.parseInt(val.trim());
            } catch (NumberFormatException ignored) {}
        }
        return defaultVal;
    }

    /**
     * Parses exercise objects from a raw JSON array string if present in request body.
     */
    private List<WorkoutExercise> parseExercisesFromBody(String body) {
        List<WorkoutExercise> list = new ArrayList<>();
        if (body == null || !body.contains("\"exercises\"")) return list;

        int startIdx = body.indexOf("\"exercises\"");
        int arrayStart = body.indexOf("[", startIdx);
        int arrayEnd = body.lastIndexOf("]");
        if (arrayStart == -1 || arrayEnd == -1 || arrayEnd <= arrayStart) return list;

        String arrayContent = body.substring(arrayStart + 1, arrayEnd);
        Pattern objPattern = Pattern.compile("\\{([^}]+)\\}");
        Matcher objMatcher = objPattern.matcher(arrayContent);

        int order = 1;
        while (objMatcher.find()) {
            String objStr = "{" + objMatcher.group(1) + "}";
            Map<String, String> map = JsonUtil.parseSimpleJson(objStr);
            if (map.containsKey("exerciseName") || map.containsKey("name")) {
                WorkoutExercise ex = new WorkoutExercise();
                ex.setExerciseName(map.getOrDefault("exerciseName", map.get("name")));
                ex.setSets(map.containsKey("sets") ? Integer.parseInt(map.get("sets")) : 3);
                ex.setReps(map.containsKey("reps") ? Integer.parseInt(map.get("reps")) : 10);
                ex.setWeightKg(map.containsKey("weightKg") ? Double.parseDouble(map.get("weightKg")) : 0.0);
                ex.setRestSec(map.containsKey("restSec") ? Integer.parseInt(map.get("restSec")) : 60);
                ex.setOrderIdx(map.containsKey("orderIdx") ? Integer.parseInt(map.get("orderIdx")) : order++);
                ex.setNotes(map.get("notes"));
                list.add(ex);
            }
        }
        return list;
    }

    private List<WorkoutExercise> parseExercisesFromParams(HttpServletRequest req) {
        List<WorkoutExercise> list = new ArrayList<>();
        String[] names = req.getParameterValues("exerciseName");
        if (names == null) names = req.getParameterValues("exercises[]");
        if (names == null) return list;

        String[] sets = req.getParameterValues("sets");
        String[] reps = req.getParameterValues("reps");
        String[] weights = req.getParameterValues("weightKg");
        String[] rests = req.getParameterValues("restSec");

        for (int i = 0; i < names.length; i++) {
            if (names[i] == null || names[i].trim().isEmpty()) continue;
            WorkoutExercise ex = new WorkoutExercise();
            ex.setExerciseName(names[i].trim());
            ex.setSets(sets != null && i < sets.length ? Integer.parseInt(sets[i]) : 3);
            ex.setReps(reps != null && i < reps.length ? Integer.parseInt(reps[i]) : 10);
            ex.setWeightKg(weights != null && i < weights.length ? Double.parseDouble(weights[i]) : 0.0);
            ex.setRestSec(rests != null && i < rests.length ? Integer.parseInt(rests[i]) : 60);
            ex.setOrderIdx(i + 1);
            list.add(ex);
        }
        return list;
    }
}
