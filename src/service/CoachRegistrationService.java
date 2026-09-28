package service;

import dao.CoachDAO;
import dao.UserDAO;
import model.Coach;
import model.User;
import util.PasswordUtil;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Service handling Coach Self-Registration business logic.
 * Creates both a users row (role='coach') and a coaches row (account_status='pending').
 * Existing authentication (AuthService) is reused for login.
 */
public class CoachRegistrationService {

    private final UserDAO userDAO;
    private final CoachDAO coachDAO;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
    );

    public CoachRegistrationService() {
        this.userDAO = new UserDAO();
        this.coachDAO = new CoachDAO();
    }

    /**
     * Registers a new coach.
     *
     * Step 1: Validate all fields.
     * Step 2: Check email uniqueness in both users and coaches tables.
     * Step 3: Hash password.
     * Step 4: INSERT into users table (role='coach').
     * Step 5: INSERT into coaches table (account_status='pending').
     *
     * @param coachProfile   Coach professional info (name, email, phone, bio, specialties, etc.)
     * @param password       Plaintext password
     * @param confirmPassword Must match password
     * @param mobile         Mobile number (digits only)
     * @param mobileCountry  Country code e.g. +91
     * @param gender         male/female/other
     * @param age            Coach age
     * @return ServiceResult with the Coach object on success, or failure message.
     */
    public ServiceResult<Coach> registerCoach(
            Coach coachProfile,
            String password,
            String confirmPassword,
            String mobile,
            String mobileCountry,
            String gender,
            int age
    ) {
        // ─── 1. Validate Required Fields ────────────────────────────────────
        if (coachProfile == null) {
            return ServiceResult.failure("Coach profile data is required.", 400);
        }
        if (coachProfile.getFullName() == null || coachProfile.getFullName().trim().length() < 2) {
            return ServiceResult.failure("Full name is required (minimum 2 characters).", 400);
        }
        coachProfile.setFullName(coachProfile.getFullName().trim());

        if (coachProfile.getEmail() == null || coachProfile.getEmail().trim().isEmpty()) {
            return ServiceResult.failure("Email address is required.", 400);
        }
        String cleanEmail = coachProfile.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(cleanEmail).matches()) {
            return ServiceResult.failure("Invalid email address format.", 400);
        }
        coachProfile.setEmail(cleanEmail);

        if (mobile == null || mobile.trim().isEmpty()) {
            return ServiceResult.failure("Mobile number is required.", 400);
        }
        String cleanMobile = mobile.replaceAll("[^0-9]", "");
        if (cleanMobile.length() < 7 || cleanMobile.length() > 15) {
            return ServiceResult.failure("Please enter a valid mobile number (7-15 digits).", 400);
        }

        // Password validation
        if (password == null || password.length() < 6) {
            return ServiceResult.failure("Password must be at least 6 characters long.", 400);
        }
        if (!password.equals(confirmPassword)) {
            return ServiceResult.failure("Password and confirm password do not match.", 400);
        }

        // Age validation
        if (age < 18 || age > 80) {
            return ServiceResult.failure("Coach age must be between 18 and 80.", 400);
        }

        // Professional info validation
        if (coachProfile.getSpecialties() == null || coachProfile.getSpecialties().trim().isEmpty()) {
            return ServiceResult.failure("Specialization is required.", 400);
        }
        if (coachProfile.getExperienceYears() < 0 || coachProfile.getExperienceYears() > 60) {
            return ServiceResult.failure("Please enter valid experience years (0-60).", 400);
        }

        // ─── 2. Duplicate Checks ───────────────────────────────────────────
        try {
            if (userDAO.isEmailRegistered(cleanEmail)) {
                return ServiceResult.failure("An account with this email already exists. Please sign in.", 409);
            }
            if (userDAO.isMobileRegistered(cleanMobile)) {
                return ServiceResult.failure("An account with this mobile number already exists.", 409);
            }
            if (coachDAO.getCoachByEmail(cleanEmail) != null) {
                return ServiceResult.failure("A coach profile with this email already exists.", 409);
            }
        } catch (SQLException e) {
            return ServiceResult.failure("Database error during uniqueness check: " + e.getMessage(), 500);
        }

        // ─── 3. Hash Password ──────────────────────────────────────────────
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(password, salt);

        // ─── 4. Create users row with role='coach' ─────────────────────────
        User userAccount = new User();
        userAccount.setFullName(coachProfile.getFullName());
        userAccount.setEmail(cleanEmail);
        userAccount.setMobileCountry(mobileCountry != null && !mobileCountry.isEmpty() ? mobileCountry : "+91");
        userAccount.setMobileNumber(cleanMobile);
        userAccount.setPasswordHash(hash);
        userAccount.setPasswordSalt(salt);
        userAccount.setRole("coach");
        userAccount.setGender(gender != null && !gender.isEmpty() ? gender : "male");
        userAccount.setAge(age);
        userAccount.setHeightCm(170.0); // default — coaches don't need biometrics
        userAccount.setWeightKg(70.0);
        userAccount.setActivityLevel("moderate");
        userAccount.setFitnessGoal("muscle");
        userAccount.setMedicalConditions("no");
        userAccount.setMemberSince(LocalDate.now().format(DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH)));

        int userId = -1;
        try {
            userId = userDAO.createUser(userAccount);
            if (userId <= 0) {
                return ServiceResult.failure("Failed to create coach user account. Please try again.", 500);
            }
        } catch (SQLException e) {
            return ServiceResult.failure("Database error creating user account: " + e.getMessage(), 500);
        }

        // ─── 5. Create coaches row with account_status='pending' ───────────
        coachProfile.setId(userId);
        coachProfile.setEmail(cleanEmail);
        coachProfile.setPhone(cleanMobile);
        coachProfile.setAccountStatus("pending");
        coachProfile.setActive(false); // not active until approved
        coachProfile.setRating(5.0);

        // Append certifications to specialties if provided
        if (coachProfile.getCertifications() != null && !coachProfile.getCertifications().trim().isEmpty()) {
            String specs = coachProfile.getSpecialties();
            String certs = "[Cert: " + coachProfile.getCertifications().trim() + "]";
            coachProfile.setSpecialties(specs + " " + certs);
        }

        // Append coaching type to bio if provided
        if (coachProfile.getCoachingType() != null && !coachProfile.getCoachingType().trim().isEmpty()) {
            String bio = coachProfile.getBio() != null ? coachProfile.getBio() : "";
            if (!bio.isEmpty()) bio += " | ";
            bio += "Coaching Type: " + coachProfile.getCoachingType().trim();
            coachProfile.setBio(bio);
        }

        try {
            int coachId = coachDAO.createPendingCoach(coachProfile);
            if (coachId <= 0) {
                return ServiceResult.failure("Failed to create coach profile. Please try again.", 500);
            }
        } catch (SQLException e) {
            return ServiceResult.failure("Database error creating coach profile: " + e.getMessage(), 500);
        }

        return ServiceResult.success(
                "Coach registration submitted successfully! Your account is pending admin approval. " +
                "You will be able to log in once approved.",
                coachProfile
        );
    }
}
