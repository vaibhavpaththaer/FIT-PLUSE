package controller;

import dao.MealDAO;
import model.Meal;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet(name = "DietPlanServlet", urlPatterns = {"/api/diet/meals", "/api/diet/random"})
public class DietPlanServlet extends HttpServlet {

    private final MealDAO mealDAO = new MealDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();
        
        String path = req.getRequestURI();
        String category = req.getParameter("category");
        String pref = req.getParameter("pref");
        
        if (category == null || pref == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\":false,\"message\":\"Missing category or pref\"}");
            return;
        }

        try {
            if (path.endsWith("/api/diet/meals")) {
                List<Meal> meals = mealDAO.getMealsByCategory(category, pref);
                out.write("{\"success\":true,\"data\":" + buildJsonArray(meals) + "}");
            } else if (path.endsWith("/api/diet/random")) {
                Meal meal = mealDAO.getRandomMealByCategory(category, pref);
                if (meal != null) {
                    out.write("{\"success\":true,\"data\":" + buildJson(meal) + "}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"success\":false,\"message\":\"No meal found\"}");
                }
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"success\":false,\"message\":\"Endpoint not found\"}");
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\":false,\"message\":\"" + e.getMessage() + "\"}");
        }
    }

    private String buildJsonArray(List<Meal> meals) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < meals.size(); i++) {
            sb.append(buildJson(meals.get(i)));
            if (i < meals.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private String buildJson(Meal meal) {
        if (meal == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"id\":").append(meal.getId()).append(",");
        sb.append("\"mealName\":\"").append(escapeJson(meal.getMealName())).append("\",");
        sb.append("\"mealCategory\":\"").append(escapeJson(meal.getMealCategory())).append("\",");
        sb.append("\"foodPreference\":\"").append(escapeJson(meal.getFoodPreference())).append("\",");
        sb.append("\"fitnessGoal\":\"").append(escapeJson(meal.getFitnessGoal())).append("\",");
        sb.append("\"calories\":").append(meal.getCalories()).append(",");
        sb.append("\"protein\":").append(meal.getProtein()).append(",");
        sb.append("\"carbs\":").append(meal.getCarbs()).append(",");
        sb.append("\"fats\":").append(meal.getFats()).append(",");
        sb.append("\"fiber\":").append(meal.getFiber()).append(",");
        sb.append("\"prepTime\":").append(meal.getPrepTime()).append(",");
        sb.append("\"servingSize\":\"").append(escapeJson(meal.getServingSize())).append("\"");
        sb.append("}");
        return sb.toString();
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
