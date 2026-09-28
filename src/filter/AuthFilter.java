package filter;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Security & Session Filter protecting user data endpoints and preventing
 * browser caching of authenticated state.
 */
@WebFilter(filterName = "AuthFilter", urlPatterns = {"/*"})
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization if needed
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // 1. Enforce No-Cache Headers on all dynamic API and dynamic HTML responses
        // This ensures the browser Back button will NEVER serve stale logged-in dashboard screens after logout
        httpResponse.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0");
        httpResponse.setHeader("Pragma", "no-cache");
        httpResponse.setDateHeader("Expires", 0);

        String uri = httpRequest.getRequestURI();
        String contextPath = httpRequest.getContextPath();
        String path = uri.substring(contextPath.length());

        // 2. Allow Public Endpoints and Static Assets
        if (isPublicPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Protected Endpoints: Verify Session Existence and Authenticated User ID
        HttpSession session = httpRequest.getSession(false);
        boolean isAuthenticated = (session != null && session.getAttribute("userId") != null);

        if (!isAuthenticated) {
            if (path.startsWith("/api/")) {
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.setContentType("application/json; charset=UTF-8");
                httpResponse.getWriter().write("{" +
                        "\"success\":false," +
                        "\"authenticated\":false," +
                        "\"message\":\"Authentication required. Please sign in to access this resource.\"" +
                        "}");
                return;
            } else {
                httpResponse.sendRedirect(contextPath + "/index.html");
                return;
            }
        }

        // 4. Role-Based Access Control (RBAC): Enforce Admin privilege for Admin routes
        if (isAdminPath(path)) {
            String authRole = (String) session.getAttribute("authRole");
            if (authRole == null && session.getAttribute("user") instanceof model.User) {
                authRole = ((model.User) session.getAttribute("user")).getRole();
            }

            if (!"admin".equalsIgnoreCase(authRole)) {
                if (path.startsWith("/api/")) {
                    httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    httpResponse.setContentType("application/json; charset=UTF-8");
                    httpResponse.getWriter().write("{" +
                            "\"success\":false," +
                            "\"authenticated\":true," +
                            "\"authorized\":false," +
                            "\"message\":\"Access denied. Administrator privileges required.\"" +
                            "}");
                    return;
                } else {
                    httpResponse.sendRedirect(contextPath + "/index.html");
                    return;
                }
            }
        }

        // User is authenticated and authorized; proceed with request
        chain.doFilter(request, response);
    }

    private boolean isAdminPath(String path) {
        if (path == null) return false;
        return path.startsWith("/api/admin") || path.equals("/admin") || path.startsWith("/admin/") || path.equals("/admin.html");
    }

    private boolean isPublicPath(String path) {
        if (path == null || path.isEmpty() || "/".equals(path) || "/index.html".equals(path)) {
            return true;
        }
        // Public API routes
        if (path.equals("/api/login") || path.equals("/login") || path.equals("/api/auth/login") ||
                path.equals("/api/register") || path.equals("/register") || path.equals("/api/auth/register") ||
                path.equals("/api/coach/register") || path.equals("/coach/register") ||
                path.equals("/api/logout") || path.equals("/logout") || path.equals("/api/auth/logout") ||
                path.equals("/api/forgot-password") || path.equals("/forgot-password") || path.equals("/api/reset-password") ||
                path.equals("/api/session") || path.equals("/api/auth/check") || path.equals("/api/auth/me") || 
                path.equals("/api/health")) {
            return true;
        }
        // Static assets
        if (path.startsWith("/assets/") || path.startsWith("/css/") || path.startsWith("/js/") ||
                path.endsWith(".css") || path.endsWith(".js") || path.endsWith(".jpg") ||
                path.endsWith(".png") || path.endsWith(".svg") || path.endsWith(".ico") ||
                path.endsWith(".woff") || path.endsWith(".woff2") || path.endsWith(".ttf")) {
            return true;
        }
        return false;
    }

    @Override
    public void destroy() {
        // Cleanup if needed
    }
}
