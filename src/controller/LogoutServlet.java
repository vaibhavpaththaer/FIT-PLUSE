package controller;


import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Controller handling User Logout and Session Invalidation.
 * Mapped to /api/logout, /logout, and /api/auth/logout.
 */
@WebServlet(name = "LogoutServlet", urlPatterns = {"/api/logout", "/logout", "/api/auth/logout"})
public class LogoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processLogout(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processLogout(request, response);
    }

    private void processLogout(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // 1. Destroy and invalidate active HTTP Session
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.removeAttribute("user");
            session.removeAttribute("userId");
            session.removeAttribute("userEmail");
            session.removeAttribute("userName");
            session.invalidate();
        }

        // 2. Erase Remember Me Cookie
        Cookie rememberCookie = new Cookie("fitpulse_remember", "");
        rememberCookie.setMaxAge(0);
        rememberCookie.setPath("/");
        rememberCookie.setHttpOnly(true);
        response.addCookie(rememberCookie);

        // 3. Strict No-Cache Headers to prevent browser Back navigation from reading cached user screens
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.print("{" +
                "\"success\":true," +
                "\"message\":\"You have logged out successfully. Session destroyed.\"" +
                "}");
        out.flush();
    }
}
