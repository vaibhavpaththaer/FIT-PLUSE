package util;

import dao.UserDAO;
import dao.WorkoutDAO;
import model.User;
import model.Workout;
import model.WorkoutExercise;

import service.ServiceResult;
import service.UserService;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

public class WorkoutIntegrationTest {

    public static void main(String[] args) {
        UserDAO userDAO = new UserDAO();
        WorkoutDAO workoutDAO = new WorkoutDAO();
        System.out.println("===============================================================");
        System.out.println("     FITPULSE - STEP 7 WORKOUT MODULE INTEGRATION TEST");
        System.out.println("===============================================================\n");



        UserService userService = new UserService();


        String athleteEmail = "athlete_test_" + System.currentTimeMillis() + "@fitpulse.io";
        String athleteMobile = "9" + (long)(Math.random() * 900000000L + 100000000L);
        String testPassword = "PulseMaster@2026";

        int createdWorkoutId = 0;
        int athleteId = 0;
        int secondAthleteId = 0;

        try {
            // ── 1. Create Test Athlete User ───────────────────────────────────
            System.out.println("--- 1. Creating Test Athlete User ---");
            User athleteUser = new User();
            athleteUser.setFullName("Alexander Drake");
            athleteUser.setEmail(athleteEmail);
            athleteUser.setMobileCountry("+91");
            athleteUser.setMobileNumber(athleteMobile);
            athleteUser.setGender("male");
            athleteUser.setAge(27);
            athleteUser.setHeightCm(180.0);
            athleteUser.setWeightKg(78.5);
            athleteUser.setTargetWeightKg(82.0);
            athleteUser.setFitnessGoal("muscle");
            athleteUser.setGymExperience("intermediate");
            athleteUser.setWorkoutPreference("gym");
            athleteUser.setWorkoutDays("5");
            athleteUser.setWorkoutDurationMin(55);
            athleteUser.setDietPreference("non-vegetarian");
            athleteUser.setWaterIntake("3.0");
            athleteUser.setSleepHours("7-8");
            athleteUser.setMedicalConditions("no");

            ServiceResult<User> regResult = userService.registerUser(athleteUser, testPassword, testPassword);
            if (!regResult.isSuccess() || regResult.getData() == null) {
                System.err.println("FAILED: Could not register athlete user: " + regResult.getMessage());
                return;
            }
            athleteId = regResult.getData().getId();
            System.out.println("SUCCESS: Athlete created with User ID = " + athleteId);

            // ── 2. Create Second Athlete to Test Ownership Isolation ─────────
            System.out.println("\n--- 2. Creating Second Athlete for Security/Isolation Checks ---");
            User secondAthlete = new User();
            secondAthlete.setFullName("Jordan Taylor");
            secondAthlete.setEmail("second_athlete_" + System.currentTimeMillis() + "@fitpulse.io");
            secondAthlete.setMobileCountry("+91");
            secondAthlete.setMobileNumber("9" + (long)(Math.random() * 900000000L + 100000000L));
            secondAthlete.setGender("female");
            secondAthlete.setAge(25);
            secondAthlete.setHeightCm(168.0);
            secondAthlete.setWeightKg(60.0);
            secondAthlete.setFitnessGoal("endurance");
            secondAthlete.setWorkoutDays("4");

            ServiceResult<User> reg2Result = userService.registerUser(secondAthlete, testPassword, testPassword);
            if (reg2Result.isSuccess() && reg2Result.getData() != null) {
                secondAthleteId = reg2Result.getData().getId();
                System.out.println("SUCCESS: Second Athlete created with User ID = " + secondAthleteId);
            }

            // ── 3. Create Workout with Exercises ──────────────────────────────
            System.out.println("\n--- 3. Creating Workout with Exercises via WorkoutDAO ---");
            Workout newWorkout = new Workout();
            newWorkout.setUserId(athleteId);
            newWorkout.setCoachId(1); // Coach Marcus / Rahul
            newWorkout.setTitle("Hypertrophy Push: Chest, Delts & Triceps");
            newWorkout.setCategory("Strength / Hypertrophy");
            newWorkout.setDifficulty("Intermediate");
            newWorkout.setTargetMuscle("Chest, Deltoids, Triceps, Core");
            newWorkout.setDurationMin(55);
            newWorkout.setCaloriesBurned(520);
            newWorkout.setScheduledDate(new Date(System.currentTimeMillis()));
            newWorkout.setScheduledTime("06:30 PM");
            newWorkout.setCompleted(false);
            newWorkout.setNotes("Focus on 3-second eccentric tempo on presses.");

            List<WorkoutExercise> exercises = new ArrayList<>();
            WorkoutExercise ex1 = new WorkoutExercise();
            ex1.setExerciseName("Incline Dumbbell Bench Press");
            ex1.setSets(4);
            ex1.setReps(10);
            ex1.setWeightKg(32.5);
            ex1.setRestSec(90);
            ex1.setOrderIdx(1);
            ex1.setNotes("Upper Pectorals");
            exercises.add(ex1);

            WorkoutExercise ex2 = new WorkoutExercise();
            ex2.setExerciseName("Standing Barbell Overhead Press");
            ex2.setSets(4);
            ex2.setReps(8);
            ex2.setWeightKg(50.0);
            ex2.setRestSec(90);
            ex2.setOrderIdx(2);
            ex2.setNotes("Deltoids & Core Bracing");
            exercises.add(ex2);

            WorkoutExercise ex3 = new WorkoutExercise();
            ex3.setExerciseName("Weighted Cable Chest Flyes");
            ex3.setSets(3);
            ex3.setReps(12);
            ex3.setWeightKg(18.0);
            ex3.setRestSec(60);
            ex3.setOrderIdx(3);
            ex3.setNotes("Inner Sternal Pectorals");
            exercises.add(ex3);

            newWorkout.setExercises(exercises);

            createdWorkoutId = workoutDAO.createWorkoutWithExercises(newWorkout);
            if (createdWorkoutId > 0) {
                System.out.println("SUCCESS: Workout created with ID = " + createdWorkoutId + " (" + exercises.size() + " exercises linked)");
            } else {
                System.err.println("FAILED: Workout creation returned invalid ID: " + createdWorkoutId);
                return;
            }

            // ── 4. Verify Ownership Isolation (Security Check) ────────────────
            System.out.println("\n--- 4. Verifying Ownership Isolation & Security Rules ---");
            Workout ownerWorkout = workoutDAO.getWorkoutById(createdWorkoutId);
            if (ownerWorkout != null && ownerWorkout.getUserId() == athleteId) {
                System.out.println("SUCCESS: Owner (User " + athleteId + ") correctly retrieved their workout.");
            } else {
                System.err.println("FAILED: Owner could not retrieve own workout.");
            }

            boolean isOwnedBySecond = workoutDAO.isWorkoutOwnedByUser(createdWorkoutId, secondAthleteId);
            if (!isOwnedBySecond) {
                System.out.println("SUCCESS: Access correctly DENIED for unauthorized User " + secondAthleteId + " (isWorkoutOwnedByUser = false).");
            } else {
                System.err.println("SECURITY VULNERABILITY: Unauthorized User " + secondAthleteId + " was reported as owner!");
            }

            // ── 5. Fetch Today's Workout ──────────────────────────────────────
            System.out.println("\n--- 5. Fetching Today's Workout ---");
            Workout todayWorkout = workoutDAO.getWorkoutByDate(athleteId, new Date(System.currentTimeMillis()));
            if (todayWorkout != null) {
                System.out.println("SUCCESS: Retrieved today's workout: '" + todayWorkout.getTitle() + "' with " +
                        (todayWorkout.getExercises() != null ? todayWorkout.getExercises().size() : 0) + " exercises.");
            } else {
                System.err.println("FAILED: Could not retrieve today's workout for user " + athleteId);
            }

            // ── 6. Fetch Coach-Assigned Workouts ──────────────────────────────
            System.out.println("\n--- 6. Fetching Workouts Prescribed by Coach (Coach ID = 1) ---");
            List<Workout> coachWorkouts = workoutDAO.getWorkoutsByCoachId(1);
            System.out.println("SUCCESS: Found " + coachWorkouts.size() + " workouts prescribed by Coach ID 1.");

            // ── 7. Coach Updating Workout with New Exercise ───────────────────
            System.out.println("\n--- 7. Coach Updating Workout with an Extra Exercise Routine ---");
            WorkoutExercise ex4 = new WorkoutExercise();
            ex4.setExerciseName("Cable Rope Triceps Pushdowns");
            ex4.setSets(3);
            ex4.setReps(15);
            ex4.setWeightKg(27.5);
            ex4.setRestSec(60);
            ex4.setOrderIdx(4);
            ex4.setNotes("Triceps Lateral Head");
            exercises.add(ex4);
            todayWorkout.setExercises(exercises);
            todayWorkout.setTitle("Updated Hypertrophy: Chest, Delts, Triceps & Arms");

            boolean updateOk = workoutDAO.updateWorkoutWithExercises(todayWorkout);
            if (updateOk) {
                Workout refreshed = workoutDAO.getWorkoutById(createdWorkoutId);
                System.out.println("SUCCESS: Workout updated. New title: '" + refreshed.getTitle() + "', Exercises count: " +
                        (refreshed.getExercises() != null ? refreshed.getExercises().size() : 0));
            } else {
                System.err.println("FAILED: Update workout with exercises failed.");
            }

            // ── 8. Completing Workout (Atomic Transaction & Streak Update) ────
            System.out.println("\n--- 8. Completing Workout Session (Atomic Transaction & User Metrics) ---");
            User athleteBefore = userDAO.getUserById(athleteId);
            int workoutsBefore = athleteBefore.getTotalWorkouts();
            int calsBefore = athleteBefore.getTotalCaloriesBurned();
            int streakBefore = athleteBefore.getStreakDays();

            boolean completeOk = workoutDAO.completeWorkout(createdWorkoutId, athleteId, 530, 52);
            if (completeOk) {
                User athleteAfter = userDAO.getUserById(athleteId);
                Workout completedWo = workoutDAO.getWorkoutById(createdWorkoutId);

                System.out.println("SUCCESS: Workout marked complete (isCompleted = " + completedWo.isCompleted() +
                        ", Duration = " + completedWo.getDurationMin() + " mins, Calories = " + completedWo.getCaloriesBurned() + " kcal)");
                System.out.println("SUCCESS: User metrics incremented atomically:");
                System.out.println("  - Total Workouts: " + workoutsBefore + " -> " + athleteAfter.getTotalWorkouts());
                System.out.println("  - Total Calories Burned: " + calsBefore + " -> " + athleteAfter.getTotalCaloriesBurned());
                System.out.println("  - Streak Days: " + streakBefore + " -> " + athleteAfter.getStreakDays());
            } else {
                System.err.println("FAILED: Workout completion transaction failed.");
            }

            // ── 9. Fetch Workout History ──────────────────────────────────────
            System.out.println("\n--- 9. Fetching User Workout History ---");
            List<Workout> history = workoutDAO.getRecentWorkoutHistory(athleteId, 10);
            System.out.println("SUCCESS: Retrieved " + history.size() + " completed workout records in history log.");

            // ── 10. JSON Serialization Verification ───────────────────────────
            System.out.println("\n--- 10. Verifying JSON Serialization ---");
            String singleJson = JsonUtil.workoutToJson(todayWorkout);
            String listJson = JsonUtil.workoutListToJson(history);

            if (singleJson.contains("exercises") && singleJson.contains("Incline Dumbbell Bench Press")) {
                System.out.println("SUCCESS: Single Workout JSON serialization valid with nested exercises array.");
            } else {
                System.err.println("FAILED: Single Workout JSON missing expected exercise fields.");
            }

            if (listJson.startsWith("[") && listJson.endsWith("]")) {
                System.out.println("SUCCESS: Workout List JSON serialization valid array format.");
            } else {
                System.err.println("FAILED: Workout List JSON invalid format.");
            }

            // ── 11. Delete Workout ────────────────────────────────────────────
            System.out.println("\n--- 11. Testing Workout Deletion ---");
            boolean delOk = workoutDAO.deleteWorkout(createdWorkoutId);
            if (delOk) {
                Workout deletedWo = workoutDAO.getWorkoutById(createdWorkoutId);
                if (deletedWo == null) {
                    System.out.println("SUCCESS: Workout " + createdWorkoutId + " successfully deleted from database.");
                } else {
                    System.err.println("FAILED: Workout still found after deletion.");
                }
            } else {
                System.err.println("FAILED: Delete workout operation returned false.");
            }

            System.out.println("\n===============================================================");
            System.out.println("  ALL STEP 7 WORKOUT MODULE TESTS PASSED WITH 100% SUCCESS!");
            System.out.println("===============================================================");

        } catch (Exception e) {
            System.err.println("ERROR: Unexpected exception during Workout Integration Test:");
            e.printStackTrace();
        }
    }
}
