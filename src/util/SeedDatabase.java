package util;

import dao.CoachDAO;
import dao.UserDAO;
import model.Coach;
import model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * Utility to seed and verify essential users and coaches for all three roles:
 * 1. Admin: admin@fitpulse.com (Password: Password@123) -> role: admin
 * 2. Coach: coach.rahul@fitpulse.com (Password: Password@123) -> role: coach
 * 3. User: alex.morgan@gmail.com (Password: Password@123) -> role: user
 * Plus additional coaches and users for rich platform data.
 */
public class SeedDatabase {

    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("🌱 FITPULSE DATABASE SEEDER & ROLE VERIFIER");
        System.out.println("==================================================");

        try {
            seedCoaches();
            seedUsers();
            System.out.println("✅ Database seeding and role verification complete!");
        } catch (Exception e) {
            System.err.println("❌ Seeding failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void seedCoaches() throws SQLException {
        CoachDAO coachDAO = new CoachDAO();

        // 1. Coach Rahul Sharma
        Coach c1 = coachDAO.getCoachByEmail("coach.rahul@fitpulse.com");
        if (c1 == null) {
            c1 = new Coach();
            c1.setFullName("Coach Rahul Sharma");
            c1.setEmail("coach.rahul@fitpulse.com");
            c1.setPhone("+91 98765 11223");
            c1.setBio("Senior Elite Strength & Conditioning Coach certified with NSCA & CSCS. Specializes in hypertrophy, biomechanics, and personalized competition preparation.");
            c1.setSpecialties("Hypertrophy, Strength & Conditioning, Powerlifting");
            c1.setExperienceYears(8);
            c1.setRating(4.9);
            c1.setAvatarUrl("https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=200&auto=format&fit=crop&q=80");
            c1.setActive(true);
            coachDAO.createCoach(c1);
            System.out.println("  ➕ Seeded Coach: Rahul Sharma (ID: " + c1.getId() + ")");
        } else {
            System.out.println("  ℹ️ Coach Rahul Sharma already exists (ID: " + c1.getId() + ")");
        }

        // 2. Coach Priya Patel
        Coach c2 = coachDAO.getCoachByEmail("coach.priya@fitpulse.com");
        if (c2 == null) {
            c2 = new Coach();
            c2.setFullName("Coach Priya Patel");
            c2.setEmail("coach.priya@fitpulse.com");
            c2.setPhone("+91 98765 22334");
            c2.setBio("Clinical Nutritionist & Functional Fitness Specialist with 6+ years transforming client lifestyles through sustainable macro diets and metabolic conditioning.");
            c2.setSpecialties("Clinical Nutrition, Fat Loss, HIIT, Mobility");
            c2.setExperienceYears(6);
            c2.setRating(4.8);
            c2.setAvatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80");
            c2.setActive(true);
            coachDAO.createCoach(c2);
            System.out.println("  ➕ Seeded Coach: Priya Patel (ID: " + c2.getId() + ")");
        }

        // 3. Coach Vikram Sengupta
        Coach c3 = coachDAO.getCoachByEmail("coach.vikram@fitpulse.com");
        if (c3 == null) {
            c3 = new Coach();
            c3.setFullName("Coach Vikram Sengupta");
            c3.setEmail("coach.vikram@fitpulse.com");
            c3.setPhone("+91 98765 33445");
            c3.setBio("Former National Athlete & Master Trainer dedicated to athletic performance, kettlebell training, and posture rehabilitation.");
            c3.setSpecialties("Athletic Performance, Posture Correction, Kettlebells");
            c3.setExperienceYears(10);
            c3.setRating(5.0);
            c3.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80");
            c3.setActive(true);
            coachDAO.createCoach(c3);
            System.out.println("  ➕ Seeded Coach: Vikram Sengupta (ID: " + c3.getId() + ")");
        }
    }

    public static void seedUsers() throws SQLException {
        UserDAO userDAO = new UserDAO();
        CoachDAO coachDAO = new CoachDAO();
        Coach coachRahul = coachDAO.getCoachByEmail("coach.rahul@fitpulse.com");
        Integer coachId = (coachRahul != null) ? coachRahul.getId() : 1;

        // 1. ADMIN USER: admin@fitpulse.com (Password: Password@123)
        User admin = userDAO.getUserByEmail("admin@fitpulse.com");
        if (admin == null) {
            String salt = PasswordUtil.generateSalt();
            String hash = PasswordUtil.hashPassword("Password@123", salt);

            admin = new User();
            admin.setFullName("System Administrator");
            admin.setEmail("admin@fitpulse.com");
            admin.setMobileCountry("+91");
            admin.setMobileNumber("9990001111");
            admin.setPasswordSalt(salt);
            admin.setPasswordHash(hash);
            admin.setGender("male");
            admin.setAge(32);
            admin.setHeightCm(182.0);
            admin.setWeightKg(80.0);
            admin.setFitnessGoal("maintenance");
            admin.setActivityLevel("very_active");
            admin.setGymExperience("advanced");
            admin.setWorkoutPreference("gym");
            admin.setRole("admin");
            admin.setMemberSince("Jan 2026");
            admin.setPreferredLanguage("en");

            int adminId = userDAO.createUser(admin);
            System.out.println("  👑 Seeded Admin User: admin@fitpulse.com (ID: " + adminId + ", role: admin)");
        } else {
            // Ensure role is admin
            if (!"admin".equalsIgnoreCase(admin.getRole())) {
                updateRole(admin.getId(), "admin");
                System.out.println("  👑 Updated user admin@fitpulse.com to role 'admin'");
            } else {
                System.out.println("  ℹ️ Admin user admin@fitpulse.com already exists (ID: " + admin.getId() + ")");
            }
        }

        // 2. COACH USER: coach.rahul@fitpulse.com (Password: Password@123)
        User coachUser = userDAO.getUserByEmail("coach.rahul@fitpulse.com");
        if (coachUser == null) {
            String salt = PasswordUtil.generateSalt();
            String hash = PasswordUtil.hashPassword("Password@123", salt);

            coachUser = new User();
            coachUser.setFullName("Coach Rahul Sharma");
            coachUser.setEmail("coach.rahul@fitpulse.com");
            coachUser.setMobileCountry("+91");
            coachUser.setMobileNumber("9876511223");
            coachUser.setPasswordSalt(salt);
            coachUser.setPasswordHash(hash);
            coachUser.setGender("male");
            coachUser.setAge(31);
            coachUser.setHeightCm(185.0);
            coachUser.setWeightKg(86.0);
            coachUser.setFitnessGoal("muscle");
            coachUser.setActivityLevel("very_active");
            coachUser.setGymExperience("advanced");
            coachUser.setWorkoutPreference("gym");
            coachUser.setRole("coach");
            coachUser.setMemberSince("Jan 2026");
            coachUser.setPreferredLanguage("en");

            int coachUserId = userDAO.createUser(coachUser);
            System.out.println("  🥋 Seeded Coach User: coach.rahul@fitpulse.com (ID: " + coachUserId + ", role: coach)");
        } else {
            if (!"coach".equalsIgnoreCase(coachUser.getRole())) {
                updateRole(coachUser.getId(), "coach");
            }
            System.out.println("  ℹ️ Coach user coach.rahul@fitpulse.com already exists (ID: " + coachUser.getId() + ")");
        }

        // 3. ATHLETE USER: alex.morgan@gmail.com (Password: Password@123)
        User athlete = userDAO.getUserByEmail("alex.morgan@gmail.com");
        if (athlete == null) {
            String salt = PasswordUtil.generateSalt();
            String hash = PasswordUtil.hashPassword("Password@123", salt);

            athlete = new User();
            athlete.setFullName("Alex Morgan");
            athlete.setEmail("alex.morgan@gmail.com");
            athlete.setMobileCountry("+91");
            athlete.setMobileNumber("9876543210");
            athlete.setPasswordSalt(salt);
            athlete.setPasswordHash(hash);
            athlete.setGender("male");
            athlete.setAge(26);
            athlete.setHeightCm(178.0);
            athlete.setWeightKg(72.4);
            athlete.setTargetWeightKg(75.0);
            athlete.setFitnessGoal("muscle");
            athlete.setActivityLevel("moderate");
            athlete.setGymExperience("intermediate");
            athlete.setWorkoutPreference("gym");
            athlete.setWorkoutDays("4-5");
            athlete.setWorkoutDurationMin(45);
            athlete.setDietPreference("non-vegetarian");
            athlete.setWaterIntake("2-3L");
            athlete.setSleepHours("6-8");
            athlete.setMedicalConditions("no");
            athlete.setRole("user");
            athlete.setAssignedCoachId(coachId);
            athlete.setStreakDays(14);
            athlete.setTotalWorkouts(48);
            athlete.setTotalCaloriesBurned(32450);
            athlete.setMemberSince("Feb 2026");
            athlete.setPreferredLanguage("en");

            int athleteId = userDAO.createUser(athlete);
            System.out.println("  🏋️ Seeded Athlete User: alex.morgan@gmail.com (ID: " + athleteId + ", role: user)");
        } else {
            System.out.println("  ℹ️ Athlete user alex.morgan@gmail.com already exists (ID: " + athlete.getId() + ")");
        }

        // 4. ADDITIONAL ATHLETE: sarah.jenkins@gmail.com
        User athlete2 = userDAO.getUserByEmail("sarah.jenkins@gmail.com");
        if (athlete2 == null) {
            String salt = PasswordUtil.generateSalt();
            String hash = PasswordUtil.hashPassword("Password@123", salt);

            athlete2 = new User();
            athlete2.setFullName("Sarah Jenkins");
            athlete2.setEmail("sarah.jenkins@gmail.com");
            athlete2.setMobileCountry("+91");
            athlete2.setMobileNumber("9876543219");
            athlete2.setPasswordSalt(salt);
            athlete2.setPasswordHash(hash);
            athlete2.setGender("female");
            athlete2.setAge(28);
            athlete2.setHeightCm(165.0);
            athlete2.setWeightKg(62.0);
            athlete2.setTargetWeightKg(58.0);
            athlete2.setFitnessGoal("weight_loss");
            athlete2.setActivityLevel("moderate");
            athlete2.setGymExperience("beginner");
            athlete2.setWorkoutPreference("home");
            athlete2.setWorkoutDays("3-4");
            athlete2.setWorkoutDurationMin(40);
            athlete2.setDietPreference("vegetarian");
            athlete2.setWaterIntake("2-3L");
            athlete2.setSleepHours("7-8");
            athlete2.setMedicalConditions("no");
            athlete2.setRole("user");
            athlete2.setAssignedCoachId(coachId);
            athlete2.setStreakDays(8);
            athlete2.setTotalWorkouts(22);
            athlete2.setTotalCaloriesBurned(14200);
            athlete2.setMemberSince("Feb 2026");
            athlete2.setPreferredLanguage("en");

            int athlete2Id = userDAO.createUser(athlete2);
            System.out.println("  🏋️ Seeded Athlete User: sarah.jenkins@gmail.com (ID: " + athlete2Id + ")");
        }
    }

    private static void updateRole(int userId, String role) throws SQLException {
        String sql = "UPDATE `users` SET `role` = ? WHERE `id` = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, role);
            ps.setInt(2, userId);
            ps.executeUpdate();
        }
    }
}
