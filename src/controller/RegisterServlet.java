package controller;

import model.User;
import service.ServiceResult;
import service.UserService;
import util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

/**
 * Controller handling User Registration requests.
 * Mapped to /api/register and /register.
 */
@WebServlet(name = "RegisterServlet", urlPatterns = {"/api/register", "/register", "/api/auth/register"})
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private UserService userService;

    @Override
    public void init() throws ServletException {
        super.init();
        this.userService = new UserService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();

        String contentType = request.getContentType();
        Map<String, String> params;

        // Parse either JSON body or URL-encoded form parameters
        if (contentType != null && contentType.toLowerCase().contains("application/json")) {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            params = JsonUtil.parseSimpleJson(sb.toString());
        } else {
            params = new java.util.HashMap<>();
            for (String key : request.getParameterMap().keySet()) {
                params.put(key, request.getParameter(key));
            }
        }

        // Extract and populate User entity
        User user = new User();

        // 1. Personal Details
        String name = getVal(params, "fullName", getVal(params, "name", ""));
        user.setFullName(name);
        user.setGender(getVal(params, "gender", "male"));

        try {
            user.setAge(Integer.parseInt(getVal(params, "age", "25")));
        } catch (NumberFormatException e) {
            user.setAge(25);
        }

        try {
            user.setHeightCm(Double.parseDouble(getVal(params, "heightCm", getVal(params, "height", "175"))));
        } catch (NumberFormatException e) {
            user.setHeightCm(175.0);
        }

        try {
            user.setWeightKg(Double.parseDouble(getVal(params, "weightKg", getVal(params, "weight", "70"))));
        } catch (NumberFormatException e) {
            user.setWeightKg(70.0);
        }

        // 2. Account & Security
        user.setMobileCountry(getVal(params, "mobileCountry", getVal(params, "countryCode", "+91")));
        user.setMobileNumber(getVal(params, "mobileNumber", getVal(params, "mobile", "")));
        user.setEmail(getVal(params, "email", ""));

        String password = getVal(params, "password", "");
        String confirmPassword = getVal(params, "confirmPassword", password);

        // 3. Lifestyle & Habits
        user.setGymExperience(getVal(params, "gymExperience", getVal(params, "gymExp", "intermediate")));
        user.setWorkoutPreference(getVal(params, "workoutPreference", getVal(params, "workoutPref", "gym")));
        user.setWorkoutDays(getVal(params, "workoutDays", "4-5"));

        try {
            user.setWorkoutDurationMin(Integer.parseInt(getVal(params, "workoutDurationMin", getVal(params, "workoutDuration", "45")).replaceAll("[^0-9]", "")));
        } catch (Exception e) {
            user.setWorkoutDurationMin(45);
        }

        user.setDietPreference(getVal(params, "dietPreference", getVal(params, "diet", "non-vegetarian")));
        user.setWaterIntake(getVal(params, "waterIntake", getVal(params, "water", "2-3L")));
        user.setSleepHours(getVal(params, "sleepHours", getVal(params, "sleep", "6-8")));

        // 4. Goals & Medical
        user.setFitnessGoal(getVal(params, "fitnessGoal", "muscle"));
        user.setMedicalConditions(getVal(params, "medicalConditions", getVal(params, "medical", "no")));
        user.setMedicalDetails(getVal(params, "medicalDetails", ""));
        user.setPreferredLanguage(getVal(params, "preferredLanguage", "en"));
        user.setAvatarUrl(getVal(params, "avatarUrl", getVal(params, "avatar_url", "")));

        // Execute registration via service layer
        ServiceResult<User> result = userService.registerUser(user, password, confirmPassword);

        if (result.isSuccess()) {
            response.setStatus(HttpServletResponse.SC_CREATED);
            User saved = result.getData();
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"," +
                    "\"userId\":" + saved.getId() + "," +
                    "\"email\":\"" + JsonUtil.escape(saved.getEmail()) + "\"," +
                    "\"name\":\"" + JsonUtil.escape(saved.getFullName()) + "\"" +
                    "}");
        } else {
            int statusCode = result.getErrorCode() > 0 ? result.getErrorCode() : HttpServletResponse.SC_BAD_REQUEST;
            response.setStatus(statusCode);
            out.print("{" +
                    "\"success\":false," +
                    "\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"" +
                    "}");
        }
        out.flush();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json; charset=UTF-8");
        response.getWriter().print("{\"status\":\"FitPulse Registration API active\",\"method\":\"POST\"}");
    }

    private String getVal(Map<String, String> map, String key, String defaultValue) {
        String v = map.get(key);
        return (v != null && !v.trim().isEmpty()) ? v.trim() : defaultValue;
    }
}
