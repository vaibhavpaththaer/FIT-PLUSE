package dao;

import model.User;
import util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for User entities.
 * Handles database operations against the `users` table.
 */
public class UserDAO {

    static {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("ALTER TABLE `users` MODIFY COLUMN `avatar_url` LONGTEXT");
        } catch (Exception ignored) {}
    }

    /**
     * Creates a new user record.
     * @return Generated user ID or -1 on failure
     */
    public int createUser(User user) throws SQLException {
        String sql = "INSERT INTO `users` (" +
                "`full_name`, `email`, `mobile_country`, `mobile_number`, " +
                "`password_hash`, `password_salt`, `gender`, `age`, " +
                "`height_cm`, `weight_kg`, `target_weight_kg`, `fitness_goal`, " +
                "`activity_level`, `gym_experience`, `workout_preference`, " +
                "`workout_days`, `workout_duration_min`, `diet_preference`, " +
                "`water_intake`, `sleep_hours`, `medical_conditions`, " +
                "`medical_details`, `avatar_url`, `role`, `assigned_coach_id`, " +
                "`streak_days`, `total_workouts`, `total_calories_burned`, " +
                "`member_since`, `preferred_language`" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);

            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getMobileCountry() != null ? user.getMobileCountry() : "+91");
            ps.setString(4, user.getMobileNumber());
            ps.setString(5, user.getPasswordHash());
            ps.setString(6, user.getPasswordSalt());
            ps.setString(7, user.getGender() != null ? user.getGender() : "male");
            ps.setInt(8, user.getAge());
            ps.setDouble(9, user.getHeightCm());
            ps.setDouble(10, user.getWeightKg());

            if (user.getTargetWeightKg() != null) {
                ps.setDouble(11, user.getTargetWeightKg());
            } else {
                ps.setNull(11, Types.DOUBLE);
            }

            ps.setString(12, user.getFitnessGoal() != null ? user.getFitnessGoal() : "muscle");
            ps.setString(13, user.getActivityLevel() != null ? user.getActivityLevel() : "moderate");
            ps.setString(14, user.getGymExperience() != null ? user.getGymExperience() : "intermediate");
            ps.setString(15, user.getWorkoutPreference() != null ? user.getWorkoutPreference() : "gym");
            ps.setString(16, user.getWorkoutDays() != null ? user.getWorkoutDays() : "4-5");
            ps.setInt(17, user.getWorkoutDurationMin() > 0 ? user.getWorkoutDurationMin() : 45);
            ps.setString(18, user.getDietPreference() != null ? user.getDietPreference() : "non-vegetarian");
            ps.setString(19, user.getWaterIntake() != null ? user.getWaterIntake() : "2-3L");
            ps.setString(20, user.getSleepHours() != null ? user.getSleepHours() : "6-8");
            ps.setString(21, user.getMedicalConditions() != null ? user.getMedicalConditions() : "no");
            ps.setString(22, user.getMedicalDetails());
            ps.setString(23, user.getAvatarUrl());
            ps.setString(24, user.getRole() != null ? user.getRole() : "user");

            if (user.getAssignedCoachId() != null && user.getAssignedCoachId() > 0) {
                ps.setInt(25, user.getAssignedCoachId());
            } else {
                ps.setNull(25, Types.INTEGER);
            }

            ps.setInt(26, user.getStreakDays());
            ps.setInt(27, user.getTotalWorkouts());
            ps.setInt(28, user.getTotalCaloriesBurned());
            ps.setString(29, user.getMemberSince() != null ? user.getMemberSince() : "Feb 2026");
            ps.setString(30, user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "en");

            int affected = ps.executeUpdate();
            if (affected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int generatedId = rs.getInt(1);
                    user.setId(generatedId);
                    return generatedId;
                }
            }
            return -1;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves user by unique ID with assigned coach name joined.
     */
    public User getUserById(int id) throws SQLException {
        String sql = "SELECT u.*, c.full_name AS coach_name FROM `users` u " +
                "LEFT JOIN `coaches` c ON u.assigned_coach_id = c.id " +
                "WHERE u.`id` = ?";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, id);
            rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves user by email with assigned coach name joined.
     */
    public User getUserByEmail(String email) throws SQLException {
        String sql = "SELECT u.*, c.full_name AS coach_name FROM `users` u " +
                "LEFT JOIN `coaches` c ON u.assigned_coach_id = c.id " +
                "WHERE u.`email` = ?";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, email != null ? email.trim().toLowerCase() : "");
            rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves user by mobile number.
     */
    public User getUserByMobile(String mobile) throws SQLException {
        String sql = "SELECT u.*, c.full_name AS coach_name FROM `users` u " +
                "LEFT JOIN `coaches` c ON u.assigned_coach_id = c.id " +
                "WHERE u.`mobile_number` = ?";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, mobile != null ? mobile.trim() : "");
            rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToUser(rs);
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Checks if email is already registered.
     */
    public boolean isEmailRegistered(String email) throws SQLException {
        String sql = "SELECT 1 FROM `users` WHERE `email` = ? LIMIT 1";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, email != null ? email.trim().toLowerCase() : "");
            rs = ps.executeQuery();
            return rs.next();
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Checks if mobile number is already registered.
     */
    public boolean isMobileRegistered(String mobile) throws SQLException {
        String sql = "SELECT 1 FROM `users` WHERE `mobile_number` = ? LIMIT 1";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, mobile != null ? mobile.trim() : "");
            rs = ps.executeQuery();
            return rs.next();
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Updates full user profile biometrics, preferences, and details.
     */
    public boolean updateUserProfile(User user) throws SQLException {
        String sql = "UPDATE `users` SET " +
                "`full_name` = ?, `mobile_country` = ?, `mobile_number` = ?, " +
                "`gender` = ?, `age` = ?, `height_cm` = ?, `weight_kg` = ?, " +
                "`target_weight_kg` = ?, `fitness_goal` = ?, `activity_level` = ?, " +
                "`gym_experience` = ?, `workout_preference` = ?, `workout_days` = ?, " +
                "`workout_duration_min` = ?, `diet_preference` = ?, `water_intake` = ?, " +
                "`sleep_hours` = ?, `medical_conditions` = ?, `medical_details` = ?, " +
                "`avatar_url` = ?, `assigned_coach_id` = ?, `preferred_language` = ? " +
                "WHERE `id` = ?";

        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);

            ps.setString(1, user.getFullName());
            ps.setString(2, user.getMobileCountry());
            ps.setString(3, user.getMobileNumber());
            ps.setString(4, user.getGender());
            ps.setInt(5, user.getAge());
            ps.setDouble(6, user.getHeightCm());
            ps.setDouble(7, user.getWeightKg());

            if (user.getTargetWeightKg() != null) {
                ps.setDouble(8, user.getTargetWeightKg());
            } else {
                ps.setNull(8, Types.DOUBLE);
            }

            ps.setString(9, user.getFitnessGoal());
            ps.setString(10, user.getActivityLevel());
            ps.setString(11, user.getGymExperience());
            ps.setString(12, user.getWorkoutPreference());
            ps.setString(13, user.getWorkoutDays());
            ps.setInt(14, user.getWorkoutDurationMin());
            ps.setString(15, user.getDietPreference());
            ps.setString(16, user.getWaterIntake());
            ps.setString(17, user.getSleepHours());
            ps.setString(18, user.getMedicalConditions());
            ps.setString(19, user.getMedicalDetails());
            ps.setString(20, user.getAvatarUrl());

            if (user.getAssignedCoachId() != null && user.getAssignedCoachId() > 0) {
                ps.setInt(21, user.getAssignedCoachId());
            } else {
                ps.setNull(21, Types.INTEGER);
            }

            ps.setString(22, user.getPreferredLanguage() != null ? user.getPreferredLanguage() : "en");
            ps.setInt(23, user.getId());

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Updates password hash and salt for a user.
     */
    public boolean updatePassword(int userId, String passwordHash, String passwordSalt) throws SQLException {
        String sql = "UPDATE `users` SET `password_hash` = ?, `password_salt` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, passwordHash);
            ps.setString(2, passwordSalt);
            ps.setInt(3, userId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Updates preferred language for a user.
     */
    public boolean updatePreferredLanguage(int userId, String lang) throws SQLException {
        String sql = "UPDATE `users` SET `preferred_language` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, lang);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Updates user dynamic stats (streak, workouts, calories).
     */
    public boolean updateUserStats(int userId, int streakDays, int totalWorkouts, int totalCalories) throws SQLException {
        String sql = "UPDATE `users` SET `streak_days` = ?, `total_workouts` = ?, `total_calories_burned` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, streakDays);
            ps.setInt(2, totalWorkouts);
            ps.setInt(3, totalCalories);
            ps.setInt(4, userId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Updates only user weight in kg.
     */
    public boolean updateUserWeight(int userId, double weightKg) throws SQLException {
        String sql = "UPDATE `users` SET `weight_kg` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setDouble(1, weightKg);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Assigns a coach to a user.
     */
    public boolean assignCoach(int userId, Integer coachId) throws SQLException {
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
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Deletes user by ID.
     */
    public boolean deleteUser(int userId) throws SQLException {
        String sql = "DELETE FROM `users` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Retrieves all users assigned to a specific coach.
     */
    public List<User> getUsersByCoachId(int coachId) throws SQLException {
        String sql = "SELECT u.*, c.full_name AS coach_name FROM `users` u " +
                "LEFT JOIN `coaches` c ON u.assigned_coach_id = c.id " +
                "WHERE u.assigned_coach_id = ? " +
                "ORDER BY u.full_name ASC";
        List<User> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, coachId);
            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToUser(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves all client users.
     */
    public List<User> getAllUsers() throws SQLException {
        String sql = "SELECT u.*, c.full_name AS coach_name FROM `users` u " +
                "LEFT JOIN `coaches` c ON u.assigned_coach_id = c.id " +
                "WHERE u.role = 'user' " +
                "ORDER BY u.full_name ASC";
        List<User> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToUser(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Maps a database ResultSet row to a User entity object.
     */
    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setFullName(rs.getString("full_name"));
        u.setEmail(rs.getString("email"));
        u.setMobileCountry(rs.getString("mobile_country"));
        u.setMobileNumber(rs.getString("mobile_number"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setPasswordSalt(rs.getString("password_salt"));
        u.setGender(rs.getString("gender"));
        u.setAge(rs.getInt("age"));
        u.setHeightCm(rs.getDouble("height_cm"));
        u.setWeightKg(rs.getDouble("weight_kg"));

        double targetW = rs.getDouble("target_weight_kg");
        if (!rs.wasNull()) {
            u.setTargetWeightKg(targetW);
        }

        u.setFitnessGoal(rs.getString("fitness_goal"));
        u.setActivityLevel(rs.getString("activity_level"));
        u.setGymExperience(rs.getString("gym_experience"));
        u.setWorkoutPreference(rs.getString("workout_preference"));
        u.setWorkoutDays(rs.getString("workout_days"));
        u.setWorkoutDurationMin(rs.getInt("workout_duration_min"));
        u.setDietPreference(rs.getString("diet_preference"));
        u.setWaterIntake(rs.getString("water_intake"));
        u.setSleepHours(rs.getString("sleep_hours"));
        u.setMedicalConditions(rs.getString("medical_conditions"));
        u.setMedicalDetails(rs.getString("medical_details"));
        u.setAvatarUrl(rs.getString("avatar_url"));
        u.setRole(rs.getString("role"));

        int coachId = rs.getInt("assigned_coach_id");
        if (!rs.wasNull()) {
            u.setAssignedCoachId(coachId);
        }

        try {
            u.setAssignedCoachName(rs.getString("coach_name"));
        } catch (SQLException ignored) {}

        u.setStreakDays(rs.getInt("streak_days"));
        u.setTotalWorkouts(rs.getInt("total_workouts"));
        u.setTotalCaloriesBurned(rs.getInt("total_calories_burned"));
        u.setMemberSince(rs.getString("member_since"));
        u.setPreferredLanguage(rs.getString("preferred_language"));
        u.setCreatedAt(rs.getTimestamp("created_at"));
        u.setUpdatedAt(rs.getTimestamp("updated_at"));

        return u;
    }
}
