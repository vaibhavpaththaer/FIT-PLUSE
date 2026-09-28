package util;

import model.User;
import service.ServiceResult;
import service.UserService;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Diagnostic Verification Test Suite for Step 4 (Registration Backend).
 * Tests:
 * 1. PasswordUtil Salt & SHA-256 Hashing verification
 * 2. UserService Input Validation (Email format, Password length & confirmation, Biometrics)
 * 3. Successful Registration Flow with complete user attributes
 * 4. Duplicate Email Detection
 * 5. Duplicate Mobile Detection
 * 6. Database entity round-trip retrieval and validation
 */
public class RegistrationTest {

    public static void main(String[] args) {
        System.out.println("==========================================================");
        System.out.println("  FITPULSE STEP 4: REGISTRATION BACKEND VERIFICATION");
        System.out.println("==========================================================");

        int passed = 0;
        int failed = 0;

        // TEST 1: Password Salt & Hashing Verification
        System.out.print("[TEST 1] Password Hashing & Salt Verification: ");
        try {
            String plainPassword = "SecretPassword123!";
            String salt = PasswordUtil.generateSalt();
            String hash = PasswordUtil.hashPassword(plainPassword, salt);

            if (salt != null && salt.length() == 32 && hash != null && hash.length() == 64) {
                boolean matches = PasswordUtil.verifyPassword(plainPassword, salt, hash);
                boolean wrongFails = !PasswordUtil.verifyPassword("WrongPassword", salt, hash);

                if (matches && wrongFails && !hash.equals(plainPassword)) {
                    System.out.println("PASSED (SHA-256 with 128-bit secure salt)");
                    passed++;
                } else {
                    System.out.println("FAILED (Hash verification failed)");
                    failed++;
                }
            } else {
                System.out.println("FAILED (Invalid salt or hash format)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // TEST 2: Validation of Invalid Inputs
        System.out.print("[TEST 2] Input Validation (Invalid email, short pass, mismatch): ");
        try {
            UserService service = new UserService();

            // Bad email
            User u1 = new User(0, "Test User", "invalid-email-format", "9876543210");
            ServiceResult<User> r1 = service.registerUser(u1, "validPass123", "validPass123");

            // Password mismatch
            User u2 = new User(0, "Test User", "valid@test.com", "9876543210");
            ServiceResult<User> r2 = service.registerUser(u2, "password123", "differentPassword");

            // Short password
            User u3 = new User(0, "Test User", "valid2@test.com", "9876543210");
            ServiceResult<User> r3 = service.registerUser(u3, "1234", "1234");

            // Invalid age
            User u4 = new User(0, "Test User", "valid3@test.com", "9876543210");
            u4.setAge(150);
            ServiceResult<User> r4 = service.registerUser(u4, "validPass123", "validPass123");

            if (!r1.isSuccess() && !r2.isSuccess() && !r3.isSuccess() && !r4.isSuccess()) {
                System.out.println("PASSED (All invalid inputs caught correctly)");
                passed++;
            } else {
                System.out.println("FAILED (One or more invalid inputs bypassed validation)");
                failed++;
            }
        } catch (Exception e) {
            System.out.println("FAILED: " + e.getMessage());
            failed++;
        }

        // TEST 3: Database Registration & Duplicate Detection Test
        System.out.println("\n--- Testing Database Persistence & Duplicate Rules ---");
        boolean dbReachable = false;
        try (Connection conn = DBConnection.getConnection()) {
            dbReachable = (conn != null && !conn.isClosed());
        } catch (Exception e) {
            System.out.println("Notice: MySQL connection not active on localhost:3306 (" + e.getMessage() + ")");
            System.out.println("Skipping live database insert tests until MySQL server is started.");
        }

        if (dbReachable) {
            UserService service = new UserService();
            String testEmail = "testuser_" + System.currentTimeMillis() + "@fitpulse.com";
            String testMobile = "9" + (long) (Math.random() * 1000000000L);

            // Test 3A: Successful Registration
            System.out.print("[TEST 3A] Full Registration Flow (All 15+ Frontend Fields): ");
            User newUser = new User();
            newUser.setFullName("John Doe Test");
            newUser.setEmail(testEmail);
            newUser.setMobileCountry("+91");
            newUser.setMobileNumber(testMobile);
            newUser.setGender("male");
            newUser.setAge(28);
            newUser.setHeightCm(180.5);
            newUser.setWeightKg(78.2);
            newUser.setFitnessGoal("muscle");
            newUser.setActivityLevel("high");
            newUser.setGymExperience("advanced");
            newUser.setWorkoutPreference("gym");
            newUser.setWorkoutDays("4-5");
            newUser.setWorkoutDurationMin(60);
            newUser.setDietPreference("non-vegetarian");
            newUser.setWaterIntake("2-3L");
            newUser.setSleepHours("6-8");
            newUser.setMedicalConditions("no");

            ServiceResult<User> regResult = service.registerUser(newUser, "StrongPass@2026", "StrongPass@2026");
            if (regResult.isSuccess() && regResult.getData().getId() > 0) {
                System.out.println("PASSED (Created User ID: " + regResult.getData().getId() + ")");
                passed++;

                // Test 3B: Duplicate Email Prevention
                System.out.print("[TEST 3B] Duplicate Email Prevention: ");
                User dupEmailUser = new User();
                dupEmailUser.setFullName("Another Person");
                dupEmailUser.setEmail(testEmail);
                dupEmailUser.setMobileNumber("9999988888");
                dupEmailUser.setAge(25);
                dupEmailUser.setHeightCm(170);
                dupEmailUser.setWeightKg(65);
                ServiceResult<User> dupEmailResult = service.registerUser(dupEmailUser, "Pass12345", "Pass12345");
                if (!dupEmailResult.isSuccess() && dupEmailResult.getErrorCode() == 409) {
                    System.out.println("PASSED (" + dupEmailResult.getMessage() + ")");
                    passed++;
                } else {
                    System.out.println("FAILED (Duplicate email was not rejected)");
                    failed++;
                }

                // Test 3C: Duplicate Mobile Prevention
                System.out.print("[TEST 3C] Duplicate Mobile Prevention: ");
                User dupMobileUser = new User();
                dupMobileUser.setFullName("Third Person");
                dupMobileUser.setEmail("third_unique_" + System.currentTimeMillis() + "@fitpulse.com");
                dupMobileUser.setMobileNumber(testMobile);
                dupMobileUser.setAge(25);
                dupMobileUser.setHeightCm(170);
                dupMobileUser.setWeightKg(65);
                ServiceResult<User> dupMobileResult = service.registerUser(dupMobileUser, "Pass12345", "Pass12345");
                if (!dupMobileResult.isSuccess() && dupMobileResult.getErrorCode() == 409) {
                    System.out.println("PASSED (" + dupMobileResult.getMessage() + ")");
                    passed++;
                } else {
                    System.out.println("FAILED (Duplicate mobile was not rejected)");
                    failed++;
                }

                // Test 3D: Database Field Verification
                System.out.print("[TEST 3D] Database Entity Field Round-trip Verification: ");
                try {
                    User fetched = service.getUserById(regResult.getData().getId());
                    if (fetched != null &&
                            fetched.getEmail().equalsIgnoreCase(testEmail) &&
                            fetched.getMobileNumber().equals(testMobile) &&
                            fetched.getAge() == 28 &&
                            fetched.getHeightCm() == 180.5 &&
                            fetched.getWeightKg() == 78.2 &&
                            "muscle".equals(fetched.getFitnessGoal()) &&
                            "advanced".equals(fetched.getGymExperience()) &&
                            fetched.getPasswordSalt() != null &&
                            fetched.getPasswordHash() != null &&
                            !fetched.getPasswordHash().equals("StrongPass@2026")) {
                        System.out.println("PASSED (All fields saved and verified accurately)");
                        passed++;
                    } else {
                        System.out.println("FAILED (Field mismatch during retrieval)");
                        failed++;
                    }
                } catch (SQLException e) {
                    System.out.println("FAILED: " + e.getMessage());
                    failed++;
                }

            } else {
                System.out.println("FAILED: " + regResult.getMessage());
                failed++;
            }
        }

        System.out.println("\n==========================================================");
        System.out.println("  SUMMARY: " + passed + " Passed, " + failed + " Failed");
        System.out.println("==========================================================");
    }
}
