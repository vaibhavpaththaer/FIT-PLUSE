package dao;

import model.Coach;
import model.User;
import util.DBConnection;
import util.PasswordUtil;

import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Data Access Object for Admin operations.
 * Provides platform-wide KPI aggregation, user/coach administration,
 * relational coach assignments, platform analytics, broadcast notifications,
 * and real-time database/system health monitoring.
 */
public class AdminDAO {

    private final UserDAO userDAO = new UserDAO();
    private final CoachDAO coachDAO = new CoachDAO();


    // =========================================================================
    // 1. PLATFORM OVERVIEW & LIVE METRICS
    // =========================================================================

    /**
     * Aggregates real-time platform statistics across all relational database tables.
     */
    public Map<String, Object> getPlatformOverviewStats() throws SQLException {
        Map<String, Object> stats = new LinkedHashMap<>();
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.createStatement();

            // 1. User & Coach Counts
            int totalUsers = 0;
            int totalAthletes = 0;
            int totalCoachUsers = 0;
            int totalAdmins = 0;
            int assignedAthletes = 0;
            int unassignedAthletes = 0;

            rs = stmt.executeQuery("SELECT `role`, COUNT(*) AS cnt, " +
                    "SUM(CASE WHEN `assigned_coach_id` IS NOT NULL THEN 1 ELSE 0 END) AS assigned_cnt " +
                    "FROM `users` GROUP BY `role`");
            while (rs.next()) {
                String role = rs.getString("role");
                int count = rs.getInt("cnt");
                totalUsers += count;
                if ("user".equalsIgnoreCase(role)) {
                    totalAthletes = count;
                    assignedAthletes = rs.getInt("assigned_cnt");
                    unassignedAthletes = totalAthletes - assignedAthletes;
                } else if ("coach".equalsIgnoreCase(role)) {
                    totalCoachUsers = count;
                } else if ("admin".equalsIgnoreCase(role)) {
                    totalAdmins = count;
                }
            }
            rs.close();

            // 2. Coaches in coaches table
            int totalCoaches = 0;
            int activeCoaches = 0;
            rs = stmt.executeQuery("SELECT COUNT(*) AS total, " +
                    "SUM(CASE WHEN `is_active` = TRUE THEN 1 ELSE 0 END) AS active_cnt " +
                    "FROM `coaches`");
            if (rs.next()) {
                totalCoaches = rs.getInt("total");
                activeCoaches = rs.getInt("active_cnt");
            }
            rs.close();

            // 3. Workouts & Calories
            int totalWorkouts = 0;
            int completedWorkouts = 0;
            long totalCaloriesBurned = 0;
            rs = stmt.executeQuery("SELECT COUNT(*) AS total, " +
                    "SUM(CASE WHEN `is_completed` = TRUE THEN 1 ELSE 0 END) AS completed, " +
                    "COALESCE(SUM(`calories_burned`), 0) AS total_cals " +
                    "FROM `workouts`");
            if (rs.next()) {
                totalWorkouts = rs.getInt("total");
                completedWorkouts = rs.getInt("completed");
                totalCaloriesBurned = rs.getLong("total_cals");
            }
            rs.close();

            // If workout calories sum is 0, fall back to users total_calories_burned sum
            if (totalCaloriesBurned == 0) {
                rs = stmt.executeQuery("SELECT COALESCE(SUM(`total_calories_burned`), 0) AS total_cals FROM `users`");
                if (rs.next()) {
                    totalCaloriesBurned = rs.getLong("total_cals");
                }
                rs.close();
            }

            double workoutCompletionRate = (totalWorkouts > 0)
                    ? Math.round((completedWorkouts * 100.0 / totalWorkouts) * 10.0) / 10.0
                    : 0.0;

            // 4. Diet Plans
            int totalDietPlans = 0;
            int activeDietPlans = 0;
            rs = stmt.executeQuery("SELECT COUNT(*) AS total, " +
                    "SUM(CASE WHEN `is_active` = TRUE THEN 1 ELSE 0 END) AS active_cnt " +
                    "FROM `diet_plans`");
            if (rs.next()) {
                totalDietPlans = rs.getInt("total");
                activeDietPlans = rs.getInt("active_cnt");
            }
            rs.close();

            // 5. Progress Logs
            int totalProgressLogs = 0;
            rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM `progress`");
            if (rs.next()) {
                totalProgressLogs = rs.getInt("total");
            }
            rs.close();

            // 6. Messages
            int totalMessages = 0;
            rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM `messages`");
            if (rs.next()) {
                totalMessages = rs.getInt("total");
            }
            rs.close();

            // 7. Notifications
            int totalNotifications = 0;
            rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM `notifications`");
            if (rs.next()) {
                totalNotifications = rs.getInt("total");
            }
            rs.close();

            // 8. Reports
            int totalReports = 0;
            rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM `reports`");
            if (rs.next()) {
                totalReports = rs.getInt("total");
            }
            rs.close();

            // 9. Active Users in last 30 days
            int activeUsersLast30Days = 0;
            rs = stmt.executeQuery("SELECT COUNT(DISTINCT user_id) AS cnt FROM (" +
                    "SELECT `user_id` FROM `workouts` WHERE `created_at` >= DATE_SUB(NOW(), INTERVAL 30 DAY) " +
                    "UNION " +
                    "SELECT `user_id` FROM `progress` WHERE `recorded_at` >= DATE_SUB(NOW(), INTERVAL 30 DAY) " +
                    "UNION " +
                    "SELECT `user_id` FROM `reports` WHERE `generated_at` >= DATE_SUB(NOW(), INTERVAL 30 DAY) " +
                    ") t");
            if (rs.next()) {
                activeUsersLast30Days = rs.getInt("cnt");
            }
            rs.close();

            if (activeUsersLast30Days == 0 && totalAthletes > 0) {
                activeUsersLast30Days = totalAthletes;
            }

            // Populate output map
            stats.put("totalUsers", totalUsers);
            stats.put("totalAthletes", totalAthletes);
            stats.put("totalCoachUsers", totalCoachUsers);
            stats.put("totalAdmins", totalAdmins);
            stats.put("totalCoaches", totalCoaches);
            stats.put("activeCoaches", activeCoaches);
            stats.put("assignedAthletes", assignedAthletes);
            stats.put("unassignedAthletes", unassignedAthletes);
            stats.put("totalWorkouts", totalWorkouts);
            stats.put("completedWorkouts", completedWorkouts);
            stats.put("workoutCompletionRate", workoutCompletionRate);
            stats.put("totalCaloriesBurned", totalCaloriesBurned);
            stats.put("totalDietPlans", totalDietPlans);
            stats.put("activeDietPlans", activeDietPlans);
            stats.put("totalProgressLogs", totalProgressLogs);
            stats.put("totalMessages", totalMessages);
            stats.put("totalNotifications", totalNotifications);
            stats.put("totalReports", totalReports);
            stats.put("activeUsersLast30Days", activeUsersLast30Days);

            return stats;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    // =========================================================================
    // 2. USER MANAGEMENT & RELATIONAL QUERIES
    // =========================================================================

    /**
     * Retrieves paginated, filtered, and searched user management records.
     */
    public List<Map<String, Object>> getUserManagementList(String search, String role, String goal,
                                                           Integer coachId, int limit, int offset) throws SQLException {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT u.*, c.full_name AS coach_name, c.avatar_url AS coach_avatar ")
                .append("FROM `users` u ")
                .append("LEFT JOIN `coaches` c ON u.assigned_coach_id = c.id ")
                .append("WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (u.full_name LIKE ? OR u.email LIKE ? OR u.mobile_number LIKE ?) ");
            String wild = "%" + search.trim() + "%";
            params.add(wild);
            params.add(wild);
            params.add(wild);
        }
        if (role != null && !role.trim().isEmpty() && !"all".equalsIgnoreCase(role.trim())) {
            sql.append("AND u.role = ? ");
            params.add(role.trim().toLowerCase());
        }
        if (goal != null && !goal.trim().isEmpty() && !"all".equalsIgnoreCase(goal.trim())) {
            sql.append("AND u.fitness_goal = ? ");
            params.add(goal.trim());
        }
        if (coachId != null) {
            if (coachId == 0) {
                sql.append("AND u.assigned_coach_id IS NULL ");
            } else if (coachId > 0) {
                sql.append("AND u.assigned_coach_id = ? ");
                params.add(coachId);
            }
        }

        sql.append("ORDER BY u.id DESC ");
        if (limit > 0) {
            sql.append("LIMIT ? OFFSET ? ");
            params.add(limit);
            params.add(Math.max(0, offset));
        }

        List<Map<String, Object>> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            rs = ps.executeQuery();
            while (rs.next()) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", rs.getInt("id"));
                map.put("fullName", rs.getString("full_name"));
                map.put("email", rs.getString("email"));
                map.put("mobileCountry", rs.getString("mobile_country"));
                map.put("mobileNumber", rs.getString("mobile_number"));
                map.put("gender", rs.getString("gender"));
                map.put("age", rs.getInt("age"));
                map.put("heightCm", rs.getDouble("height_cm"));
                map.put("weightKg", rs.getDouble("weight_kg"));
                map.put("targetWeightKg", rs.getDouble("target_weight_kg"));
                map.put("fitnessGoal", rs.getString("fitness_goal"));
                map.put("activityLevel", rs.getString("activity_level"));
                map.put("gymExperience", rs.getString("gym_experience"));
                map.put("workoutPreference", rs.getString("workout_preference"));
                map.put("role", rs.getString("role"));
                map.put("assignedCoachId", rs.getObject("assigned_coach_id"));
                map.put("assignedCoachName", rs.getString("coach_name"));
                map.put("assignedCoachAvatar", rs.getString("coach_avatar"));
                map.put("streakDays", rs.getInt("streak_days"));
                map.put("totalWorkouts", rs.getInt("total_workouts"));
                map.put("totalCaloriesBurned", rs.getInt("total_calories_burned"));
                map.put("memberSince", rs.getString("member_since"));
                map.put("createdAt", rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toString() : "");

                // Compute BMI
                double wt = rs.getDouble("weight_kg");
                double ht = rs.getDouble("height_cm");
                double bmi = 0.0;
                if (wt > 0 && ht > 0) {
                    double hM = ht / 100.0;
                    bmi = Math.round((wt / (hM * hM)) * 10.0) / 10.0;
                }
                map.put("bmi", bmi);

                list.add(map);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Counts total users matching search and filter criteria for pagination.
     */
    public int getUserCount(String search, String role, String goal, Integer coachId) throws SQLException {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM `users` WHERE 1=1 ");
        List<Object> params = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (full_name LIKE ? OR email LIKE ? OR mobile_number LIKE ?) ");
            String wild = "%" + search.trim() + "%";
            params.add(wild);
            params.add(wild);
            params.add(wild);
        }
        if (role != null && !role.trim().isEmpty() && !"all".equalsIgnoreCase(role.trim())) {
            sql.append("AND role = ? ");
            params.add(role.trim().toLowerCase());
        }
        if (goal != null && !goal.trim().isEmpty() && !"all".equalsIgnoreCase(goal.trim())) {
            sql.append("AND fitness_goal = ? ");
            params.add(goal.trim());
        }
        if (coachId != null) {
            if (coachId == 0) {
                sql.append("AND assigned_coach_id IS NULL ");
            } else if (coachId > 0) {
                sql.append("AND assigned_coach_id = ? ");
                params.add(coachId);
            }
        }

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql.toString());
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt(1);
            }
            return 0;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves detailed profile and relational summary for a single user.
     */
    public Map<String, Object> getUserDetails(int userId) throws SQLException {
        User user = userDAO.getUserById(userId);
        if (user == null) {
            return null;
        }

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("user", user);

        // Fetch assigned coach if any
        if (user.getAssignedCoachId() != null && user.getAssignedCoachId() > 0) {
            Coach coach = coachDAO.getCoachById(user.getAssignedCoachId());
            details.put("coach", coach);
        } else {
            details.put("coach", null);
        }

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();

            // 1. Total workouts logged & completed
            ps = conn.prepareStatement("SELECT COUNT(*) as total, " +
                    "SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed, " +
                    "COALESCE(SUM(calories_burned), 0) as cals " +
                    "FROM `workouts` WHERE `user_id` = ?");
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            if (rs.next()) {
                details.put("workoutsCount", rs.getInt("total"));
                details.put("workoutsCompleted", rs.getInt("completed"));
                details.put("workoutCaloriesBurned", rs.getLong("cals"));
            }
            rs.close();
            ps.close();

            // 2. Active Diet Plan
            ps = conn.prepareStatement("SELECT * FROM `diet_plans` WHERE `user_id` = ? AND `is_active` = TRUE LIMIT 1");
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            if (rs.next()) {
                Map<String, Object> dp = new LinkedHashMap<>();
                dp.put("id", rs.getInt("id"));
                dp.put("title", rs.getString("title"));
                dp.put("planType", rs.getString("plan_type"));
                dp.put("targetCalories", rs.getInt("target_calories"));
                details.put("activeDietPlan", dp);
            } else {
                details.put("activeDietPlan", null);
            }
            rs.close();
            ps.close();

            // 3. Progress Entries Count
            ps = conn.prepareStatement("SELECT COUNT(*) as cnt FROM `progress` WHERE `user_id` = ?");
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            if (rs.next()) {
                details.put("progressLogsCount", rs.getInt("cnt"));
            }
            rs.close();
            ps.close();

            // 4. Reports Count
            ps = conn.prepareStatement("SELECT COUNT(*) as cnt FROM `reports` WHERE `user_id` = ?");
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            if (rs.next()) {
                details.put("reportsCount", rs.getInt("cnt"));
            }

            return details;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Creates a new user via the Admin interface with cryptographic password hashing.
     */
    public int createUserByAdmin(User user, String rawPassword) throws SQLException {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            rawPassword = "Password@123";
        }
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(rawPassword, salt);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hash);

        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("user");
        }

        return userDAO.createUser(user);
    }

    /**
     * Updates user details from Admin Console.
     */
    public boolean updateUserByAdmin(User user, String rawPassword) throws SQLException {
        StringBuilder sql = new StringBuilder("UPDATE `users` SET " +
                "`full_name` = ?, `email` = ?, `mobile_country` = ?, `mobile_number` = ?, " +
                "`gender` = ?, `age` = ?, `height_cm` = ?, `weight_kg` = ?, `target_weight_kg` = ?, " +
                "`fitness_goal` = ?, `activity_level` = ?, `gym_experience` = ?, `workout_preference` = ?, " +
                "`role` = ?, `assigned_coach_id` = ? ");

        boolean updatePass = (rawPassword != null && !rawPassword.trim().isEmpty());
        if (updatePass) {
            sql.append(", `password_hash` = ?, `password_salt` = ? ");
        }
        sql.append("WHERE `id` = ?");

        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql.toString());

            int idx = 1;
            ps.setString(idx++, user.getFullName());
            ps.setString(idx++, user.getEmail() != null ? user.getEmail().trim().toLowerCase() : "");
            ps.setString(idx++, user.getMobileCountry() != null ? user.getMobileCountry() : "+91");
            ps.setString(idx++, user.getMobileNumber());
            ps.setString(idx++, user.getGender());
            ps.setInt(idx++, user.getAge());
            ps.setDouble(idx++, user.getHeightCm());
            ps.setDouble(idx++, user.getWeightKg());
            if (user.getTargetWeightKg() != null) {
                ps.setDouble(idx++, user.getTargetWeightKg());
            } else {
                ps.setNull(idx++, Types.DOUBLE);
            }
            ps.setString(idx++, user.getFitnessGoal());
            ps.setString(idx++, user.getActivityLevel());
            ps.setString(idx++, user.getGymExperience());
            ps.setString(idx++, user.getWorkoutPreference());
            ps.setString(idx++, user.getRole() != null ? user.getRole().toLowerCase() : "user");

            if (user.getAssignedCoachId() != null && user.getAssignedCoachId() > 0) {
                ps.setInt(idx++, user.getAssignedCoachId());
            } else {
                ps.setNull(idx++, Types.INTEGER);
            }

            if (updatePass) {
                String salt = PasswordUtil.generateSalt();
                String hash = PasswordUtil.hashPassword(rawPassword, salt);
                ps.setString(idx++, hash);
                ps.setString(idx++, salt);
            }

            ps.setInt(idx, user.getId());

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(null, ps, conn);
        }
    }

    /**
     * Deletes user and associated records.
     */
    public boolean deleteUserByAdmin(int userId) throws SQLException {
        return userDAO.deleteUser(userId);
    }

    // =========================================================================
    // 3. COACH ASSIGNMENT ENGINE
    // =========================================================================

    /**
     * Assigns or unassigns a coach for a single user.
     */
    public boolean assignCoachToUser(int userId, Integer coachId) throws SQLException {
        String sql = "UPDATE `users` SET `assigned_coach_id` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            if (coachId != null && coachId > 0) {
                ps.setInt(1, coachId);
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(null, ps, conn);
        }
    }

    /**
     * Bulk assigns a coach to multiple users.
     */
    public int bulkAssignCoach(List<Integer> userIds, Integer coachId) throws SQLException {
        if (userIds == null || userIds.isEmpty()) return 0;

        String sql = "UPDATE `users` SET `assigned_coach_id` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);
            ps = conn.prepareStatement(sql);

            for (Integer uId : userIds) {
                if (coachId != null && coachId > 0) {
                    ps.setInt(1, coachId);
                } else {
                    ps.setNull(1, Types.INTEGER);
                }
                ps.setInt(2, uId);
                ps.addBatch();
            }

            int[] results = ps.executeBatch();
            conn.commit();

            int updated = 0;
            for (int r : results) {
                if (r > 0 || r == Statement.SUCCESS_NO_INFO) updated++;
            }
            return updated;
        } catch (SQLException ex) {
            if (conn != null) conn.rollback();
            throw ex;
        } finally {
            if (conn != null) conn.setAutoCommit(true);
            DBConnection.close(null, ps, conn);
        }
    }

    // =========================================================================
    // 4. PLATFORM ANALYTICS & INTELLIGENCE
    // =========================================================================

    /**
     * Gathers cross-sectional distribution analytics for platform intelligence charts.
     */
    public Map<String, Object> getPlatformAnalytics() throws SQLException {
        Map<String, Object> analytics = new LinkedHashMap<>();
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            stmt = conn.createStatement();

            // 1. Goal Distribution
            Map<String, Integer> goalDist = new LinkedHashMap<>();
            rs = stmt.executeQuery("SELECT `fitness_goal`, COUNT(*) AS cnt " +
                    "FROM `users` WHERE `role` = 'user' GROUP BY `fitness_goal`");
            while (rs.next()) {
                String goal = rs.getString("fitness_goal");
                goalDist.put(goal != null ? goal : "unspecified", rs.getInt("cnt"));
            }
            rs.close();
            analytics.put("goalDistribution", goalDist);

            // 2. Activity Level Distribution
            Map<String, Integer> actDist = new LinkedHashMap<>();
            rs = stmt.executeQuery("SELECT `activity_level`, COUNT(*) AS cnt " +
                    "FROM `users` WHERE `role` = 'user' GROUP BY `activity_level`");
            while (rs.next()) {
                String act = rs.getString("activity_level");
                actDist.put(act != null ? act : "moderate", rs.getInt("cnt"));
            }
            rs.close();
            analytics.put("activityDistribution", actDist);

            // 3. Gym Experience Distribution
            Map<String, Integer> expDist = new LinkedHashMap<>();
            rs = stmt.executeQuery("SELECT `gym_experience`, COUNT(*) AS cnt " +
                    "FROM `users` WHERE `role` = 'user' GROUP BY `gym_experience`");
            while (rs.next()) {
                String exp = rs.getString("gym_experience");
                expDist.put(exp != null ? exp : "intermediate", rs.getInt("cnt"));
            }
            rs.close();
            analytics.put("experienceDistribution", expDist);

            // 4. Coach Client Workload
            List<Map<String, Object>> coachWorkload = new ArrayList<>();
            rs = stmt.executeQuery("SELECT c.id, c.full_name, c.rating, COUNT(u.id) AS client_count " +
                    "FROM `coaches` c " +
                    "LEFT JOIN `users` u ON c.id = u.assigned_coach_id " +
                    "WHERE c.is_active = TRUE " +
                    "GROUP BY c.id " +
                    "ORDER BY client_count DESC");
            while (rs.next()) {
                Map<String, Object> cw = new LinkedHashMap<>();
                cw.put("coachId", rs.getInt("id"));
                cw.put("coachName", rs.getString("full_name"));
                cw.put("rating", rs.getDouble("rating"));
                cw.put("clientCount", rs.getInt("client_count"));
                coachWorkload.add(cw);
            }
            rs.close();
            analytics.put("coachWorkload", coachWorkload);

            // 5. Workout Type Breakdown
            Map<String, Integer> workoutTypes = new LinkedHashMap<>();
            rs = stmt.executeQuery("SELECT `category`, COUNT(*) AS cnt FROM `workouts` GROUP BY `category`");
            while (rs.next()) {
                String wt = rs.getString("category");
                workoutTypes.put(wt != null ? wt : "general", rs.getInt("cnt"));
            }
            rs.close();
            analytics.put("workoutTypeDistribution", workoutTypes);

            // 6. Registration Trend (Last 7 Days)
            List<Map<String, Object>> regTrend = new ArrayList<>();
            rs = stmt.executeQuery("SELECT DATE(`created_at`) AS reg_date, COUNT(*) AS count " +
                    "FROM `users` " +
                    "GROUP BY DATE(`created_at`) " +
                    "ORDER BY reg_date DESC LIMIT 7");
            while (rs.next()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("date", rs.getString("reg_date"));
                item.put("count", rs.getInt("count"));
                regTrend.add(item);
            }
            rs.close();
            analytics.put("registrationTrend", regTrend);

            return analytics;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }

    // =========================================================================
    // 5. SYSTEM BROADCAST NOTIFICATIONS
    // =========================================================================

    /**
     * Broadcasts a push notification to all users matching target role ('all', 'user', 'coach', 'admin').
     */
    public int broadcastSystemNotification(String title, String message, String notifType,
                                            String targetRole, String targetUrl) throws SQLException {
        StringBuilder sqlUsers = new StringBuilder("SELECT `id` FROM `users` WHERE 1=1 ");
        if (targetRole != null && !targetRole.trim().isEmpty() && !"all".equalsIgnoreCase(targetRole.trim())) {
            sqlUsers.append("AND `role` = ?");
        }

        Connection conn = null;
        PreparedStatement psUsers = null;
        PreparedStatement psInsert = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            psUsers = conn.prepareStatement(sqlUsers.toString());
            if (targetRole != null && !targetRole.trim().isEmpty() && !"all".equalsIgnoreCase(targetRole.trim())) {
                psUsers.setString(1, targetRole.trim().toLowerCase());
            }

            rs = psUsers.executeQuery();
            List<Integer> recipientIds = new ArrayList<>();
            while (rs.next()) {
                recipientIds.add(rs.getInt("id"));
            }
            rs.close();

            if (recipientIds.isEmpty()) {
                conn.setAutoCommit(true);
                return 0;
            }

            String insertSql = "INSERT INTO `notifications` (`user_id`, `title`, `message`, `notif_type`, `target_url`, `is_read`) " +
                    "VALUES (?, ?, ?, ?, ?, FALSE)";
            psInsert = conn.prepareStatement(insertSql);

            String safeType = (notifType != null && !notifType.trim().isEmpty()) ? notifType.trim().toLowerCase() : "system";
            String safeUrl = (targetUrl != null) ? targetUrl.trim() : "";

            for (Integer uId : recipientIds) {
                psInsert.setInt(1, uId);
                psInsert.setString(2, title);
                psInsert.setString(3, message);
                psInsert.setString(4, safeType);
                psInsert.setString(5, safeUrl);
                psInsert.addBatch();
            }

            int[] results = psInsert.executeBatch();
            conn.commit();

            int inserted = 0;
            for (int r : results) {
                if (r > 0 || r == Statement.SUCCESS_NO_INFO) inserted++;
            }
            return inserted;
        } catch (SQLException ex) {
            if (conn != null) conn.rollback();
            throw ex;
        } finally {
            if (conn != null) conn.setAutoCommit(true);
            DBConnection.close(rs, psUsers, null);
            DBConnection.close(null, psInsert, conn);
        }
    }

    // =========================================================================
    // 6. SYSTEM HEALTH & DIAGNOSTICS
    // =========================================================================

    /**
     * Collects live server, JVM, and database connection pool diagnostics.
     */
    public Map<String, Object> getSystemHealth() throws SQLException {
        Map<String, Object> health = new LinkedHashMap<>();
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            DatabaseMetaData meta = conn.getMetaData();

            health.put("status", "HEALTHY");
            health.put("databaseConnected", true);
            health.put("databaseProductName", meta.getDatabaseProductName());
            health.put("databaseProductVersion", meta.getDatabaseProductVersion());
            health.put("driverName", meta.getDriverName());
            health.put("driverVersion", meta.getDriverVersion());

            // JVM Runtime Stats
            Runtime rt = Runtime.getRuntime();
            long totalMem = rt.totalMemory() / (1024 * 1024);
            long freeMem = rt.freeMemory() / (1024 * 1024);
            long maxMem = rt.maxMemory() / (1024 * 1024);
            long usedMem = totalMem - freeMem;

            Map<String, Object> jvm = new LinkedHashMap<>();
            jvm.put("usedMemoryMB", usedMem);
            jvm.put("freeMemoryMB", freeMem);
            jvm.put("totalMemoryMB", totalMem);
            jvm.put("maxMemoryMB", maxMem);
            jvm.put("availableProcessors", rt.availableProcessors());
            jvm.put("jvmUptimeSeconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
            jvm.put("javaVersion", System.getProperty("java.version"));
            health.put("jvm", jvm);

            // Table Row Counts
            stmt = conn.createStatement();
            Map<String, Integer> tableCounts = new LinkedHashMap<>();
            String[] tables = {"users", "coaches", "workouts", "diet_plans", "progress", "messages", "notifications", "reports"};
            for (String table : tables) {
                try {
                    rs = stmt.executeQuery("SELECT COUNT(*) FROM `" + table + "`");
                    if (rs.next()) {
                        tableCounts.put(table, rs.getInt(1));
                    }
                    rs.close();
                } catch (SQLException ignored) {
                    tableCounts.put(table, 0);
                }
            }
            health.put("tableCounts", tableCounts);
            health.put("serverTime", new java.util.Date().toString());

            return health;
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }
}
