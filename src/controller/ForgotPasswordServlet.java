package controller;

import service.AuthService;
import service.ServiceResult;
import util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * Controller handling Forgot Password & Password Recovery.
 * Mapped to /api/forgot-password, /forgot-password, and /api/reset-password.
 */
@WebServlet(name = "ForgotPasswordServlet", urlPatterns = {
        "/api/forgot-password",
        "/forgot-password",
        "/api/auth/forgot-password",
        "/api/reset-password"
})
public class ForgotPasswordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private AuthService authService;

    @Override
    public void init() throws ServletException {
        super.init();
        this.authService = new AuthService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

        PrintWriter out = response.getWriter();
        String path = request.getServletPath();

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

        if (path != null && path.contains("reset-password")) {
            // Reset Password Flow
            String identifier = getVal(params, "identifier", getVal(params, "email", ""));
            String newPassword = getVal(params, "newPassword", getVal(params, "password", ""));
            String confirmPassword = getVal(params, "confirmPassword", newPassword);

            ServiceResult<Boolean> result = authService.resetPassword(identifier, newPassword, confirmPassword);
            if (result.isSuccess()) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{\"success\":true,\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.print("{\"success\":false,\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"}");
            }
        } else {
            // Forgot Password / Request Code Flow
            String identifier = getVal(params, "identifier", getVal(params, "email", getVal(params, "mobile", "")));
            ServiceResult<String> result = authService.processForgotPassword(identifier);

            if (result.isSuccess()) {
                response.setStatus(HttpServletResponse.SC_OK);
                out.print("{" +
                        "\"success\":true," +
                        "\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"," +
                        "\"target\":\"" + JsonUtil.escape(identifier) + "\"" +
                        "}");
            } else {
                int status = result.getErrorCode() > 0 ? result.getErrorCode() : HttpServletResponse.SC_BAD_REQUEST;
                response.setStatus(status);
                out.print("{\"success\":false,\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"}");
            }
        }
        out.flush();
    }

    private String getVal(Map<String, String> map, String key, String defaultValue) {
        String v = map.get(key);
        return (v != null && !v.trim().isEmpty()) ? v.trim() : defaultValue;
    }
}
