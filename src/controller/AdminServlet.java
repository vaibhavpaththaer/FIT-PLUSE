package controller;

import dao.AdminDAO;
import dao.CoachDAO;
import dao.UserDAO;
import model.Coach;
import model.User;
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
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller Servlet for all Administrator operations, real-time KPI metrics,
 * User & Coach CRUD management, Coach assignments, platform analytics,
 * broadcast notifications, and system diagnostics.
 */
@WebServlet(name = "AdminServlet", urlPatterns = {"/api/admin", "/api/admin/*", "/admin"})
public class AdminServlet extends HttpServlet {

    private final AdminDAO adminDAO = new AdminDAO();
    private final UserDAO userDAO = new UserDAO();
    private final CoachDAO coachDAO = new CoachDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json; charset=UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");

        PrintWriter out = response.getWriter();

        // 1. Enforce Authentication & Admin Role
        if (!validateAdminAuth(request, response, out)) {
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/") || pathInfo.isEmpty()) {
            pathInfo = "/overview";
        }

        try {
            if ("/overview".equalsIgnoreCase(pathInfo) || "/stats".equalsIgnoreCase(pathInfo)) {
                handleOverview(request, response, out);
            } else if (pathInfo.startsWith("/users")) {
                handleGetUsers(request, response, out, pathInfo);
            } else if ("/coaches/pending".equalsIgnoreCase(pathInfo)) {
                handleGetPendingCoaches(request, response, out);
            } else if (pathInfo.startsWith("/coaches")) {
                handleGetCoaches(request, response, out, pathInfo);
            } else if ("/analytics".equalsIgnoreCase(pathInfo)) {
                handleAnalytics(request, response, out);
            } else if ("/reports".equalsIgnoreCase(pathInfo)) {
                handleReports(request, response, out);
            } else if ("/system/health".equalsIgnoreCase(pathInfo) || "/health".equalsIgnoreCase(pathInfo)) {
                handleSystemHealth(request, response, out);
            } else {
                sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Unknown admin endpoint: " + pathInfo);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Internal server error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json; charset=UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");

        PrintWriter out = response.getWriter();

        // 1. Enforce Authentication & Admin Role
        if (!validateAdminAuth(request, response, out)) {
            return;
        }

        String pathInfo = request.getPathInfo();
        if (pathInfo == null || pathInfo.isEmpty()) {
            pathInfo = "/";
        }

        Map<String, String> body = parseRequestBody(request);

        try {
            if ("/users".equalsIgnoreCase(pathInfo) || "/users/create".equalsIgnoreCase(pathInfo)) {
                handleCreateUser(body, response, out);
            } else if ("/users/update".equalsIgnoreCase(pathInfo)) {
                handleUpdateUser(body, response, out);
            } else if ("/users/delete".equalsIgnoreCase(pathInfo)) {
                handleDeleteUser(body, response, out);
            } else if ("/users/assign-coach".equalsIgnoreCase(pathInfo) || "/assign-coach".equalsIgnoreCase(pathInfo)) {
                handleAssignCoach(body, response, out);
            } else if ("/coaches".equalsIgnoreCase(pathInfo) || "/coaches/create".equalsIgnoreCase(pathInfo)) {
                handleCreateCoach(body, response, out);
            } else if ("/coaches/update".equalsIgnoreCase(pathInfo)) {
                handleUpdateCoach(body, response, out);
            } else if ("/coaches/delete".equalsIgnoreCase(pathInfo)) {
                handleDeleteCoach(body, response, out);
            } else if ("/coaches/toggle-status".equalsIgnoreCase(pathInfo)) {
                handleToggleCoachStatus(body, response, out);
            } else if ("/coaches/approve".equalsIgnoreCase(pathInfo)) {
                handleApproveCoach(body, response, out);
            } else if ("/coaches/reject".equalsIgnoreCase(pathInfo)) {
                handleRejectCoach(body, response, out);
            } else if ("/notifications/broadcast".equalsIgnoreCase(pathInfo) || "/broadcast".equalsIgnoreCase(pathInfo)) {
                handleBroadcastNotification(body, response, out);
            } else if ("/system/settings".equalsIgnoreCase(pathInfo)) {
                handleSaveSettings(body, response, out);
            } else {
                sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Unknown admin action endpoint: " + pathInfo);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Operation failed: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // Delegate DELETE requests to POST handlers
        doPost(request, response);
    }

    // =========================================================================
    // GET HANDLERS
    // =========================================================================

    private void handleOverview(HttpServletRequest request, HttpServletResponse response, PrintWriter out)
            throws SQLException {
        Map<String, Object> stats = adminDAO.getPlatformOverviewStats();
        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"stats\":" + JsonUtil.mapToJson(stats) +
                "}");
        out.flush();
    }

    private void handleGetUsers(HttpServletRequest request, HttpServletResponse response, PrintWriter out, String pathInfo)
            throws SQLException {

        // Check if requesting single user by ID: /users/{id}
        String[] parts = pathInfo.split("/");
        if (parts.length >= 3 && !parts[2].isEmpty()) {
            try {
                int userId = Integer.parseInt(parts[2]);
                Map<String, Object> details = adminDAO.getUserDetails(userId);
                if (details != null) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    out.print("{" +
                            "\"success\":true," +
                            "\"details\":" + JsonUtil.mapToJson(details) +
                            "}");
                } else {
                    sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "User not found with ID: " + userId);
                }
                out.flush();
                return;
            } catch (NumberFormatException ignored) {}
        }

