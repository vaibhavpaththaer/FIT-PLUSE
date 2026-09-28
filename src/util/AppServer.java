package util;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import controller.*;
import filter.AuthFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionContext;

import java.io.*;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

/**
 * FitPulse Standalone Embedded AppServer
 * Runs on port 8080 and serves:
 * 1. Static Web Assets (HTML, CSS, JS, Images)
 * 2. Real Backend Java Servlets via RESTful API Endpoints
 */
public class AppServer {

    private static int PORT = 8080;
    private static String BIND_ADDRESS = "0.0.0.0";
    private static final Map<String, DummyHttpSession> sessions = new ConcurrentHashMap<>();
    private static final Map<String, HttpServlet> servlets = new HashMap<>();
    private static AuthFilter authFilter;

    public static void main(String[] args) throws Exception {
        System.out.println("===============================================================");
        System.out.println("🏋️  FITPULSE STANDALONE EMBEDDED APPSERVER STARTING...");
        System.out.println("===============================================================");

        try {
            Properties props = new Properties();
            File propFile = new File("application.properties");
            if (propFile.exists()) {
                props.load(new FileInputStream(propFile));
                if (props.getProperty("server.port") != null) {
                    PORT = Integer.parseInt(props.getProperty("server.port"));
                }
                if (props.getProperty("server.address") != null) {
                    BIND_ADDRESS = props.getProperty("server.address");
                }
                System.out.println("✅ [AppServer] Loaded configuration: port=" + PORT + ", address=" + BIND_ADDRESS);
            }
        } catch (Exception e) {
            System.err.println("⚠️ [AppServer] Could not load application.properties");
        }

        // 1. Initialize DB Connection
        boolean dbOk = DBConnection.testConnection();
        if (dbOk) {
            System.out.println("✅ [AppServer] Database Connection: SUCCESS");
        } else {
            System.err.println("⚠️ [AppServer] Database Connection WARNING: MySQL server might be offline or initializing.");
        }

        // 2. Register Servlets
        registerServlet(new LoginServlet(), "/api/login", "/login", "/api/auth/login", "/api/session", "/api/auth/check", "/api/auth/me");
        registerServlet(new RegisterServlet(), "/api/register", "/register", "/api/auth/register");
        registerServlet(new CoachRegisterServlet(), "/api/coach/register", "/coach/register");
        registerServlet(new LogoutServlet(), "/api/logout", "/logout", "/api/auth/logout");
        registerServlet(new ProfileServlet(), "/api/profile", "/api/user/profile", "/profile");
        registerServlet(new DashboardServlet(), "/api/dashboard", "/api/user/dashboard", "/dashboard");
        registerServlet(new WorkoutServlet(), "/api/workout", "/api/workouts", "/workouts");
        registerServlet(new DietServlet(), "/api/diet", "/api/diets", "/diets");
        registerServlet(new DietPlanServlet(), "/api/diet/meals", "/api/diet/random");
        registerServlet(new ProgressServlet(), "/api/progress", "/progress");
        registerServlet(new NotificationServlet(), "/api/notifications", "/notifications");
        registerServlet(new ReportServlet(), "/api/reports", "/reports");
        registerServlet(new AdminServlet(), "/api/admin", "/admin");
        registerServlet(new HealthServlet(), "/api/health");
        registerServlet(new CoachServlet(), "/api/coach", "/coach");
        registerServlet(new ForgotPasswordServlet(), "/api/forgot-password", "/api/auth/forgot-password");

        // 3. Initialize Security Filter
        authFilter = new AuthFilter();
        authFilter.init(null);

        // 4. Start HTTP Server
        HttpServer server = HttpServer.create(new InetSocketAddress(BIND_ADDRESS, PORT), 0);
        server.createContext("/", new CombinedHandler());
        server.setExecutor(Executors.newFixedThreadPool(20));
        server.start();

        System.out.println("🚀 [AppServer] Server running at http://localhost:" + PORT + "/");
        System.out.println("===============================================================");
    }

    private static void registerServlet(HttpServlet servlet, String... patterns) throws ServletException {
        servlet.init(new ServletConfig() {
            @Override public String getServletName() { return servlet.getClass().getSimpleName(); }
            @Override public ServletContext getServletContext() { return null; }
            @Override public String getInitParameter(String name) { return null; }
            @Override public Enumeration<String> getInitParameterNames() { return Collections.emptyEnumeration(); }
        });
        for (String pattern : patterns) {
            servlets.put(pattern, servlet);
        }
    }

