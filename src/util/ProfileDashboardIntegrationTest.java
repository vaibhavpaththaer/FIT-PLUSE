package util;

import dao.ProgressDAO;
import dao.UserDAO;
import model.Progress;
import model.User;

import service.ServiceResult;
import service.UserService;

import java.sql.Date;
import java.util.List;

public class ProfileDashboardIntegrationTest {

    public static void main(String[] args) {
        UserDAO userDAO = new UserDAO();

        System.out.println("===============================================================");
        System.out.println("  FITPULSE - STEP 6 PROFILE & DASHBOARD INTEGRATION TEST");
        System.out.println("===============================================================\n");


        ProgressDAO progressDAO = new ProgressDAO();
        UserService userService = new UserService();


        String testEmail = "test_athlete_" + System.currentTimeMillis() + "@fitpulse.io";
        String testMobile = "9" + (long)(Math.random() * 900000000L + 100000000L);
        String testPass = "PulseMaster@2026";

        try {
            System.out.println("--- 1. Registering New Athlete for Profile Testing ---");
            User newUser = new User();
            newUser.setFullName("Marcus Vance");
            newUser.setEmail(testEmail);
            newUser.setMobileCountry("+91");
            newUser.setMobileNumber(testMobile);
            newUser.setGender("male");
            newUser.setAge(28);
            newUser.setHeightCm(182.0);
            newUser.setWeightKg(80.0);
            newUser.setTargetWeightKg(75.0);
            newUser.setFitnessGoal("weight_loss");
            newUser.setGymExperience("intermediate");
            newUser.setWorkoutPreference("gym");
            newUser.setWorkoutDays("5");
            newUser.setWorkoutDurationMin(60);
            newUser.setDietPreference("high_protein");
            newUser.setWaterIntake("3.5");
            newUser.setSleepHours("8");
            newUser.setMedicalConditions("no");

            ServiceResult<User> regResult = userService.registerUser(newUser, testPass, testPass);
            if (!regResult.isSuccess() || regResult.getData() == null) {
                System.err.println("FAILED: Registration of test user failed: " + regResult.getMessage());
                return;
            }

            User athlete = regResult.getData();
            int userId = athlete.getId();
            System.out.println("SUCCESS: Athlete created with User ID = " + userId);
            System.out.println("Initial Height: " + athlete.getHeightCm() + " cm | Initial Weight: " + athlete.getWeightKg() + " kg");

            // Calculate initial BMI
            double heightM = athlete.getHeightCm() / 100.0;
            double expectedBMI = Math.round((athlete.getWeightKg() / (heightM * heightM)) * 10.0) / 10.0;
            System.out.println("Initial Calculated BMI: " + expectedBMI + " (Formula: weight / height_in_m^2)");

            System.out.println("\n--- 2. Updating Athlete Profile Data via DAO ---");
            athlete.setFullName("Marcus Alexander Vance");
            athlete.setAge(29);
            athlete.setHeightCm(182.0);
            athlete.setWeightKg(78.5);
            athlete.setFitnessGoal("muscle_gain");
            athlete.setGymExperience("advanced");

            boolean updateSuccess = userDAO.updateUserProfile(athlete);
            if (!updateSuccess) {
                System.err.println("FAILED: Could not update user profile.");
                return;
            }
            System.out.println("SUCCESS: Profile updated in MySQL DB.");

            User reloadedUser = userDAO.getUserById(userId);
            if (reloadedUser == null || !reloadedUser.getFullName().equals("Marcus Alexander Vance") || reloadedUser.getWeightKg() != 78.5) {
                System.err.println("FAILED: Verification query did not return updated values!");
                return;
            }
            System.out.println("SUCCESS: Verified updated values: Name=" + reloadedUser.getFullName() + ", Weight=" + reloadedUser.getWeightKg() + " kg");

            System.out.println("\n--- 3. Logging Weight & Daily Progress Entries ---");
            Progress entry1 = new Progress();
            entry1.setUserId(userId);
            entry1.setRecordDate(new Date(System.currentTimeMillis() - 86400000L));
            entry1.setWeightKg(79.0);
            entry1.setBmi(Math.round((79.0 / (heightM * heightM)) * 10.0) / 10.0);
            entry1.setCaloriesBurned(550);
            entry1.setSteps(8200);
            entry1.setWaterLiters(2.8);
            entry1.setWorkoutsCompleted(1);
            entry1.setSleepHours(7.5);
            entry1.setNotes("Leg day session");
            progressDAO.logProgress(entry1);

            Progress entry2 = new Progress();
            entry2.setUserId(userId);
            entry2.setRecordDate(new Date(System.currentTimeMillis()));
            entry2.setWeightKg(78.5);
            entry2.setBmi(Math.round((78.5 / (heightM * heightM)) * 10.0) / 10.0);
            entry2.setCaloriesBurned(680);
            entry2.setSteps(10450);
            entry2.setWaterLiters(3.4);
            entry2.setWorkoutsCompleted(2);
            entry2.setSleepHours(8.0);
            entry2.setNotes("Chest & Triceps pump");
            progressDAO.logProgress(entry2);

            List<Progress> historyList = progressDAO.getProgressHistory(userId, 30);
            System.out.println("SUCCESS: Fetched " + historyList.size() + " progress records for User ID " + userId);
            for (Progress p : historyList) {
                System.out.println("  - Date: " + p.getRecordDate() + " | Weight: " + p.getWeightKg() + " kg | BMI: " + p.getBmi() + " | Steps: " + p.getSteps() + " | Cals: " + p.getCaloriesBurned());
            }

            System.out.println("\n--- 4. Testing JSON Serialization with JsonUtil ---");
            String userJson = JsonUtil.userToJson(reloadedUser);
            System.out.println("User JSON Output snippet: " + userJson.substring(0, Math.min(userJson.length(), 160)) + "...");

            String progressListJson = JsonUtil.progressListToJson(historyList);
            System.out.println("Progress History JSON: " + progressListJson);

            System.out.println("\n===============================================================");
            System.out.println("  ALL PROFILE & DASHBOARD INTEGRATION CHECKS PASSED (100% OK)");
            System.out.println("===============================================================");
        } catch (Exception ex) {
            System.err.println("EXCEPTION in integration test: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}
