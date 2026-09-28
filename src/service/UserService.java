package service;

import dao.UserDAO;
import model.User;
import util.PasswordUtil;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Service handling User Business Logic and Registration Validation.
 */
public class UserService {

    private final UserDAO userDAO;

    // RFC 5322 standard compliant email pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
    );

    public UserService() {
        this.userDAO = new UserDAO();
    }

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /**
     * Complete Registration workflow:
     * 1. Validates all required personal, security, lifestyle, and fitness fields
     * 2. Checks for existing registered email and mobile number
     * 3. Securely hashes the password with a cryptographic salt
     * 4. Persists the user record into the MySQL database
     */
    public ServiceResult<User> registerUser(User user, String plainPassword, String confirmPassword) {
        // --- 1. Input Validation ---
        if (user == null) {
            return ServiceResult.failure("User data is required.");
        }

        // Full Name Validation
        if (user.getFullName() == null || user.getFullName().trim().length() < 2) {
            return ServiceResult.failure("Full Name is required (minimum 2 characters).");
        }
        user.setFullName(user.getFullName().trim());

        // Email Validation
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return ServiceResult.failure("Email address is required.");
        }
        String cleanEmail = user.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(cleanEmail).matches()) {
            return ServiceResult.failure("Invalid email address format.");
        }
        user.setEmail(cleanEmail);

        // Mobile Validation
        if (user.getMobileNumber() == null || user.getMobileNumber().trim().isEmpty()) {
            return ServiceResult.failure("Mobile number is required.");
        }
        String cleanMobile = user.getMobileNumber().replaceAll("[^0-9]", "");
        if (cleanMobile.length() < 7 || cleanMobile.length() > 15) {
            return ServiceResult.failure("Please enter a valid mobile number (7-15 digits).");
        }
        user.setMobileNumber(cleanMobile);

        // Password & Confirmation Validation
        if (plainPassword == null || plainPassword.length() < 6) {
            return ServiceResult.failure("Password must be at least 6 characters long.");
        }
        if (confirmPassword == null || !plainPassword.equals(confirmPassword)) {
            return ServiceResult.failure("Password and confirm password do not match.");
        }

        // Biometrics Validation
        if (user.getAge() < 10 || user.getAge() > 100) {
            return ServiceResult.failure("Please provide a valid age between 10 and 100.");
        }
        if (user.getHeightCm() < 50 || user.getHeightCm() > 250) {
            return ServiceResult.failure("Please provide a valid height between 50 and 250 cm.");
        }
        if (user.getWeightKg() < 20 || user.getWeightKg() > 300) {
            return ServiceResult.failure("Please provide a valid weight between 20 and 300 kg.");
        }

        // Defaults for Preferences if not provided
        if (user.getGender() == null || user.getGender().isEmpty()) user.setGender("male");
        if (user.getFitnessGoal() == null || user.getFitnessGoal().isEmpty()) user.setFitnessGoal("muscle");
        if (user.getActivityLevel() == null || user.getActivityLevel().isEmpty()) user.setActivityLevel("moderate");
        if (user.getGymExperience() == null || user.getGymExperience().isEmpty()) user.setGymExperience("intermediate");
        if (user.getWorkoutPreference() == null || user.getWorkoutPreference().isEmpty()) user.setWorkoutPreference("gym");
        if (user.getWorkoutDays() == null || user.getWorkoutDays().isEmpty()) user.setWorkoutDays("4-5");
        if (user.getWorkoutDurationMin() <= 0) user.setWorkoutDurationMin(45);
        if (user.getDietPreference() == null || user.getDietPreference().isEmpty()) user.setDietPreference("non-vegetarian");
        if (user.getWaterIntake() == null || user.getWaterIntake().isEmpty()) user.setWaterIntake("2-3L");
        if (user.getSleepHours() == null || user.getSleepHours().isEmpty()) user.setSleepHours("6-8");
        if (user.getMedicalConditions() == null || user.getMedicalConditions().isEmpty()) user.setMedicalConditions("no");
        if (user.getMemberSince() == null || user.getMemberSince().isEmpty()) {
            user.setMemberSince(LocalDate.now().format(DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH)));
        }

        // --- 2. Duplicate Checks ---
        try {
            if (userDAO.isEmailRegistered(user.getEmail())) {
                return ServiceResult.failure("An account with this email address already exists. Please sign in.", 409);
            }
            if (userDAO.isMobileRegistered(user.getMobileNumber())) {
                return ServiceResult.failure("An account with this mobile number already exists. Please sign in.", 409);
            }
        } catch (SQLException e) {
            return ServiceResult.failure("Database error while checking account uniqueness: " + e.getMessage(), 500);
        }

        // --- 3. Secure Password Hashing ---
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(plainPassword, salt);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hash);

        // --- 4. Database Persistence ---
        try {
            int userId = userDAO.createUser(user);
            if (userId > 0) {
                user.setId(userId);
                return ServiceResult.success("Account created successfully! Welcome to FitPulse.", user);
            } else {
                return ServiceResult.failure("Failed to create user account. Please try again.", 500);
            }
        } catch (SQLException e) {
            return ServiceResult.failure("Database error while creating user: " + e.getMessage(), 500);
        }
    }

    /**
     * Retrieves user by ID.
     */
    public User getUserById(int id) throws SQLException {
        return userDAO.getUserById(id);
    }

    /**
     * Retrieves user by email.
     */
    public User getUserByEmail(String email) throws SQLException {
        return userDAO.getUserByEmail(email);
    }
}
