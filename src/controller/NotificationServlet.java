package controller;

import dao.NotificationDAO;
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
 * Controller servlet for Notification management.
 * Provides REST API endpoints for listing, reading, and deleting notifications.
 * All operations are scoped to the authenticated user's session.
 */
@WebServlet(name = "NotificationServlet", urlPatterns = {"/api/notifications", "/api/notifications/*", "/notifications"})
public class NotificationServlet extends HttpServlet {

    private final NotificationDAO notificationDAO = new NotificationDAO();

    /**
     * Extracts authenticated user from session, returns null and sends 401 if not authenticated.
     */
    private User getAuthenticatedUser(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = (session != null) ? (User) session.getAttribute("user") : null;
        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"success\":false,\"message\":\"Authentication required. Please log in.\"}");
        }
        return user;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        resp.setHeader("Pragma", "no-cache");

        User user = getAuthenticatedUser(req, resp);
        if (user == null) return;

        PrintWriter out = resp.getWriter();
        int userId = user.getId();

        String pathInfo = req.getPathInfo();

        try {
            // GET /api/notifications/count — unread count only
            if (pathInfo != null && pathInfo.contains("count")) {
                int unread = notificationDAO.getUnreadCount(userId);
                out.write("{\"success\":true,\"unreadCount\":" + unread + "}");
                return;
            }

            // GET /api/notifications — full list
            int limit = 20;
            String limitParam = req.getParameter("limit");
            if (limitParam != null) {
                try { limit = Integer.parseInt(limitParam); } catch (NumberFormatException ignored) {}
            }

            List<Notification> notifications = notificationDAO.getNotificationsByUserId(userId, limit);
            int unreadCount = notificationDAO.getUnreadCount(userId);

            StringBuilder sb = new StringBuilder();
            sb.append("{\"success\":true,");
            sb.append("\"notifications\":").append(JsonUtil.notificationListToJson(notifications)).append(",");
            sb.append("\"unreadCount\":").append(unreadCount);
            sb.append("}");

            resp.setStatus(HttpServletResponse.SC_OK);
            out.write(sb.toString());

        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        User user = getAuthenticatedUser(req, resp);
        if (user == null) return;

        PrintWriter out = resp.getWriter();
        int userId = user.getId();

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) pathInfo = "";

        // Read request body
        StringBuilder bodyBuilder = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                bodyBuilder.append(line);
            }
        }
        String body = bodyBuilder.toString();
        Map<String, String> params = JsonUtil.parseSimpleJson(body);

        try {
            // POST /api/notifications/read-all — mark all as read
            if (pathInfo.contains("read-all")) {
                boolean result = notificationDAO.markAllAsRead(userId);
                out.write("{\"success\":true,\"message\":\"All notifications marked as read.\",\"result\":" + result + "}");
                return;
            }

            // POST /api/notifications/read — mark single as read
            if (pathInfo.contains("read")) {
                String idStr = params.get("id");
                if (idStr == null || idStr.isEmpty()) {
                    // Try request parameter fallback
                    idStr = req.getParameter("id");
                }
                if (idStr == null || idStr.isEmpty()) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Notification ID is required.\"}");
                    return;
                }
                int notifId;
                try {
                    notifId = Integer.parseInt(idStr);
                } catch (NumberFormatException e) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Invalid notification ID.\"}");
                    return;
                }

                boolean result = notificationDAO.markAsRead(notifId);
                int newUnread = notificationDAO.getUnreadCount(userId);
                out.write("{\"success\":true,\"message\":\"Notification marked as read.\",\"result\":" + result + ",\"unreadCount\":" + newUnread + "}");
                return;
            }

            // POST /api/notifications/clear-read — delete all read notifications
            if (pathInfo.contains("clear-read")) {
                boolean result = notificationDAO.deleteAllRead(userId);
                out.write("{\"success\":true,\"message\":\"Read notifications cleared.\",\"result\":" + result + "}");
                return;
            }

            // POST /api/notifications/delete — delete single notification
            if (pathInfo.contains("delete")) {
                String idStr = params.get("id");
                if (idStr == null || idStr.isEmpty()) {
                    idStr = req.getParameter("id");
                }
                if (idStr == null || idStr.isEmpty()) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Notification ID is required.\"}");
                    return;
                }
                int notifId;
                try {
                    notifId = Integer.parseInt(idStr);
                } catch (NumberFormatException e) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Invalid notification ID.\"}");
                    return;
                }

                boolean result = notificationDAO.deleteNotification(notifId, userId);
                if (result) {
                    out.write("{\"success\":true,\"message\":\"Notification deleted.\"}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.write("{\"success\":false,\"message\":\"Notification not found or not owned by you.\"}");
                }
                return;
            }

            // Unknown POST action
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Unknown notification action.\"}");

        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        User user = getAuthenticatedUser(req, resp);
        if (user == null) return;

        PrintWriter out = resp.getWriter();
        int userId = user.getId();

        String idStr = req.getParameter("id");
        if (idStr == null || idStr.isEmpty()) {
            // Try reading from body
            StringBuilder bodyBuilder = new StringBuilder();
            try (BufferedReader reader = req.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    bodyBuilder.append(line);
                }
            }
            Map<String, String> params = JsonUtil.parseSimpleJson(bodyBuilder.toString());
            idStr = params.get("id");
        }

        if (idStr == null || idStr.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Notification ID is required.\"}");
            return;
        }

        try {
            int notifId = Integer.parseInt(idStr);
            boolean result = notificationDAO.deleteNotification(notifId, userId);
            if (result) {
                out.write("{\"success\":true,\"message\":\"Notification deleted.\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.write("{\"success\":false,\"message\":\"Notification not found or not owned by you.\"}");
            }
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Invalid notification ID.\"}");
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }
}
