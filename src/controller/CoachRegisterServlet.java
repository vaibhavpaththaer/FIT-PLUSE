package controller;

import model.Coach;
import service.CoachRegistrationService;
import service.ServiceResult;
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
 * Servlet handling Coach Self-Registration.
 * Mapped to /api/coach/register and /coach/register.
 *
 * Creates both:
 *  - A users row with role='coach' (for authentication)
 *  - A coaches row with account_status='pending' (for professional profile)
 *
 * Coach cannot log in until admin approves (account_status='active').
 */
@WebServlet(name = "CoachRegisterServlet", urlPatterns = {"/api/coach/register", "/coach/register"})
public class CoachRegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private CoachRegistrationService coachRegistrationService;

    @Override
    public void init() throws ServletException {
        super.init();
        this.coachRegistrationService = new CoachRegistrationService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");
        PrintWriter out = response.getWriter();

        // Parse JSON or form params
        String contentType = request.getContentType();
        Map<String, String> params;

        if (contentType != null && contentType.toLowerCase().contains("application/json")) {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = request.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) sb.append(line);
            }
            params = JsonUtil.parseSimpleJson(sb.toString());
        } else {
            params = new java.util.HashMap<>();
            for (String key : request.getParameterMap().keySet()) {
                params.put(key, request.getParameter(key));
            }
        }

        // ─── Build Coach Profile ──────────────────────────────────────────
        Coach coach = new Coach();
        coach.setFullName(getVal(params, "fullName", getVal(params, "name", "")));
        coach.setEmail(getVal(params, "email", ""));
        coach.setBio(getVal(params, "bio", ""));
        coach.setSpecialties(getVal(params, "specialties", getVal(params, "specialization", "")));
        coach.setCertifications(getVal(params, "certifications", getVal(params, "certification", "")));
        coach.setCoachingType(getVal(params, "coachingType", "General Fitness"));

        int experienceYears = 0;
        try { experienceYears = Integer.parseInt(getVal(params, "experienceYears", getVal(params, "experience", "0"))); }
        catch (NumberFormatException ignored) {}
        coach.setExperienceYears(experienceYears);

        String mobile      = getVal(params, "mobileNumber", getVal(params, "mobile", ""));
        String mobileCountry = getVal(params, "mobileCountry", getVal(params, "countryCode", "+91"));
        String password    = getVal(params, "password", "");
        String confirm     = getVal(params, "confirmPassword", password);
        String gender      = getVal(params, "gender", "male");

        int age = 25;
        try { age = Integer.parseInt(getVal(params, "age", "25")); }
        catch (NumberFormatException ignored) {}

        // ─── Call Service ─────────────────────────────────────────────────
        ServiceResult<Coach> result = coachRegistrationService.registerCoach(
                coach, password, confirm, mobile, mobileCountry, gender, age
        );

        if (result.isSuccess()) {
            response.setStatus(HttpServletResponse.SC_CREATED); // 201
            Coach saved = result.getData();
            out.print("{" +
                    "\"success\":true," +
                    "\"message\":\"" + JsonUtil.escape(result.getMessage()) + "\"," +
                    "\"coachId\":" + saved.getId() + "," +
                    "\"email\":\"" + JsonUtil.escape(saved.getEmail()) + "\"," +
                    "\"name\":\"" + JsonUtil.escape(saved.getFullName()) + "\"," +
                    "\"accountStatus\":\"pending\"" +
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
        response.getWriter().print("{\"status\":\"FitPulse Coach Registration API active\",\"method\":\"POST\"}");
    }

    private String getVal(Map<String, String> map, String key, String defaultValue) {
        String v = map.get(key);
        return (v != null && !v.trim().isEmpty()) ? v.trim() : defaultValue;
    }
}
