package controller;

import dao.ProgressDAO;
import dao.UserDAO;
import model.Progress;
import model.User;
import util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Date;
import java.sql.SQLException;
import java.util.Map;

/**
 * Controller servlet for User Profile operations:
 * - GET: Retrieves full profile & biometrics of authenticated user
 * - POST: Updates user profile information and biometrics
 */
@WebServlet(name = "ProfileServlet", urlPatterns = {"/api/profile", "/api/profile/*", "/api/user/profile", "/profile"})
public class ProfileServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();
    private final ProgressDAO progressDAO = new ProgressDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        resp.setHeader("Pragma", "no-cache");

        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        User sessionUser = (session != null) ? (User) session.getAttribute("user") : null;

        if (sessionUser == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required. Please log in.\"}");
            return;
        }

        try {
            User liveUser = userDAO.getUserById(sessionUser.getId());
            if (liveUser == null) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"User profile not found in database.\"}");
                return;
            }

            // Keep session user synchronized with database
            session.setAttribute("user", liveUser);

            double weight = liveUser.getWeightKg();
            double height = liveUser.getHeightCm();
            double bmi = 22.0;
            if (height > 0) {
                double hm = height / 100.0;
                bmi = Math.round((weight / (hm * hm)) * 10.0) / 10.0;
            }

            String bmiCategory;
            if (bmi < 18.5) bmiCategory = "Underweight";
            else if (bmi < 25.0) bmiCategory = "Normal";
            else if (bmi < 30.0) bmiCategory = "Overweight";
            else bmiCategory = "Obese";

            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"success\":true,");
            json.append("\"user\":").append(JsonUtil.userToJson(liveUser)).append(",");
            json.append("\"bmi\":").append(bmi).append(",");
            json.append("\"bmiCategory\":\"").append(bmiCategory).append("\",");
            json.append("\"streakDays\":").append(liveUser.getStreakDays()).append(",");
            json.append("\"totalWorkouts\":").append(liveUser.getTotalWorkouts()).append(",");
            json.append("\"totalCaloriesBurned\":").append(liveUser.getTotalCaloriesBurned());
            json.append("}");

            resp.setStatus(HttpServletResponse.SC_OK);
            out.write(json.toString());

        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        resp.setHeader("Pragma", "no-cache");

        PrintWriter out = resp.getWriter();

        HttpSession session = req.getSession(false);
        User sessionUser = (session != null) ? (User) session.getAttribute("user") : null;

        if (sessionUser == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\":false,\"message\":\"Authentication required. Please log in.\"}");
            return;
        }

        String pathInfo = req.getPathInfo(); // e.g. "/weight" or null

        // Read request payload (supports JSON or URL-encoded form)
        Map<String, String> bodyMap = null;
        String contentType = req.getContentType();
        if (contentType != null && contentType.contains("application/json")) {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = req.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            bodyMap = JsonUtil.parseSimpleJson(sb.toString());
        }

        try {
            User liveUser = userDAO.getUserById(sessionUser.getId());
            if (liveUser == null) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"User profile not found.\"}");
                return;
            }

            // 1. Quick Weight Update Route
            boolean isWeightOnly = (pathInfo != null && pathInfo.contains("weight")) ||
                    (bodyMap != null && bodyMap.containsKey("quickWeight")) ||
                    (req.getParameter("quickWeight") != null);

            if (isWeightOnly) {
                String rawWeight = getParam(req, bodyMap, "weightKg", "weight", "quickWeight");
                if (rawWeight == null || rawWeight.trim().isEmpty()) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Weight value is required.\"}");
                    return;
                }

                double newWeight;
                try {
                    newWeight = Double.parseDouble(rawWeight.trim());
                    if (newWeight < 20 || newWeight > 300) {
                        throw new IllegalArgumentException("Weight out of realistic bounds");
                    }
                } catch (Exception ex) {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\":false,\"message\":\"Please enter a valid weight in kg (20-300).\"}");
                    return;
                }

                liveUser.setWeightKg(newWeight);
                userDAO.updateUserProfile(liveUser);

                // Recalculate BMI
                double hm = liveUser.getHeightCm() / 100.0;
                double bmi = (hm > 0) ? Math.round((newWeight / (hm * hm)) * 10.0) / 10.0 : 22.0;

                // Log entry in progress history
                Progress progress = new Progress();
                progress.setUserId(liveUser.getId());
                progress.setRecordDate(new Date(System.currentTimeMillis()));
                progress.setWeightKg(newWeight);
                progress.setBmi(bmi);
                progress.setCaloriesBurned(0);
                progress.setSteps(0);
                progress.setWaterLiters(3.0);
                progress.setWorkoutsCompleted(0);
                progress.setSleepHours(7.5);
                progress.setNotes("Logged via quick weigh-in");
                try {
                    progressDAO.logProgress(progress);
                } catch (Exception ignored) {}

                session.setAttribute("user", liveUser);

                StringBuilder json = new StringBuilder();
                json.append("{");
                json.append("\"success\":true,");
                json.append("\"message\":\"Weight updated successfully!\",");
                json.append("\"weightKg\":").append(newWeight).append(",");
                json.append("\"bmi\":").append(bmi).append(",");
                json.append("\"user\":").append(JsonUtil.userToJson(liveUser));
                json.append("}");

                resp.setStatus(HttpServletResponse.SC_OK);
                out.write(json.toString());
                return;
            }

            // 2. Full Profile Update Route
            String fullName = getParam(req, bodyMap, "fullName", "name", "editName");
            String mobileCountry = getParam(req, bodyMap, "mobileCountry", "countryCode");
            String mobileNumber = getParam(req, bodyMap, "mobileNumber", "mobile", "editMobile");
            String gender = getParam(req, bodyMap, "gender", "editGender");
            String rawAge = getParam(req, bodyMap, "age", "editAge");
            String rawHeight = getParam(req, bodyMap, "heightCm", "height", "editHeight");
            String rawWeight = getParam(req, bodyMap, "weightKg", "weight", "editWeight");
            String rawTargetWeight = getParam(req, bodyMap, "targetWeightKg", "targetWeight");
            String fitnessGoal = getParam(req, bodyMap, "fitnessGoal", "goal", "editFitnessGoal");
            String activityLevel = getParam(req, bodyMap, "activityLevel");
            String gymExperience = getParam(req, bodyMap, "gymExperience");
            String workoutPreference = getParam(req, bodyMap, "workoutPreference");
            String workoutDays = getParam(req, bodyMap, "workoutDays");
            String rawWorkoutDuration = getParam(req, bodyMap, "workoutDurationMin", "workoutDuration");
            String dietPreference = getParam(req, bodyMap, "dietPreference");
            String waterIntake = getParam(req, bodyMap, "waterIntake");
            String sleepHours = getParam(req, bodyMap, "sleepHours");
            String medicalConditions = getParam(req, bodyMap, "medicalConditions");
            String medicalDetails = getParam(req, bodyMap, "medicalDetails");
            String preferredLanguage = getParam(req, bodyMap, "preferredLanguage", "language");
            String avatarUrl = getParam(req, bodyMap, "avatarUrl", "avatar");

            if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
                liveUser.setAvatarUrl(avatarUrl.trim());
            }

            if (fullName != null && !fullName.trim().isEmpty()) {
                liveUser.setFullName(fullName.trim());
            }
            if (mobileCountry != null && !mobileCountry.trim().isEmpty()) {
                liveUser.setMobileCountry(mobileCountry.trim());
            }
            if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
                liveUser.setMobileNumber(mobileNumber.trim());
            }
            if (gender != null && !gender.trim().isEmpty()) {
                liveUser.setGender(gender.trim());
            }
            if (rawAge != null && !rawAge.trim().isEmpty()) {
                try {
                    int age = Integer.parseInt(rawAge.trim());
                    if (age >= 10 && age <= 120) liveUser.setAge(age);
                } catch (NumberFormatException ignored) {}
            }
            if (rawHeight != null && !rawHeight.trim().isEmpty()) {
                try {
                    double height = Double.parseDouble(rawHeight.trim());
                    if (height >= 50 && height <= 250) liveUser.setHeightCm(height);
                } catch (NumberFormatException ignored) {}
            }
            if (rawWeight != null && !rawWeight.trim().isEmpty()) {
                try {
                    double weight = Double.parseDouble(rawWeight.trim());
                    if (weight >= 20 && weight <= 300) liveUser.setWeightKg(weight);
                } catch (NumberFormatException ignored) {}
            }
            if (rawTargetWeight != null && !rawTargetWeight.trim().isEmpty()) {
                try {
                    double tw = Double.parseDouble(rawTargetWeight.trim());
                    liveUser.setTargetWeightKg(tw);
                } catch (NumberFormatException ignored) {}
            }
            if (fitnessGoal != null && !fitnessGoal.trim().isEmpty()) {
                liveUser.setFitnessGoal(fitnessGoal.trim());
            }
            if (activityLevel != null && !activityLevel.trim().isEmpty()) {
                liveUser.setActivityLevel(activityLevel.trim());
            }
            if (gymExperience != null && !gymExperience.trim().isEmpty()) {
                liveUser.setGymExperience(gymExperience.trim());
            }
            if (workoutPreference != null && !workoutPreference.trim().isEmpty()) {
                liveUser.setWorkoutPreference(workoutPreference.trim());
            }
            if (workoutDays != null && !workoutDays.trim().isEmpty()) {
                liveUser.setWorkoutDays(workoutDays.trim());
            }
            if (rawWorkoutDuration != null && !rawWorkoutDuration.trim().isEmpty()) {
                try {
                    liveUser.setWorkoutDurationMin(Integer.parseInt(rawWorkoutDuration.trim()));
                } catch (NumberFormatException ignored) {}
            }
            if (dietPreference != null && !dietPreference.trim().isEmpty()) {
                liveUser.setDietPreference(dietPreference.trim());
            }
            if (waterIntake != null && !waterIntake.trim().isEmpty()) {
                liveUser.setWaterIntake(waterIntake.trim());
            }
            if (sleepHours != null && !sleepHours.trim().isEmpty()) {
                liveUser.setSleepHours(sleepHours.trim());
            }
            if (medicalConditions != null && !medicalConditions.trim().isEmpty()) {
                liveUser.setMedicalConditions(medicalConditions.trim());
            }
            if (medicalDetails != null) {
                liveUser.setMedicalDetails(medicalDetails.trim());
            }
            if (preferredLanguage != null && !preferredLanguage.trim().isEmpty()) {
                liveUser.setPreferredLanguage(preferredLanguage.trim());
            }

            boolean updated = userDAO.updateUserProfile(liveUser);
            if (!updated) {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\":false,\"message\":\"Failed to update profile in database.\"}");
                return;
            }

            // Keep session in sync
            session.setAttribute("user", liveUser);

            // Calculate BMI
            double hm = liveUser.getHeightCm() / 100.0;
            double bmi = (hm > 0) ? Math.round((liveUser.getWeightKg() / (hm * hm)) * 10.0) / 10.0 : 22.0;

            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"success\":true,");
            json.append("\"message\":\"Profile information updated successfully!\",");
            json.append("\"bmi\":").append(bmi).append(",");
            json.append("\"user\":").append(JsonUtil.userToJson(liveUser));
            json.append("}");

            resp.setStatus(HttpServletResponse.SC_OK);
            out.write(json.toString());

        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"Database error: " + JsonUtil.escape(e.getMessage()) + "\"}");
        }
    }

    private String getParam(HttpServletRequest req, Map<String, String> bodyMap, String... keys) {
        if (bodyMap != null) {
            for (String key : keys) {
                if (bodyMap.containsKey(key) && bodyMap.get(key) != null) {
                    return bodyMap.get(key);
                }
            }
        }
        for (String key : keys) {
            String val = req.getParameter(key);
            if (val != null) return val;
        }
        return null;
    }
}
