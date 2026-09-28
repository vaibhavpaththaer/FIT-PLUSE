package controller;


import dao.NotificationDAO;
import dao.ProgressDAO;
import dao.ReportDAO;
import dao.UserDAO;

import model.Notification;
import model.Report;
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
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

/**
 * Controller servlet for Reports Module Backend Integration.
 * Handles generation, aggregation, calculation, retrieval, export, and archival
 * of all athlete fitness reports (Weight, BMI, Workout Completion, Calories Burned,
 * Water Intake, Steps, Diet Summary, and Overall Fitness Dossiers).
 */
@WebServlet(name = "ReportServlet", urlPatterns = {"/api/reports", "/api/reports/*", "/reports"})
public class ReportServlet extends HttpServlet {

    private final ReportDAO reportDAO = new ReportDAO();
    private final ProgressDAO progressDAO = new ProgressDAO();
    private final UserDAO userDAO = new UserDAO();

    private final NotificationDAO notificationDAO = new NotificationDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            setupJsonResponse(resp, HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"success\":false,\"message\":\"Authentication required. Please log in.\"}");
            return;
        }

        int userId = user.getId();
        boolean isCoachOrAdmin = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        // Coach inspection support: coach can view reports for assigned athletes
        String targetUserParam = req.getParameter("userId");
        if (targetUserParam != null && !targetUserParam.trim().isEmpty()) {
            try {
                int targetId = Integer.parseInt(targetUserParam.trim());
                if (isCoachOrAdmin) {
                    User targetUser = userDAO.getUserById(targetId);
                    if (targetUser != null) {
                        // Multi-tenant check: if coach, ensure assigned
                        if ("admin".equalsIgnoreCase(user.getRole()) || (targetUser.getAssignedCoachId() != null && targetUser.getAssignedCoachId() == user.getId())) {
                            user = targetUser;
                            userId = targetUser.getId();
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        String pathInfo = req.getPathInfo();
        String typeParam = req.getParameter("type");

        try {
            // Ensure fresh user record and baseline progress if empty
            User liveUser = userDAO.getUserById(userId);
            if (liveUser != null) user = liveUser;
            progressDAO.ensureInitialProgressIfEmpty(user);

            // 1. GET /api/reports/history (or ?type=history)
            if ("/history".equalsIgnoreCase(pathInfo) || "history".equalsIgnoreCase(typeParam)) {
                handleGetReportHistory(resp, userId);
                return;
            }

            // 2. GET /api/reports/export (or ?type=export)
            if ("/export".equalsIgnoreCase(pathInfo) || "export".equalsIgnoreCase(typeParam)) {
                handleExportReport(req, resp, user);
                return;
            }

            // 3. Sub-report queries: /weight, /bmi, /workouts, /calories, /water, /steps, /diet, /overall
            if ("/weight".equalsIgnoreCase(pathInfo) || "weight".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "weight");
                return;
            }
            if ("/bmi".equalsIgnoreCase(pathInfo) || "bmi".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "bmi");
                return;
            }
            if ("/workouts".equalsIgnoreCase(pathInfo) || "/workout".equalsIgnoreCase(pathInfo) || "workouts".equalsIgnoreCase(typeParam) || "workout".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "workouts");
                return;
            }
            if ("/calories".equalsIgnoreCase(pathInfo) || "calories".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "calories");
                return;
            }
            if ("/water".equalsIgnoreCase(pathInfo) || "water".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "water");
                return;
            }
            if ("/steps".equalsIgnoreCase(pathInfo) || "steps".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "steps");
                return;
            }
            if ("/diet".equalsIgnoreCase(pathInfo) || "diet".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "diet");
                return;
            }
            if ("/overall".equalsIgnoreCase(pathInfo) || "overall".equalsIgnoreCase(typeParam)) {
                handleGetSubReport(req, resp, user, "overall");
                return;
            }

            // 4. Default: Full Comprehensive Multi-Module Report
            handleGetFullReport(req, resp, user);

        } catch (SQLException e) {
            setupJsonResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"success\":false,\"message\":\"Database error generating report: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            setupJsonResponse(resp, HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"success\":false,\"message\":\"Authentication required. Please log in.\"}");
            return;
        }

        String pathInfo = req.getPathInfo();
        String body = readRequestBody(req);
        Map<String, String> jsonMap = JsonUtil.parseSimpleJson(body);

        try {
            // 1. POST /api/reports/delete (or ?action=delete)
            if ("/delete".equalsIgnoreCase(pathInfo) || "delete".equalsIgnoreCase(req.getParameter("action"))) {
                handleDeleteReport(req, resp, user, jsonMap);
                return;
            }

            // 2. Default POST: Save / Archive Report Snapshot
            handleSaveReportSnapshot(req, resp, user, jsonMap);

        } catch (Exception e) {
            setupJsonResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"success\":false,\"message\":\"Failed to process report request: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User user = getAuthenticatedUser(req);
        if (user == null) {
            setupJsonResponse(resp, HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"success\":false,\"message\":\"Authentication required.\"}");
            return;
        }

        try {
            handleDeleteReport(req, resp, user, null);
        } catch (Exception e) {
            setupJsonResponse(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("{\"success\":false,\"message\":\"Failed to delete report: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    // =========================================================================
    // REPORT GENERATION & DATA HANDLERS
    // =========================================================================

    private void handleGetFullReport(HttpServletRequest req, HttpServletResponse resp, User user)
            throws SQLException, IOException {
        DateRange range = parseDateRange(req);
        Map<String, Object> data = reportDAO.calculateComprehensiveReport(user.getId(), range.startDate, range.endDate, user);
        List<Report> savedHistory = reportDAO.getReportsByUserId(user.getId());

        setupJsonResponse(resp, HttpServletResponse.SC_OK);
        PrintWriter out = resp.getWriter();

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"success\":true,");
        sb.append("\"period\":\"").append(JsonUtil.escape(range.periodLabel)).append("\",");
        sb.append("\"dateRangeStart\":\"").append(range.startDate.toString()).append("\",");
        sb.append("\"dateRangeEnd\":\"").append(range.endDate.toString()).append("\",");

        // Athlete Profile Info
        sb.append("\"athlete\":{");
        sb.append("\"id\":").append(user.getId()).append(",");
        sb.append("\"name\":\"").append(JsonUtil.escape(user.getFullName())).append("\",");
        sb.append("\"email\":\"").append(JsonUtil.escape(user.getEmail())).append("\",");
        sb.append("\"goal\":\"").append(JsonUtil.escape(user.getFitnessGoal())).append("\",");
        sb.append("\"streakDays\":").append(user.getStreakDays()).append(",");
        sb.append("\"totalWorkouts\":").append(user.getTotalWorkouts()).append(",");
        sb.append("\"totalCalories\":").append(user.getTotalCaloriesBurned());
        sb.append("},");

        // 1. Weight Progress Report
        sb.append("\"weightReport\":{");
        sb.append("\"startWeightKg\":").append(data.get("startWeightKg")).append(",");
        sb.append("\"currentWeightKg\":").append(data.get("currentWeightKg")).append(",");
        sb.append("\"weightDeltaKg\":").append(data.get("weightDeltaKg")).append(",");
        sb.append("\"weightLostKg\":").append(data.get("weightLostKg")).append(",");
        sb.append("\"targetWeightKg\":").append(data.get("targetWeightKg"));
        sb.append("},");

        // 2. BMI Progress Report
        sb.append("\"bmiReport\":{");
        sb.append("\"heightCm\":").append(data.get("heightCm")).append(",");
        sb.append("\"startBmi\":").append(data.get("startBmi")).append(",");
        sb.append("\"currentBmi\":").append(data.get("currentBmi")).append(",");
        sb.append("\"bmiDelta\":").append(data.get("bmiDelta")).append(",");
        sb.append("\"bmiCategory\":\"").append(data.get("bmiCategory")).append("\"");
        sb.append("},");

        // 3. Workout Completion Report
        sb.append("\"workoutReport\":{");
        sb.append("\"totalScheduled\":").append(data.get("totalScheduledWorkouts")).append(",");
        sb.append("\"totalCompleted\":").append(data.get("totalCompletedWorkouts")).append(",");
        sb.append("\"workoutsCompleted\":").append(data.get("workoutsCompleted")).append(",");
        sb.append("\"completionPct\":").append(data.get("completionPct")).append(",");
        sb.append("\"attendancePct\":").append(data.get("attendancePct")).append(",");
        sb.append("\"totalDurationMin\":").append(data.get("totalDurationMin"));
        sb.append("},");

        // 4. Calories Burned Report
        sb.append("\"caloriesReport\":{");
        sb.append("\"totalCaloriesBurned\":").append(data.get("totalCaloriesBurned")).append(",");
        sb.append("\"avgDailyCalories\":").append(data.get("avgDailyCalories"));
        sb.append("},");

        // 5. Water Intake Report
        sb.append("\"waterReport\":{");
        sb.append("\"totalWaterLiters\":").append(data.get("totalWaterLiters")).append(",");
        sb.append("\"avgWaterLiters\":").append(data.get("avgWaterLiters")).append(",");
        sb.append("\"targetWaterLiters\":").append(data.get("waterTargetLiters"));
        sb.append("},");

        // 6. Step Count Report
        sb.append("\"stepReport\":{");
        sb.append("\"totalSteps\":").append(data.get("totalSteps")).append(",");
        sb.append("\"avgDailySteps\":").append(data.get("avgDailySteps")).append(",");
        sb.append("\"stepTarget\":").append(data.get("stepTarget"));
        sb.append("},");

        // 7. Diet / Meal Summary Report
        sb.append("\"dietReport\":{");
        sb.append("\"planTitle\":\"").append(JsonUtil.escape((String) data.get("dietPlanTitle"))).append("\",");
        sb.append("\"planType\":\"").append(JsonUtil.escape((String) data.get("dietPlanType"))).append("\",");
        sb.append("\"targetCalories\":").append(data.get("targetCalories")).append(",");
        sb.append("\"proteinG\":").append(data.get("proteinG")).append(",");
        sb.append("\"carbsG\":").append(data.get("carbsG")).append(",");
        sb.append("\"fatsG\":").append(data.get("fatsG"));
        sb.append("},");

        // 8. Overall Fitness Progress Report
        sb.append("\"overallReport\":{");
        sb.append("\"complianceTier\":\"").append(JsonUtil.escape((String) data.get("complianceTier"))).append("\",");
        sb.append("\"status\":\"").append(JsonUtil.escape((String) data.get("status"))).append("\",");
        sb.append("\"attendancePct\":").append(data.get("attendancePct")).append(",");
        sb.append("\"streakDays\":").append(data.get("streakDays"));
        sb.append("},");

        // Summary Tile Mapping for existing UI cards
        sb.append("\"summary\":{");
        sb.append("\"weightLostKg\":").append(data.get("weightLostKg")).append(",");
        sb.append("\"caloriesBurned\":").append(data.get("totalCaloriesBurned")).append(",");
        sb.append("\"workoutsCompleted\":").append(data.get("workoutsCompleted")).append(",");
        sb.append("\"attendancePct\":").append(data.get("attendancePct")).append(",");
        sb.append("\"complianceTier\":\"").append(JsonUtil.escape((String) data.get("complianceTier"))).append("\",");
        sb.append("\"status\":\"").append(JsonUtil.escape((String) data.get("status"))).append("\"");
        sb.append("},");

        // Timeline array for interactive charts
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> timeline = (List<Map<String, Object>>) data.get("timeline");
        sb.append("\"timeline\":[");
        if (timeline != null) {
            for (int i = 0; i < timeline.size(); i++) {
                if (i > 0) sb.append(",");
                Map<String, Object> pt = timeline.get(i);
                sb.append("{");
                sb.append("\"date\":\"").append(pt.get("date")).append("\",");
                sb.append("\"weightKg\":").append(pt.get("weightKg")).append(",");
                sb.append("\"bmi\":").append(pt.get("bmi")).append(",");
                sb.append("\"caloriesBurned\":").append(pt.get("caloriesBurned")).append(",");
                sb.append("\"steps\":").append(pt.get("steps")).append(",");
                sb.append("\"waterLiters\":").append(pt.get("waterLiters")).append(",");
                sb.append("\"workoutsCompleted\":").append(pt.get("workoutsCompleted")).append(",");
                sb.append("\"sleepHours\":").append(pt.get("sleepHours"));
                sb.append("}");
            }
        }
        sb.append("],");

        // Saved Report Dossiers
        sb.append("\"savedReports\":").append(JsonUtil.reportListToJson(savedHistory));

        sb.append("}");
        out.write(sb.toString());
    }

    private void handleGetSubReport(HttpServletRequest req, HttpServletResponse resp, User user, String subType)
            throws SQLException, IOException {
        DateRange range = parseDateRange(req);
        Map<String, Object> data = reportDAO.calculateComprehensiveReport(user.getId(), range.startDate, range.endDate, user);

        setupJsonResponse(resp, HttpServletResponse.SC_OK);
        PrintWriter out = resp.getWriter();

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"success\":true,");
        sb.append("\"reportType\":\"").append(subType).append("\",");
        sb.append("\"period\":\"").append(JsonUtil.escape(range.periodLabel)).append("\",");
        sb.append("\"dateRangeStart\":\"").append(range.startDate.toString()).append("\",");
        sb.append("\"dateRangeEnd\":\"").append(range.endDate.toString()).append("\",");

        if ("weight".equals(subType)) {
            sb.append("\"startWeightKg\":").append(data.get("startWeightKg")).append(",");
            sb.append("\"currentWeightKg\":").append(data.get("currentWeightKg")).append(",");
            sb.append("\"weightDeltaKg\":").append(data.get("weightDeltaKg")).append(",");
            sb.append("\"weightLostKg\":").append(data.get("weightLostKg")).append(",");
            sb.append("\"targetWeightKg\":").append(data.get("targetWeightKg"));
        } else if ("bmi".equals(subType)) {
            sb.append("\"heightCm\":").append(data.get("heightCm")).append(",");
            sb.append("\"startBmi\":").append(data.get("startBmi")).append(",");
            sb.append("\"currentBmi\":").append(data.get("currentBmi")).append(",");
            sb.append("\"bmiDelta\":").append(data.get("bmiDelta")).append(",");
            sb.append("\"bmiCategory\":\"").append(data.get("bmiCategory")).append("\"");
        } else if ("workouts".equals(subType)) {
            sb.append("\"totalScheduled\":").append(data.get("totalScheduledWorkouts")).append(",");
            sb.append("\"totalCompleted\":").append(data.get("totalCompletedWorkouts")).append(",");
            sb.append("\"workoutsCompleted\":").append(data.get("workoutsCompleted")).append(",");
            sb.append("\"completionPct\":").append(data.get("completionPct")).append(",");
            sb.append("\"attendancePct\":").append(data.get("attendancePct")).append(",");
            sb.append("\"totalDurationMin\":").append(data.get("totalDurationMin"));
        } else if ("calories".equals(subType)) {
            sb.append("\"totalCaloriesBurned\":").append(data.get("totalCaloriesBurned")).append(",");
            sb.append("\"avgDailyCalories\":").append(data.get("avgDailyCalories"));
        } else if ("water".equals(subType)) {
            sb.append("\"totalWaterLiters\":").append(data.get("totalWaterLiters")).append(",");
            sb.append("\"avgWaterLiters\":").append(data.get("avgWaterLiters")).append(",");
            sb.append("\"targetWaterLiters\":").append(data.get("waterTargetLiters"));
        } else if ("steps".equals(subType)) {
            sb.append("\"totalSteps\":").append(data.get("totalSteps")).append(",");
            sb.append("\"avgDailySteps\":").append(data.get("avgDailySteps")).append(",");
            sb.append("\"stepTarget\":").append(data.get("stepTarget"));
        } else if ("diet".equals(subType)) {
            sb.append("\"planTitle\":\"").append(JsonUtil.escape((String) data.get("dietPlanTitle"))).append("\",");
            sb.append("\"planType\":\"").append(JsonUtil.escape((String) data.get("dietPlanType"))).append("\",");
            sb.append("\"targetCalories\":").append(data.get("targetCalories")).append(",");
            sb.append("\"proteinG\":").append(data.get("proteinG")).append(",");
            sb.append("\"carbsG\":").append(data.get("carbsG")).append(",");
            sb.append("\"fatsG\":").append(data.get("fatsG"));
        } else if ("overall".equals(subType)) {
            sb.append("\"complianceTier\":\"").append(JsonUtil.escape((String) data.get("complianceTier"))).append("\",");
            sb.append("\"status\":\"").append(JsonUtil.escape((String) data.get("status"))).append("\",");
            sb.append("\"attendancePct\":").append(data.get("attendancePct")).append(",");
            sb.append("\"streakDays\":").append(data.get("streakDays"));
        }

        sb.append("}");
        out.write(sb.toString());
    }

    private void handleGetReportHistory(HttpServletResponse resp, int userId) throws SQLException, IOException {
        List<Report> reports = reportDAO.getReportsByUserId(userId);
        setupJsonResponse(resp, HttpServletResponse.SC_OK);
        resp.getWriter().write("{\"success\":true,\"reports\":" + JsonUtil.reportListToJson(reports) + "}");
    }

    private void handleExportReport(HttpServletRequest req, HttpServletResponse resp, User user)
            throws SQLException, IOException {
        DateRange range = parseDateRange(req);
        Map<String, Object> data = reportDAO.calculateComprehensiveReport(user.getId(), range.startDate, range.endDate, user);

        String format = req.getParameter("format");
        if (format == null) format = "txt";

        if ("txt".equalsIgnoreCase(format)) {
            resp.setContentType("text/plain; charset=UTF-8");
            resp.setHeader("Content-Disposition", "attachment; filename=\"FitPulse_Performance_Dossier_" + range.startDate + ".txt\"");

            PrintWriter out = resp.getWriter();
            out.println("================================================================================");
            out.println("                     FITPULSE ATHLETE PERFORMANCE DOSSIER                       ");
            out.println("================================================================================");
            out.println("Athlete Name        : " + user.getFullName());
            out.println("Email Account       : " + user.getEmail());
            out.println("Primary Goal        : " + user.getFitnessGoal());
            out.println("Reporting Period    : " + range.periodLabel + " (" + range.startDate + " to " + range.endDate + ")");
            out.println("Generated Date      : " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()));
            out.println("--------------------------------------------------------------------------------");
            out.println("1. BIOMETRIC PROGRESSION & BODY COMPOSITION");
            out.println("   - Starting Weight : " + data.get("startWeightKg") + " kg");
            out.println("   - Current Weight  : " + data.get("currentWeightKg") + " kg");
            out.println("   - Weight Change   : " + data.get("weightDeltaKg") + " kg (Lost: " + data.get("weightLostKg") + " kg)");
            out.println("   - Height          : " + data.get("heightCm") + " cm");
            out.println("   - Body Mass Index : " + data.get("currentBmi") + " (" + data.get("bmiCategory") + ")");
            out.println("   - BMI Change      : " + data.get("bmiDelta") + " pts");
            out.println("--------------------------------------------------------------------------------");
            out.println("2. TRAINING & WORKOUT EXECUTION");
            out.println("   - Scheduled       : " + data.get("totalScheduledWorkouts") + " sessions");
            out.println("   - Completed       : " + data.get("workoutsCompleted") + " sessions");
            out.println("   - Attendance Rate : " + data.get("attendancePct") + "%");
            out.println("   - Active Training : " + data.get("totalDurationMin") + " total minutes");
            out.println("--------------------------------------------------------------------------------");
            out.println("3. ENERGY EXPENDITURE & VITAL LOGS");
            out.println("   - Calories Burned : " + data.get("totalCaloriesBurned") + " kcal");
            out.println("   - Daily Avg Burn  : " + data.get("avgDailyCalories") + " kcal/day");
            out.println("   - Total Steps     : " + data.get("totalSteps") + " steps (Avg: " + data.get("avgDailySteps") + "/day)");
            out.println("   - Water Intake    : " + data.get("totalWaterLiters") + " L (Avg: " + data.get("avgWaterLiters") + " L/day)");
            out.println("   - Sleep Rest      : " + data.get("avgSleepHours") + " hrs/night average");
            out.println("--------------------------------------------------------------------------------");
            out.println("4. NUTRITION & MACRONUTRIENTS");
            out.println("   - Active Regimen  : " + data.get("dietPlanTitle") + " (" + data.get("dietPlanType") + ")");
            out.println("   - Target Energy   : " + data.get("targetCalories") + " kcal");
            out.println("   - Protein Target  : " + data.get("proteinG") + " g");
            out.println("   - Carbs Target    : " + data.get("carbsG") + " g");
            out.println("   - Fats Target     : " + data.get("fatsG") + " g");
            out.println("--------------------------------------------------------------------------------");
            out.println("5. EXECUTIVE SUMMARY & COMPLIANCE");
            out.println("   - Tier Ranking    : " + data.get("complianceTier"));
            out.println("   - Current Status  : " + data.get("status"));
            out.println("   - Active Streak   : " + user.getStreakDays() + " consecutive days");
            out.println("================================================================================");
            out.println("FitPulse Certified Coaching Engine • Powered by Real Database Analytics");
            out.println("================================================================================");
            return;
        }

        // Default JSON export
        setupJsonResponse(resp, HttpServletResponse.SC_OK);
        resp.setHeader("Content-Disposition", "attachment; filename=\"FitPulse_Report_" + range.startDate + ".json\"");
        handleGetFullReport(req, resp, user);
    }

    // =========================================================================
    // POST / ARCHIVE / DELETE HANDLERS
    // =========================================================================

    private void handleSaveReportSnapshot(HttpServletRequest req, HttpServletResponse resp, User user, Map<String, String> json)
            throws SQLException, IOException {
        DateRange range = parseDateRange(req);
        String reportType = getParam(json, req, "reportType");
        if (reportType == null || reportType.trim().isEmpty()) {
            reportType = "monthly_performance";
        }

        // Calculate latest real stats to store in summary_json
        Map<String, Object> data = reportDAO.calculateComprehensiveReport(user.getId(), range.startDate, range.endDate, user);

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"athlete\":\"").append(JsonUtil.escape(user.getFullName())).append("\",");
        sb.append("\"period\":\"").append(JsonUtil.escape(range.periodLabel)).append("\",");
        sb.append("\"weightLostKg\":").append(data.get("weightLostKg")).append(",");
        sb.append("\"caloriesBurned\":").append(data.get("totalCaloriesBurned")).append(",");
        sb.append("\"workoutsCompleted\":").append(data.get("workoutsCompleted")).append(",");
        sb.append("\"attendancePct\":").append(data.get("attendancePct")).append(",");
        sb.append("\"currentWeightKg\":").append(data.get("currentWeightKg")).append(",");
        sb.append("\"currentBmi\":").append(data.get("currentBmi")).append(",");
        sb.append("\"complianceTier\":\"").append(JsonUtil.escape((String) data.get("complianceTier"))).append("\",");
        sb.append("\"status\":\"").append(JsonUtil.escape((String) data.get("status"))).append("\"");
        sb.append("}");

        Report r = new Report();
        r.setUserId(user.getId());
        r.setReportType(reportType);
        r.setDateRangeStart(range.startDate);
        r.setDateRangeEnd(range.endDate);
        r.setSummaryJson(sb.toString());

        int reportId = reportDAO.createReport(r);

        // Auto-create notification for report generation
        try {
            Notification notif = new Notification(
                    user.getId(),
                    "\uD83D\uDCC3 Performance Report Generated",
                    "Your " + range.periodLabel + " fitness performance dossier is ready and archived.",
                    "system",
                    "progress"
            );
            notificationDAO.createNotification(notif);
        } catch (Exception ignored) {}

        setupJsonResponse(resp, HttpServletResponse.SC_OK);
        resp.getWriter().write("{" +
                "\"success\":true," +
                "\"message\":\"Performance report snapshot successfully archived in database!\"," +
                "\"reportId\":" + reportId + "," +
                "\"report\":" + JsonUtil.reportToJson(r) +
                "}");
    }

    private void handleDeleteReport(HttpServletRequest req, HttpServletResponse resp, User user, Map<String, String> json)
            throws SQLException, IOException {
        String idStr = getParam(json, req, "id");
        if (idStr == null && req.getPathInfo() != null && req.getPathInfo().length() > 1) {
            String sub = req.getPathInfo().substring(1);
            if (sub.matches("\\d+")) idStr = sub;
        }

        if (idStr == null || idStr.trim().isEmpty()) {
            setupJsonResponse(resp, HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"success\":false,\"message\":\"Report ID is required.\"}");
            return;
        }

        int reportId = Integer.parseInt(idStr.trim());

        // Multi-tenant check: deleteReport(reportId, userId) enforces that only the owner can delete
        boolean deleted = reportDAO.deleteReport(reportId, user.getId());

        if (deleted) {
            setupJsonResponse(resp, HttpServletResponse.SC_OK);
            resp.getWriter().write("{\"success\":true,\"message\":\"Report archive successfully removed.\"}");
        } else {
            setupJsonResponse(resp, HttpServletResponse.SC_NOT_FOUND);
            resp.getWriter().write("{\"success\":false,\"message\":\"Report not found or permission denied.\"}");
        }
    }

    // =========================================================================
    // DATE RANGE & PARAMETER HELPERS
    // =========================================================================

    private static class DateRange {
        final Date startDate;
        final Date endDate;
        final String periodLabel;

        DateRange(Date startDate, Date endDate, String periodLabel) {
            this.startDate = startDate;
            this.endDate = endDate;
            this.periodLabel = periodLabel;
        }
    }

    private DateRange parseDateRange(HttpServletRequest req) {
        String periodParam = req.getParameter("period");
        String rangeParam = req.getParameter("range");
        String startDateStr = req.getParameter("startDate");
        String endDateStr = req.getParameter("endDate");

        Calendar cal = Calendar.getInstance();
        Date today = new Date(cal.getTimeInMillis());

        // 1. Explicit start and end date
        if (startDateStr != null && endDateStr != null && !startDateStr.trim().isEmpty() && !endDateStr.trim().isEmpty()) {
            try {
                Date sDate = Date.valueOf(startDateStr.trim());
                Date eDate = Date.valueOf(endDateStr.trim());
                return new DateRange(sDate, eDate, "Custom (" + startDateStr + " - " + endDateStr + ")");
            } catch (Exception ignored) {}
        }

        // 2. Period or Range matching
        if ("weekly".equalsIgnoreCase(periodParam) || "week".equalsIgnoreCase(periodParam) || "7".equals(rangeParam)) {
            cal.add(Calendar.DAY_OF_MONTH, -7);
            return new DateRange(new Date(cal.getTimeInMillis()), today, "Past 7 Days");
        }

        if ("quarterly".equalsIgnoreCase(periodParam) || "quarter".equalsIgnoreCase(periodParam) || "90".equals(rangeParam)) {
            cal.add(Calendar.DAY_OF_MONTH, -90);
            return new DateRange(new Date(cal.getTimeInMillis()), today, "Past 90 Days (Quarter)");
        }

        if ("yearly".equalsIgnoreCase(periodParam) || "year".equalsIgnoreCase(periodParam) || "365".equals(rangeParam)) {
            cal.add(Calendar.DAY_OF_MONTH, -365);
            return new DateRange(new Date(cal.getTimeInMillis()), today, "Past 365 Days (Year)");
        }

        if ("all".equalsIgnoreCase(periodParam) || "all".equalsIgnoreCase(rangeParam)) {
            cal.add(Calendar.DAY_OF_MONTH, -730);
            return new DateRange(new Date(cal.getTimeInMillis()), today, "All Time History");
        }

        // Default: Past 30 Days (Current Monthly Report)
        cal.add(Calendar.DAY_OF_MONTH, -30);
        return new DateRange(new Date(cal.getTimeInMillis()), today, "August 2026");
    }

    private String getParam(Map<String, String> json, HttpServletRequest req, String key) {
        if (json != null && json.containsKey(key) && json.get(key) != null) {
            return json.get(key);
        }
        return req.getParameter(key);
    }

    private User getAuthenticatedUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        Object userObj = session.getAttribute("user");
        if (userObj instanceof User) return (User) userObj;
        return null;
    }

    private void setupJsonResponse(HttpServletResponse resp, int statusCode) {
        resp.setStatus(statusCode);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        resp.setHeader("Pragma", "no-cache");
    }

    private String readRequestBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return sb.toString();
    }
}
