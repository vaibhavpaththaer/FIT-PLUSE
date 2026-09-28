package controller;


import dao.DietDAO;
import dao.NotificationDAO;
import dao.UserDAO;
import model.DietMeal;
import model.DietPlan;
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
import java.sql.Date;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Controller servlet for Precision Diet & Nutrition management.
 * Handles active diet plan retrieval, itemized meal logging/editing/deleting,
 * diet plan history, diet preference switching, hydration tracking,
 * and coach assignment/updates with strict user/coach authorization.
 */
@WebServlet(name = "DietServlet", urlPatterns = {"/api/diet", "/api/diet/*", "/diet"})
public class DietServlet extends HttpServlet {

    private final DietDAO dietDAO = new DietDAO();
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
        Date today = new Date(System.currentTimeMillis());

        try {
            // 1. GET /api/diet/today or /api/diet/active (or ?type=today)
            if ("/today".equalsIgnoreCase(pathInfo) || "/active".equalsIgnoreCase(pathInfo) ||
                    "today".equalsIgnoreCase(typeParam) || "active".equalsIgnoreCase(typeParam) ||
                    (pathInfo == null || pathInfo.equals("/"))) {

                int targetUserId = userId;
                String userParam = req.getParameter("userId");
                if (userParam != null && !userParam.trim().isEmpty() && isCoach) {
                    try { targetUserId = Integer.parseInt(userParam.trim()); } catch (Exception ignored) {}
                }

                DietPlan plan = dietDAO.getActiveDietPlanByUserId(targetUserId);
                if (plan == null) {
                    // Auto-seed/create baseline plan for user based on profile diet preference
                    plan = createDefaultPlanForUser(targetUserId);
                }

                double waterLiters = dietDAO.getWaterIntake(targetUserId, today);

                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"dietPlan\":" + JsonUtil.dietPlanToJson(plan) +
                        ",\"waterLiters\":" + waterLiters + "}");
                return;
            }

