package model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Entity representing a System or Event Notification.
 * Maps to the `notifications` MySQL table.
 */
public class Notification implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private int userId;
    private String title;
    private String message;
    private String notifType = "system"; // 'workout', 'diet', 'message', 'progress', 'system'
    private boolean isRead = false;
    private String targetUrl;
    private Timestamp createdAt;

    public Notification() {}

    public Notification(int userId, String title, String message, String notifType, String targetUrl) {
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.notifType = notifType;
        this.targetUrl = targetUrl;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNotifType() { return notifType; }
    public void setNotifType(String notifType) { this.notifType = notifType; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public String getTargetUrl() { return targetUrl; }
    public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
