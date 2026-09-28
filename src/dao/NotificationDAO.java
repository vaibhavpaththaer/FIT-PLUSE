package dao;

import model.Notification;
import util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Notification alerts.
 * Handles database operations against the `notifications` table.
 */
public class NotificationDAO {

    /**
     * Creates and stores a new notification.
     */
    public int createNotification(Notification notif) throws SQLException {
        String sql = "INSERT INTO `notifications` (`user_id`, `title`, `message`, `notif_type`, `is_read`, `target_url`) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, notif.getUserId());
            ps.setString(2, notif.getTitle());
            ps.setString(3, notif.getMessage());
            ps.setString(4, notif.getNotifType() != null ? notif.getNotifType() : "system");
            ps.setBoolean(5, notif.isRead());
            ps.setString(6, notif.getTargetUrl());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int genId = rs.getInt(1);
                    notif.setId(genId);
                    return genId;
                }
            }
            return -1;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves notifications for a user ordered newest first.
     */
    public List<Notification> getNotificationsByUserId(int userId, int limit) throws SQLException {
        String sql = "SELECT * FROM `notifications` WHERE `user_id` = ? ORDER BY `created_at` DESC LIMIT ?";
        List<Notification> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setInt(2, limit > 0 ? limit : 20);
            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToNotification(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Counts unread notifications for a user.
     */
    public int getUnreadCount(int userId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM `notifications` WHERE `user_id` = ? AND `is_read` = FALSE";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
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
     * Marks a specific notification as read.
     */
    public boolean markAsRead(int notificationId) throws SQLException {
        String sql = "UPDATE `notifications` SET `is_read` = TRUE WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, notificationId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Marks all notifications for a user as read.
     */
    public boolean markAllAsRead(int userId) throws SQLException {
        String sql = "UPDATE `notifications` SET `is_read` = TRUE WHERE `user_id` = ? AND `is_read` = FALSE";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            return ps.executeUpdate() >= 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Deletes a specific notification only if it belongs to the given user (ownership security).
     */
    public boolean deleteNotification(int notificationId, int userId) throws SQLException {
        String sql = "DELETE FROM `notifications` WHERE `id` = ? AND `user_id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, notificationId);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Deletes all read notifications for a user.
     */
    public boolean deleteAllRead(int userId) throws SQLException {
        String sql = "DELETE FROM `notifications` WHERE `user_id` = ? AND `is_read` = TRUE";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            return ps.executeUpdate() >= 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Maps ResultSet to Notification entity.
     */
    private Notification mapResultSetToNotification(ResultSet rs) throws SQLException {
        Notification n = new Notification();
        n.setId(rs.getInt("id"));
        n.setUserId(rs.getInt("user_id"));
        n.setTitle(rs.getString("title"));
        n.setMessage(rs.getString("message"));
        n.setNotifType(rs.getString("notif_type"));
        n.setRead(rs.getBoolean("is_read"));
        n.setTargetUrl(rs.getString("target_url"));
        n.setCreatedAt(rs.getTimestamp("created_at"));
        return n;
    }
}
