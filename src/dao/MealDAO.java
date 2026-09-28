package dao;

import model.Meal;
import util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class MealDAO {

    private Meal mapResultSetToMeal(ResultSet rs) throws SQLException {
        Meal meal = new Meal();
        meal.setId(rs.getInt("id"));
        meal.setMealName(rs.getString("meal_name"));
        meal.setMealCategory(rs.getString("meal_category"));
        meal.setFoodPreference(rs.getString("food_preference"));
        meal.setFitnessGoal(rs.getString("fitness_goal"));
        meal.setCalories(rs.getInt("calories"));
        meal.setProtein(rs.getDouble("protein"));
        meal.setCarbs(rs.getDouble("carbs"));
        meal.setFats(rs.getDouble("fats"));
        meal.setFiber(rs.getDouble("fiber"));
        meal.setPrepTime(rs.getInt("prep_time"));
        meal.setServingSize(rs.getString("serving_size"));
        return meal;
    }

    public List<Meal> getMealsByCategory(String category, String foodPreference) {
        List<Meal> meals = new ArrayList<>();
        String sql;
        if ("mixed".equalsIgnoreCase(foodPreference)) {
            sql = "SELECT * FROM meals WHERE meal_category = ? AND food_preference IN ('vegetarian', 'non-vegetarian', 'mixed')";
        } else {
            sql = "SELECT * FROM meals WHERE meal_category = ? AND food_preference = ?";
        }

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, category);
            if (!"mixed".equalsIgnoreCase(foodPreference)) {
                pstmt.setString(2, foodPreference);
            }
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    meals.add(mapResultSetToMeal(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return meals;
    }

    public Meal getRandomMealByCategory(String category, String foodPreference) {
        Meal meal = null;
        String sql;
        if ("mixed".equalsIgnoreCase(foodPreference)) {
            sql = "SELECT * FROM meals WHERE meal_category = ? AND food_preference IN ('vegetarian', 'non-vegetarian', 'mixed') ORDER BY RAND() LIMIT 1";
        } else {
            sql = "SELECT * FROM meals WHERE meal_category = ? AND food_preference = ? ORDER BY RAND() LIMIT 1";
        }

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, category);
            if (!"mixed".equalsIgnoreCase(foodPreference)) {
                pstmt.setString(2, foodPreference);
            }
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    meal = mapResultSetToMeal(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return meal;
    }

    public Meal getMealById(int id) {
        Meal meal = null;
        String sql = "SELECT * FROM meals WHERE id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    meal = mapResultSetToMeal(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return meal;
    }
}
