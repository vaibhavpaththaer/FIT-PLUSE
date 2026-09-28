package model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Entity representing a Direct Chat Message between a User and a Coach.
 * Maps to the `messages` MySQL table.
 */
public class Message implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private int senderId;
    private String senderType; // 'user', 'coach'
    private int receiverId;
    private String receiverType; // 'user', 'coach'
    private String messageText;
    private boolean isRead = false;
    private Timestamp sentAt;
    private String senderName;

    public Message() {}

    public Message(int senderId, String senderType, int receiverId, String receiverType, String messageText) {
        this.senderId = senderId;
        this.senderType = senderType;
        this.receiverId = receiverId;
        this.receiverType = receiverType;
        this.messageText = messageText;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getSenderId() { return senderId; }
    public void setSenderId(int senderId) { this.senderId = senderId; }

    public String getSenderType() { return senderType; }
    public void setSenderType(String senderType) { this.senderType = senderType; }

    public int getReceiverId() { return receiverId; }
    public void setReceiverId(int receiverId) { this.receiverId = receiverId; }

    public String getReceiverType() { return receiverType; }
    public void setReceiverType(String receiverType) { this.receiverType = receiverType; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Timestamp getSentAt() { return sentAt; }
    public void setSentAt(Timestamp sentAt) { this.sentAt = sentAt; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
}
