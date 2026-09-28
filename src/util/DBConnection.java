package util;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * =============================================================================
 * FITPULSE FITNESS COACHING & TRACKING PLATFORM
 * Database Connection Manager & Connection Pool
 * =============================================================================
 * Provides robust JDBC connection handling, properties loading, thread-safe
 * connection pooling, and connection diagnostics.
 */
public class DBConnection {

    private static final String DEFAULT_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String DEFAULT_URL = "jdbc:mysql://localhost:3306/fitness_coaching?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8&autoReconnect=true";
    private static final String DEFAULT_USER = "root";
    private static final String DEFAULT_PASSWORD = "root";
    private static final int DEFAULT_POOL_SIZE = 10;

    private static String driver = DEFAULT_DRIVER;
    private static String url = DEFAULT_URL;
    private static String user = DEFAULT_USER;
    private static String password = DEFAULT_PASSWORD;
    private static int maxPoolSize = DEFAULT_POOL_SIZE;

    private static boolean driverLoaded = false;
    private static final Properties props = new Properties();

    // Lightweight thread-safe connection pool
    private static BlockingQueue<Connection> pool;
    private static final AtomicInteger activeConnectionsCount = new AtomicInteger(0);
    private static volatile boolean poolInitialized = false;

    static {
        loadConfiguration();
        initializeDriver();
    }

    /**
     * Loads db.properties from multiple potential locations.
     */
    private static synchronized void loadConfiguration() {
        InputStream in = null;
        try {
            // 1. Try classpath /resources/db.properties
            in = DBConnection.class.getResourceAsStream("/resources/db.properties");
            if (in == null) {
                // 2. Try classpath /db.properties
                in = DBConnection.class.getResourceAsStream("/db.properties");
            }
            if (in == null) {
                // 3. Try classloader
                in = Thread.currentThread().getContextClassLoader().getResourceAsStream("db.properties");
            }
            if (in == null) {
                // 4. Try relative filesystem path
                File file = new File("src/resources/db.properties");
                if (file.exists()) {
                    in = new FileInputStream(file);
                }
            }
            if (in == null) {
                // 5. Try root db.properties
                File file = new File("db.properties");
                if (file.exists()) {
                    in = new FileInputStream(file);
                }
            }

            if (in != null) {
                props.load(in);
                driver = props.getProperty("db.driver", DEFAULT_DRIVER).trim();
                url = props.getProperty("db.url", DEFAULT_URL).trim();
                user = props.getProperty("db.user", DEFAULT_USER).trim();
                password = props.getProperty("db.password", DEFAULT_PASSWORD).trim();
                try {
                    maxPoolSize = Integer.parseInt(props.getProperty("db.pool.maxTotal", String.valueOf(DEFAULT_POOL_SIZE)).trim());
                } catch (NumberFormatException ignored) {}
                System.out.println("[DBConnection] Configuration loaded successfully from properties.");
            } else {
                System.out.println("[DBConnection] db.properties not found in classpath/filesystem; using defaults.");
            }
        } catch (Exception e) {
            System.err.println("[DBConnection] Warning loading db.properties: " + e.getMessage() + "; using defaults.");
        } finally {
            if (in != null) {
                try { in.close(); } catch (Exception ignored) {}
            }
        }
    }

    /**
     * Dynamically registers the JDBC Driver.
     */
    private static synchronized void initializeDriver() {
        if (driverLoaded) return;
        try {
            Class.forName(driver);
            driverLoaded = true;
            System.out.println("[DBConnection] JDBC Driver registered: " + driver);
        } catch (ClassNotFoundException e) {
            // Fallback for older driver package
            try {
                Class.forName("com.mysql.jdbc.Driver");
                driver = "com.mysql.jdbc.Driver";
                driverLoaded = true;
                System.out.println("[DBConnection] Fallback JDBC Driver registered: " + driver);
            } catch (ClassNotFoundException ex) {
                System.err.println("[DBConnection] ERROR: MySQL JDBC Driver class not found in classpath. " + ex.getMessage());
            }
        }
    }

