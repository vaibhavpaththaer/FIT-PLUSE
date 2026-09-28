package dao;

import model.Coach;
import util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Coach entities.
 * Handles database operations against the `coaches` table.
 */
public class CoachDAO {

    /**
     * Retrieves all active coaches with their active client counts.
     */
    public List<Coach> getAllActiveCoaches() throws SQLException {
        String sql = "SELECT c.*, COUNT(u.id) AS client_count " +
                "FROM `coaches` c " +
                "LEFT JOIN `users` u ON c.id = u.assigned_coach_id " +
                "WHERE c.`is_active` = TRUE " +
                "GROUP BY c.id " +
                "ORDER BY c.rating DESC, c.experience_years DESC";

        List<Coach> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();
            while (rs.next()) {
                Coach coach = mapResultSetToCoach(rs);
                coach.setActiveClientsCount(rs.getInt("client_count"));
                list.add(coach);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves a coach by ID.
     */
    public Coach getCoachById(int id) throws SQLException {
        String sql = "SELECT c.*, COUNT(u.id) AS client_count " +
                "FROM `coaches` c " +
                "LEFT JOIN `users` u ON c.id = u.assigned_coach_id " +
                "WHERE c.`id` = ? " +
                "GROUP BY c.id";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, id);
            rs = ps.executeQuery();
            if (rs.next()) {
                Coach coach = mapResultSetToCoach(rs);
                coach.setActiveClientsCount(rs.getInt("client_count"));
                return coach;
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Creates a new coach (admin-created, defaults to active).
     */
    public int createCoach(Coach coach) throws SQLException {
        boolean hasId = coach.getId() > 0;
        String sql;
        if (hasId) {
            sql = "INSERT INTO `coaches` (`id`, `full_name`, `email`, `phone`, `bio`, `specialties`, `experience_years`, `rating`, `avatar_url`, `is_active`, `account_status`) " +
                  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        } else {
            sql = "INSERT INTO `coaches` (`full_name`, `email`, `phone`, `bio`, `specialties`, `experience_years`, `rating`, `avatar_url`, `is_active`, `account_status`) " +
                  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        }

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            if (hasId) {
                ps = conn.prepareStatement(sql);
                ps.setInt(1, coach.getId());
                ps.setString(2, coach.getFullName());
                ps.setString(3, coach.getEmail());
                ps.setString(4, coach.getPhone());
                ps.setString(5, coach.getBio());
                ps.setString(6, coach.getSpecialties());
                ps.setInt(7, coach.getExperienceYears());
                ps.setDouble(8, coach.getRating());
                ps.setString(9, coach.getAvatarUrl());
                ps.setBoolean(10, coach.isActive());
                String status = coach.getAccountStatus() != null ? coach.getAccountStatus() : "active";
                ps.setString(11, status);

                int affected = ps.executeUpdate();
                if (affected > 0) {
                    return coach.getId();
                }
            } else {
                ps = conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, coach.getFullName());
                ps.setString(2, coach.getEmail());
                ps.setString(3, coach.getPhone());
                ps.setString(4, coach.getBio());
                ps.setString(5, coach.getSpecialties());
                ps.setInt(6, coach.getExperienceYears());
                ps.setDouble(7, coach.getRating());
                ps.setString(8, coach.getAvatarUrl());
                ps.setBoolean(9, coach.isActive());
                String status = coach.getAccountStatus() != null ? coach.getAccountStatus() : "active";
                ps.setString(10, status);

                int affected = ps.executeUpdate();
                if (affected > 0) {
                    rs = ps.getGeneratedKeys();
                    if (rs.next()) {
                        int genId = rs.getInt(1);
                        coach.setId(genId);
                        return genId;
                    }
                }
            }
            return -1;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Creates a self-registered coach with pending status.
     */
    public int createPendingCoach(Coach coach) throws SQLException {
        coach.setAccountStatus("pending");
        coach.setActive(false); // Not active until approved
        return createCoach(coach);
    }

    /**
     * Retrieves a coach by email.
     */
    public Coach getCoachByEmail(String email) throws SQLException {
        String sql = "SELECT c.*, COUNT(u.id) AS client_count " +
                "FROM `coaches` c " +
                "LEFT JOIN `users` u ON c.id = u.assigned_coach_id " +
                "WHERE c.`email` = ? " +
                "GROUP BY c.id";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, email != null ? email.trim().toLowerCase() : "");
            rs = ps.executeQuery();
            if (rs.next()) {
                Coach coach = mapResultSetToCoach(rs);
                coach.setActiveClientsCount(rs.getInt("client_count"));
                return coach;
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Returns the account_status for a coach by email.
     * Returns null if coach not found.
     */
    public String getCoachStatusByEmail(String email) throws SQLException {
        String sql = "SELECT `account_status` FROM `coaches` WHERE `email` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, email != null ? email.trim().toLowerCase() : "");
            rs = ps.executeQuery();
            if (rs.next()) return rs.getString("account_status");
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Approves a pending coach: sets account_status='active' and is_active=TRUE.
     */
    public boolean approveCoach(int coachId) throws SQLException {
        String sql = "UPDATE `coaches` SET `account_status` = 'active', `is_active` = TRUE WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, coachId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Rejects a pending coach: sets account_status='rejected', is_active=FALSE.
     */
    public boolean rejectCoach(int coachId) throws SQLException {
        String sql = "UPDATE `coaches` SET `account_status` = 'rejected', `is_active` = FALSE WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, coachId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Returns all coaches with pending account_status.
     */
    public List<Coach> getPendingCoaches() throws SQLException {
        String sql = "SELECT c.*, 0 AS client_count FROM `coaches` c WHERE c.`account_status` = 'pending' ORDER BY c.created_at DESC";
        List<Coach> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToCoach(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves all coaches (both active and inactive) with assigned client counts.
     */
    public List<Coach> getAllCoaches() throws SQLException {
        String sql = "SELECT c.*, COUNT(u.id) AS client_count " +
                "FROM `coaches` c " +
                "LEFT JOIN `users` u ON c.id = u.assigned_coach_id " +
                "GROUP BY c.id " +
                "ORDER BY c.is_active DESC, c.rating DESC, c.full_name ASC";

        List<Coach> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            rs = ps.executeQuery();
            while (rs.next()) {
                Coach coach = mapResultSetToCoach(rs);
                coach.setActiveClientsCount(rs.getInt("client_count"));
                list.add(coach);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Updates coach details.
     */
    public boolean updateCoach(Coach coach) throws SQLException {
        String sql = "UPDATE `coaches` SET " +
                "`full_name` = ?, `email` = ?, `phone` = ?, `bio` = ?, " +
                "`specialties` = ?, `experience_years` = ?, `rating` = ?, " +
                "`avatar_url` = ?, `is_active` = ? " +
                "WHERE `id` = ?";

        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, coach.getFullName());
            ps.setString(2, coach.getEmail());
            ps.setString(3, coach.getPhone());
            ps.setString(4, coach.getBio());
            ps.setString(5, coach.getSpecialties());
            ps.setInt(6, coach.getExperienceYears());
            ps.setDouble(7, coach.getRating());
            ps.setString(8, coach.getAvatarUrl());
            ps.setBoolean(9, coach.isActive());
            ps.setInt(10, coach.getId());

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Deletes a coach by ID. (Foreign keys in users and workouts set assigned_coach_id to NULL).
     */
    public boolean deleteCoach(int coachId) throws SQLException {
        String sql = "DELETE FROM `coaches` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, coachId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Sets coach active status (activate/deactivate).
     */
    public boolean setCoachActive(int coachId, boolean active) throws SQLException {
        String sql = "UPDATE `coaches` SET `is_active` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setBoolean(1, active);
            ps.setInt(2, coachId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Gets total coach count.
     */
    public int getCoachCount() throws SQLException {
        String sql = "SELECT COUNT(*) FROM `coaches`";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
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
     * Maps a ResultSet row to a Coach entity.
     */
    private Coach mapResultSetToCoach(ResultSet rs) throws SQLException {
        Coach c = new Coach();
        c.setId(rs.getInt("id"));
        c.setFullName(rs.getString("full_name"));
        c.setEmail(rs.getString("email"));
        c.setPhone(rs.getString("phone"));
        c.setBio(rs.getString("bio"));
        c.setSpecialties(rs.getString("specialties"));
        c.setExperienceYears(rs.getInt("experience_years"));
        c.setRating(rs.getDouble("rating"));
        c.setAvatarUrl(rs.getString("avatar_url"));
        c.setActive(rs.getBoolean("is_active"));
        // account_status column (may not be present in older queries — use try/catch)
        try {
            String status = rs.getString("account_status");
            c.setAccountStatus(status != null ? status : "active");
        } catch (SQLException ignored) {
            c.setAccountStatus("active");
        }
        c.setCreatedAt(rs.getTimestamp("created_at"));
        return c;
    }
}
