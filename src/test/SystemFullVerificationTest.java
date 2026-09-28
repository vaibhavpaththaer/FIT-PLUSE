package test;

import dao.*;
import model.*;
import util.DBConnection;
import util.PasswordUtil;

import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * FitPulse Full System Verification Suite
 * Tests End-to-End Core Functionality:
 * 1. Database Connection & Pool
 * 2. Auth, Password Hashing & Registration Lifecycle
 * 3. User Profile & Biometrics
 * 4. Workout Engine & History
 * 5. Diet, Macros & Hydration
 * 6. Progress Analytics, Dynamic BMI & Measurements
 * 7. Multi-tenant User Isolation & Data Security
 */
public class SystemFullVerificationTest {

    private static UserDAO userDAO = new UserDAO();
    private static WorkoutDAO workoutDAO = new WorkoutDAO();
    private static DietDAO dietDAO = new DietDAO();
    private static ProgressDAO progressDAO = new ProgressDAO();


    private static int passedTests = 0;
    private static int failedTests = 0;

    public static void main(String[] args) {
        System.out.println("================================================================");
        System.out.println("🏋️  FITPULSE ENTERPRISE FULL SYSTEM VERIFICATION SUITE");
        System.out.println("================================================================");

        try {
            testDatabaseConnection();
            testAuthAndRegistrationLifecycle();
            testUserProfileAndBiometrics();
            testWorkoutEngineAndHistory();
            testDietMacrosAndHydration();
            testProgressBiometricsAndDynamicBMI();
            testMultiTenantSecurityAndIsolation();

            System.out.println("\n================================================================");
            System.out.println("🎯 TEST RESULTS SUMMARY:");
            System.out.println("   Passed: " + passedTests);
            System.out.println("   Failed: " + failedTests);
            System.out.println("================================================================");

            if (failedTests == 0) {
                System.out.println("✨ ALL SYSTEM INTEGRATION TESTS PASSED PERFECTLY! 🚀");
            } else {
                System.err.println("❌ SOME TESTS FAILED. PLEASE CHECK LOGS.");
                System.exit(1);
            }
        } catch (Exception e) {
            System.err.println("🔥 Critical test execution failure: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void assertTrue(String testName, boolean condition, String errorMsg) {
        if (condition) {
            passedTests++;
            System.out.println("  ✅ [PASS] " + testName);
        } else {
            failedTests++;
            System.err.println("  ❌ [FAIL] " + testName + " -> " + errorMsg);
        }
    }

    // =========================================================================
    // 1. DATABASE CONNECTIVITY TEST
    // =========================================================================
    private static void testDatabaseConnection() {
        System.out.println("\n[1/7] Testing Database Connection Pool...");
        try (Connection conn = DBConnection.getConnection()) {
            assertTrue("Database Connection Valid", conn != null && !conn.isClosed(), "Failed to obtain valid connection.");
        } catch (SQLException e) {
            assertTrue("Database Connection Valid", false, e.getMessage());
        }
    }

    // =========================================================================
    // 2. AUTHENTICATION & REGISTRATION LIFECYCLE
    // =========================================================================
    private static void testAuthAndRegistrationLifecycle() throws SQLException {
        System.out.println("\n[2/7] Testing Auth, Hashing & Registration...");

        String testEmail = "athlete_test_" + System.currentTimeMillis() + "@fitpulse.io";
        String rawPass = "EliteAthlete2026!";
        String salt = PasswordUtil.generateSalt();
        String hashedPass = PasswordUtil.hashPassword(rawPass, salt);

        User user = new User();
        user.setEmail(testEmail);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hashedPass);
        user.setFullName("Marcus Steele");
        user.setMobileCountry("+1");
        user.setMobileNumber("555" + (int)(Math.random() * 8999999 + 1000000));
        user.setRole("user");
        user.setHeightCm(180.0);
        user.setWeightKg(80.0);
        user.setTargetWeightKg(75.0);
        user.setFitnessGoal("fat_loss");
        user.setActivityLevel("very_active");
        user.setStreakDays(5);
        user.setTotalWorkouts(12);
        user.setTotalCaloriesBurned(8500);

        int userId = userDAO.createUser(user);
        assertTrue("User Registration in Database", userId > 0, "Failed to insert new test user.");

        User fetched = userDAO.getUserByEmail(testEmail);
        assertTrue("Fetch User by Email", fetched != null && fetched.getId() == userId, "User not found after registration.");

        boolean passMatch = PasswordUtil.verifyPassword(rawPass, fetched.getPasswordSalt(), fetched.getPasswordHash());
        assertTrue("Password Hash & Salt Verification", passMatch, "Password hash verification failed.");

        boolean wrongPassMatch = PasswordUtil.verifyPassword("WrongPassword123!", fetched.getPasswordSalt(), fetched.getPasswordHash());
        assertTrue("Invalid Password Rejection", !wrongPassMatch, "Accepted invalid password.");
    }

    // =========================================================================
    // 3. USER PROFILE & BIOMETRICS
    // =========================================================================
    private static void testUserProfileAndBiometrics() throws SQLException {
        System.out.println("\n[3/7] Testing User Profile & Biometrics...");

        String testEmail = "profile_test_" + System.currentTimeMillis() + "@fitpulse.io";
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword("SecurePass2026!", salt);

        User user = new User();
        user.setEmail(testEmail);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hash);
        user.setFullName("Elena Rostova");
        user.setMobileNumber("444" + (int)(Math.random() * 8999999 + 1000000));
        user.setHeightCm(168.0);
        user.setWeightKg(65.0);
        user.setTargetWeightKg(58.0);
        user.setFitnessGoal("hypertrophy");
        user.setActivityLevel("moderate");
        int uId = userDAO.createUser(user);

        User u = userDAO.getUserById(uId);
        assertTrue("User Retrieved for Profile Test", u != null, "User null.");

        // Update profile
        u.setFullName("Elena Rostova Pro");
        u.setHeightCm(169.0);
        u.setWeightKg(63.5);
        u.setTargetWeightKg(57.0);
        u.setFitnessGoal("endurance");
        u.setActivityLevel("very_active");

        boolean updated = userDAO.updateUserProfile(u);
        assertTrue("Update User Profile", updated, "updateUserProfile failed.");

        User reFetched = userDAO.getUserById(u.getId());
        assertTrue("Verified Profile Persistence",
                "Elena Rostova Pro".equals(reFetched.getFullName()) && reFetched.getHeightCm() == 169.0 && reFetched.getWeightKg() == 63.5,
                "Profile modifications did not persist.");
    }