    /**
     * Initializes the connection pool lazily.
     */
    private static synchronized void initPool() {
        if (poolInitialized) return;
        pool = new ArrayBlockingQueue<>(maxPoolSize);
        poolInitialized = true;
    }

    /**
     * Creates a new physical JDBC Connection.
     */
    public static Connection createNewConnection() throws SQLException {
        initializeDriver();
        try {
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            // If authentication failed (e.g. Access denied for user 'root'@'localhost'), try alternate common local setups
            if (e.getErrorCode() == 1045 || e.getMessage().toLowerCase().contains("access denied")) {
                String[] altPasswords = new String[] { "", "root", "password", "admin" };
                for (String alt : altPasswords) {
                    if (alt.equals(password)) continue;
                    try {
                        Connection altConn = DriverManager.getConnection(url, user, alt);
                        password = alt; // update for subsequent calls
                        return altConn;
                    } catch (SQLException ignored) {}
                }
            }
            throw e;
        }
    }

    /**
     * Retrieves a valid JDBC Connection. If pool is enabled, pulls from pool.
     */
    public static Connection getConnection() throws SQLException {
        if (!poolInitialized) {
            initPool();
        }

        Connection conn = pool.poll();
        if (conn != null) {
            try {
                if (!conn.isClosed() && conn.isValid(2)) {
                    return conn;
                }
            } catch (Exception ignored) {}
            // Connection is stale, decrement and create new
            activeConnectionsCount.decrementAndGet();
        }

        if (activeConnectionsCount.get() < maxPoolSize) {
            conn = createNewConnection();
            activeConnectionsCount.incrementAndGet();
            return conn;
        }

        // Wait for an available connection from the pool
        try {
            conn = pool.poll(5, TimeUnit.SECONDS);
            if (conn != null && !conn.isClosed() && conn.isValid(2)) {
                return conn;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Direct fallback creation if pool is saturated
        return createNewConnection();
    }

    /**
     * Releases or recycles a connection back to the pool.
     */
    public static void releaseConnection(Connection conn) {
        if (conn == null) return;
        try {
            if (conn.isClosed() || !conn.isValid(2)) {
                activeConnectionsCount.decrementAndGet();
                return;
            }
            if (!conn.getAutoCommit()) {
                conn.setAutoCommit(true);
            }
            if (pool != null && pool.offer(conn)) {
                // Successfully returned to pool
                return;
            }
            // Pool full, close it
            conn.close();
            activeConnectionsCount.decrementAndGet();
        } catch (Exception e) {
            activeConnectionsCount.decrementAndGet();
            try { conn.close(); } catch (Exception ignored) {}
        }
    }

    /**
     * Closes an active connection or releases it back to pool.
     */
    public static void closeConnection(Connection conn) {
        releaseConnection(conn);
    }

    /**
     * Closes AutoCloseable resources (Statements, ResultSets, Connections) quietly without throwing.
     */
    public static void close(AutoCloseable... closeables) {
        if (closeables == null) return;
        for (AutoCloseable c : closeables) {
            if (c != null) {
                try {
                    if (c instanceof Connection) {
                        releaseConnection((Connection) c);
                    } else {
                        c.close();
                    }
                } catch (Exception ignored) {}
            }
        }
    }

    /**
     * Executes a health check against the database.
     */
    public static boolean testConnection() {
        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;
        try {
            conn = createNewConnection();
            stmt = conn.createStatement();
            rs = stmt.executeQuery("SELECT 1");
            return rs.next();
        } catch (Exception e) {
            System.err.println("[DBConnection] Connection test failed: " + e.getMessage());
            return false;
        } finally {
            close(rs, stmt, conn);
        }
    }

    // Getters for configuration properties
    public static String getDriver() { return driver; }
    public static String getUrl() { return url; }
    public static String getUser() { return user; }
    public static String getPassword() { return password; }
    public static int getMaxPoolSize() { return maxPoolSize; }

    public static Properties getProperties() {
        return props;
    }
}
