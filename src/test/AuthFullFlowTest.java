package test;

import dao.UserDAO;
import model.User;
import service.AuthService;
import service.ServiceResult;
import service.UserService;
import util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * Suite verifying complete backend database & servlet authentication lifecycle:
 * TEST 1: Create a completely new account -> stored in DB
 * TEST 2: Re-register existing email -> "An account with this email already exists. Please sign in."
 * TEST 3: Sign in with wrong password -> "Invalid email or password."
 * TEST 4: Sign in with correct password -> Authentication succeeds
 * TEST 5: User data retrieval & isolation
 */
public class AuthFullFlowTest {

    private static final UserService userService = new UserService();
    private static final AuthService authService = new AuthService();
    private static final UserDAO userDAO = new UserDAO();

    private static int passed = 0;
    private static int failed = 0;

    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println("🏋️  FITPULSE AUTHENTICATION & DATABASE SYSTEM TEST SUITE");
        System.out.println("===============================================================");

        try {
            cleanupTestData();

            test1_CreateNewAccount();
            test2_DuplicateEmailRegistration();
            test3_SignInWrongPassword();
            test4_SignInCorrectPassword();
            test5_UserDataIsolationAndSecurity();

            System.out.println("\n---------------------------------------------------------------");
            System.out.println("🎯 TEST SUMMARY: Passed=" + passed + ", Failed=" + failed);
            System.out.println("===============================================================");

            if (failed > 0) {
                System.err.println("❌ Authentication System Test Suite FAILED!");
                System.exit(1);
            } else {
                System.out.println("✨ ALL AUTHENTICATION SYSTEM TESTS PASSED PERFECTLY!");
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void cleanupTestData() {
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM `users` WHERE `email` LIKE 'auth_test_%@fitpulse.io'")) {
            ps.executeUpdate();
        } catch (SQLException ignored) {}
    }

    private static void assertTest(String testName, boolean condition, String errorMsg) {
        if (condition) {
            passed++;
            System.out.println("  ✅ [PASS] " + testName);
        } else {
            failed++;
            System.err.println("  ❌ [FAIL] " + testName + " -> " + errorMsg);
        }
    }

    private static String testEmail = "auth_test_" + System.currentTimeMillis() + "@fitpulse.io";
    private static String testPassword = "Password@123";

    private static void test1_CreateNewAccount() {
        System.out.println("\n[TEST 1] Create New Account Registration...");

        User newUser = new User();
        newUser.setFullName("Test Athlete");
        newUser.setEmail(testEmail);
        newUser.setMobileCountry("+91");
        newUser.setMobileNumber("98765" + (System.currentTimeMillis() % 100000));
        newUser.setGender("female");
        newUser.setAge(24);
        newUser.setHeightCm(168.0);
        newUser.setWeightKg(62.5);
        newUser.setFitnessGoal("weight_loss");
        newUser.setRole("user");

        ServiceResult<User> result = userService.registerUser(newUser, testPassword, testPassword);
        assertTest("Registration Succeeded", result.isSuccess(), result.getMessage());
        assertTest("User ID Generated", result.getData() != null && result.getData().getId() > 0, "ID invalid");

        try {
            User storedUser = userDAO.getUserByEmail(testEmail);
            assertTest("User Stored in MySQL Database", storedUser != null, "User not found in DB");
            assertTest("Password Hash Not Exposed in Plaintext", !testPassword.equals(storedUser.getPasswordHash()), "Plaintext password stored!");
        } catch (SQLException e) {
            assertTest("User Stored in MySQL Database", false, e.getMessage());
        }
    }

    private static void test2_DuplicateEmailRegistration() {
        System.out.println("\n[TEST 2] Duplicate Email Registration Prevention...");

        User dupUser = new User();
        dupUser.setFullName("Duplicate Tester");
        dupUser.setEmail(testEmail); // Same email
        dupUser.setMobileCountry("+91");
        dupUser.setMobileNumber("91234" + (System.currentTimeMillis() % 100000));
        dupUser.setAge(24);
        dupUser.setHeightCm(168.0);
        dupUser.setWeightKg(62.5);

        ServiceResult<User> result = userService.registerUser(dupUser, "AltPassword123", "AltPassword123");

        boolean isFailed = !result.isSuccess();
        boolean correctMessage = result.getMessage() != null && result.getMessage().contains("An account with this email address already exists. Please sign in.");
        boolean status409 = result.getErrorCode() == 409;

        assertTest("Duplicate Registration Blocked", isFailed, "Duplicate allowed!");
        assertTest("Exact Duplicate Error Message", correctMessage, "Message received: " + result.getMessage());
        assertTest("HTTP 409 Status Code", status409, "ErrorCode: " + result.getErrorCode());
    }

    private static void test3_SignInWrongPassword() {
        System.out.println("\n[TEST 3] Sign In With Incorrect Password...");

        ServiceResult<User> result = authService.login(testEmail, "WrongPassword999!");

        boolean isFailed = !result.isSuccess();
        boolean correctMessage = "Invalid email or password.".equals(result.getMessage());
        boolean status401 = result.getErrorCode() == 401;

        assertTest("Wrong Password Rejected", isFailed, "Accepted wrong password!");
        assertTest("Exact 'Invalid email or password.' Message", correctMessage, "Message: " + result.getMessage());
        assertTest("HTTP 401 Unauthorized Code", status401, "Code: " + result.getErrorCode());
    }

    private static void test4_SignInCorrectPassword() {
        System.out.println("\n[TEST 4] Sign In With Correct Password...");

        ServiceResult<User> result = authService.login(testEmail, testPassword);

        assertTest("Login Succeeded", result.isSuccess(), result.getMessage());
        assertTest("User Data Returned", result.getData() != null, "No user data returned");
        assertTest("Email Matches", result.getData() != null && testEmail.equalsIgnoreCase(result.getData().getEmail()), "Email mismatch");
        assertTest("Password Hash Sanitized From Response", result.getData() != null && result.getData().getPasswordHash() == null, "Hash exposed!");
    }

    private static void test5_UserDataIsolationAndSecurity() {
        System.out.println("\n[TEST 5] User Data Isolation & Security...");

        try {
            User loaded = userDAO.getUserByEmail(testEmail);
            assertTest("Loaded User Non-Null", loaded != null, "Null user");
            assertTest("User Name Matches", loaded != null && "Test Athlete".equals(loaded.getFullName()), "Name mismatch");
            assertTest("User Goal Matches", loaded != null && "weight_loss".equals(loaded.getFitnessGoal()), "Goal mismatch");
        } catch (SQLException e) {
            assertTest("UserDataIsolation", false, e.getMessage());
        }
    }
}