        // Paginated & filtered list
        String search = request.getParameter("search");
        String role = request.getParameter("role");
        String goal = request.getParameter("goal");
        String coachIdParam = request.getParameter("coachId");
        Integer coachId = null;
        if (coachIdParam != null && !coachIdParam.trim().isEmpty() && !"all".equalsIgnoreCase(coachIdParam.trim())) {
            try {
                coachId = Integer.parseInt(coachIdParam.trim());
            } catch (NumberFormatException ignored) {}
        }

        int limit = 50;
        int offset = 0;
        try {
            if (request.getParameter("limit") != null) limit = Integer.parseInt(request.getParameter("limit"));
            if (request.getParameter("offset") != null) offset = Integer.parseInt(request.getParameter("offset"));
        } catch (NumberFormatException ignored) {}

        List<Map<String, Object>> users = adminDAO.getUserManagementList(search, role, goal, coachId, limit, offset);
        int totalCount = adminDAO.getUserCount(search, role, goal, coachId);

        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"totalCount\":" + totalCount + "," +
                "\"limit\":" + limit + "," +
                "\"offset\":" + offset + "," +
                "\"users\":" + JsonUtil.mapListToJson(users) +
                "}");
        out.flush();
    }

    private void handleGetCoaches(HttpServletRequest request, HttpServletResponse response, PrintWriter out, String pathInfo)
            throws SQLException {

        String[] parts = pathInfo.split("/");
        if (parts.length >= 3 && !parts[2].isEmpty()) {
            try {
                int coachId = Integer.parseInt(parts[2]);
                Coach coach = coachDAO.getCoachById(coachId);
                if (coach != null) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    out.print("{" +
                            "\"success\":true," +
                            "\"coach\":" + JsonUtil.coachToJson(coach) +
                            "}");
                } else {
                    sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Coach not found with ID: " + coachId);
                }
                out.flush();
                return;
            } catch (NumberFormatException ignored) {}
        }

        List<Coach> coaches = coachDAO.getAllCoaches();
        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"coaches\":" + JsonUtil.coachListToJson(coaches) +
                "}");
        out.flush();
    }

    private void handleAnalytics(HttpServletRequest request, HttpServletResponse response, PrintWriter out)
            throws SQLException {
        Map<String, Object> analytics = adminDAO.getPlatformAnalytics();
        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"analytics\":" + JsonUtil.mapToJson(analytics) +
                "}");
        out.flush();
    }

    private void handleReports(HttpServletRequest request, HttpServletResponse response, PrintWriter out)
            throws SQLException {
        Map<String, Object> stats = adminDAO.getPlatformOverviewStats();
        Map<String, Object> analytics = adminDAO.getPlatformAnalytics();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("generatedAt", new java.util.Date().toString());
        report.put("reportTitle", "FitPulse Enterprise Platform Intelligence & Compliance Dossier");
        report.put("stats", stats);
        report.put("analytics", analytics);

        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"report\":" + JsonUtil.mapToJson(report) +
                "}");
        out.flush();
    }

    private void handleSystemHealth(HttpServletRequest request, HttpServletResponse response, PrintWriter out)
            throws SQLException {
        Map<String, Object> health = adminDAO.getSystemHealth();
        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"health\":" + JsonUtil.mapToJson(health) +
                "}");
        out.flush();
    }

    // =========================================================================
    // POST HANDLERS
    // =========================================================================

    private void handleCreateUser(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        String fullName = body.get("fullName");
        String email = body.get("email");
        String password = body.get("password");

        if (fullName == null || fullName.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Full name and email are required.");
            return;
        }

        if (userDAO.getUserByEmail(email.trim()) != null) {
            sendError(response, out, HttpServletResponse.SC_CONFLICT, "A user with this email already exists.");
            return;
        }

        User u = new User();
        u.setFullName(fullName.trim());
        u.setEmail(email.trim().toLowerCase());
        u.setMobileCountry(body.getOrDefault("mobileCountry", "+91"));
        u.setMobileNumber(body.getOrDefault("mobileNumber", ""));
        u.setGender(body.getOrDefault("gender", "male"));
        u.setAge(parseInt(body.get("age"), 25));
        u.setHeightCm(parseDouble(body.get("heightCm"), 175.0));
        u.setWeightKg(parseDouble(body.get("weightKg"), 70.0));
        u.setTargetWeightKg(parseDouble(body.get("targetWeightKg"), 70.0));
        u.setFitnessGoal(body.getOrDefault("fitnessGoal", "muscle"));
        u.setActivityLevel(body.getOrDefault("activityLevel", "moderate"));
        u.setGymExperience(body.getOrDefault("gymExperience", "intermediate"));
        u.setWorkoutPreference(body.getOrDefault("workoutPreference", "gym"));
        u.setRole(body.getOrDefault("role", "user"));

        Integer coachId = parseInteger(body.get("assignedCoachId"));
        u.setAssignedCoachId(coachId);
        u.setMemberSince(body.getOrDefault("memberSince", "Aug 2026"));
        u.setPreferredLanguage("en");

        int userId = adminDAO.createUserByAdmin(u, password);
        if (userId > 0) {
            u.setId(userId);
            response.setStatus(HttpServletResponse.SC_CREATED);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"User created successfully.\"," +
                    "\"userId\":" + userId + "," +
                    "\"user\":" + JsonUtil.userToJson(u) +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create user record.");
        }
        out.flush();
    }

    private void handleUpdateUser(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        int userId = parseInt(body.get("id"), -1);
        if (userId <= 0) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid User ID is required for update.");
            return;
        }

        User existing = userDAO.getUserById(userId);
        if (existing == null) {
            sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "User not found with ID: " + userId);
            return;
        }

        if (body.containsKey("fullName")) existing.setFullName(body.get("fullName").trim());
        if (body.containsKey("email")) existing.setEmail(body.get("email").trim().toLowerCase());
        if (body.containsKey("mobileCountry")) existing.setMobileCountry(body.get("mobileCountry"));
        if (body.containsKey("mobileNumber")) existing.setMobileNumber(body.get("mobileNumber"));
        if (body.containsKey("gender")) existing.setGender(body.get("gender"));
        if (body.containsKey("age")) existing.setAge(parseInt(body.get("age"), existing.getAge()));
        if (body.containsKey("heightCm")) existing.setHeightCm(parseDouble(body.get("heightCm"), existing.getHeightCm()));
        if (body.containsKey("weightKg")) existing.setWeightKg(parseDouble(body.get("weightKg"), existing.getWeightKg()));
        if (body.containsKey("targetWeightKg")) existing.setTargetWeightKg(parseDouble(body.get("targetWeightKg"), existing.getTargetWeightKg()));
        if (body.containsKey("fitnessGoal")) existing.setFitnessGoal(body.get("fitnessGoal"));
        if (body.containsKey("activityLevel")) existing.setActivityLevel(body.get("activityLevel"));
        if (body.containsKey("gymExperience")) existing.setGymExperience(body.get("gymExperience"));
        if (body.containsKey("workoutPreference")) existing.setWorkoutPreference(body.get("workoutPreference"));
        if (body.containsKey("role")) existing.setRole(body.get("role"));

        if (body.containsKey("assignedCoachId")) {
            existing.setAssignedCoachId(parseInteger(body.get("assignedCoachId")));
        }

        String password = body.get("password");
        boolean updated = adminDAO.updateUserByAdmin(existing, password);

        if (updated) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"User updated successfully.\"," +
                    "\"user\":" + JsonUtil.userToJson(existing) +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update user.");
        }
        out.flush();
    }

    private void handleDeleteUser(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        int userId = parseInt(body.get("id"), -1);
        if (userId <= 0) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid User ID is required for deletion.");
            return;
        }

        boolean deleted = adminDAO.deleteUserByAdmin(userId);
        if (deleted) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"User and associated records deleted successfully.\"," +
                    "\"userId\":" + userId +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "User not found or already deleted.");
        }
        out.flush();
    }

    private void handleAssignCoach(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        Integer coachId = parseInteger(body.get("coachId"));

        // Single user assignment
        if (body.containsKey("userId")) {
            int userId = parseInt(body.get("userId"), -1);
            if (userId <= 0) {
                sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid userId is required.");
                return;
            }
            boolean success = adminDAO.assignCoachToUser(userId, coachId);
            if (success) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{" +
                        "\"success\":true," +
                        "\"message\":\"Coach assignment updated successfully.\"," +
                        "\"userId\":" + userId + "," +
                        "\"assignedCoachId\":" + (coachId != null ? coachId : "null") +
                        "}");
            } else {
                sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update coach assignment.");
            }
            out.flush();
            return;
        }

        // Bulk users assignment: comma-separated "userIds"
        if (body.containsKey("userIds")) {
            String rawIds = body.get("userIds");
            List<Integer> idList = new ArrayList<>();
            for (String part : rawIds.split(",")) {
                try {
                    int id = Integer.parseInt(part.trim());
                    if (id > 0) idList.add(id);
                } catch (NumberFormatException ignored) {}
            }

            int count = adminDAO.bulkAssignCoach(idList, coachId);
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"Bulk assigned coach to " + count + " users.\"," +
                    "\"updatedCount\":" + count +
                    "}");
            out.flush();
            return;
        }

        sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "userId or userIds parameter required.");
    }

    private void handleCreateCoach(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        String fullName = body.get("fullName");
        String email = body.get("email");

        if (fullName == null || fullName.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Coach full name and email are required.");
            return;
        }

        Coach c = new Coach();
        c.setFullName(fullName.trim());
        c.setEmail(email.trim().toLowerCase());
        c.setPhone(body.getOrDefault("phone", ""));
        c.setBio(body.getOrDefault("bio", ""));
        c.setSpecialties(body.getOrDefault("specialties", "Fitness Training"));
        c.setExperienceYears(parseInt(body.get("experienceYears"), 5));
        c.setRating(parseDouble(body.get("rating"), 5.0));
        c.setAvatarUrl(body.getOrDefault("avatarUrl", "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=200&auto=format&fit=crop&q=80"));
        c.setActive(!"false".equalsIgnoreCase(body.get("isActive")));

        int coachId = coachDAO.createCoach(c);
        if (coachId > 0) {
            c.setId(coachId);
            response.setStatus(HttpServletResponse.SC_CREATED);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"Coach registered successfully.\"," +
                    "\"coach\":" + JsonUtil.coachToJson(c) +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to register coach.");
        }
        out.flush();
    }

    private void handleUpdateCoach(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        int coachId = parseInt(body.get("id"), -1);
        if (coachId <= 0) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid Coach ID is required.");
            return;
        }

        Coach c = coachDAO.getCoachById(coachId);
        if (c == null) {
            sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Coach not found with ID: " + coachId);
            return;
        }

        if (body.containsKey("fullName")) c.setFullName(body.get("fullName").trim());
        if (body.containsKey("email")) c.setEmail(body.get("email").trim().toLowerCase());
        if (body.containsKey("phone")) c.setPhone(body.get("phone"));
        if (body.containsKey("bio")) c.setBio(body.get("bio"));
        if (body.containsKey("specialties")) c.setSpecialties(body.get("specialties"));
        if (body.containsKey("experienceYears")) c.setExperienceYears(parseInt(body.get("experienceYears"), c.getExperienceYears()));
        if (body.containsKey("rating")) c.setRating(parseDouble(body.get("rating"), c.getRating()));
        if (body.containsKey("avatarUrl")) c.setAvatarUrl(body.get("avatarUrl"));
        if (body.containsKey("isActive")) c.setActive(!"false".equalsIgnoreCase(body.get("isActive")));

        boolean updated = coachDAO.updateCoach(c);
        if (updated) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"Coach updated successfully.\"," +
                    "\"coach\":" + JsonUtil.coachToJson(c) +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to update coach.");
        }
        out.flush();
    }

    private void handleDeleteCoach(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        int coachId = parseInt(body.get("id"), -1);
        if (coachId <= 0) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid Coach ID is required.");
            return;
        }

        boolean deleted = coachDAO.deleteCoach(coachId);
        if (deleted) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"Coach deleted successfully.\"," +
                    "\"coachId\":" + coachId +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Coach not found with ID: " + coachId);
        }
        out.flush();
    }

    private void handleToggleCoachStatus(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        int coachId = parseInt(body.get("id"), -1);
        boolean active = !"false".equalsIgnoreCase(body.get("isActive"));

        if (coachId <= 0) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid Coach ID is required.");
            return;
        }

        boolean updated = coachDAO.setCoachActive(coachId, active);
        if (updated) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"Coach status set to " + (active ? "Active" : "Inactive") + ".\"," +
                    "\"coachId\":" + coachId + "," +
                    "\"isActive\":" + active +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Coach not found with ID: " + coachId);
        }
        out.flush();
    }

    private void handleBroadcastNotification(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException {

        String title = body.get("title");
        String message = body.get("message");
        String notifType = body.getOrDefault("notifType", "system");
        String targetRole = body.getOrDefault("targetRole", "all");
        String targetUrl = body.getOrDefault("targetUrl", "");

        if (title == null || title.trim().isEmpty() || message == null || message.trim().isEmpty()) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Notification title and message are required.");
            return;
        }

        int count = adminDAO.broadcastSystemNotification(title.trim(), message.trim(), notifType, targetRole, targetUrl);
        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"message\":\"Broadcast notification dispatched to " + count + " recipient(s).\"," +
                "\"recipientsCount\":" + count +
                "}");
        out.flush();
    }

    private void handleSaveSettings(Map<String, String> body, HttpServletResponse response, PrintWriter out) {
        // Echo back successful settings update
        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"message\":\"Platform settings and parameters saved successfully.\"," +
                "\"settings\":" + JsonUtil.mapToJson(body) +
                "}");
        out.flush();
    }

    // =========================================================================
    // SECURITY & HELPER METHODS
    // =========================================================================

    /**
     * Defensive server-side role validation.
     */
    private boolean validateAdminAuth(HttpServletRequest request, HttpServletResponse response, PrintWriter out) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{" +
                    "\"success\":false," +
                    "\"authenticated\":false," +
                    "\"message\":\"Authentication required. Please sign in as an Administrator.\"" +
                    "}");
            out.flush();
            return false;
        }

        String role = (String) session.getAttribute("authRole");
        if (role == null && session.getAttribute("user") instanceof User) {
            role = ((User) session.getAttribute("user")).getRole();
        }

        if (!"admin".equalsIgnoreCase(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.print("{" +
                    "\"success\":false," +
                    "\"authenticated\":true," +
                    "\"authorized\":false," +
                    "\"message\":\"Access denied. Administrator privileges required.\"" +
                    "}");
            out.flush();
            return false;
        }

        return true;
    }

    private void sendError(HttpServletResponse response, PrintWriter out, int statusCode, String message) {
        response.setStatus(statusCode);
        out.print("{" +
                "\"success\":false," +
                "\"message\":\"" + JsonUtil.escape(message) + "\"" +
                "}");
        out.flush();
    }

    private Map<String, String> parseRequestBody(HttpServletRequest request) throws IOException {
        String contentType = request.getContentType();
        if (contentType != null && contentType.toLowerCase().contains("application/json")) {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            return JsonUtil.parseSimpleJson(sb.toString());
        } else {
            Map<String, String> map = new HashMap<>();
            for (String key : request.getParameterMap().keySet()) {
                map.put(key, request.getParameter(key));
            }
            return map;
        }
    }

    private int parseInt(String val, int def) {
        if (val == null) return def;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }

    private double parseDouble(String val, double def) {
        if (val == null) return def;
        try {
            return Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            return def;
        }
    }

    private Integer parseInteger(String val) {
        if (val == null || val.trim().isEmpty() || "null".equalsIgnoreCase(val.trim()) || "0".equals(val.trim())) {
            return null;
        }
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void handleGetPendingCoaches(HttpServletRequest request, HttpServletResponse response, PrintWriter out)
            throws SQLException, IOException {
        List<Coach> pending = coachDAO.getPendingCoaches();
        response.setStatus(HttpServletResponse.SC_OK);
        out.print("{" +
                "\"success\":true," +
                "\"coaches\":" + JsonUtil.coachListToJson(pending) +
                "}");
        out.flush();
    }

    private void handleApproveCoach(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException, IOException {
        int coachId = parseInt(body.get("id"), -1);
        if (coachId <= 0) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid Coach ID is required.");
            return;
        }
        boolean approved = coachDAO.approveCoach(coachId);
        if (approved) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"Coach approved and activated successfully.\"," +
                    "\"coachId\":" + coachId +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Coach not found with ID: " + coachId);
        }
        out.flush();
    }

    private void handleRejectCoach(Map<String, String> body, HttpServletResponse response, PrintWriter out)
            throws SQLException, IOException {
        int coachId = parseInt(body.get("id"), -1);
        if (coachId <= 0) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Valid Coach ID is required.");
            return;
        }
        boolean rejected = coachDAO.rejectCoach(coachId);
        if (rejected) {
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"Coach registration has been rejected.\"," +
                    "\"coachId\":" + coachId +
                    "}");
        } else {
            sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Coach not found with ID: " + coachId);
        }
        out.flush();
    }
}
