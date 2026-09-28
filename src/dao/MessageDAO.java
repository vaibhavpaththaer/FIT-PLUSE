package dao;

import model.Message;
import util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Message chat entries.
 * Handles database operations against the `messages` table.
 */
public class MessageDAO {

    /**
     * Persists a new chat message.
     */
    public int sendMessage(Message msg) throws SQLException {
        String sql = "INSERT INTO `messages` (`sender_id`, `sender_type`, `receiver_id`, `receiver_type`, `message_text`, `is_read`) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, msg.getSenderId());
            ps.setString(2, msg.getSenderType());
            ps.setInt(3, msg.getReceiverId());
            ps.setString(4, msg.getReceiverType());
            ps.setString(5, msg.getMessageText());
            ps.setBoolean(6, msg.isRead());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int genId = rs.getInt(1);
                    msg.setId(genId);
                    return genId;
                }
            }
            return -1;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves the chat message history between a user and coach.
     */
    public List<Message> getConversation(int userId, int coachId, int limit) throws SQLException {
        String sql = "SELECT * FROM `messages` WHERE " +
                "((sender_id = ? AND sender_type = 'user' AND receiver_id = ? AND receiver_type = 'coach') OR " +
                " (sender_id = ? AND sender_type = 'coach' AND receiver_id = ? AND receiver_type = 'user')) " +
                "ORDER BY `sent_at` ASC, `id` ASC LIMIT ?";

        List<Message> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setInt(2, coachId);
            ps.setInt(3, coachId);
            ps.setInt(4, userId);
            ps.setInt(5, limit > 0 ? limit : 100);

            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToMessage(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves new messages sent after a specific message ID (for efficient polling).
     */
    public List<Message> getMessagesSince(int userId, int coachId, int lastMessageId, int limit) throws SQLException {
        String sql = "SELECT * FROM `messages` WHERE " +
                "id > ? AND (" +
                " (sender_id = ? AND sender_type = 'user' AND receiver_id = ? AND receiver_type = 'coach') OR " +
                " (sender_id = ? AND sender_type = 'coach' AND receiver_id = ? AND receiver_type = 'user')" +
                ") ORDER BY `sent_at` ASC, `id` ASC LIMIT ?";

        List<Message> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, lastMessageId);
            ps.setInt(2, userId);
            ps.setInt(3, coachId);
            ps.setInt(4, coachId);
            ps.setInt(5, userId);
            ps.setInt(6, limit > 0 ? limit : 50);

            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToMessage(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves the latest message in a conversation.
     */
    public Message getLastMessage(int userId, int coachId) throws SQLException {
        String sql = "SELECT * FROM `messages` WHERE " +
                "((sender_id = ? AND sender_type = 'user' AND receiver_id = ? AND receiver_type = 'coach') OR " +
                " (sender_id = ? AND sender_type = 'coach' AND receiver_id = ? AND receiver_type = 'user')) " +
                "ORDER BY `sent_at` DESC, `id` DESC LIMIT 1";

        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setInt(2, coachId);
            ps.setInt(3, coachId);
            ps.setInt(4, userId);

            rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToMessage(rs);
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Clears all messages between a user and coach.
     */
    public boolean clearConversation(int userId, int coachId) throws SQLException {
        String sql = "DELETE FROM `messages` WHERE " +
                "((sender_id = ? AND sender_type = 'user' AND receiver_id = ? AND receiver_type = 'coach') OR " +
                " (sender_id = ? AND sender_type = 'coach' AND receiver_id = ? AND receiver_type = 'user'))";

        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setInt(2, coachId);
            ps.setInt(3, coachId);
            ps.setInt(4, userId);

            return ps.executeUpdate() >= 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Counts unread messages for a recipient.
     */
    public int getUnreadCount(int receiverId, String receiverType) throws SQLException {
        String sql = "SELECT COUNT(*) FROM `messages` WHERE `receiver_id` = ? AND `receiver_type` = ? AND `is_read` = FALSE";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, receiverId);
            ps.setString(2, receiverType);
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
     * Counts unread messages from a specific sender for a recipient.
     */
    public int getUnreadCountFromSender(int senderId, String senderType, int receiverId, String receiverType) throws SQLException {
        String sql = "SELECT COUNT(*) FROM `messages` WHERE `sender_id` = ? AND `sender_type` = ? AND `receiver_id` = ? AND `receiver_type` = ? AND `is_read` = FALSE";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, senderId);
            ps.setString(2, senderType);
            ps.setInt(3, receiverId);
            ps.setString(4, receiverType);
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
     * Marks all messages from a sender as read.
     */
    public boolean markConversationAsRead(int senderId, String senderType, int receiverId, String receiverType) throws SQLException {
        String sql = "UPDATE `messages` SET `is_read` = TRUE " +
                "WHERE `sender_id` = ? AND `sender_type` = ? AND `receiver_id` = ? AND `receiver_type` = ? AND `is_read` = FALSE";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, senderId);
            ps.setString(2, senderType);
            ps.setInt(3, receiverId);
            ps.setString(4, receiverType);
            return ps.executeUpdate() >= 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Maps ResultSet to Message entity.
     */
    private Message mapResultSetToMessage(ResultSet rs) throws SQLException {
        Message m = new Message();
        m.setId(rs.getInt("id"));
        m.setSenderId(rs.getInt("sender_id"));
        m.setSenderType(rs.getString("sender_type"));
        m.setReceiverId(rs.getInt("receiver_id"));
        m.setReceiverType(rs.getString("receiver_type"));
        m.setMessageText(rs.getString("message_text"));
        m.setRead(rs.getBoolean("is_read"));
        m.setSentAt(rs.getTimestamp("sent_at"));
        return m;
    }
}
