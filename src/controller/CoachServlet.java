package controller;

import dao.CoachDAO;
import dao.MessageDAO;
import dao.NotificationDAO;
import dao.UserDAO;
import model.Coach;
import model.Message;
import model.Notification;
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
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * Controller servlet for Coach Profile, 1-on-1 Communication, Direct Messaging,
 * and Coaching Session Bookings.
 * Mapped to /api/coach, /api/coach/*, /api/messages, and /api/messages/*.
 */
@WebServlet(name = "CoachServlet", urlPatterns = {
        "/api/coach",
        "/api/coach/*",
        "/api/messages",
        "/api/messages/*"
})
public class CoachServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private final CoachDAO coachDAO = new CoachDAO();
    private final UserDAO userDAO = new UserDAO();
    private final MessageDAO messageDAO = new MessageDAO();
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

        int userId = user.getId();
        String uri = req.getRequestURI();
        String contextPath = req.getContextPath();
        String relativePath = uri.substring(contextPath.length());
        String pathInfo = req.getPathInfo();
        String typeParam = req.getParameter("type");

        try {
            // Keep user object updated from database
            User liveUser = userDAO.getUserById(userId);
            if (liveUser != null) {
                user = liveUser;
            }

            // Ensure athlete user has an assigned coach (defaults to Coach 1 - Rahul Sharma if unassigned)
            int assignedCoachId = user.getAssignedCoachId() != null ? user.getAssignedCoachId() : 0;
            if (assignedCoachId <= 0 && !"coach".equalsIgnoreCase(user.getRole())) {
                assignedCoachId = 1;
                userDAO.assignCoach(userId, 1);
                user.setAssignedCoachId(1);
            }

            // 1. GET /api/messages/conversations OR /api/coach/conversations
            if (relativePath.contains("/conversations") || "/conversations".equalsIgnoreCase(pathInfo)) {
                handleGetConversations(req, resp, out, user);
                return;
            }

            // 2. GET /api/messages OR /api/coach/messages OR ?type=messages -> Chat Conversation History
            if (relativePath.startsWith("/api/messages") || 
                "/messages".equalsIgnoreCase(pathInfo) || 
                "/conversation".equalsIgnoreCase(pathInfo) || 
                "messages".equalsIgnoreCase(typeParam)) {
                
                handleGetMessages(req, resp, out, user, assignedCoachId);
                return;
            }

            // 3. GET /api/coach/list OR ?type=all -> List all available coaches
            if ("/list".equalsIgnoreCase(pathInfo) || 
                "/all".equalsIgnoreCase(pathInfo) || 
                "all".equalsIgnoreCase(typeParam) || 
                "list".equalsIgnoreCase(typeParam)) {
                
                List<Coach> allCoaches = coachDAO.getAllActiveCoaches();
                out.write("{\"success\":true,\"coaches\":" + JsonUtil.coachListToJson(allCoaches) + "}");
                return;
            }

            // 4. GET /api/coach/clients -> Clients assigned to this coach (if coach role)
            if ("/clients".equalsIgnoreCase(pathInfo) || "clients".equalsIgnoreCase(typeParam)) {
                if ("coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole())) {
                    List<User> clients = userDAO.getUsersByCoachId(user.getId());
                    out.write("{\"success\":true,\"clients\":" + JsonUtil.userListToJson(clients) + "}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"Access denied. Coach privileges required.\"}");
                }
                return;
            }

            // 5. Default: GET /api/coach -> Authenticated User's Coach Profile & Overview
            handleGetCoachOverview(resp, out, user, assignedCoachId);

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

        int userId = user.getId();
        String uri = req.getRequestURI();
        String contextPath = req.getContextPath();
        String relativePath = uri.substring(contextPath.length());
        String pathInfo = req.getPathInfo();
        String body = readRequestBody(req);
        Map<String, String> jsonMap = JsonUtil.parseSimpleJson(body);

        try {
            User liveUser = userDAO.getUserById(userId);
            if (liveUser != null) {
                user = liveUser;
            }

            int assignedCoachId = user.getAssignedCoachId() != null ? user.getAssignedCoachId() : 0;
            if (assignedCoachId <= 0 && !"coach".equalsIgnoreCase(user.getRole())) {
                assignedCoachId = 1;
                userDAO.assignCoach(userId, 1);
                user.setAssignedCoachId(1);
            }

            // 1. POST /api/messages OR /api/coach/messages -> Send Chat Message
            if (relativePath.startsWith("/api/messages/send") || 
                relativePath.equals("/api/messages") || 
                "/messages".equalsIgnoreCase(pathInfo) || 
                "/chat".equalsIgnoreCase(pathInfo) || 
                "/send".equalsIgnoreCase(pathInfo)) {
                
                handleSendMessage(req, resp, out, user, assignedCoachId, jsonMap);
                return;
            }

            // 2. POST /api/messages/read OR /api/coach/read -> Mark messages as read
            if (relativePath.startsWith("/api/messages/read") || 
                "/read".equalsIgnoreCase(pathInfo) || 
                "/mark-read".equalsIgnoreCase(pathInfo)) {
                
                handleMarkMessagesAsRead(req, resp, out, user, assignedCoachId, jsonMap);
                return;
            }

            // 3. POST /api/messages/clear OR /api/coach/messages/clear -> Clear Conversation History
            if (relativePath.contains("/clear") || "/clear".equalsIgnoreCase(pathInfo)) {
                handleClearConversation(req, resp, out, user, assignedCoachId, jsonMap);
                return;
            }

            // 4. POST /api/coach/book OR /api/coach/session -> Book 1-on-1 Session
            if ("/book".equalsIgnoreCase(pathInfo) || 
                "/session".equalsIgnoreCase(pathInfo) || 
                "/schedule".equalsIgnoreCase(pathInfo)) {
                
                handleBookSession(resp, out, user, assignedCoachId, jsonMap);
                return;
            }

            // 5. POST /api/coach/assign OR /api/coach/select -> Assign or switch coach
            if ("/assign".equalsIgnoreCase(pathInfo) || "/select".equalsIgnoreCase(pathInfo)) {
                handleAssignCoach(resp, out, user, jsonMap);
                return;
            }

            // Default fallback for unrecognized POST endpoint
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Unrecognized coach action endpoint: " + JsonUtil.escape(pathInfo) + "\"}");

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

        try {
            int assignedCoachId = user.getAssignedCoachId() > 0 ? user.getAssignedCoachId() : 1;
            handleClearConversation(req, resp, out, user, assignedCoachId, null);
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles GET /api/coach overview.
     */
    private void handleGetCoachOverview(HttpServletResponse resp, PrintWriter out, User user, int assignedCoachId) throws SQLException {
        Coach assignedCoach = coachDAO.getCoachById(assignedCoachId);
        if (assignedCoach == null) {
            assignedCoach = coachDAO.getCoachById(1);
        }

        List<Coach> allCoaches = coachDAO.getAllActiveCoaches();
        int unreadCount = messageDAO.getUnreadCount(user.getId(), "user");

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"success\":true,");
        sb.append("\"assignedCoach\":").append(JsonUtil.coachToJson(assignedCoach)).append(",");
        sb.append("\"unreadMessages\":").append(unreadCount).append(",");
        sb.append("\"availableCoaches\":").append(JsonUtil.coachListToJson(allCoaches));
        sb.append("}");

        out.write(sb.toString());
    }

    /**
     * Handles GET /api/messages/conversations (Contact sidebar list).
     */
    private void handleGetConversations(HttpServletRequest req, HttpServletResponse resp, PrintWriter out, User user) throws SQLException {
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        if (isCoach) {
            List<User> clients = userDAO.getUsersByCoachId(user.getId());
            StringBuilder sb = new StringBuilder();
            sb.append("{\"success\":true,\"role\":\"coach\",\"conversations\":[");
            for (int i = 0; i < clients.size(); i++) {
                User client = clients.get(i);
                Message lastMsg = messageDAO.getLastMessage(client.getId(), user.getId());
                int unread = messageDAO.getUnreadCountFromSender(client.getId(), "user", user.getId(), "coach");
                if (i > 0) sb.append(",");
                sb.append("{");
                sb.append("\"userId\":").append(client.getId()).append(",");
                sb.append("\"name\":\"").append(JsonUtil.escape(client.getFullName())).append("\",");
                sb.append("\"avatarUrl\":\"").append(JsonUtil.escape(client.getAvatarUrl() != null ? client.getAvatarUrl() : "")).append("\",");
                sb.append("\"unreadCount\":").append(unread).append(",");
                sb.append("\"lastMessage\":").append(lastMsg != null ? JsonUtil.messageToJson(lastMsg) : "null");
                sb.append("}");
            }
            sb.append("]}");
            out.write(sb.toString());
        } else {
            int coachId = user.getAssignedCoachId() > 0 ? user.getAssignedCoachId() : 1;
            Coach coach = coachDAO.getCoachById(coachId);
            Message lastMsg = messageDAO.getLastMessage(user.getId(), coachId);
            int unread = messageDAO.getUnreadCount(user.getId(), "user");

            StringBuilder sb = new StringBuilder();
            sb.append("{\"success\":true,\"role\":\"user\",\"conversations\":[{");
            sb.append("\"coachId\":").append(coachId).append(",");
            sb.append("\"name\":\"").append(JsonUtil.escape(coach != null ? coach.getFullName() : "Coach Rahul Sharma")).append("\",");
            sb.append("\"avatarUrl\":\"").append(JsonUtil.escape(coach != null ? coach.getAvatarUrl() : "")).append("\",");
            sb.append("\"unreadCount\":").append(unread).append(",");
            sb.append("\"lastMessage\":").append(lastMsg != null ? JsonUtil.messageToJson(lastMsg) : "null");
            sb.append("}]}");
            out.write(sb.toString());
        }
    }

    /**
     * Handles GET /api/coach/messages and /api/messages.
     */
    private void handleGetMessages(HttpServletRequest req, HttpServletResponse resp, PrintWriter out, User user, int assignedCoachId) throws SQLException {
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());
        
        int targetUserId = user.getId();
        int targetCoachId = assignedCoachId;

        // Security check for regular Athlete user
        if (!isCoach) {
            String requestedUserId = req.getParameter("userId");
            if (requestedUserId != null && !requestedUserId.trim().isEmpty()) {
                try {
                    int reqUid = Integer.parseInt(requestedUserId.trim());
                    if (reqUid != user.getId()) {
                        resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        out.write("{\"success\":false,\"message\":\"Access denied. You cannot view another athlete's conversation.\"}");
                        return;
                    }
                } catch (NumberFormatException ignored) {}
            }

            String requestedCoachId = req.getParameter("coachId");
            if (requestedCoachId != null && !requestedCoachId.trim().isEmpty()) {
                try {
                    int reqCid = Integer.parseInt(requestedCoachId.trim());
                    if (reqCid != assignedCoachId) {
                        resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        out.write("{\"success\":false,\"message\":\"Access denied. You can only communicate with your assigned coach.\"}");
                        return;
                    }
                } catch (NumberFormatException ignored) {}
            }

            targetUserId = user.getId();
            targetCoachId = assignedCoachId;
        } else {
            // Coach role requesting athlete conversation
            String requestedUserId = req.getParameter("userId");
            if (requestedUserId != null && !requestedUserId.trim().isEmpty()) {
                try {
                    targetUserId = Integer.parseInt(requestedUserId.trim());
                    User clientUser = userDAO.getUserById(targetUserId);
                    if (clientUser == null || clientUser.getAssignedCoachId() == null || clientUser.getAssignedCoachId() != user.getId()) {
                        resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        out.write("{\"success\":false,\"message\":\"Access denied. Athlete is not assigned to you.\"}");
                        return;
                    }
                } catch (NumberFormatException e) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Invalid userId parameter.\"}");
                    return;
                }
            } else {
                List<User> clients = userDAO.getUsersByCoachId(user.getId());
                if (!clients.isEmpty()) {
                    targetUserId = clients.get(0).getId();
                }
            }
            targetCoachId = user.getId();
        }

        // Support incremental polling via lastId / sinceId
        int lastId = 0;
        String lastIdParam = req.getParameter("lastId");
        if (lastIdParam == null) lastIdParam = req.getParameter("sinceId");
        if (lastIdParam != null && !lastIdParam.trim().isEmpty()) {
            try {
                lastId = Integer.parseInt(lastIdParam.trim());
            } catch (NumberFormatException ignored) {}
        }

        List<Message> conversation;
        if (lastId > 0) {
            conversation = messageDAO.getMessagesSince(targetUserId, targetCoachId, lastId, 50);
        } else {
            conversation = messageDAO.getConversation(targetUserId, targetCoachId, 100);
        }

        // If conversation is empty in database and not a poll, seed initial greeting
        if (conversation.isEmpty() && lastId <= 0 && !isCoach) {
            Message m1 = new Message(targetCoachId, "coach", targetUserId, "user", "Hello! Great job today.");
            m1.setRead(true);
            messageDAO.sendMessage(m1);

            Message m2 = new Message(targetUserId, "user", targetCoachId, "coach", "Thank you coach.");
            m2.setRead(true);
            messageDAO.sendMessage(m2);

            Message m3 = new Message(targetCoachId, "coach", targetUserId, "user", "Tomorrow increase cardio by 10 min.");
            m3.setRead(false);
            messageDAO.sendMessage(m3);

            conversation = messageDAO.getConversation(targetUserId, targetCoachId, 100);
        }

        // Mark messages as read for receiver
        if (!isCoach) {
            messageDAO.markConversationAsRead(targetCoachId, "coach", targetUserId, "user");
        } else {
            messageDAO.markConversationAsRead(targetUserId, "user", targetCoachId, "coach");
        }

        Coach coach = coachDAO.getCoachById(targetCoachId);
        String coachName = (coach != null) ? coach.getFullName() : "Coach Rahul Sharma";
        User clientObj = (!isCoach) ? user : userDAO.getUserById(targetUserId);
        String clientName = (clientObj != null && clientObj.getFullName() != null) ? clientObj.getFullName() : "Athlete";

        // Assign senderName helper property for UI convenience
        for (Message m : conversation) {
            if ("coach".equalsIgnoreCase(m.getSenderType())) {
                m.setSenderName(coachName);
            } else {
                m.setSenderName(clientName);
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"success\":true,");
        sb.append("\"userId\":").append(targetUserId).append(",");
        sb.append("\"coachId\":").append(targetCoachId).append(",");
        sb.append("\"coachName\":\"").append(JsonUtil.escape(coachName)).append("\",");
        sb.append("\"athleteName\":\"").append(JsonUtil.escape(clientName)).append("\",");
        sb.append("\"messages\":").append(JsonUtil.messageListToJson(conversation));
        sb.append("}");

        out.write(sb.toString());
    }

    /**
     * Handles POST /api/coach/messages and /api/messages.
     */
    private void handleSendMessage(HttpServletRequest req, HttpServletResponse resp, PrintWriter out, User user, int assignedCoachId, Map<String, String> jsonMap) throws SQLException {
        String text = jsonMap.get("messageText");
        if (text == null || text.trim().isEmpty()) {
            text = jsonMap.get("text");
        }
        if (text == null || text.trim().isEmpty()) {
            text = req.getParameter("messageText");
        }
        if (text == null || text.trim().isEmpty()) {
            text = req.getParameter("text");
        }

        if (text == null || text.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Message text cannot be empty.\"}");
            return;
        }

        if (text.trim().length() > 2000) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Message is too long (maximum 2000 characters).\"}");
            return;
        }

        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        if (isCoach) {
            // Coach sending message to assigned athlete
            String clientParam = jsonMap.get("userId");
            if (clientParam == null || clientParam.trim().isEmpty()) {
                clientParam = req.getParameter("userId");
            }
            if (clientParam == null || clientParam.trim().isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"success\":false,\"message\":\"Missing userId parameter for athlete recipient.\"}");
                return;
            }

            int targetAthleteId;
            try {
                targetAthleteId = Integer.parseInt(clientParam.trim());
            } catch (NumberFormatException e) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"success\":false,\"message\":\"Invalid userId parameter.\"}");
                return;
            }

            User athlete = userDAO.getUserById(targetAthleteId);
            if (athlete == null || athlete.getAssignedCoachId() == null || athlete.getAssignedCoachId() != user.getId()) {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.write("{\"success\":false,\"message\":\"Access denied. Cannot message an athlete who is not assigned to you.\"}");
                return;
            }

            Message coachMsg = new Message(user.getId(), "coach", targetAthleteId, "user", text.trim());
            coachMsg.setRead(false);
            int coachMsgId = messageDAO.sendMessage(coachMsg);
            coachMsg.setId(coachMsgId);
            coachMsg.setSenderName(user.getFullName() != null ? user.getFullName() : "Coach");

            // Notification for athlete
            try {
                Notification notif = new Notification(
                        targetAthleteId,
                        "New Message from Coach " + user.getFullName(),
                        text.trim().length() > 80 ? text.trim().substring(0, 77) + "..." : text.trim(),
                        "message",
                        "#messages"
                );
                notificationDAO.createNotification(notif);
            } catch (Exception ignored) {}

            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"success\":true,");
            sb.append("\"coachMessage\":").append(JsonUtil.messageToJson(coachMsg));
            sb.append("}");
            out.write(sb.toString());

        } else {
            // Athlete sending message to assigned coach
            String coachParam = jsonMap.get("coachId");
            if (coachParam == null) coachParam = req.getParameter("coachId");
            if (coachParam != null && !coachParam.trim().isEmpty()) {
                try {
                    int requestedCoachId = Integer.parseInt(coachParam.trim());
                    if (requestedCoachId != assignedCoachId) {
                        resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        out.write("{\"success\":false,\"message\":\"Access denied. You can only send messages to your assigned coach.\"}");
                        return;
                    }
                } catch (NumberFormatException ignored) {}
            }

            int targetCoachId = assignedCoachId;
            Message userMsg = new Message(user.getId(), "user", targetCoachId, "coach", text.trim());
            userMsg.setRead(true);
            int userMsgId = messageDAO.sendMessage(userMsg);
            userMsg.setId(userMsgId);
            userMsg.setSenderName(user.getFullName() != null ? user.getFullName() : "You");

            // Generate Intelligent Contextual Coach Reply
            String userFirstName = (user.getFullName() != null && !user.getFullName().trim().isEmpty())
                    ? user.getFullName().split(" ")[0]
                    : "Alex";
            double weight = user.getWeightKg() > 0 ? user.getWeightKg() : 72.4;

            String replyText = generateCoachResponse(text.trim(), userFirstName, weight);

            Coach coach = coachDAO.getCoachById(targetCoachId);
            String coachName = (coach != null) ? coach.getFullName() : "Coach Rahul Sharma";

            Message coachReplyMsg = new Message(targetCoachId, "coach", user.getId(), "user", replyText);
            coachReplyMsg.setRead(false);
            int replyId = messageDAO.sendMessage(coachReplyMsg);
            coachReplyMsg.setId(replyId);
            coachReplyMsg.setSenderName(coachName);

            // Create notification for user
            try {
                Notification notif = new Notification(
                        user.getId(),
                        "New Message from " + coachName,
                        replyText.length() > 80 ? replyText.substring(0, 77) + "..." : replyText,
                        "message",
                        "#messages"
                );
                notificationDAO.createNotification(notif);
            } catch (Exception ignored) {}

            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"success\":true,");
            sb.append("\"userMessage\":").append(JsonUtil.messageToJson(userMsg));
            sb.append(",\"coachReply\":").append(JsonUtil.messageToJson(coachReplyMsg));
            sb.append("}");

            out.write(sb.toString());
        }
    }

    /**
     * Handles POST /api/messages/read and /api/coach/read.
     */
    private void handleMarkMessagesAsRead(HttpServletRequest req, HttpServletResponse resp, PrintWriter out, User user, int assignedCoachId, Map<String, String> jsonMap) throws SQLException {
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        if (isCoach) {
            String clientParam = (jsonMap != null) ? jsonMap.get("userId") : null;
            if (clientParam == null) clientParam = req.getParameter("userId");
            if (clientParam != null && !clientParam.trim().isEmpty()) {
                try {
                    int targetUserId = Integer.parseInt(clientParam.trim());
                    messageDAO.markConversationAsRead(targetUserId, "user", user.getId(), "coach");
                } catch (NumberFormatException ignored) {}
            }
        } else {
            messageDAO.markConversationAsRead(assignedCoachId, "coach", user.getId(), "user");
        }

        out.write("{\"success\":true,\"message\":\"Messages marked as read.\"}");
    }

    /**
     * Handles clearing the conversation between athlete and coach.
     */
    private void handleClearConversation(HttpServletRequest req, HttpServletResponse resp, PrintWriter out, User user, int assignedCoachId, Map<String, String> jsonMap) throws SQLException {
        boolean isCoach = "coach".equalsIgnoreCase(user.getRole()) || "admin".equalsIgnoreCase(user.getRole());

        int targetUserId = user.getId();
        int targetCoachId = assignedCoachId;

        if (isCoach) {
            String clientParam = (jsonMap != null) ? jsonMap.get("userId") : null;
            if (clientParam == null) clientParam = req.getParameter("userId");
            if (clientParam != null && !clientParam.trim().isEmpty()) {
                try {
                    targetUserId = Integer.parseInt(clientParam.trim());
                } catch (NumberFormatException ignored) {}
            }
            targetCoachId = user.getId();
        }

        boolean ok = messageDAO.clearConversation(targetUserId, targetCoachId);
        if (ok) {
            out.write("{\"success\":true,\"message\":\"Conversation cleared successfully.\"}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to clear conversation.\"}");
        }
    }

    /**
     * Generates intelligent, personalized coach response based on fitness topics.
     */
    private String generateCoachResponse(String userMsg, String userFirstName, double currentWeight) {
        String lower = userMsg.toLowerCase();

        if (lower.contains("cardio") || lower.contains("run") || lower.contains("10 min") || lower.contains("treadmill") || lower.contains("hiit")) {
            return "Awesome! An extra 10 minutes of steady-state Zone 2 cardio will boost your mitochondrial density and keep fat oxidation high. Keep up the great pace, " + userFirstName + "!";
        } else if (lower.contains("got it") || lower.contains("thank") || lower.contains("ok") || lower.contains("sure") || lower.contains("great") || lower.contains("done")) {
            return "You're doing fantastic, " + userFirstName + "! Rest up well tonight and make sure to hit your hydration target before tomorrow's session.";
        } else if (lower.contains("strength") || lower.contains("lifting") || lower.contains("dumbbell") || lower.contains("bench") || lower.contains("squat") || lower.contains("deadlift") || lower.contains("press")) {
            return "For strength tomorrow, we have Progressive Overload on the compound lifts. Keep your RPE at 8 and maintain a tight brace through your core!";
        } else if (lower.contains("weight") || lower.contains("scale") || lower.contains("kg") || lower.contains("fat") || lower.contains("bmi")) {
            return "Logged and noted! Maintaining around " + String.format("%.1f", currentWeight) + " kg while building lean muscle density is the gold standard for body recomposition.";
        } else if (lower.contains("form") || lower.contains("check") || lower.contains("technique") || lower.contains("posture") || lower.contains("video")) {
            return "Absolutely! You can book a 1-on-1 Biomechanics & Form Check session with me through the Booking tab, or send your lifting clip right here.";
        } else if (lower.contains("diet") || lower.contains("macro") || lower.contains("protein") || lower.contains("meal") || lower.contains("calorie") || lower.contains("nutrition")) {
            return "Ensure you hit your daily protein goal and check your dedicated Diet Plan view for full macro breakdowns!";
        } else if (lower.contains("pain") || lower.contains("hurt") || lower.contains("sore") || lower.contains("injury") || lower.contains("doms")) {
            return "Prioritize dynamic mobility, foam rolling, and adequate recovery sleep tonight. If soreness persists beyond 48 hours, we'll swap compound movements for joint-friendly alternatives.";
        } else {
            return "Great initiative, " + userFirstName + "! Keep your workout consistency locked in and let me know if you need any adjustments to your program.";
        }
    }

    /**
     * Handles POST /api/coach/book.
     */
    private void handleBookSession(HttpServletResponse resp, PrintWriter out, User user, int assignedCoachId, Map<String, String> jsonMap) throws SQLException {
        String sessionType = jsonMap.get("sessionType");
        String bookingDate = jsonMap.get("bookingDate");
        String timeSlot = jsonMap.get("timeSlot");
        String mode = jsonMap.get("mode");


        if (sessionType == null || sessionType.trim().isEmpty()) {
            sessionType = "1-on-1 Strategy & Biomechanics Review";
        }
        if (bookingDate == null || bookingDate.trim().isEmpty()) {
            bookingDate = "Tomorrow";
        }
        if (timeSlot == null || timeSlot.trim().isEmpty()) {
            timeSlot = "10:00 AM";
        }
        if (mode == null || mode.trim().isEmpty()) {
            mode = "Video Call";
        }

        Coach coach = coachDAO.getCoachById(assignedCoachId);
        String coachName = (coach != null) ? coach.getFullName() : "Coach Rahul Sharma";

        // Create notification for confirmed booking
        try {
            Notification notif = new Notification(
                    user.getId(),
                    "Session Booked with " + coachName,
                    sessionType + " on " + bookingDate + " at " + timeSlot + " (" + mode + ").",
                    "session",
                    "#coach"
            );
            notificationDAO.createNotification(notif);
        } catch (Exception ignored) {}

        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"success\":true,");
        sb.append("\"message\":\"Session confirmed with ").append(JsonUtil.escape(coachName)).append("\",");
        sb.append("\"sessionType\":\"").append(JsonUtil.escape(sessionType)).append("\",");
        sb.append("\"bookingDate\":\"").append(JsonUtil.escape(bookingDate)).append("\",");
        sb.append("\"timeSlot\":\"").append(JsonUtil.escape(timeSlot)).append("\",");
        sb.append("\"mode\":\"").append(JsonUtil.escape(mode)).append("\",");
        sb.append("\"coachName\":\"").append(JsonUtil.escape(coachName)).append("\"");
        sb.append("}");

        out.write(sb.toString());
    }

    /**
     * Handles POST /api/coach/assign.
     */
    private void handleAssignCoach(HttpServletResponse resp, PrintWriter out, User user, Map<String, String> jsonMap) throws SQLException {
        String coachIdStr = jsonMap.get("coachId");
        if (coachIdStr == null || coachIdStr.trim().isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing coachId parameter.\"}");
            return;
        }

        int coachId;
        try {
            coachId = Integer.parseInt(coachIdStr.trim());
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid coachId.\"}");
            return;
        }

        Coach coach = coachDAO.getCoachById(coachId);
        if (coach == null) {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            out.write("{\"success\":false,\"message\":\"Coach not found.\"}");
            return;
        }

        boolean ok = userDAO.assignCoach(user.getId(), coachId);
        if (ok) {
            user.setAssignedCoachId(coachId);
            out.write("{\"success\":true,\"message\":\"Assigned to " + JsonUtil.escape(coach.getFullName()) + "\",\"coach\":" + JsonUtil.coachToJson(coach) + "}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Failed to update coach assignment.\"}");
        }
    }

    /**
     * Extracts authenticated User from session.
     */
    private User getAuthenticatedUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) {
            Object userObj = session.getAttribute("user");
            if (userObj instanceof User) {
                return (User) userObj;
            }
            Object userIdObj = session.getAttribute("userId");
            if (userIdObj instanceof Integer) {
                try {
                    return userDAO.getUserById((Integer) userIdObj);
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    private void setupResponse(HttpServletResponse resp) {
        resp.setContentType("application/json; charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        resp.setHeader("Pragma", "no-cache");
        resp.setDateHeader("Expires", 0);
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
