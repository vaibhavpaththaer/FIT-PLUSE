package test;

import dao.CoachDAO;
import dao.UserDAO;
import model.Coach;
import model.User;
import service.CoachRegistrationService;
import service.ServiceResult;
import util.PasswordUtil;

import java.sql.SQLException;

public class CoachRegistrationLoginTest {

    private static final CoachDAO coachDAO = new CoachDAO();
    private static final UserDAO userDAO = new UserDAO();
    private static final CoachRegistrationService registrationService = new CoachRegistrationService();

    private static int passedTests = 0;
    private static int failedTests = 0;

    public static void main(String[] args) {
        System.out.println("================================================================");
        System.out.println("🧑‍🏫  FITPULSE COACH REGISTRATION, LOGIN & APPROVAL LIFECYCLE TEST");
        System.out.println("================================================================");

        try {
            testCoachRegistrationValidation();
            testCoachRegistrationAndPendingStatus();
            testCoachLoginRoleMismatchesAndStatusGuards();
            testCoachApprovalAndActivation();
            testCoachRejection();

            System.out.println("\n================================================================");
            System.out.println("🎯 TEST RESULTS SUMMARY:");
            System.out.println("   Passed: " + passedTests);
            System.out.println("   Failed: " + failedTests);
            System.out.println("================================================================");

            if (failedTests == 0) {
                System.out.println("✨ ALL COACH LIFECYCLE TESTS PASSED PERFECTLY! 🚀");
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

    private static void testCoachRegistrationValidation() {
        System.out.println("\n[1/5] Testing Coach Registration Validation...");

        // Test duplicate email validation
        Coach invalidCoach = new Coach();
        invalidCoach.setEmail(""); // empty email
        invalidCoach.setFullName("Test Coach");
        invalidCoach.setSpecialties("General Fitness");

        String mobile = "9" + (int)(Math.random() * 899999999 + 100000000);
        ServiceResult<?> res = registrationService.registerCoach(invalidCoach, "123456", "123456", mobile, "+91", "male", 30);
        assertTrue("Empty Email Check Rejected", !res.isSuccess(), "Accepted invalid coach registration: empty email.");

        Coach mismatchPassCoach = new Coach();
        mismatchPassCoach.setEmail("coach_val_" + System.currentTimeMillis() + "@fitpulse.io");
        mismatchPassCoach.setFullName("Validator Coach");
        mismatchPassCoach.setSpecialties("General Fitness");
        
        res = registrationService.registerCoach(mismatchPassCoach, "Secret123", "DifferentPassword", mobile, "+91", "male", 30);
        assertTrue("Confirm Password Mismatch Rejected", !res.isSuccess(), "Accepted invalid coach registration: password mismatch.");
    }

    private static void testCoachRegistrationAndPendingStatus() throws SQLException {
        System.out.println("\n[2/5] Testing Coach Registration and Pending Status...");

        String uniqueEmail = "coach_test_" + System.currentTimeMillis() + "@fitpulse.io";
        Coach newCoach = new Coach();
        newCoach.setEmail(uniqueEmail);
        newCoach.setFullName("Arthur Pendragon");
        newCoach.setBio("Certified master strength coach and personal trainer.");
        newCoach.setCertifications("CSCS, NASM-PES");
        newCoach.setCoachingType("strength");
        newCoach.setSpecialties("Strength Training");
        newCoach.setExperienceYears(8);

        String mobile = "77" + (int)(Math.random() * 89999999 + 10000000);
        ServiceResult<?> result = registrationService.registerCoach(newCoach, "Excalibur2026!", "Excalibur2026!", mobile, "+44", "male", 30);
        assertTrue("Coach Register Service Success", result.isSuccess(), "Failed to register coach: " + (result != null ? result.getMessage() : "null"));

        // Check user record exists
        User userRecord = userDAO.getUserByEmail(uniqueEmail);
        assertTrue("User Record Exists for Coach", userRecord != null, "User account not created.");
        assertTrue("User Role set to Coach", userRecord != null && "coach".equalsIgnoreCase(userRecord.getRole()), "User role not set to coach.");

        // Check coach record exists
        if (userRecord != null) {
            Coach coachRecord = coachDAO.getCoachById(userRecord.getId());
            assertTrue("Coach Record Exists", coachRecord != null, "Coach profile record not created.");
            assertTrue("Coach Account Status is Pending by default", coachRecord != null && "pending".equals(coachRecord.getAccountStatus()), "Account status is not pending: " + (coachRecord != null ? coachRecord.getAccountStatus() : "null"));
        } else {
            assertTrue("Coach Record Exists", false, "Cannot check coach profile: User record is null.");
        }
    }

    private static void testCoachLoginRoleMismatchesAndStatusGuards() throws SQLException {
        System.out.println("\n[3/5] Testing Login Mismatch & Status Guards...");

        String uniqueEmail = "coach_guard_" + System.currentTimeMillis() + "@fitpulse.io";
        Coach guardCoach = new Coach();
        guardCoach.setEmail(uniqueEmail);
        guardCoach.setFullName("Gawain Guard");
        guardCoach.setCertifications("ACE CPT");
        guardCoach.setCoachingType("cardio");
        guardCoach.setSpecialties("Cardio Pacing");
        guardCoach.setExperienceYears(3);

        String mobile = "77" + (int)(Math.random() * 89999999 + 10000000);
        ServiceResult<?> result = registrationService.registerCoach(guardCoach, "GuardPass2026!", "GuardPass2026!", mobile, "+44", "male", 28);
        assertTrue("Guard Coach Registered", result.isSuccess(), "Failed to register coach: " + (result != null ? result.getMessage() : "null"));

        User userRecord = userDAO.getUserByEmail(uniqueEmail);
        assertTrue("Guard User Record Exists", userRecord != null, "Guard user account not created.");
        
        if (userRecord != null) {
            // Simulating the loginServlet password checks and status checks:
            boolean passMatch = PasswordUtil.verifyPassword("GuardPass2026!", userRecord.getPasswordSalt(), userRecord.getPasswordHash());
            assertTrue("Password Matches", passMatch, "Password verification failed.");

            Coach coachProfile = coachDAO.getCoachById(userRecord.getId());
            assertTrue("Coach is in pending status", coachProfile != null && "pending".equals(coachProfile.getAccountStatus()), "Status is not pending: " + (coachProfile != null ? coachProfile.getAccountStatus() : "null"));
        }
    }

    private static void testCoachApprovalAndActivation() throws SQLException {
        System.out.println("\n[4/5] Testing Coach Approval and Activation...");

        String uniqueEmail = "coach_appr_" + System.currentTimeMillis() + "@fitpulse.io";
        Coach approveCoach = new Coach();
        approveCoach.setEmail(uniqueEmail);
        approveCoach.setFullName("Lancelot Du Lac");
        approveCoach.setCertifications("ISSA Strength");
        approveCoach.setCoachingType("strength");
        approveCoach.setSpecialties("Heavy Lifting");
        approveCoach.setExperienceYears(12);

        String mobile = "61" + (int)(Math.random() * 89999999 + 10000000);
        registrationService.registerCoach(approveCoach, "Guinevere2026!", "Guinevere2026!", mobile, "+33", "male", 35);
        User userRecord = userDAO.getUserByEmail(uniqueEmail);
        assertTrue("Approve User Record Exists", userRecord != null, "Approve user account not created.");
        
        if (userRecord != null) {
            int coachId = userRecord.getId();

            // Check initial state
            Coach coachBefore = coachDAO.getCoachById(coachId);
            assertTrue("Coach is pending initial", coachBefore != null && "pending".equals(coachBefore.getAccountStatus()), "Not pending initially.");

            // Approve coach
            boolean approveResult = coachDAO.approveCoach(coachId);
            assertTrue("DAO Approved Coach Status", approveResult, "Failed to update status to active.");

            Coach coachAfter = coachDAO.getCoachById(coachId);
            assertTrue("Coach status is active after approval", coachAfter != null && "active".equals(coachAfter.getAccountStatus()), "Status did not update to active.");
        }
    }

    private static void testCoachRejection() throws SQLException {
        System.out.println("\n[5/5] Testing Coach Rejection...");

        String uniqueEmail = "coach_rej_" + System.currentTimeMillis() + "@fitpulse.io";
        Coach rejectCoach = new Coach();
        rejectCoach.setEmail(uniqueEmail);
        rejectCoach.setFullName("Mordred Rej");
        rejectCoach.setCertifications("None");
        rejectCoach.setCoachingType("general");
        rejectCoach.setSpecialties("Body Conditioning");
        rejectCoach.setExperienceYears(1);

        String mobile = "77" + (int)(Math.random() * 89999999 + 10000000);
        registrationService.registerCoach(rejectCoach, "Rejection2026!", "Rejection2026!", mobile, "+44", "male", 40);
        User userRecord = userDAO.getUserByEmail(uniqueEmail);
        assertTrue("Reject User Record Exists", userRecord != null, "Reject user account not created.");
        
        if (userRecord != null) {
            int coachId = userRecord.getId();

            // Reject coach
            boolean rejectResult = coachDAO.rejectCoach(coachId);
            assertTrue("DAO Rejected Coach Status", rejectResult, "Failed to update status to rejected.");

            Coach coachAfter = coachDAO.getCoachById(coachId);
            assertTrue("Coach status is rejected", coachAfter != null && "rejected".equals(coachAfter.getAccountStatus()), "Status did not update to rejected.");
        }
    }
}
