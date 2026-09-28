package util;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * =============================================================================
 * FITPULSE FITNESS COACHING & TRACKING PLATFORM
 * Step 2: JDBC Connection Verification & Diagnostic Test
 * =============================================================================
 */
public class ConnectionTest {

    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println(" FITPULSE FITNESS PLATFORM — JDBC DATABASE CONNECTION TEST");
        System.out.println("===============================================================");
        System.out.println("JDBC Driver  : " + DBConnection.getDriver());
        System.out.println("Database URL : " + DBConnection.getUrl());
        System.out.println("DB User      : " + DBConnection.getUser());
        System.out.println("Max Pool     : " + DBConnection.getMaxPoolSize());
        System.out.println("---------------------------------------------------------------");
        System.out.println("[1/3] Attempting connection to MySQL server...");

        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            long startTime = System.currentTimeMillis();
            conn = DBConnection.createNewConnection();
            long elapsed = System.currentTimeMillis() - startTime;

            System.out.println(">>> SUCCESS! Connected to MySQL database in " + elapsed + " ms.");
            System.out.println("---------------------------------------------------------------");
            System.out.println("[2/3] Inspecting Database Metadata...");

            DatabaseMetaData meta = conn.getMetaData();
            System.out.println("DBMS Name    : " + meta.getDatabaseProductName() + " v" + meta.getDatabaseProductVersion());
            System.out.println("Driver Name  : " + meta.getDriverName() + " v" + meta.getDriverVersion());
            System.out.println("Catalog/DB   : " + conn.getCatalog());

            System.out.println("---------------------------------------------------------------");
            System.out.println("[3/3] Checking Required Application Tables...");

            String[] requiredTables = {
                "coaches", "users", "workouts", "workout_exercises",
                "diet_plans", "diet_meals", "progress", "messages",
                "notifications", "reports"
            };

            List<String> existingTables = new ArrayList<>();
            ResultSet tableRs = meta.getTables(conn.getCatalog(), null, "%", new String[]{"TABLE"});
            while (tableRs.next()) {
                existingTables.add(tableRs.getString("TABLE_NAME").toLowerCase());
            }
            tableRs.close();

            stmt = conn.createStatement();
            int foundCount = 0;
            for (String table : requiredTables) {
                boolean exists = existingTables.contains(table.toLowerCase());
                if (exists) {
                    foundCount++;
                    int rowCount = 0;
                    try {
                        rs = stmt.executeQuery("SELECT COUNT(*) FROM `" + table + "`");
                        if (rs.next()) {
                            rowCount = rs.getInt(1);
                        }
                        rs.close();
                    } catch (Exception ignored) {}
                    System.out.println("  [FOUND] Table: " + String.format("%-18s", table) + " | Records: " + rowCount);
                } else {
                    System.out.println("  [MISSING] Table: " + table + " (Run db/schema.sql to create)");
                }
            }

            System.out.println("---------------------------------------------------------------");
            if (foundCount == requiredTables.length) {
                System.out.println(">>> VERIFICATION COMPLETE: All " + foundCount + "/" + requiredTables.length + " tables verified!");
            } else {
                System.out.println(">>> " + foundCount + "/" + requiredTables.length + " tables found. Please run db/schema.sql & db/seed.sql.");
            }
            System.out.println("===============================================================");

        } catch (Exception e) {
            System.err.println("\n>>> CONNECTION FAILED: " + e.getMessage());
            System.err.println("---------------------------------------------------------------");
            System.err.println("DIAGNOSTIC & TROUBLESHOOTING GUIDE:");
            System.err.println("1. Ensure MySQL Server is running (e.g., via MySQL Workbench, XAMPP, or Services: 'net start MySQL')");
            System.err.println("2. Verify that database 'fitness_coaching' exists. If not, run db/schema.sql in your MySQL client.");
            System.err.println("3. If your MySQL root password is not 'root', update 'db.password' in 'src/resources/db.properties'.");
            System.err.println("4. Default connection string: " + DBConnection.getUrl());
            System.err.println("===============================================================");
        } finally {
            DBConnection.close(rs, stmt, conn);
        }
    }
}