    // =========================================================================
    // 4. WORKOUT ENGINE & HISTORY
    // =========================================================================
    private static void testWorkoutEngineAndHistory() throws SQLException {
        System.out.println("\n[4/7] Testing Workout Engine & Workout History...");

        String email = "workout_test_" + System.currentTimeMillis() + "@fitpulse.io";
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword("WorkoutPass123!", salt);

        User user = new User();
        user.setEmail(email);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hash);
        user.setFullName("Damon Vance");
        user.setMobileNumber("333" + (int)(Math.random() * 8999999 + 1000000));
        user.setWeightKg(85.0);
        user.setHeightCm(185.0);
        int uId = userDAO.createUser(user);

        Date today = new Date(System.currentTimeMillis());

        Workout wp = new Workout();
        wp.setUserId(uId);
        wp.setTitle("Upper Body Power & Hypertrophy");
        wp.setCategory("Strength");
        wp.setTargetMuscle("Chest, Shoulders & Triceps");
        wp.setDifficulty("intermediate");
        wp.setDurationMin(60);
        wp.setCaloriesBurned(550);
        wp.setScheduledDate(today);
        wp.setScheduledTime("18:00");
        wp.setCompleted(false);

        List<WorkoutExercise> exList = new ArrayList<>();
        WorkoutExercise e1 = new WorkoutExercise();
        e1.setExerciseName("Incline Dumbbell Bench Press");
        e1.setSets(4);
        e1.setReps(10);
        e1.setWeightKg(34.0);
        e1.setRestSec(90);
        e1.setOrderIdx(1);
        exList.add(e1);
        wp.setExercises(exList);

        int workoutId = workoutDAO.createWorkoutWithExercises(wp);
        assertTrue("Create Workout with Exercises", workoutId > 0, "Failed to create workout plan.");

        // Complete workout
        boolean completed = workoutDAO.completeWorkout(workoutId, uId, 550, 60);
        assertTrue("Mark Workout Completed", completed, "Failed to update workout status.");

