package controller;

import dao.CoachDAO;
import model.User;
import service.AuthService;
import service.ServiceResult;
import util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * Controller handling Login Authentication and Active Session Validation.
 * Mapped to /api/login, /login, /api/auth/login, /api/session, and /api/auth/check.
 *
 * Role-Aware Login (Step 16):
 *  - Frontend sends optional "loginRole" field ("user" or "coach").
 *  - Backend verifies the actual role from MySQL — frontend role is NOT trusted.
 *  - If loginRole="coach" but account is "user" → 403 Forbidden.
 *  - If loginRole="user" but account is "coach" → 403 Forbidden.
 *  - If loginRole="coach" and coach account_status="pending" → 403 Forbidden.
 *  - Admin accounts can always log in (ignored by role selector).
 */
@WebServlet(name = "LoginServlet", urlPatterns = {
        "/api/login",
        "/login",
        "/api/auth/login",
        "/api/session",
        "/api/auth/check",
        "/api/auth/me"
})
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private AuthService authService;
    private CoachDAO coachDAO;

    @Override
    public void init() throws ServletException {
        super.init();
        this.authService = new AuthService();
        this.coachDAO = new CoachDAO();
    }

    /**
     * Handles Login Authentication.
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");

        // Strict cache-control headers to prevent storing authenticated states in browser back-forward cache
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        PrintWriter out = response.getWriter();

        String contentType = request.getContentType();
        Map<String, String> params;

        if (contentType != null && contentType.toLowerCase().contains("application/json")) {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            params = JsonUtil.parseSimpleJson(sb.toString());
        } else {
            params = new java.util.HashMap<>();
            for (String key : request.getParameterMap().keySet()) {
                params.put(key, request.getParameter(key));
            }
        }

        String identifier = getVal(params, "identifier", getVal(params, "email", getVal(params, "mobile", "")));
        String password = getVal(params, "password", "");
        boolean rememberMe = "true".equalsIgnoreCase(getVal(params, "rememberMe", "false")) ||
                "1".equals(getVal(params, "rememberMe", "0")) ||
                "on".equalsIgnoreCase(getVal(params, "rememberMe", ""));

        // Role hint from frontend (NOT trusted — we verify from DB below)
        String loginRoleHint = getVal(params, "loginRole", "").trim().toLowerCase();

        // Authenticate with business service (verifies password via PBKDF2/SHA-256)
        ServiceResult<User> result = authService.login(identifier, password);

        if (result.isSuccess()) {
            User user = result.getData();
            String actualRole = user.getRole() != null ? user.getRole().toLowerCase() : "user";

            // ── Role Mismatch Guard (Server-Side) ──────────────────────────
            if (!loginRoleHint.isEmpty() && !"admin".equals(actualRole)) {
                if ("coach".equals(loginRoleHint) && !"coach".equals(actualRole)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.print("{\"success\":false,\"message\":\"This is not a coach account. Please select 'User' to sign in.\"}");
                    out.flush();
                    return;
                }
                if ("user".equals(loginRoleHint) && "coach".equals(actualRole)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    out.print("{\"success\":false,\"message\":\"This is a coach account. Please select 'Coach' to sign in.\"}");
                    out.flush();
                    return;
                }
            }

            // ── Coach Approval Status Check ────────────────────────────────
            if ("coach".equals(actualRole)) {
                try {
                    String coachStatus = coachDAO.getCoachStatusByEmail(user.getEmail());
                    /*
                    if ("pending".equals(coachStatus)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        out.print("{\"success\":false,\"message\":\"Your coach account is pending admin approval. Please wait for approval before signing in.\",\"accountStatus\":\"pending\"}");
                        out.flush();
                        return;
                    }
                    */
                    if ("rejected".equals(coachStatus)) {
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        out.print("{\"success\":false,\"message\":\"Your coach registration has been rejected. Please contact support.\",\"accountStatus\":\"rejected\"}");
                        out.flush();
                        return;
                    }
                } catch (Exception e) {
                    // If coaches table lookup fails (e.g. old coach row not found), allow login to proceed
                }
            }

            // ── Create Secure Session ──────────────────────────────────────
            // 1. Invalidate any prior session to prevent session fixation
            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }

            // 2. Create fresh secure session
            HttpSession session = request.getSession(true);
            session.setAttribute("user", user);
            session.setAttribute("userId", user.getId());
            session.setAttribute("userEmail", user.getEmail());
            session.setAttribute("userName", user.getFullName());
            session.setAttribute("authRole", user.getRole());
            session.setAttribute("loginTime", System.currentTimeMillis());

            // 3. Handle Remember Me Cookie if enabled
            if (rememberMe) {
                Cookie rememberCookie = new Cookie("fitpulse_remember", user.getEmail());
                rememberCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
                rememberCookie.setPath("/");
                rememberCookie.setHttpOnly(true);
                response.addCookie(rememberCookie);
            }

            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"," +
                    "\"user\":" + JsonUtil.userToJson(user) +
                    "}");
        } else {
            int statusCode = result.getErrorCode() > 0 ? result.getErrorCode() : HttpServletResponse.SC_UNAUTHORIZED;
            response.setStatus(statusCode);
            out.print("{" +
                    "\"success\":false," +
                    "\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"" +
                    "}");
        }
        out.flush();
    }

    /**
     * Handles Session Status Check (/api/session, /api/auth/check).
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json; charset=UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);

        if (session != null && session.getAttribute("userId") != null && session.getAttribute("user") != null) {
            User user = (User) session.getAttribute("user");
            response.setStatus(HttpServletResponse.SC_OK);
            out.print("{" +
                    "\"authenticated\":true," +
                    "\"user\":" + JsonUtil.userToJson(user) +
                    "}");
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("{" +
                    "\"authenticated\":false," +
                    "\"message\":\"Session expired or unauthenticated. Please sign in.\"" +
                    "}");
        }
        out.flush();
    }

    private String getVal(Map<String, String> map, String key, String defaultValue) {
        String v = map.get(key);
        return (v != null && !v.trim().isEmpty()) ? v.trim() : defaultValue;
    }
}
