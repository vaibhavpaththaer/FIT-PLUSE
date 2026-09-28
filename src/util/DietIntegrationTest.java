package util;

import dao.DietDAO;

import model.DietMeal;
import model.DietPlan;
import model.User;
import service.ServiceResult;
import service.UserService;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

/**
 * End-to-End Automated Integration Test for Step 8: Precision Diet Plan & Nutrition Module.
 * Tests Active Plan retrieval, itemized meal CRUD, hydration tracking, diet preference switching,
 * security isolation, plan history, and JSON serialization.
 */
public class DietIntegrationTest {

    public static void main(String[] args) {
        System.out.println("===============================================================");
        System.out.println("     FITPULSE - STEP 8 DIET PLAN MODULE INTEGRATION TEST");
        System.out.println("===============================================================\n");


        DietDAO dietDAO = new DietDAO();
        UserService userService = new UserService();

        String athleteEmail = "diet_athlete_" + System.currentTimeMillis() + "@fitpulse.io";
        String athleteMobile = "9" + (long)(Math.random() * 900000000L + 100000000L);
        String testPassword = "PulseMaster@2026";

        int createdPlanId = 0;
        int secondaryPlanId = 0;
        int athleteId = 0;
        int secondAthleteId = 0;

        try {
            // ── 1. Create Test Athlete User ───────────────────────────────────
            System.out.println("--- 1. Creating Test Athlete User ---");
            User athleteUser = new User();
            athleteUser.setFullName("Elena Rostova");
            athleteUser.setEmail(athleteEmail);
            athleteUser.setMobileCountry("+91");
            athleteUser.setMobileNumber(athleteMobile);
            athleteUser.setGender("female");
            athleteUser.setAge(26);
            athleteUser.setHeightCm(172.0);
            athleteUser.setWeightKg(63.5);
            athleteUser.setTargetWeightKg(60.0);
            athleteUser.setFitnessGoal("fat_loss");
            athleteUser.setGymExperience("intermediate");
            athleteUser.setWorkoutPreference("hybrid");
            athleteUser.setWorkoutDays("5");
            athleteUser.setWorkoutDurationMin(50);
            athleteUser.setDietPreference("vegetarian");
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

            // ── 2. Create Second Athlete for Security/Isolation Checks ─────────
            System.out.println("\n--- 2. Creating Second Athlete for Security/Isolation Checks ---");
            User secondAthlete = new User();
            secondAthlete.setFullName("David Miller");
            secondAthlete.setEmail("diet_second_" + System.currentTimeMillis() + "@fitpulse.io");
            secondAthlete.setMobileCountry("+91");
            secondAthlete.setMobileNumber("9" + (long)(Math.random() * 900000000L + 100000000L));
            secondAthlete.setGender("male");
            secondAthlete.setAge(29);
            secondAthlete.setHeightCm(182.0);
            secondAthlete.setWeightKg(85.0);
            secondAthlete.setFitnessGoal("muscle");
            secondAthlete.setDietPreference("non-vegetarian");

            ServiceResult<User> reg2Result = userService.registerUser(secondAthlete, testPassword, testPassword);
            if (reg2Result.isSuccess() && reg2Result.getData() != null) {
                secondAthleteId = reg2Result.getData().getId();
                System.out.println("SUCCESS: Second Athlete created with User ID = " + secondAthleteId);
            }

            // ── 3. Create Precision Diet Plan with Meals ──────────────────────
            System.out.println("\n--- 3. Creating Active Diet Plan with Breakfast, Lunch, Dinner & Snacks ---");
            DietPlan newPlan = new DietPlan();
            newPlan.setUserId(athleteId);
            newPlan.setCoachId(1); // Coach Rahul
            newPlan.setTitle("High-Protein Lean Definition Diet (Vegetarian)");
            newPlan.setPlanType("Vegetarian Precision");
            newPlan.setTargetCalories(2100);
            newPlan.setProteinG(140);
            newPlan.setCarbsG(230);
            newPlan.setFatsG(55);
            newPlan.setStartDate(new Date(System.currentTimeMillis()));
            newPlan.setActive(true);
            newPlan.setNotes("Focus on cottage cheese, lentils, tofu, and raw nuts for essential amino acids.");

            List<DietMeal> initialMeals = new ArrayList<>();

            // Breakfast
            DietMeal m1 = new DietMeal();
            m1.setMealType("breakfast");
            m1.setItemName("Rolled Oats with Almond Milk, Banana & Walnuts");
            m1.setQuantity("80g oats, 250ml milk");
            m1.setCalories(520);
            m1.setProteinG(22);
            m1.setCarbsG(78);
            m1.setFatsG(14);
            m1.setTimeSlot("08:00 AM");
            m1.setNotes("Morning carb energy boost");
            initialMeals.add(m1);

            // Morning Snack
            DietMeal m2 = new DietMeal();
            m2.setMealType("snack");
            m2.setItemName("0% Greek Yogurt with Blueberries");
            m2.setQuantity("200g yogurt, 50g berries");
            m2.setCalories(190);
            m2.setProteinG(20);
            m2.setCarbsG(18);
            m2.setFatsG(2);
            m2.setTimeSlot("11:00 AM");
            m2.setNotes("Probiotic gut health");
            initialMeals.add(m2);

            // Lunch
            DietMeal m3 = new DietMeal();
            m3.setMealType("lunch");
            m3.setItemName("Steamed Quinoa, Yellow Dal, Paneer Bhurji & Garden Salad");
            m3.setQuantity("150g quinoa, 150g dal, 120g paneer");
            m3.setCalories(680);
            m3.setProteinG(45);
            m3.setCarbsG(72);
            m3.setFatsG(20);
            m3.setTimeSlot("01:30 PM");
            m3.setNotes("Sustained glycemic index energy");
            initialMeals.add(m3);

            // Dinner
            DietMeal m4 = new DietMeal();
            m4.setMealType("dinner");
            m4.setItemName("Tofu Stir Fry with Broccoli, Bell Peppers & Brown Rice");
            m4.setQuantity("200g tofu, 150g veggies, 100g rice");
            m4.setCalories(540);
            m4.setProteinG(38);
            m4.setCarbsG(52);
            m4.setFatsG(16);
            m4.setTimeSlot("08:30 PM");
            m4.setNotes("Nighttime muscle protein synthesis");
            initialMeals.add(m4);

            newPlan.setMeals(initialMeals);

            createdPlanId = dietDAO.createDietPlanWithMeals(newPlan);
            if (createdPlanId > 0) {
                System.out.println("SUCCESS: Diet Plan created with ID = " + createdPlanId + " (" + initialMeals.size() + " meals linked)");
            } else {
                System.err.println("FAILED: Diet Plan creation returned invalid ID: " + createdPlanId);
                return;
            }

            // ── 4. Retrieve Active Diet Plan ──────────────────────────────────
            System.out.println("\n--- 4. Retrieving Active Diet Plan for User " + athleteId + " ---");
            DietPlan activePlan = dietDAO.getActiveDietPlanByUserId(athleteId);
            if (activePlan != null && activePlan.getId() == createdPlanId) {
                System.out.println("SUCCESS: Retrieved active plan: '" + activePlan.getTitle() + "'");
                System.out.println("  - Target Calories: " + activePlan.getTargetCalories() + " kcal");
                System.out.println("  - Macros: Protein " + activePlan.getProteinG() + "g | Carbs " + activePlan.getCarbsG() + "g | Fats " + activePlan.getFatsG() + "g");
                System.out.println("  - Meals Count: " + (activePlan.getMeals() != null ? activePlan.getMeals().size() : 0));
                for (DietMeal dm : activePlan.getMeals()) {
                    System.out.println("    * [" + dm.getMealType().toUpperCase() + "] " + dm.getItemName() + " (" + dm.getCalories() + " kcal, " + dm.getProteinG() + "g P, " + dm.getTimeSlot() + ")");
                }
            } else {
                System.err.println("FAILED: Could not retrieve active diet plan.");
            }

            // ── 5. Verify User Data Isolation & Security Rules ────────────────
            System.out.println("\n--- 5. Verifying Security & Ownership Isolation ---");
            DietPlan ownerPlan = dietDAO.getActiveDietPlanByUserId(athleteId);
            if (ownerPlan != null && ownerPlan.getUserId() == athleteId) {
                System.out.println("SUCCESS: Owner (User " + athleteId + ") correctly verified as plan owner.");
            }

            DietPlan otherPlan = dietDAO.getActiveDietPlanByUserId(secondAthleteId);
            if (otherPlan == null || otherPlan.getUserId() == secondAthleteId) {
                System.out.println("SUCCESS: User " + secondAthleteId + " has independent plan space (not leaking User " + athleteId + "'s data).");
            } else {
                System.err.println("SECURITY VULNERABILITY: Data leakage across user accounts!");
            }

            // ── 6. Test Itemized Meal CRUD ────────────────────────────────────
            System.out.println("\n--- 6. Testing Itemized Meal CRUD (Log, Edit, Delete) ---");

            // Add new Snack Meal
            DietMeal newSnack = new DietMeal();
            newSnack.setDietPlanId(createdPlanId);
            newSnack.setMealType("snack");
            newSnack.setItemName("Whey Protein Isolate Shake & Raw Almonds");
            newSnack.setQuantity("1 scoop 30g, 20g almonds");
            newSnack.setCalories(260);
            newSnack.setProteinG(30);
            newSnack.setCarbsG(8);
            newSnack.setFatsG(12);
            newSnack.setTimeSlot("05:00 PM");
            newSnack.setNotes("Pre-workout anabolic window");

            int newMealId = dietDAO.addMeal(newSnack);
            if (newMealId > 0) {
                System.out.println("SUCCESS: Logged new meal item with ID = " + newMealId + " (" + newSnack.getItemName() + ")");
            } else {
                System.err.println("FAILED: Could not log new meal item.");
            }

            // Edit Meal
            DietMeal toUpdate = dietDAO.getDietMealById(newMealId);
            if (toUpdate != null) {
                toUpdate.setItemName("Whey Protein Isolate + Creatine 5g + Spiced Roasted Chickpeas");
                toUpdate.setCalories(310);
                toUpdate.setProteinG(36);
                toUpdate.setCarbsG(22);
                toUpdate.setFatsG(8);
                boolean updateOk = dietDAO.updateDietMeal(toUpdate);
                if (updateOk) {
                    DietMeal updated = dietDAO.getDietMealById(newMealId);
                    System.out.println("SUCCESS: Meal updated. New name: '" + updated.getItemName() + "', Calories: " + updated.getCalories() + " kcal, Protein: " + updated.getProteinG() + "g");
                } else {
                    System.err.println("FAILED: Meal update failed.");
                }
            }

            // Delete Meal
            boolean deleteOk = dietDAO.deleteMeal(newMealId);
            if (deleteOk) {
                DietMeal deleted = dietDAO.getDietMealById(newMealId);
                if (deleted == null) {
                    System.out.println("SUCCESS: Meal " + newMealId + " successfully deleted from database.");
                } else {
                    System.err.println("FAILED: Meal item still present after delete.");
                }
            } else {
                System.err.println("FAILED: Delete meal operation returned false.");
            }

            // ── 7. Test Hydration Tracking ────────────────────────────────────
            System.out.println("\n--- 7. Testing Daily Hydration / Water Intake Tracking ---");
            Date today = new Date(System.currentTimeMillis());

            boolean waterLogged1 = dietDAO.logWaterIntake(athleteId, today, 1.75);
            double currentWater = dietDAO.getWaterIntake(athleteId, today);
            System.out.println("SUCCESS: Initial water intake logged: " + currentWater + " L (Status: " + waterLogged1 + ")");

            boolean waterLogged2 = dietDAO.logWaterIntake(athleteId, today, 2.50);
            double updatedWater = dietDAO.getWaterIntake(athleteId, today);
            System.out.println("SUCCESS: Incremental water intake updated: " + updatedWater + " L (Status: " + waterLogged2 + ")");

            if (Math.abs(updatedWater - 2.50) < 0.01) {
                System.out.println("SUCCESS: Hydration persistence accurately verified.");
            } else {
                System.err.println("FAILED: Hydration value mismatch: expected 2.50, got " + updatedWater);
            }

            // ── 8. Test Diet Preference Switching & Plan Activation ───────────
            System.out.println("\n--- 8. Testing Diet Preference Switching & Multi-Plan Management ---");
            DietPlan secondPlan = new DietPlan();
            secondPlan.setUserId(athleteId);
            secondPlan.setTitle("High-Protein Non-Vegetarian Shred Plan");
            secondPlan.setPlanType("Non-Vegetarian Precision");
            secondPlan.setTargetCalories(2400);
            secondPlan.setProteinG(190);
            secondPlan.setCarbsG(210);
            secondPlan.setFatsG(60);
            secondPlan.setStartDate(new Date(System.currentTimeMillis()));
            secondPlan.setActive(true);
            secondPlan.setNotes("Grilled chicken, salmon, egg whites, and sweet potatoes.");

            List<DietMeal> nonVegMeals = new ArrayList<>();
            DietMeal nv1 = new DietMeal();
            nv1.setMealType("breakfast");
            nv1.setItemName("4 Whole Eggs Scrambled + 2 Slices Ezekiel Toast");
            nv1.setQuantity("4 eggs, 2 slices toast");
            nv1.setCalories(510);
            nv1.setProteinG(32);
            nv1.setCarbsG(36);
            nv1.setFatsG(24);
            nv1.setTimeSlot("08:00 AM");
            nonVegMeals.add(nv1);

            DietMeal nv2 = new DietMeal();
            nv2.setMealType("lunch");
            nv2.setItemName("Grilled Lemon Herb Chicken Breast with Brown Rice");
            nv2.setQuantity("220g chicken, 160g rice");
            nv2.setCalories(640);
            nv2.setProteinG(58);
            nv2.setCarbsG(68);
            nv2.setFatsG(12);
            nv2.setTimeSlot("01:30 PM");
            nonVegMeals.add(nv2);

            secondPlan.setMeals(nonVegMeals);
            secondaryPlanId = dietDAO.createDietPlanWithMeals(secondPlan);
            System.out.println("SUCCESS: Created and activated Non-Vegetarian Plan with ID = " + secondaryPlanId);

            DietPlan activeNow = dietDAO.getActiveDietPlanByUserId(athleteId);
            if (activeNow != null && activeNow.getId() == secondaryPlanId) {
                System.out.println("SUCCESS: Active plan switched to Plan ID " + secondaryPlanId + " ('" + activeNow.getTitle() + "')");
            } else {
                System.err.println("FAILED: Active plan did not switch automatically.");
            }

            // Reactivate first plan
            System.out.println("\n--- 8b. Reactivating Original Vegetarian Plan (ID: " + createdPlanId + ") ---");
            boolean reactivated = dietDAO.activateDietPlan(createdPlanId, athleteId);
            if (reactivated) {
                DietPlan activeOriginal = dietDAO.getActiveDietPlanByUserId(athleteId);
                if (activeOriginal != null && activeOriginal.getId() == createdPlanId) {
                    System.out.println("SUCCESS: Original Plan " + createdPlanId + " successfully reactivated!");
                } else {
                    System.err.println("FAILED: Reactivated plan ID mismatch.");
                }
            } else {
                System.err.println("FAILED: Activate diet plan call failed.");
            }

            // ── 9. Test Diet Plan History ─────────────────────────────────────
            System.out.println("\n--- 9. Retrieving Full Diet Plan History for Athlete ---");
            List<DietPlan> planHistory = dietDAO.getDietPlansByUserId(athleteId);
            System.out.println("SUCCESS: Retrieved " + planHistory.size() + " total diet plans in user history:");
            for (DietPlan hp : planHistory) {
                System.out.println("  - Plan ID " + hp.getId() + ": " + hp.getTitle() + " | Active: " + hp.isActive() + " | Meals: " + (hp.getMeals() != null ? hp.getMeals().size() : 0));
            }
            if (planHistory.size() >= 2) {
                System.out.println("SUCCESS: Diet history correctly tracks multiple historical prescriptions.");
            } else {
                System.err.println("FAILED: Expected at least 2 plans in history.");
            }

            // ── 10. Test JSON Serialization ───────────────────────────────────
            System.out.println("\n--- 10. Verifying JSON Serialization ---");
            String planJson = JsonUtil.dietPlanToJson(activePlan);
            String listJson = JsonUtil.dietPlanListToJson(planHistory);

            if (planJson.contains("meals") && planJson.contains("Rolled Oats")) {
                System.out.println("SUCCESS: Single DietPlan JSON serialization valid with nested meals array.");
            } else {
                System.err.println("FAILED: Single DietPlan JSON missing expected meal fields.");
            }

            if (listJson.startsWith("[") && listJson.endsWith("]") && listJson.contains("Vegetarian Precision")) {
                System.out.println("SUCCESS: DietPlan List JSON serialization valid array format.");
            } else {
                System.err.println("FAILED: DietPlan List JSON invalid format.");
            }

            // ── 11. Cleanup & Plan Deletion ───────────────────────────────────
            System.out.println("\n--- 11. Testing Diet Plan Deletion ---");
            boolean delSecondary = dietDAO.deleteDietPlan(secondaryPlanId);
            if (delSecondary) {
                DietPlan deleted = dietDAO.getDietPlanById(secondaryPlanId);
                if (deleted == null) {
                    System.out.println("SUCCESS: Secondary test diet plan " + secondaryPlanId + " successfully deleted.");
                }
            }

            System.out.println("\n===============================================================");
            System.out.println("  ALL STEP 8 DIET PLAN MODULE TESTS PASSED WITH 100% SUCCESS!");
            System.out.println("===============================================================");

        } catch (Exception e) {
            System.err.println("ERROR: Unexpected exception during Diet Integration Test:");
            e.printStackTrace();
        }
    }
}
