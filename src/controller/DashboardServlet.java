package controller;

import dao.CoachDAO;
import dao.DietDAO;
import dao.NotificationDAO;
import dao.ProgressDAO;
import dao.UserDAO;
import dao.WorkoutDAO;
import model.Coach;
import model.DietPlan;
import model.Notification;
import model.Progress;
import model.User;
import model.Workout;
import util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Date;
import java.sql.SQLException;
import java.util.List;

/**
 * Controller servlet for the main User Dashboard.
 * Aggregates live database metrics, workouts, diet, notifications, and progress charts.
 */
@WebServlet(name = "DashboardServlet", urlPatterns = {"/api/dashboard", "/api/dashboard/*", "/api/user/dashboard", "/dashboard"})
public class DashboardServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final ProgressDAO progressDAO = new ProgressDAO();
    private final WorkoutDAO workoutDAO = new WorkoutDAO();
    private final DietDAO dietDAO = new DietDAO();
    private final NotificationDAO notificationDAO = new NotificationDAO();
    private final CoachDAO coachDAO = new CoachDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        resp.setHeader("Pragma", "no-cache");

        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        User sessionUser = (session != null) ? (User) session.getAttribute("user") : null;

        if (sessionUser == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required. Please log in.\"}");
            return;
        }

        try {
            int userId = sessionUser.getId();
            User liveUser = userDAO.getUserById(userId);
            if (liveUser == null) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"User account not found.\"}");
                return;
            }

            // Keep session in sync
            session.setAttribute("user", liveUser);

            // 1. BMI Calculation
            double weight = liveUser.getWeightKg();
            double height = liveUser.getHeightCm();
            double bmi = 22.0;
            if (height > 0) {
                double hm = height / 100.0;
                bmi = Math.round((weight / (hm * hm)) * 10.0) / 10.0;
            }

            String bmiCategory;
            if (bmi < 18.5) bmiCategory = "Underweight";
            else if (bmi < 25.0) bmiCategory = "Normal";
            else if (bmi < 30.0) bmiCategory = "Overweight";
            else bmiCategory = "Obese";

            // 2. Latest Progress / Daily Metrics
            Progress latestProgress = progressDAO.getLatestProgress(userId);
            int caloriesBurned = (latestProgress != null) ? latestProgress.getCaloriesBurned() : 0;
            int steps = (latestProgress != null) ? latestProgress.getSteps() : 0;
            double waterLiters = (latestProgress != null) ? latestProgress.getWaterLiters() : 0.0;
            double sleepHours = (latestProgress != null) ? latestProgress.getSleepHours() : 0.0;

            // 3. Active Diet Plan & Calorie Targets
            DietPlan activeDiet = dietDAO.getActiveDietPlanByUserId(userId);
            int calorieTarget = (activeDiet != null && activeDiet.getTargetCalories() > 0) ? activeDiet.getTargetCalories() : 2400;
            int caloriesRemaining = Math.max(0, calorieTarget - caloriesBurned);

            // 4. Today's Scheduled Workout
            Date today = new Date(System.currentTimeMillis());
            Workout todayWorkout = workoutDAO.getWorkoutByDate(userId, today);
            if (todayWorkout == null) {
                // If not scheduled for today specifically, get most recent workout
                List<Workout> recentWorkouts = workoutDAO.getWorkoutsByUserId(userId);
                if (!recentWorkouts.isEmpty()) {
                    todayWorkout = recentWorkouts.get(0);
                }
            }

            // 5. 7-Day Progress History for Chart.js
            List<Progress> historyList = progressDAO.getProgressHistory(userId, 7);

            // 6. Notifications & Unread Count
            List<Notification> notifs = notificationDAO.getNotificationsByUserId(userId, 5);
            int unreadCount = notificationDAO.getUnreadCount(userId);

            // 7. Assigned Coach Details
            Coach coach = null;
            if (liveUser.getAssignedCoachId() != null && liveUser.getAssignedCoachId() > 0) {
                coach = coachDAO.getCoachById(liveUser.getAssignedCoachId());
            } else {
                coach = coachDAO.getCoachById(1); // Default Coach Rahul
            }

            // Build Comprehensive JSON Response
            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"success\":true,");
            sb.append("\"user\":").append(JsonUtil.userToJson(liveUser)).append(",");

            // Metrics Summary Block
            sb.append("\"metrics\":{");
            sb.append("\"weightKg\":").append(weight).append(",");
            sb.append("\"heightCm\":").append(height).append(",");
            sb.append("\"bmi\":").append(bmi).append(",");
            sb.append("\"bmiCategory\":\"").append(bmiCategory).append("\",");
            sb.append("\"caloriesBurned\":").append(caloriesBurned).append(",");
            sb.append("\"calorieTarget\":").append(calorieTarget).append(",");
            sb.append("\"caloriesRemaining\":").append(caloriesRemaining).append(",");
            sb.append("\"waterLiters\":").append(waterLiters).append(",");
            sb.append("\"waterTargetLiters\":3.5,");
            sb.append("\"steps\":").append(steps).append(",");
            sb.append("\"stepTarget\":10000,");
            sb.append("\"sleepHours\":").append(sleepHours).append(",");
            sb.append("\"streakDays\":").append(liveUser.getStreakDays()).append(",");
            sb.append("\"totalWorkouts\":").append(liveUser.getTotalWorkouts()).append(",");
            sb.append("\"totalCaloriesBurned\":").append(liveUser.getTotalCaloriesBurned());
            sb.append("},");

            // Today Workout
            sb.append("\"todayWorkout\":").append(todayWorkout != null ? JsonUtil.workoutToJson(todayWorkout) : "null").append(",");

            // Active Diet Plan
            sb.append("\"activeDiet\":").append(activeDiet != null ? JsonUtil.dietPlanToJson(activeDiet) : "null").append(",");

            // Progress History Array
            sb.append("\"history\":").append(JsonUtil.progressListToJson(historyList)).append(",");

            // Notifications
            sb.append("\"notifications\":").append(JsonUtil.notificationListToJson(notifs)).append(",");
            sb.append("\"unreadNotifCount\":").append(unreadCount).append(",");

            // Coach
            sb.append("\"coach\":").append(coach != null ? JsonUtil.coachToJson(coach) : "null");

            sb.append("}");

            resp.setStatus(HttpServletResponse.SC_OK);
            out.write(sb.toString());

        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }
}
