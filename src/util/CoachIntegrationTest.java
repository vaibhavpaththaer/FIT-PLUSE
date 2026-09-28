package util;

import dao.CoachDAO;
import dao.MessageDAO;

import dao.UserDAO;
import model.Coach;
import model.Message;
import model.User;

import service.ServiceResult;
import service.UserService;

import java.sql.SQLException;
import java.util.List;

/**
 * End-to-end integration test for Coach and 1-on-1 Messaging System.
 * Tests coach profile retrieval, coach assignment, messaging persistence,
 * user data isolation, and JSON serialization.
 */
public class CoachIntegrationTest {

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("   FITPULSE COACH & MESSAGING INTEGRATION TEST   ");
        System.out.println("=================================================");

        CoachDAO coachDAO = new CoachDAO();
        UserDAO userDAO = new UserDAO();
        MessageDAO messageDAO = new MessageDAO();


        UserService userService = new UserService();


        int passed = 0;
        int failed = 0;

        try {
            // -------------------------------------------------------------
            // TEST 1: Default Coach Seeding & Active Coaches
            // -------------------------------------------------------------
            System.out.println("\n[TEST 1] Verifying Default Coaches & Retrieval...");
            List<Coach> activeCoaches = coachDAO.getAllActiveCoaches();
            if (activeCoaches != null && !activeCoaches.isEmpty()) {
                Coach coach1 = coachDAO.getCoachById(1);
                if (coach1 != null && coach1.getFullName().contains("Rahul Sharma")) {
                    System.out.println("✓ PASS: Default Coach #1 Rahul Sharma verified (" + coach1.getSpecialties() + ")");
                    passed++;
                } else {
                    System.err.println("✗ FAIL: Coach #1 is not Rahul Sharma");
                    failed++;
                }
            } else {
                System.err.println("✗ FAIL: No active coaches found in database");
                failed++;
            }

            // -------------------------------------------------------------
            // TEST 2: User Creation & Coach Assignment
            // -------------------------------------------------------------
            System.out.println("\n[TEST 2] Verifying User Coach Assignment...");
            long timestamp = System.currentTimeMillis();
            String emailA = "athleteA_" + timestamp + "@fitpulse.io";
            String emailB = "athleteB_" + timestamp + "@fitpulse.io";
            String testPass = "SecurePass123!";

            User userA = new User(0, "Alex Morgan", emailA, "+198765" + (timestamp % 10000));
            userA.setGender("male");
            userA.setAge(28);
            userA.setHeightCm(178.0);
            userA.setWeightKg(72.4);
            userA.setFitnessGoal("muscle");

            User userB = new User(0, "Samantha Ray", emailB, "+198766" + (timestamp % 10000));
            userB.setGender("female");
            userB.setAge(25);
            userB.setHeightCm(165.0);
            userB.setWeightKg(58.0);
            userB.setFitnessGoal("weight_loss");

            ServiceResult<User> regA = userService.registerUser(userA, testPass, testPass);
            ServiceResult<User> regB = userService.registerUser(userB, testPass, testPass);

            if (regA.isSuccess() && regB.isSuccess()) {
                int userAId = regA.getData().getId();
                int userBId = regB.getData().getId();

                // Assign User A to Coach 1
                userDAO.assignCoach(userAId, 1);
                User updatedA = userDAO.getUserById(userAId);

                if (updatedA != null && updatedA.getAssignedCoachId() == 1) {
                    System.out.println("✓ PASS: User A successfully assigned to Coach ID 1");
                    passed++;
                } else {
                    System.err.println("✗ FAIL: User A coach assignment mismatch");
                    failed++;
                }

                // -------------------------------------------------------------
                // TEST 3: User-Coach Messaging & Conversation Persistence
                // -------------------------------------------------------------
                System.out.println("\n[TEST 3] Verifying Message Persistence & Delivery...");
                Message msg1 = new Message(userAId, "user", 1, "coach", "Hey coach, should I do cardio today?");


                Message reply1 = new Message(1, "coach", userAId, "user", "Yes! Do 20 minutes of steady Zone 2 cardio.");
                reply1.setRead(false);


                List<Message> convA = messageDAO.getConversation(userAId, 1, 10);
                if (convA.size() >= 2) {
                    System.out.println("✓ PASS: Conversation retrieved for User A with " + convA.size() + " messages");
                    passed++;
                } else {
                    System.err.println("✗ FAIL: Conversation messages count mismatch for User A");
                    failed++;
                }

                // -------------------------------------------------------------
                // TEST 4: Data Isolation Between User A and User B
                // -------------------------------------------------------------
                System.out.println("\n[TEST 4] Verifying Privacy & Data Isolation Between Users...");
                List<Message> convB = messageDAO.getConversation(userBId, 1, 10);
                boolean leaked = false;
                for (Message m : convB) {
                    if (m.getSenderId() == userAId || m.getReceiverId() == userAId) {
                        leaked = true;
                        break;
                    }
                }

                if (!leaked && convB.isEmpty()) {
                    System.out.println("✓ PASS: Strict privacy confirmed. User B cannot see User A's private messages");
                    passed++;
                } else {
                    System.err.println("✗ FAIL: Data leak detected! User B accessed User A's messages");
                    failed++;
                }

                // -------------------------------------------------------------
                // TEST 5: Unread Count Calculation & Mark Read
                // -------------------------------------------------------------
                System.out.println("\n[TEST 5] Verifying Unread Message Count & Mark Read...");
                int unreadA = messageDAO.getUnreadCount(userAId, "user");
                if (unreadA >= 1) {
                    System.out.println("✓ PASS: Unread message count correctly reported as " + unreadA);
                    passed++;
                } else {
                    System.err.println("✗ FAIL: Unread message count expected >= 1, got " + unreadA);
                    failed++;
                }

                messageDAO.markConversationAsRead(1, "coach", userAId, "user");
                int unreadAfter = messageDAO.getUnreadCount(userAId, "user");
                if (unreadAfter == 0) {
                    System.out.println("✓ PASS: Mark messages as read cleared unread counter to 0");
                    passed++;
                } else {
                    System.err.println("✗ FAIL: Unread count after mark read expected 0, got " + unreadAfter);
                    failed++;
                }

                // -------------------------------------------------------------
                // TEST 6: JSON Serialization
                // -------------------------------------------------------------
                System.out.println("\n[TEST 6] Verifying JsonUtil Coach & Message Serialization...");
                Coach coach = coachDAO.getCoachById(1);
                String coachJson = JsonUtil.coachToJson(coach);
                String msgJson = JsonUtil.messageToJson(msg1);

                if (coachJson.contains("Rahul Sharma") && msgJson.contains("\"messageText\":\"Hey coach, should I do cardio today?\"")) {
                    System.out.println("✓ PASS: JSON serialization outputs valid key-value structures");
                    passed++;
                } else {
                    System.err.println("✗ FAIL: JSON serialization output unexpected:\nCoach: " + coachJson + "\nMessage: " + msgJson);
                    failed++;
                }
            } else {
                System.err.println("✗ FAIL: Could not register test users: " + regA.getMessage());
                failed++;
            }

        } catch (SQLException e) {
            System.err.println("✗ SQL Exception during test: " + e.getMessage());
            e.printStackTrace();
            failed++;
        }

        System.out.println("\n=================================================");
        System.out.println("RESULTS: " + passed + " Passed, " + failed + " Failed");
        System.out.println("=================================================");

        if (failed > 0) {
            System.exit(1);
        }
    }
}