            // 2. GET /api/diet/history (or ?type=history)
            if ("/history".equalsIgnoreCase(pathInfo) || "history".equalsIgnoreCase(typeParam)) {
                int targetUserId = userId;
                String userParam = req.getParameter("userId");
                if (userParam != null && !userParam.trim().isEmpty() && isCoach) {
                    try { targetUserId = Integer.parseInt(userParam.trim()); } catch (Exception ignored) {}
                }

                List<DietPlan> history = dietDAO.getDietPlansByUserId(targetUserId);
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"dietPlans\":" + JsonUtil.dietPlanListToJson(history) + "}");
                return;
            }

            // 3. GET /api/diet/coach (or ?type=coach)
            if ("/coach".equalsIgnoreCase(pathInfo) || "coach".equalsIgnoreCase(typeParam)) {
                if (!isCoach) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"Coach authorization required.\"}");
                    return;
                }
                List<DietPlan> coachPlans = dietDAO.getDietPlansByCoachId(userId);
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"dietPlans\":" + JsonUtil.dietPlanListToJson(coachPlans) + "}");
                return;
            }

            // 4. GET /api/diet/water (or ?type=water)
            if ("/water".equalsIgnoreCase(pathInfo) || "water".equalsIgnoreCase(typeParam)) {
                double waterLiters = dietDAO.getWaterIntake(userId, today);
                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"waterLiters\":" + waterLiters + "}");
                return;
            }

            // 5. GET /api/diet/{id} or /api/diet?id=X
            Integer planId = extractId(pathInfo, idParam);
            if (planId != null) {
                DietPlan plan = dietDAO.getDietPlanById(planId);
                if (plan == null) {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"success\":false,\"message\":\"Diet plan not found.\"}");
                    return;
                }

                // Authorization check: only owner or coach/admin can view
                boolean isOwner = plan.getUserId() == userId;
                boolean isAssigningCoach = plan.getCoachId() != null && plan.getCoachId() == userId;
                if (!isOwner && !isCoach && !isAssigningCoach) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"Access denied. You do not have permission to view this diet plan.\"}");
                    return;
                }

                resp.setStatus(HttpServletResponse.SC_OK);
                out.write("{\"success\":true,\"dietPlan\":" + JsonUtil.dietPlanToJson(plan) + "}");
                return;
            }

            // Default fallback
            DietPlan plan = dietDAO.getActiveDietPlanByUserId(userId);
            if (plan == null) plan = createDefaultPlanForUser(userId);
            double waterLiters = dietDAO.getWaterIntake(userId, today);
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"dietPlan\":" + JsonUtil.dietPlanToJson(plan) + ",\"waterLiters\":" + waterLiters + "}");

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
            // 1. Add Meal: POST /api/diet/meal or action=addMeal
            if ("/meal".equalsIgnoreCase(pathInfo) || "addMeal".equalsIgnoreCase(action) ||
                    (pathInfo != null && pathInfo.endsWith("/meal"))) {
                handleAddMeal(req, resp, out, jsonParams, userId, isCoach);
                return;
            }

            // 2. Update Meal: POST /api/diet/meal/update or action=updateMeal
            if ("/meal/update".equalsIgnoreCase(pathInfo) || "updateMeal".equalsIgnoreCase(action) ||
                    (pathInfo != null && pathInfo.endsWith("/meal/update"))) {
                handleUpdateMeal(req, resp, out, jsonParams, userId, isCoach);
                return;
            }

            // 3. Delete Meal: POST /api/diet/meal/delete or action=deleteMeal
            if ("/meal/delete".equalsIgnoreCase(pathInfo) || "deleteMeal".equalsIgnoreCase(action) ||
                    (pathInfo != null && pathInfo.endsWith("/meal/delete"))) {
                handleDeleteMeal(req, resp, out, jsonParams, userId, isCoach);
                return;
            }

            // 4. Switch Diet Preference: POST /api/diet/preference or action=preference
            if ("/preference".equalsIgnoreCase(pathInfo) || "/type".equalsIgnoreCase(pathInfo) ||
                    "preference".equalsIgnoreCase(action) || "type".equalsIgnoreCase(action)) {
                handleSwitchPreference(req, resp, out, jsonParams, user);
                return;
            }

            // 5. Log Water Intake: POST /api/diet/water or action=water
            if ("/water".equalsIgnoreCase(pathInfo) || "water".equalsIgnoreCase(action) ||
                    (pathInfo != null && pathInfo.endsWith("/water"))) {
                handleLogWater(req, resp, out, jsonParams, userId);
                return;
            }

            // 6. Activate a Diet Plan: POST /api/diet/activate or action=activate
            if ("/activate".equalsIgnoreCase(pathInfo) || "activate".equalsIgnoreCase(action) ||
                    (pathInfo != null && pathInfo.endsWith("/activate"))) {
                handleActivatePlan(req, resp, out, jsonParams, userId, isCoach);
                return;
            }

            // 7. Update Diet Plan Header: POST /api/diet/update or action=update
            if ("/update".equalsIgnoreCase(pathInfo) || "update".equalsIgnoreCase(action)) {
                handleUpdatePlan(req, resp, out, jsonParams, userId, isCoach);
                return;
            }

            // 8. Delete Diet Plan: POST /api/diet/delete or action=delete
            if ("/delete".equalsIgnoreCase(pathInfo) || "delete".equalsIgnoreCase(action)) {
                handleDeletePlan(req, resp, out, jsonParams, userId, isCoach);
                return;
            }

            // 9. Create / Assign Diet Plan: POST /api/diet
            handleCreatePlan(req, resp, out, body, jsonParams, userId, isCoach);

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

        String pathInfo = req.getPathInfo();
        String body = readRequestBody(req);
        Map<String, String> jsonParams = JsonUtil.parseSimpleJson(body);
        int userId = user.getId();
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        try {
            if (pathInfo != null && pathInfo.contains("/meal")) {
                handleUpdateMeal(req, resp, out, jsonParams, userId, isCoach);
            } else {
                handleUpdatePlan(req, resp, out, jsonParams, userId, isCoach);
            }
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

        String pathInfo = req.getPathInfo();
        Map<String, String> jsonParams = JsonUtil.parseSimpleJson(readRequestBody(req));
        int userId = user.getId();
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        try {
            if (pathInfo != null && pathInfo.contains("/meal")) {
                handleDeleteMeal(req, resp, out, jsonParams, userId, isCoach);
            } else {
                handleDeletePlan(req, resp, out, jsonParams, userId, isCoach);
            }
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    // =========================================================================
    // SUB-HANDLERS
    // =========================================================================

    private void handleAddMeal(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                               Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        // Find target plan
        int planId = parseParamInt(req, jsonParams, "dietPlanId", -1);
        if (planId <= 0) planId = parseParamInt(req, jsonParams, "planId", -1);

        DietPlan plan = null;
        if (planId > 0) {
            plan = dietDAO.getDietPlanById(planId);
        } else {
            plan = dietDAO.getActiveDietPlanByUserId(userId);
            if (plan == null) plan = createDefaultPlanForUser(userId);
        }

        if (plan == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Active diet plan not found.\"}");
            return;
        }

        // Authorization check
        if (plan.getUserId() != userId && !isCoach) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You can only log meals to your own plan.\"}");
            return;
        }

        String itemName = parseParam(req, jsonParams, "itemName");
        if (itemName == null || itemName.trim().isEmpty()) {
            itemName = parseParam(req, jsonParams, "name");
        }
        if (itemName == null || itemName.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Meal item name is required.\"}");
            return;
        }

        String mealType = parseParam(req, jsonParams, "mealType");
        if (mealType == null || mealType.trim().isEmpty()) {
            mealType = parseParam(req, jsonParams, "category");
        }
        if (mealType == null || mealType.trim().isEmpty()) mealType = "breakfast";
        mealType = mealType.toLowerCase().trim();

        // Normalize meal type: breakfast, lunch, dinner, snack
        if (mealType.contains("morn") || mealType.contains("even") || mealType.contains("snack")) {
            mealType = "snack";
        } else if (mealType.contains("break")) {
            mealType = "breakfast";
        } else if (mealType.contains("lunch")) {
            mealType = "lunch";
        } else if (mealType.contains("dinn")) {
            mealType = "dinner";
        }

        String quantity = parseParam(req, jsonParams, "quantity");
        if (quantity == null || quantity.trim().isEmpty()) quantity = "1 Serving";

        int calories = parseParamInt(req, jsonParams, "calories", 250);
        int proteinG = parseParamInt(req, jsonParams, "proteinG", 15);
        int carbsG = parseParamInt(req, jsonParams, "carbsG", 25);
        int fatsG = parseParamInt(req, jsonParams, "fatsG", 8);

        String timeSlot = parseParam(req, jsonParams, "timeSlot");
        if (timeSlot == null || timeSlot.trim().isEmpty()) {
            switch (mealType) {
                case "breakfast": timeSlot = "08:00 AM"; break;
                case "lunch": timeSlot = "01:00 PM"; break;
                case "dinner": timeSlot = "08:30 PM"; break;
                default: timeSlot = "04:30 PM"; break;
            }
        }

        String notes = parseParam(req, jsonParams, "notes");

        DietMeal meal = new DietMeal();
        meal.setDietPlanId(plan.getId());
        meal.setMealType(mealType);
        meal.setItemName(itemName.trim());
        meal.setQuantity(quantity.trim());
        meal.setCalories(calories);
        meal.setProteinG(proteinG);
        meal.setCarbsG(carbsG);
        meal.setFatsG(fatsG);
        meal.setTimeSlot(timeSlot);
        meal.setNotes(notes);

        int mealId = dietDAO.addMeal(meal);
        if (mealId > 0) {
            meal.setId(mealId);
            DietPlan updatedPlan = dietDAO.getDietPlanById(plan.getId());
            resp.setStatus(HttpServletResponse.SC_CREATED);
            out.write("{\"success\":true,\"message\":\"Meal logged successfully!\",\"mealId\":" + mealId +
                    ",\"meal\":" + JsonUtil.dietMealToJson(meal) +
                    ",\"dietPlan\":" + JsonUtil.dietPlanToJson(updatedPlan) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to save meal item to database.\"}");
        }
    }

    private void handleUpdateMeal(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                  Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        int mealId = parseParamInt(req, jsonParams, "mealId", -1);
        if (mealId <= 0) mealId = parseParamInt(req, jsonParams, "id", -1);

        if (mealId <= 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing meal ID.\"}");
            return;
        }

        DietMeal existing = dietDAO.getDietMealById(mealId);
        if (existing == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Meal item not found.\"}");
            return;
        }

        DietPlan parentPlan = dietDAO.getDietPlanById(existing.getDietPlanId());
        if (parentPlan == null || (parentPlan.getUserId() != userId && !isCoach)) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You cannot edit this meal.\"}");
            return;
        }

        String itemName = parseParam(req, jsonParams, "itemName");
        if (itemName != null && !itemName.trim().isEmpty()) existing.setItemName(itemName.trim());

        String mealType = parseParam(req, jsonParams, "mealType");
        if (mealType != null && !mealType.trim().isEmpty()) existing.setMealType(mealType.trim().toLowerCase());

        String quantity = parseParam(req, jsonParams, "quantity");
        if (quantity != null && !quantity.trim().isEmpty()) existing.setQuantity(quantity.trim());

        int calories = parseParamInt(req, jsonParams, "calories", existing.getCalories());
        existing.setCalories(calories);

        int proteinG = parseParamInt(req, jsonParams, "proteinG", existing.getProteinG());
        existing.setProteinG(proteinG);

        int carbsG = parseParamInt(req, jsonParams, "carbsG", existing.getCarbsG());
        existing.setCarbsG(carbsG);

        int fatsG = parseParamInt(req, jsonParams, "fatsG", existing.getFatsG());
        existing.setFatsG(fatsG);

        String timeSlot = parseParam(req, jsonParams, "timeSlot");
        if (timeSlot != null && !timeSlot.trim().isEmpty()) existing.setTimeSlot(timeSlot.trim());

        String notes = parseParam(req, jsonParams, "notes");
        if (notes != null) existing.setNotes(notes);

        boolean updated = dietDAO.updateDietMeal(existing);
        if (updated) {
            DietPlan updatedPlan = dietDAO.getDietPlanById(parentPlan.getId());
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Meal updated successfully!\",\"meal\":" + JsonUtil.dietMealToJson(existing) +
                    ",\"dietPlan\":" + JsonUtil.dietPlanToJson(updatedPlan) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to update meal item.\"}");
        }
    }

    private void handleDeleteMeal(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                  Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        int mealId = parseParamInt(req, jsonParams, "mealId", -1);
        if (mealId <= 0) mealId = parseParamInt(req, jsonParams, "id", -1);

        if (mealId <= 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing meal ID.\"}");
            return;
        }

        DietMeal existing = dietDAO.getDietMealById(mealId);
        if (existing == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Meal item not found.\"}");
            return;
        }

        DietPlan parentPlan = dietDAO.getDietPlanById(existing.getDietPlanId());
        if (parentPlan == null || (parentPlan.getUserId() != userId && !isCoach)) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You cannot delete this meal.\"}");
            return;
        }

        boolean deleted = dietDAO.deleteMeal(mealId);
        if (deleted) {
            DietPlan updatedPlan = dietDAO.getDietPlanById(parentPlan.getId());
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Meal deleted successfully!\",\"mealId\":" + mealId +
                    ",\"dietPlan\":" + JsonUtil.dietPlanToJson(updatedPlan) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to delete meal.\"}");
        }
    }

    private void handleSwitchPreference(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                        Map<String, String> jsonParams, User user) throws SQLException {
        String pref = parseParam(req, jsonParams, "preference");
        if (pref == null || pref.trim().isEmpty()) {
            pref = parseParam(req, jsonParams, "dietType");
        }
        if (pref == null || pref.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Diet preference is required (e.g. vegetarian, non-vegetarian, mixed).\"}");
            return;
        }

        pref = pref.toLowerCase().trim();
        user.setDietPreference(pref);
        userDAO.updateUserProfile(user);

        // Update session user
        req.getSession().setAttribute("user", user);

        // Create new tailored active plan with the new preference
        DietPlan newPlan = createDefaultPlanForUser(user.getId(), pref);

        resp.setStatus(HttpServletResponse.SC_OK);
        out.write("{\"success\":true,\"message\":\"Diet preference updated to " + JsonUtil.escape(pref) + "!\",\"dietPlan\":" + JsonUtil.dietPlanToJson(newPlan) + "}");
    }

    private void handleLogWater(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                Map<String, String> jsonParams, int userId) throws SQLException {
        String waterStr = parseParam(req, jsonParams, "waterLiters");
        if (waterStr == null || waterStr.trim().isEmpty()) {
            waterStr = parseParam(req, jsonParams, "amount");
        }
        String deltaStr = parseParam(req, jsonParams, "delta");

        Date today = new Date(System.currentTimeMillis());
        double currentWater = dietDAO.getWaterIntake(userId, today);
        double targetWater = currentWater;

        if (waterStr != null && !waterStr.trim().isEmpty()) {
            try { targetWater = Double.parseDouble(waterStr.trim()); } catch (Exception ignored) {}
        } else if (deltaStr != null && !deltaStr.trim().isEmpty()) {
            try {
                double delta = Double.parseDouble(deltaStr.trim());
                targetWater = Math.max(0.0, currentWater + delta);
            } catch (Exception ignored) {}
        } else {
            targetWater = Math.min(5.0, currentWater + 0.25);
        }

        // Round to 2 decimal places
        targetWater = Math.round(targetWater * 100.0) / 100.0;

        boolean success = dietDAO.logWaterIntake(userId, today, targetWater);
        if (success) {
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Hydration logged successfully.\",\"waterLiters\":" + targetWater + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to update hydration record.\"}");
        }
    }

    private void handleActivatePlan(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                    Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        int planId = parseParamInt(req, jsonParams, "planId", -1);
        if (planId <= 0) planId = parseParamInt(req, jsonParams, "id", -1);

        if (planId <= 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing plan ID.\"}");
            return;
        }

        DietPlan plan = dietDAO.getDietPlanById(planId);
        if (plan == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Diet plan not found.\"}");
            return;
        }

        if (plan.getUserId() != userId && !isCoach) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You can only activate your own plan.\"}");
            return;
        }

        boolean success = dietDAO.activateDietPlan(planId, plan.getUserId());
        if (success) {
            DietPlan active = dietDAO.getDietPlanById(planId);
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Diet plan activated!\",\"dietPlan\":" + JsonUtil.dietPlanToJson(active) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to activate plan.\"}");
        }
    }

    private void handleCreatePlan(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                  String body, Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        String title = parseParam(req, jsonParams, "title");
        if (title == null || title.trim().isEmpty()) {
            title = "Personalized Precision Nutrition Plan";
        }

        String planType = parseParam(req, jsonParams, "planType");
        if (planType == null || planType.trim().isEmpty()) planType = "High Protein & Balanced Macros";

        int targetCalories = parseParamInt(req, jsonParams, "targetCalories", 2200);
        int proteinG = parseParamInt(req, jsonParams, "proteinG", 160);
        int carbsG = parseParamInt(req, jsonParams, "carbsG", 220);
        int fatsG = parseParamInt(req, jsonParams, "fatsG", 65);

        String notes = parseParam(req, jsonParams, "notes");

        int targetUserId = userId;
        String targetUserStr = parseParam(req, jsonParams, "userId");
        if (targetUserStr != null && !targetUserStr.trim().isEmpty()) {
            int requested = Integer.parseInt(targetUserStr.trim());
            if (isCoach) {
                targetUserId = requested;
            } else if (requested != userId) {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.write("{\"success\":false,\"message\":\"Only coaches can assign diet plans to other users.\"}");
                return;
            }
        }

        DietPlan plan = new DietPlan();
        if (isCoach) {
            plan.setCoachId(userId);
        }
        plan.setUserId(targetUserId);
        plan.setTitle(title.trim());
        plan.setPlanType(planType.trim());
        plan.setTargetCalories(targetCalories);
        plan.setProteinG(proteinG);
        plan.setCarbsG(carbsG);
        plan.setFatsG(fatsG);
        plan.setStartDate(new Date(System.currentTimeMillis()));
        plan.setActive(true);
        plan.setNotes(notes);

        List<DietMeal> meals = parseMealsFromBody(body);
        plan.setMeals(meals);

        int newPlanId = dietDAO.createDietPlanWithMeals(plan);
        if (newPlanId > 0) {
            // Auto-create notification for new diet plan
            try {
                model.Notification notif = new model.Notification(
                        plan.getUserId(),
                        "\uD83C\uDF4E New Diet Plan Assigned",
                        "New diet plan assigned: " + plan.getTitle() + " (" + plan.getTargetCalories() + " kcal target)",
                        "diet",
                        "diet"
                );
                notificationDAO.createNotification(notif);
            } catch (Exception ignored) {}

            DietPlan created = dietDAO.getDietPlanById(newPlanId);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            out.write("{\"success\":true,\"message\":\"Diet plan created successfully!\",\"planId\":" + newPlanId +
                    ",\"dietPlan\":" + JsonUtil.dietPlanToJson(created) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to create diet plan.\"}");
        }
    }

    private void handleUpdatePlan(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                  Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        int planId = parseParamInt(req, jsonParams, "planId", -1);
        if (planId <= 0) planId = parseParamInt(req, jsonParams, "id", -1);

        if (planId <= 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing plan ID.\"}");
            return;
        }

        DietPlan existing = dietDAO.getDietPlanById(planId);
        if (existing == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Diet plan not found.\"}");
            return;
        }

        if (existing.getUserId() != userId && !isCoach) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You cannot edit this diet plan.\"}");
            return;
        }

        String title = parseParam(req, jsonParams, "title");
        if (title != null && !title.trim().isEmpty()) existing.setTitle(title.trim());

        String planType = parseParam(req, jsonParams, "planType");
        if (planType != null && !planType.trim().isEmpty()) existing.setPlanType(planType.trim());

        int targetCalories = parseParamInt(req, jsonParams, "targetCalories", existing.getTargetCalories());
        existing.setTargetCalories(targetCalories);

        int proteinG = parseParamInt(req, jsonParams, "proteinG", existing.getProteinG());
        existing.setProteinG(proteinG);

        int carbsG = parseParamInt(req, jsonParams, "carbsG", existing.getCarbsG());
        existing.setCarbsG(carbsG);

        int fatsG = parseParamInt(req, jsonParams, "fatsG", existing.getFatsG());
        existing.setFatsG(fatsG);

        String notes = parseParam(req, jsonParams, "notes");
        if (notes != null) existing.setNotes(notes);

        boolean success = dietDAO.updateDietPlan(existing);
        if (success) {
            DietPlan updated = dietDAO.getDietPlanById(planId);
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Diet plan updated successfully!\",\"dietPlan\":" + JsonUtil.dietPlanToJson(updated) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to update diet plan.\"}");
        }
    }

    private void handleDeletePlan(HttpServletRequest req, HttpServletResponse resp, PrintWriter out,
                                  Map<String, String> jsonParams, int userId, boolean isCoach) throws SQLException {
        int planId = parseParamInt(req, jsonParams, "planId", -1);
        if (planId <= 0) planId = parseParamInt(req, jsonParams, "id", -1);

        if (planId <= 0) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing plan ID.\"}");
            return;
        }

        DietPlan existing = dietDAO.getDietPlanById(planId);
        if (existing == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Diet plan not found.\"}");
            return;
        }

        if (existing.getUserId() != userId && !isCoach) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"success\":false,\"message\":\"Access denied. You cannot delete this diet plan.\"}");
            return;
        }

        boolean deleted = dietDAO.deleteDietPlan(planId);
        if (deleted) {
            resp.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\":true,\"message\":\"Diet plan deleted successfully.\",\"planId\":" + planId + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to delete diet plan.\"}");
        }
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private DietPlan createDefaultPlanForUser(int userId) throws SQLException {
        User u = userDAO.getUserById(userId);
        String pref = (u != null && u.getDietPreference() != null) ? u.getDietPreference() : "non-vegetarian";
        return createDefaultPlanForUser(userId, pref);
    }

    private DietPlan createDefaultPlanForUser(int userId, String pref) throws SQLException {
        DietPlan plan = new DietPlan();
        plan.setUserId(userId);
        plan.setActive(true);
        plan.setStartDate(new Date(System.currentTimeMillis()));

        List<DietMeal> meals = new ArrayList<>();

        if ("vegetarian".equalsIgnoreCase(pref) || "veg".equalsIgnoreCase(pref)) {
            plan.setTitle("Vegetarian High-Protein Precision Nutrition");
            plan.setPlanType("High Protein Vegetarian");
            plan.setTargetCalories(2150);
            plan.setProteinG(145);
            plan.setCarbsG(240);
            plan.setFatsG(60);
            plan.setNotes("Sustained energy from plant and dairy proteins, complex carbs, and whole foods.");

            meals.add(new DietMeal(0, "breakfast", "Oats with Almond Milk, Chia Seeds & Plant Protein", "1 Bowl (80g Oats + 250ml Milk)", 480, 32, 62, 12));
            meals.get(0).setTimeSlot("08:00 AM");
            meals.get(0).setNotes("High fiber and slow-digesting carbs.");

            meals.add(new DietMeal(0, "lunch", "Tofu & Paneer Tikka with Quinoa & Steamed Broccoli", "150g Tofu/Paneer + 150g Quinoa", 620, 44, 65, 18));
            meals.get(1).setTimeSlot("01:00 PM");
            meals.get(1).setNotes("Rich in essential amino acids.");

            meals.add(new DietMeal(0, "snack", "Roasted Chickpeas & Greek Yogurt with Walnuts", "150g Yogurt + 40g Chickpeas", 310, 22, 28, 11));
            meals.get(2).setTimeSlot("04:30 PM");
            meals.get(2).setNotes("Pre-workout sustained energy.");

            meals.add(new DietMeal(0, "dinner", "Lentil Dahl, Spinach, and Mixed Vegetable Stir Fry", "200g Lentils + 150g Veggies", 540, 35, 68, 14));
            meals.get(3).setTimeSlot("08:30 PM");
            meals.get(3).setNotes("Calming nighttime nutrient recovery.");

            meals.add(new DietMeal(0, "snack", "Warm Turmeric Soy Milk with Pumpkin Seeds", "200ml Soy Milk + 15g Seeds", 200, 12, 17, 5));
            meals.get(4).setTimeSlot("09:45 PM");
            meals.get(4).setNotes("Bedtime micronutrient and magnesium support.");

        } else if ("mixed".equalsIgnoreCase(pref)) {
            plan.setTitle("Flexible Balanced Macro Meal Plan");
            plan.setPlanType("Flexible Balanced Split");
            plan.setTargetCalories(2300);
            plan.setProteinG(165);
            plan.setCarbsG(250);
            plan.setFatsG(65);
            plan.setNotes("Balanced combination of lean poultry, seafood, eggs, dairy, and whole grains.");

            meals.add(new DietMeal(0, "breakfast", "Poached Eggs on Multigrain Toast with Avocado", "3 Eggs + 2 Slices Toast + 1/2 Avo", 510, 34, 48, 20));
            meals.get(0).setTimeSlot("08:00 AM");
            meals.get(0).setNotes("Rich in choline, healthy fats, and bioavailable protein.");

            meals.add(new DietMeal(0, "lunch", "Turkey Breast Quinoa Bowl with Roasted Veggies", "180g Turkey + 140g Quinoa", 640, 50, 68, 15));
            meals.get(1).setTimeSlot("01:00 PM");
            meals.get(1).setNotes("Clean midday protein synthesis fuel.");

            meals.add(new DietMeal(0, "snack", "Cottage Cheese with Fresh Berries & Flaxseeds", "180g Cottage Cheese + 50g Berries", 290, 26, 24, 8));
            meals.get(2).setTimeSlot("04:30 PM");
            meals.get(2).setNotes("Slow-release casein protein.");

            meals.add(new DietMeal(0, "dinner", "Grilled Salmon Fillet, Baked Sweet Potato & Green Beans", "180g Salmon + 150g Potato", 620, 43, 56, 20));
            meals.get(3).setTimeSlot("08:30 PM");
            meals.get(3).setNotes("Optimal Omega-3 EPA/DHA recovery.");

            meals.add(new DietMeal(0, "snack", "Whey Isolate Protein Shake", "1 Scoop in 300ml Water", 240, 28, 14, 2));
            meals.get(4).setTimeSlot("06:45 PM");
            meals.get(4).setNotes("Fast post-exercise amino acid delivery.");

        } else {
            // non-vegetarian / default
            plan.setTitle("Lean Mass Hypertrophy & Performance Plan");
            plan.setPlanType("High Protein & Clean Carb Cycling");
            plan.setTargetCalories(2400);
            plan.setProteinG(180);
            plan.setCarbsG(260);
            plan.setFatsG(70);
            plan.setNotes("Tailored for lean muscle development, glycogen replenishment, and rapid recovery.");

            meals.add(new DietMeal(0, "breakfast", "Rolled Oats with Whey Protein, Chia Seeds & Blueberries", "1 Large Bowl (80g oats + 30g whey)", 520, 42, 65, 12));
            meals.get(0).setTimeSlot("08:00 AM");
            meals.get(0).setNotes("Provides sustained complex carbs and fast-absorbing protein.");

            meals.add(new DietMeal(0, "lunch", "Grilled Herb Chicken Breast, Brown Rice & Steamed Broccoli", "200g Chicken + 150g Rice", 680, 52, 75, 16));
            meals.get(1).setTimeSlot("01:00 PM");
            meals.get(1).setNotes("Primary midday fuel for muscle recovery.");

            meals.add(new DietMeal(0, "snack", "Low-Fat Greek Yogurt with Almonds & Organic Honey", "200g Yogurt + 15g Almonds", 320, 24, 28, 11));
            meals.get(2).setTimeSlot("04:30 PM");
            meals.get(2).setNotes("Pre-workout energy booster with healthy fats.");

            meals.add(new DietMeal(0, "dinner", "Pan-Seared Atlantic Salmon, Sweet Potato Mash & Asparagus", "180g Salmon + 150g Potato", 620, 44, 58, 22));
            meals.get(3).setTimeSlot("08:30 PM");
            meals.get(3).setNotes("Rich in essential Omega-3 fatty acids and micronutrients.");

            meals.add(new DietMeal(0, "snack", "Post-Workout Whey Isolate & 2 Whole Grain Rice Cakes", "1 Scoop Isolate + 2 Cakes", 260, 28, 24, 3));
            meals.get(4).setTimeSlot("06:45 PM");
            meals.get(4).setNotes("Immediate post-exercise amino acid delivery.");
        }

        plan.setMeals(meals);
        int newId = dietDAO.createDietPlanWithMeals(plan);
        if (newId > 0) {
            return dietDAO.getDietPlanById(newId);
        }
        return plan;
    }

    private List<DietMeal> parseMealsFromBody(String body) {
        List<DietMeal> list = new ArrayList<>();
        if (body == null || !body.contains("\"meals\"")) return list;

        int startIdx = body.indexOf("\"meals\"");
        int arrayStart = body.indexOf("[", startIdx);
        int arrayEnd = body.lastIndexOf("]");
        if (arrayStart == -1 || arrayEnd == -1 || arrayEnd <= arrayStart) return list;

        String arrayContent = body.substring(arrayStart + 1, arrayEnd);
        Pattern objPattern = Pattern.compile("\\{([^}]+)\\}");
        Matcher objMatcher = objPattern.matcher(arrayContent);

        while (objMatcher.find()) {
            String objStr = "{" + objMatcher.group(1) + "}";
            Map<String, String> map = JsonUtil.parseSimpleJson(objStr);
            if (map.containsKey("itemName") || map.containsKey("name")) {
                DietMeal m = new DietMeal();
                m.setItemName(map.getOrDefault("itemName", map.get("name")));
                m.setMealType(map.getOrDefault("mealType", map.getOrDefault("category", "snack")));
                m.setQuantity(map.getOrDefault("quantity", "1 Serving"));
                m.setCalories(map.containsKey("calories") ? Integer.parseInt(map.get("calories")) : 250);
                m.setProteinG(map.containsKey("proteinG") ? Integer.parseInt(map.get("proteinG")) : 20);
                m.setCarbsG(map.containsKey("carbsG") ? Integer.parseInt(map.get("carbsG")) : 25);
                m.setFatsG(map.containsKey("fatsG") ? Integer.parseInt(map.get("fatsG")) : 8);
                m.setTimeSlot(map.getOrDefault("timeSlot", "12:00 PM"));
                m.setNotes(map.get("notes"));
                list.add(m);
            }
        }
        return list;
    }

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
            if (!clean.equalsIgnoreCase("today") && !clean.equalsIgnoreCase("active") &&
                    !clean.equalsIgnoreCase("history") && !clean.equalsIgnoreCase("coach") &&
                    !clean.equalsIgnoreCase("meal") && !clean.equalsIgnoreCase("preference") &&
                    !clean.equalsIgnoreCase("type") && !clean.equalsIgnoreCase("water") &&
                    !clean.equalsIgnoreCase("activate") && !clean.equalsIgnoreCase("update") &&
                    !clean.equalsIgnoreCase("delete")) {
                try {
                    return Integer.parseInt(clean);
                } catch (NumberFormatException ignored) {}
            }
        }
        return null;
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
}
