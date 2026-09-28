package service;

import dao.UserDAO;
import model.User;
import util.PasswordUtil;

import java.sql.SQLException;
import java.util.UUID;

/**
 * Service handling Authentication, Credentials Verification, Session Security,
 * and Password Recovery workflows.
 */
public class AuthService {

    private final UserDAO userDAO;

    public AuthService() {
        this.userDAO = new UserDAO();
    }

    public AuthService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /**
     * Authenticates a user by email or mobile number with password verification.
     */
    public ServiceResult<User> login(String identifier, String plainPassword) {
        // 1. Basic validation
        if (identifier == null || identifier.trim().isEmpty()) {
            return ServiceResult.failure("Please enter your email or mobile number.", 400);
        }
        if (plainPassword == null || plainPassword.isEmpty()) {
            return ServiceResult.failure("Please enter your password.", 400);
        }

        String cleanIdentifier = identifier.trim();

        try {
            User user = null;

            // Determine if identifier is email or mobile
            if (cleanIdentifier.contains("@")) {
                user = userDAO.getUserByEmail(cleanIdentifier.toLowerCase());
            } else {
                String cleanMobile = cleanIdentifier.replaceAll("[^0-9]", "");
                user = userDAO.getUserByMobile(cleanMobile);
                // Fallback: try by email in case of non-standard input
                if (user == null) {
                    user = userDAO.getUserByEmail(cleanIdentifier.toLowerCase());
                }
            }

            // 2. Check if user exists
            if (user == null) {
                return ServiceResult.failure("Invalid email or password.", 401);
            }

            // 3. Verify password against stored salt and SHA-256 hash
            String storedSalt = user.getPasswordSalt();
            String storedHash = user.getPasswordHash();

            if (storedSalt == null || storedHash == null) {
                return ServiceResult.failure("Authentication configuration error. Please reset your password.", 500);
            }

            boolean passwordValid = PasswordUtil.verifyPassword(plainPassword, storedSalt, storedHash);
            if (!passwordValid) {
                return ServiceResult.failure("Invalid email or password.", 401);
            }

            // 4. Sanitize user model before returning to client (hide salt and hash)
            user.setPasswordSalt(null);
            user.setPasswordHash(null);

            return ServiceResult.success("Login successful! Welcome back, " + user.getFullName() + "!", user);

        } catch (SQLException e) {
            return ServiceResult.failure("Database error during authentication: " + e.getMessage(), 500);
        }
    }

    /**
     * Handles forgot password / reset link request.
     */
    public ServiceResult<String> processForgotPassword(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return ServiceResult.failure("Please provide your registered email or mobile number.", 400);
        }

        String cleanIdentifier = identifier.trim();

        try {
            User user = null;
            if (cleanIdentifier.contains("@")) {
                user = userDAO.getUserByEmail(cleanIdentifier.toLowerCase());
            } else {
                String cleanMobile = cleanIdentifier.replaceAll("[^0-9]", "");
                user = userDAO.getUserByMobile(cleanMobile);
            }

            if (user == null) {
                return ServiceResult.failure("No registered account found matching " + cleanIdentifier + ".", 404);
            }

            // Generate reset token (in real production would email/SMS; here generates active verification token)
            String resetToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            return ServiceResult.success(
                    "Password reset verification code (" + resetToken + ") has been sent to " + cleanIdentifier + ".",
                    resetToken
            );

        } catch (SQLException e) {
            return ServiceResult.failure("Database error during password reset: " + e.getMessage(), 500);
        }
    }

    /**
     * Resets a user's password with fresh cryptographic salt and SHA-256 hashing.
     */
    public ServiceResult<Boolean> resetPassword(String identifier, String newPassword, String confirmPassword) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return ServiceResult.failure("User identifier is required.", 400);
        }
        if (newPassword == null || newPassword.length() < 5) {
            return ServiceResult.failure("New password must be at least 5 characters long.", 400);
        }
        if (!newPassword.equals(confirmPassword)) {
            return ServiceResult.failure("New password and confirmation do not match.", 400);
        }

        try {
            User user = null;
            if (identifier.contains("@")) {
                user = userDAO.getUserByEmail(identifier.toLowerCase());
            } else {
                user = userDAO.getUserByMobile(identifier.replaceAll("[^0-9]", ""));
            }

            if (user == null) {
                return ServiceResult.failure("User not found.", 404);
            }

            String newSalt = PasswordUtil.generateSalt();
            String newHash = PasswordUtil.hashPassword(newPassword, newSalt);

            boolean updated = userDAO.updatePassword(user.getId(), newHash, newSalt);
            if (updated) {
                return ServiceResult.success("Password reset successfully. You may now sign in with your new password.", true);
            } else {
                return ServiceResult.failure("Failed to update password in database.", 500);
            }
        } catch (SQLException e) {
            return ServiceResult.failure("Database error while updating password: " + e.getMessage(), 500);
        }
    }
}