    static class CombinedHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();

            // Handle API requests
            if (path.startsWith("/api/") || servlets.containsKey(path)) {
                handleApi(exchange, path);
                return;
            }

            // Handle Static File requests
            handleStatic(exchange, path);
        }

        private void handleApi(HttpExchange exchange, String path) throws IOException {
            // CORS Headers (Supports file://, localhost, live server, and custom origins)
            String origin = exchange.getRequestHeaders().getFirst("Origin");
            if (origin != null && !origin.trim().isEmpty()) {
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", origin);
            } else {
                exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            }
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
            exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");

            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            // Extract or create Session ID
            String sessionId = getSessionId(exchange);
            boolean newSession = false;
            if (sessionId == null) {
                sessionId = UUID.randomUUID().toString();
                newSession = true;
            }
            DummyHttpSession session = sessions.computeIfAbsent(sessionId, DummyHttpSession::new);

            if (newSession) {
                exchange.getResponseHeaders().add("Set-Cookie", "JSESSIONID=" + sessionId + "; Path=/; HttpOnly");
            }

            // Read Request Body
            byte[] bodyBytes = exchange.getRequestBody().readAllBytes();

            // Prepare Wrappers
            HttpServletResponseImpl respImpl = new HttpServletResponseImpl(exchange);
            HttpServletRequestImpl reqImpl = new HttpServletRequestImpl(exchange, bodyBytes, session);

            HttpServletRequest reqProxy = reqImpl.getProxy();
            HttpServletResponse respProxy = respImpl.getProxy();

            try {
                // Run Security Filter
                authFilter.doFilter(reqProxy, respProxy, new FilterChain() {
                    @Override
                    public void doFilter(ServletRequest request, ServletResponse response)
                            throws IOException, ServletException {
                        HttpServlet servlet = matchServlet(path);
                        if (servlet != null) {
                            servlet.service(request, response);
                        } else {
                            respImpl.setStatus(404);
                            respImpl.getWriter().write("{\"success\":false,\"message\":\"Endpoint not found: " + path + "\"}");
                        }
                    }
                });

                respImpl.commit();
            } catch (Exception e) {
                e.printStackTrace();
                if (!respImpl.isCommitted()) {
                    respImpl.setStatus(500);
                    respImpl.getWriter().write("{\"success\":false,\"message\":\"Server Error: " + e.getMessage() + "\"}");
                    respImpl.commit();
                }
            }
        }

        private HttpServlet matchServlet(String path) {
            HttpServlet exact = servlets.get(path);
            if (exact != null) return exact;
            for (Map.Entry<String, HttpServlet> entry : servlets.entrySet()) {
                String p = entry.getKey();
                if (path.startsWith(p)) {
                    return entry.getValue();
                }
            }
            return null;
        }

        private String getSessionId(HttpExchange exchange) {
            List<String> cookieHeaders = exchange.getRequestHeaders().get("Cookie");
            if (cookieHeaders != null) {
                for (String header : cookieHeaders) {
                    String[] cookies = header.split(";");
                    for (String cookie : cookies) {
                        String[] pair = cookie.trim().split("=");
                        if (pair.length == 2 && "JSESSIONID".equalsIgnoreCase(pair[0])) {
                            return pair[1];
                        }
                    }
                }
            }
            return null;
        }

        private void handleStatic(HttpExchange exchange, String path) throws IOException {
            if ("/".equals(path) || path.isEmpty()) {
                path = "/index.html";
            }

            Path file = Paths.get(".", path.substring(1));
            if (!Files.exists(file) || Files.isDirectory(file)) {
                String msg = "404 Not Found";
                exchange.sendResponseHeaders(404, msg.length());
                OutputStream os = exchange.getResponseBody();
                os.write(msg.getBytes());
                os.close();
                return;
            }

            String contentType = getMimeType(path);
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Cache-Control", "no-cache, no-store, must-revalidate");

            byte[] bytes = Files.readAllBytes(file);
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }

        private String getMimeType(String path) {
            if (path.endsWith(".html")) return "text/html; charset=utf-8";
            if (path.endsWith(".css")) return "text/css; charset=utf-8";
            if (path.endsWith(".js")) return "text/javascript; charset=utf-8";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
            if (path.endsWith(".svg")) return "image/svg+xml";
            if (path.endsWith(".ico")) return "image/x-icon";
            if (path.endsWith(".json")) return "application/json; charset=utf-8";
            return "application/octet-stream";
        }
    }

    // Dummy Session Implementation
    static class DummyHttpSession implements HttpSession {
        private final String id;
        private final Map<String, Object> attributes = new ConcurrentHashMap<>();
        private final long creationTime = System.currentTimeMillis();
        private long lastAccessedTime = System.currentTimeMillis();
        private boolean valid = true;

        public DummyHttpSession(String id) { this.id = id; }
        @Override public String getId() { return id; }
        @Override public long getCreationTime() { return creationTime; }
        @Override public long getLastAccessedTime() { return lastAccessedTime; }
        @Override public ServletContext getServletContext() { return null; }
        @Override public void setMaxInactiveInterval(int interval) {}
        @Override public int getMaxInactiveInterval() { return 1800; }
        @SuppressWarnings("deprecation")
        @Override public HttpSessionContext getSessionContext() { return null; }
        @Override public Object getAttribute(String name) { checkValid(); return attributes.get(name); }
        @Override public Object getValue(String name) { return getAttribute(name); }
        @Override public Enumeration<String> getAttributeNames() { checkValid(); return Collections.enumeration(attributes.keySet()); }
        @Override public String[] getValueNames() { checkValid(); return attributes.keySet().toArray(new String[0]); }
        @Override public void setAttribute(String name, Object value) { checkValid(); if (value == null) attributes.remove(name); else attributes.put(name, value); }
        @Override public void putValue(String name, Object value) { setAttribute(name, value); }
        @Override public void removeAttribute(String name) { checkValid(); attributes.remove(name); }
        @Override public void removeValue(String name) { removeAttribute(name); }
        @Override public void invalidate() { valid = false; attributes.clear(); }
        @Override public boolean isNew() { return false; }
        public boolean isValid() { return valid; }
        private void checkValid() { if (!valid) throw new IllegalStateException("Session invalidated"); lastAccessedTime = System.currentTimeMillis(); }
    }

    // Dynamic Request Wrapper Implementation
    static class HttpServletRequestImpl implements InvocationHandler {
        private final HttpExchange exchange;
        private final byte[] body;
        private DummyHttpSession currentSession;
        private final Map<String, String[]> parameters = new HashMap<>();
        private String encoding = "UTF-8";

        public HttpServletRequestImpl(HttpExchange exchange, byte[] body, DummyHttpSession session) {
            this.exchange = exchange;
            this.body = body;
            this.currentSession = session;
            parseParameters();
        }

        private void parseParameters() {
            String query = exchange.getRequestURI().getQuery();
            if (query != null) {
                parseQuery(query);
            }
            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            if (contentType != null && contentType.contains("application/x-www-form-urlencoded")) {
                parseQuery(new String(body, StandardCharsets.UTF_8));
            }
        }

        private void parseQuery(String query) {
            for (String pair : query.split("&")) {
                String[] kv = pair.split("=");
                if (kv.length > 0) {
                    String k = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
                    String v = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
                    parameters.compute(k, (key, old) -> {
                        if (old == null) return new String[]{v};
                        String[] arr = Arrays.copyOf(old, old.length + 1);
                        arr[arr.length - 1] = v;
                        return arr;
                    });
                }
            }
        }

        public HttpServletRequest getProxy() {
            return (HttpServletRequest) Proxy.newProxyInstance(
                    HttpServletRequest.class.getClassLoader(),
                    new Class<?>[]{HttpServletRequest.class},
                    this
            );
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            String name = method.getName();
            switch (name) {
                case "getMethod": return exchange.getRequestMethod();
                case "getRequestURI": return exchange.getRequestURI().getPath();
                case "getContextPath": return "";
                case "getServletPath": return exchange.getRequestURI().getPath();
                case "getPathInfo": return null;
                case "getQueryString": return exchange.getRequestURI().getQuery();
                case "getContentType": return exchange.getRequestHeaders().getFirst("Content-Type");
                case "getContentLength": return body.length;
                case "getCharacterEncoding": return encoding;
                case "setCharacterEncoding": encoding = (String) args[0]; return null;
                case "getReader": return new BufferedReader(new InputStreamReader(new ByteArrayInputStream(body), encoding));
                case "getInputStream": return new ServletInputStreamWrapper(body);
                case "getParameter":
                    String[] vals = parameters.get((String) args[0]);
                    return (vals != null && vals.length > 0) ? vals[0] : null;
                case "getParameterValues": return parameters.get((String) args[0]);
                case "getParameterMap": return parameters;
                case "getParameterNames": return Collections.enumeration(parameters.keySet());
                case "getHeader": return exchange.getRequestHeaders().getFirst((String) args[0]);
                case "getHeaders":
                    List<String> list = exchange.getRequestHeaders().get((String) args[0]);
                    return list != null ? Collections.enumeration(list) : Collections.emptyEnumeration();
                case "getHeaderNames": return Collections.enumeration(exchange.getRequestHeaders().keySet());
                case "getSession":
                    boolean create = args == null || args.length == 0 || (Boolean) args[0];
                    if (currentSession != null && currentSession.isValid()) return currentSession;
                    if (create) {
                        String newId = UUID.randomUUID().toString();
                        currentSession = new DummyHttpSession(newId);
                        sessions.put(newId, currentSession);
                        exchange.getResponseHeaders().add("Set-Cookie", "JSESSIONID=" + newId + "; Path=/; HttpOnly");
                        return currentSession;
                    }
                    return null;
                case "getCookies":
                    List<String> cookieHeaders = exchange.getRequestHeaders().get("Cookie");
                    if (cookieHeaders == null) return null;
                    List<Cookie> cookieList = new ArrayList<>();
                    for (String header : cookieHeaders) {
                        for (String c : header.split(";")) {
                            String[] pair = c.trim().split("=");
                            if (pair.length == 2) {
                                cookieList.add(new Cookie(pair[0], pair[1]));
                            }
                        }
                    }
                    return cookieList.toArray(new Cookie[0]);
                case "getAttribute": return null;
                case "setAttribute": return null;
                case "removeAttribute": return null;
                default:
                    if (method.getReturnType().equals(boolean.class)) return false;
                    if (method.getReturnType().equals(int.class)) return 0;
                    return null;
            }
        }
    }

    static class ServletInputStreamWrapper extends javax.servlet.ServletInputStream {
        private final ByteArrayInputStream bais;
        public ServletInputStreamWrapper(byte[] data) { this.bais = new ByteArrayInputStream(data); }
        @Override public boolean isFinished() { return bais.available() == 0; }
        @Override public boolean isReady() { return true; }
        @Override public void setReadListener(javax.servlet.ReadListener listener) {}
        @Override public int read() { return bais.read(); }
    }

    // Dynamic Response Wrapper Implementation
    static class HttpServletResponseImpl implements InvocationHandler {
        private final HttpExchange exchange;
        private final ByteArrayOutputStream baos = new ByteArrayOutputStream();
        private final PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8), true);
        private int statusCode = 200;
        private boolean committed = false;

        public HttpServletResponseImpl(HttpExchange exchange) {
            this.exchange = exchange;
        }

        public HttpServletResponse getProxy() {
            return (HttpServletResponse) Proxy.newProxyInstance(
                    HttpServletResponse.class.getClassLoader(),
                    new Class<?>[]{HttpServletResponse.class},
                    this
            );
        }

        public void setStatus(int sc) { this.statusCode = sc; }
        public PrintWriter getWriter() { return writer; }
        public boolean isCommitted() { return committed; }

        public void commit() throws IOException {
            if (committed) return;
            writer.flush();
            byte[] bytes = baos.toByteArray();
            exchange.sendResponseHeaders(statusCode, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
            committed = true;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            String name = method.getName();
            switch (name) {
                case "setStatus": statusCode = (Integer) args[0]; return null;
                case "getStatus": return statusCode;
                case "setContentType": exchange.getResponseHeaders().set("Content-Type", (String) args[0]); return null;
                case "setHeader": exchange.getResponseHeaders().set((String) args[0], (String) args[1]); return null;
                case "addHeader": exchange.getResponseHeaders().add((String) args[0], (String) args[1]); return null;
                case "setDateHeader": exchange.getResponseHeaders().set((String) args[0], String.valueOf(args[1])); return null;
                case "getWriter": return writer;
                case "addCookie":
                    Cookie cookie = (Cookie) args[0];
                    StringBuilder sb = new StringBuilder();
                    sb.append(cookie.getName()).append("=").append(cookie.getValue()).append("; Path=").append(cookie.getPath() != null ? cookie.getPath() : "/");
                    if (cookie.getMaxAge() >= 0) sb.append("; Max-Age=").append(cookie.getMaxAge());
                    if (cookie.isHttpOnly()) sb.append("; HttpOnly");
                    exchange.getResponseHeaders().add("Set-Cookie", sb.toString());
                    return null;
                default:
                    if (method.getReturnType().equals(boolean.class)) return false;
                    if (method.getReturnType().equals(int.class)) return 0;
                    return null;
            }
        }
    }
}