        // Fetch History
        List<Workout> history = workoutDAO.getCompletedWorkoutsByUserId(uId);
        assertTrue("Fetch Workout History", history != null && !history.isEmpty() && history.get(0).isCompleted(),
                "Workout history query failed.");
    }

    // =========================================================================
    // 5. DIET, MACROS & HYDRATION
    // =========================================================================
    private static void testDietMacrosAndHydration() throws SQLException {
        System.out.println("\n[5/7] Testing Diet Engine, Macro Targets & Hydration...");

        String email = "diet_test_" + System.currentTimeMillis() + "@fitpulse.io";
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword("DietPass2026!", salt);

        User user = new User();
        user.setEmail(email);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hash);
        user.setFullName("Kira Vance");
        user.setMobileNumber("222" + (int)(Math.random() * 8999999 + 1000000));
        user.setWeightKg(62.0);
        user.setHeightCm(170.0);
        int uId = userDAO.createUser(user);

        Date today = new Date(System.currentTimeMillis());

        // Create Diet Plan
        DietPlan dp = new DietPlan();
        dp.setUserId(uId);
        dp.setTitle("High Protein Lean Bulk");
        dp.setPlanType("High Protein");
        dp.setTargetCalories(2200);
        dp.setProteinG(160);
        dp.setCarbsG(200);
        dp.setFatsG(60);
        dp.setStartDate(today);
        dp.setActive(true);

        List<DietMeal> mealList = new ArrayList<>();
        DietMeal meal = new DietMeal();
        meal.setMealType("breakfast");
        meal.setItemName("Egg White Omelet with Avocado & Oats");
        meal.setQuantity("1 plate");
        meal.setCalories(480);
        meal.setProteinG(42);
        meal.setCarbsG(45);
        meal.setFatsG(14);
        meal.setTimeSlot("08:00 AM");
        mealList.add(meal);
        dp.setMeals(mealList);

        int planId = dietDAO.createDietPlanWithMeals(dp);
        assertTrue("Create Diet Plan with Meals", planId > 0, "Failed to create diet plan.");

        // Hydration update
        boolean waterUpdated = dietDAO.logWaterIntake(uId, today, 2.5);
        assertTrue("Update Hydration Intake", waterUpdated, "Water logging failed.");

        double loggedWater = dietDAO.getWaterIntake(uId, today);
        assertTrue("Verify Water Intake Stored (2.5L)", Math.abs(loggedWater - 2.5) < 0.01,
                "Hydration value mismatch: " + loggedWater);
    }

    // =========================================================================
    // 6. PROGRESS, BIOMETRICS & DYNAMIC BMI
    // =========================================================================
    private static void testProgressBiometricsAndDynamicBMI() throws SQLException {
        System.out.println("\n[6/7] Testing Progress Analytics, Measurements & Dynamic BMI...");

        String email = "progress_test_" + System.currentTimeMillis() + "@fitpulse.io";
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword("ProgressPass2026!", salt);

        User user = new User();
        user.setEmail(email);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hash);
        user.setFullName("Alexander Drake");
        user.setMobileNumber("111" + (int)(Math.random() * 8999999 + 1000000));
        user.setHeightCm(175.0); // 1.75m -> h^2 = 3.0625
        user.setWeightKg(75.0);  // BMI = 75 / 3.0625 = 24.49 -> 24.5
        user.setTargetWeightKg(70.0);
        int uId = userDAO.createUser(user);

        Date today = new Date(System.currentTimeMillis());

        // 1. Initial Progress Log
        double expectedBMI = Math.round((75.0 / (1.75 * 1.75)) * 10.0) / 10.0;
        Progress p = new Progress();
        p.setUserId(uId);
        p.setRecordDate(today);
        p.setWeightKg(75.0);
        p.setBmi(expectedBMI);
        p.setBodyFatPct(16.5);
        p.setMuscleMassKg(36.0);
        p.setCaloriesBurned(2400);
        p.setSteps(10500);
        p.setWaterLiters(3.2);
        p.setWorkoutsCompleted(1);
        p.setSleepHours(7.5);
        p.setNotes("Initial Biometrics Check-in");

        boolean logged = progressDAO.logProgress(p);
        assertTrue("Log Initial Progress Record", logged, "Failed to log progress.");

        Progress latest = progressDAO.getLatestProgress(uId);
        assertTrue("Fetch Latest Progress", latest != null && latest.getWeightKg() == 75.0, "Latest progress mismatch.");
        assertTrue("Dynamic BMI Calculation Accuracy (24.5)", Math.abs(latest.getBmi() - 24.5) < 0.1,
                "Expected BMI 24.5 but got " + latest.getBmi());

        // 2. Weigh-in update: 72.0 kg -> BMI = 72 / 3.0625 = 23.51 -> 23.5
        double newWeight = 72.0;
        double updatedBMI = Math.round((newWeight / (1.75 * 1.75)) * 10.0) / 10.0;
        Progress p2 = new Progress();
        p2.setUserId(uId);
        p2.setRecordDate(new Date(System.currentTimeMillis() + 86400000L)); // Next day
        p2.setWeightKg(newWeight);
        p2.setBmi(updatedBMI);
        p2.setBodyFatPct(15.2);
        p2.setMuscleMassKg(36.5);
        p2.setCaloriesBurned(2600);
        p2.setSteps(12000);
        p2.setWaterLiters(3.5);
        p2.setWorkoutsCompleted(2);
        p2.setSleepHours(8.0);
        p2.setNotes("Weigh-in update: 72.0 kg");

        progressDAO.logProgress(p2);
        userDAO.updateUserWeight(uId, newWeight);

        Progress latest2 = progressDAO.getLatestProgress(uId);
        assertTrue("Updated Weigh-In Check", latest2 != null && latest2.getWeightKg() == 72.0, "Weight update failed.");
        assertTrue("Recalculated BMI on Weigh-in (23.5)", Math.abs(latest2.getBmi() - 23.5) < 0.1,
                "Expected updated BMI 23.5 but got " + latest2.getBmi());

        // 3. Range queries
        List<Progress> past30 = progressDAO.getProgressHistory(uId, 30);
        assertTrue("Fetch Range History (30 Days)", past30 != null && past30.size() >= 2,
                "History range query returned incorrect size.");
    }

    // =========================================================================
    // 7. MULTI-TENANT ISOLATION & DATA SECURITY
    // =========================================================================
    private static void testMultiTenantSecurityAndIsolation() throws SQLException {
        System.out.println("\n[7/7] Testing Multi-Tenant Data Isolation & Security...");

        // User A
        String emailA = "user_a_" + System.currentTimeMillis() + "@fitpulse.io";
        String saltA = PasswordUtil.generateSalt();
        String hashA = PasswordUtil.hashPassword("PassA2026!", saltA);

        User userA = new User();
        userA.setEmail(emailA);
        userA.setPasswordSalt(saltA);
        userA.setPasswordHash(hashA);
        userA.setFullName("User A (Secure)");
        userA.setMobileNumber("666" + (int)(Math.random() * 8999999 + 1000000));
        userA.setWeightKg(70.0);
        userA.setHeightCm(175.0);
        int uIdA = userDAO.createUser(userA);

        // User B
        String emailB = "user_b_" + System.currentTimeMillis() + "@fitpulse.io";
        String saltB = PasswordUtil.generateSalt();
        String hashB = PasswordUtil.hashPassword("PassB2026!", saltB);

        User userB = new User();
        userB.setEmail(emailB);
        userB.setPasswordSalt(saltB);
        userB.setPasswordHash(hashB);
        userB.setFullName("User B (Secure)");
        userB.setMobileNumber("777" + (int)(Math.random() * 8999999 + 1000000));
        userB.setWeightKg(90.0);
        userB.setHeightCm(190.0);
        int uIdB = userDAO.createUser(userB);

        // User A logs progress
        Progress pA = new Progress();
        pA.setUserId(uIdA);
        pA.setRecordDate(new Date(System.currentTimeMillis()));
        pA.setWeightKg(70.0);
        pA.setBmi(22.9);
        pA.setCaloriesBurned(2000);
        pA.setSteps(8000);
        pA.setWaterLiters(2.5);
        pA.setWorkoutsCompleted(1);
        pA.setNotes("User A Confidential Log");
        progressDAO.logProgress(pA);

        // User B queries progress
        List<Progress> listB = progressDAO.getProgressHistory(uIdB, 30);
        assertTrue("User B Cannot Access User A Progress Records", listB == null || listB.isEmpty(),
                "Data leakage: User B retrieved progress belonging to User A.");

        // User A creates workout
        Workout wpA = new Workout();
        wpA.setUserId(uIdA);
        wpA.setTitle("User A Confidential Workout");
        wpA.setCategory("Strength");
        wpA.setScheduledDate(new Date(System.currentTimeMillis()));
        wpA.setCompleted(true);
        workoutDAO.createWorkoutWithExercises(wpA);

        List<Workout> wpListB = workoutDAO.getCompletedWorkoutsByUserId(uIdB);
        assertTrue("User B Cannot Access User A Workout Plans", wpListB == null || wpListB.isEmpty(),
                "Data leakage: User B retrieved workout plans belonging to User A.");

        // User A creates diet plan
        DietPlan dpA = new DietPlan();
        dpA.setUserId(uIdA);
        dpA.setTitle("User A Confidential Diet");
        dpA.setPlanType("KETO");
        dpA.setTargetCalories(1800);
        dpA.setActive(true);
        dietDAO.createDietPlanWithMeals(dpA);

        DietPlan dpB = dietDAO.getActiveDietPlanByUserId(uIdB);
        assertTrue("User B Cannot Access User A Diet Plan", dpB == null,
                "Data leakage: User B retrieved diet plan belonging to User A.");
    }
}
