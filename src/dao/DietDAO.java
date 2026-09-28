package dao;

import model.DietMeal;
import model.DietPlan;
import util.DBConnection;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for DietPlan and DietMeal entities.
 * Handles database operations against `diet_plans`, `diet_meals`, and daily hydration tracking.
 */
public class DietDAO {

    /**
     * Creates a DietPlan with all its meal items in an atomic transaction.
     */
    public int createDietPlanWithMeals(DietPlan plan) throws SQLException {
        String planSql = "INSERT INTO `diet_plans` (" +
                "`coach_id`, `user_id`, `title`, `plan_type`, `target_calories`, " +
                "`protein_g`, `carbs_g`, `fats_g`, `start_date`, `end_date`, `is_active`, `notes`" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        String mealSql = "INSERT INTO `diet_meals` (" +
                "`diet_plan_id`, `meal_type`, `item_name`, `quantity`, `calories`, `protein_g`, `carbs_g`, `fats_g`, `time_slot`, `notes`" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement psPlan = null;
        PreparedStatement psMeal = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // If new plan is active, deactivate previous active plans for this user
            if (plan.isActive()) {
                String deactivateSql = "UPDATE `diet_plans` SET `is_active` = FALSE WHERE `user_id` = ?";
                try (PreparedStatement psDeact = conn.prepareStatement(deactivateSql)) {
                    psDeact.setInt(1, plan.getUserId());
                    psDeact.executeUpdate();
                }
            }

            psPlan = conn.prepareStatement(planSql, Statement.RETURN_GENERATED_KEYS);
            if (plan.getCoachId() != null && plan.getCoachId() > 0) {
                psPlan.setInt(1, plan.getCoachId());
            } else {
                psPlan.setNull(1, Types.INTEGER);
            }
            psPlan.setInt(2, plan.getUserId());
            psPlan.setString(3, plan.getTitle());
            psPlan.setString(4, plan.getPlanType());
            psPlan.setInt(5, plan.getTargetCalories());
            psPlan.setInt(6, plan.getProteinG());
            psPlan.setInt(7, plan.getCarbsG());
            psPlan.setInt(8, plan.getFatsG());
            psPlan.setDate(9, plan.getStartDate() != null ? plan.getStartDate() : new Date(System.currentTimeMillis()));
            psPlan.setDate(10, plan.getEndDate());
            psPlan.setBoolean(11, plan.isActive());
            psPlan.setString(12, plan.getNotes());

            psPlan.executeUpdate();
            rs = psPlan.getGeneratedKeys();
            int planId = -1;
            if (rs.next()) {
                planId = rs.getInt(1);
                plan.setId(planId);
            } else {
                conn.rollback();
                return -1;
            }

            if (plan.getMeals() != null && !plan.getMeals().isEmpty()) {
                psMeal = conn.prepareStatement(mealSql);
                for (DietMeal meal : plan.getMeals()) {
                    psMeal.setInt(1, planId);
                    psMeal.setString(2, meal.getMealType() != null ? meal.getMealType().toLowerCase() : "snack");
                    psMeal.setString(3, meal.getItemName());
                    psMeal.setString(4, meal.getQuantity() != null ? meal.getQuantity() : "1 serving");
                    psMeal.setInt(5, meal.getCalories());
                    psMeal.setInt(6, meal.getProteinG());
                    psMeal.setInt(7, meal.getCarbsG());
                    psMeal.setInt(8, meal.getFatsG());
                    psMeal.setString(9, meal.getTimeSlot());
                    psMeal.setString(10, meal.getNotes());
                    psMeal.addBatch();
                }
                psMeal.executeBatch();
            }

            conn.commit();
            return planId;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            DBConnection.close(rs, psMeal, psPlan, conn);
        }
    }

    /**
     * Retrieves the current active diet plan for a user, including all meals.
     */
    public DietPlan getActiveDietPlanByUserId(int userId) throws SQLException {
        String sql = "SELECT * FROM `diet_plans` WHERE `user_id` = ? AND `is_active` = TRUE ORDER BY `id` DESC LIMIT 1";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            if (rs.next()) {
                DietPlan plan = mapResultSetToDietPlan(rs);
                plan.setMeals(getMealsForPlan(conn, plan.getId()));
                return plan;
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves a diet plan by ID with all its meals.
     */
    public DietPlan getDietPlanById(int planId) throws SQLException {
        String sql = "SELECT * FROM `diet_plans` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, planId);
            rs = ps.executeQuery();
            if (rs.next()) {
                DietPlan plan = mapResultSetToDietPlan(rs);
                plan.setMeals(getMealsForPlan(conn, planId));
                return plan;
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves all diet plans (history) for a user ordered by ID descending.
     */
    public List<DietPlan> getDietPlansByUserId(int userId) throws SQLException {
        String sql = "SELECT * FROM `diet_plans` WHERE `user_id` = ? ORDER BY `id` DESC";
        List<DietPlan> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            while (rs.next()) {
                DietPlan plan = mapResultSetToDietPlan(rs);
                plan.setMeals(getMealsForPlan(conn, plan.getId()));
                list.add(plan);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves all diet plans assigned/created by a coach.
     */
    public List<DietPlan> getDietPlansByCoachId(int coachId) throws SQLException {
        String sql = "SELECT * FROM `diet_plans` WHERE `coach_id` = ? ORDER BY `id` DESC";
        List<DietPlan> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, coachId);
            rs = ps.executeQuery();
            while (rs.next()) {
                DietPlan plan = mapResultSetToDietPlan(rs);
                plan.setMeals(getMealsForPlan(conn, plan.getId()));
                list.add(plan);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Updates an existing DietPlan header properties.
     */
    public boolean updateDietPlan(DietPlan plan) throws SQLException {
        String sql = "UPDATE `diet_plans` SET `title` = ?, `plan_type` = ?, `target_calories` = ?, " +
                "`protein_g` = ?, `carbs_g` = ?, `fats_g` = ?, `start_date` = ?, `end_date` = ?, `is_active` = ?, `notes` = ? " +
                "WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, plan.getTitle());
            ps.setString(2, plan.getPlanType());
            ps.setInt(3, plan.getTargetCalories());
            ps.setInt(4, plan.getProteinG());
            ps.setInt(5, plan.getCarbsG());
            ps.setInt(6, plan.getFatsG());
            ps.setDate(7, plan.getStartDate());
            ps.setDate(8, plan.getEndDate());
            ps.setBoolean(9, plan.isActive());
            ps.setString(10, plan.getNotes());
            ps.setInt(11, plan.getId());

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(null, ps, conn);
        }
    }

    /**
     * Activates a specific plan and deactivates all other plans for the user.
     */
    public boolean activateDietPlan(int planId, int userId) throws SQLException {
        String deactSql = "UPDATE `diet_plans` SET `is_active` = FALSE WHERE `user_id` = ?";
        String actSql = "UPDATE `diet_plans` SET `is_active` = TRUE WHERE `id` = ? AND `user_id` = ?";
        Connection conn = null;
        PreparedStatement psDeact = null;
        PreparedStatement psAct = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            psDeact = conn.prepareStatement(deactSql);
            psDeact.setInt(1, userId);
            psDeact.executeUpdate();

            psAct = conn.prepareStatement(actSql);
            psAct.setInt(1, planId);
            psAct.setInt(2, userId);
            int affected = psAct.executeUpdate();

            conn.commit();
            return affected > 0;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            DBConnection.close(null, psAct, conn);
            DBConnection.close(null, psDeact, null);
        }
    }

    /**
     * Deletes a diet plan by ID.
     */
    public boolean deleteDietPlan(int planId) throws SQLException {
        String sql = "DELETE FROM `diet_plans` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, planId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(null, ps, conn);
        }
    }

    /**
     * Retrieves an individual meal item by its ID.
     */
    public DietMeal getDietMealById(int mealId) throws SQLException {
        String sql = "SELECT * FROM `diet_meals` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, mealId);
            rs = ps.executeQuery();
            if (rs.next()) {
                DietMeal m = new DietMeal();
                m.setId(rs.getInt("id"));
                m.setDietPlanId(rs.getInt("diet_plan_id"));
                m.setMealType(rs.getString("meal_type"));
                m.setItemName(rs.getString("item_name"));
                m.setQuantity(rs.getString("quantity"));
                m.setCalories(rs.getInt("calories"));
                m.setProteinG(rs.getInt("protein_g"));
                m.setCarbsG(rs.getInt("carbs_g"));
                m.setFatsG(rs.getInt("fats_g"));
                m.setTimeSlot(rs.getString("time_slot"));
                m.setNotes(rs.getString("notes"));
                return m;
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Adds an individual meal to an existing diet plan.
     */
    public int addMeal(DietMeal meal) throws SQLException {
        String sql = "INSERT INTO `diet_meals` (`diet_plan_id`, `meal_type`, `item_name`, `quantity`, `calories`, `protein_g`, `carbs_g`, `fats_g`, `time_slot`, `notes`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, meal.getDietPlanId());
            ps.setString(2, meal.getMealType() != null ? meal.getMealType().toLowerCase() : "snack");
            ps.setString(3, meal.getItemName());
            ps.setString(4, meal.getQuantity() != null ? meal.getQuantity() : "1 serving");
            ps.setInt(5, meal.getCalories());
            ps.setInt(6, meal.getProteinG());
            ps.setInt(7, meal.getCarbsG());
            ps.setInt(8, meal.getFatsG());
            ps.setString(9, meal.getTimeSlot());
            ps.setString(10, meal.getNotes());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int genId = rs.getInt(1);
                    meal.setId(genId);
                    return genId;
                }
            }
            return -1;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Updates an existing meal item in `diet_meals`.
     */
    public boolean updateDietMeal(DietMeal meal) throws SQLException {
        String sql = "UPDATE `diet_meals` SET `meal_type` = ?, `item_name` = ?, `quantity` = ?, " +
                "`calories` = ?, `protein_g` = ?, `carbs_g` = ?, `fats_g` = ?, `time_slot` = ?, `notes` = ? " +
                "WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, meal.getMealType() != null ? meal.getMealType().toLowerCase() : "snack");
            ps.setString(2, meal.getItemName());
            ps.setString(3, meal.getQuantity() != null ? meal.getQuantity() : "1 serving");
            ps.setInt(4, meal.getCalories());
            ps.setInt(5, meal.getProteinG());
            ps.setInt(6, meal.getCarbsG());
            ps.setInt(7, meal.getFatsG());
            ps.setString(8, meal.getTimeSlot());
            ps.setString(9, meal.getNotes());
            ps.setInt(10, meal.getId());

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(null, ps, conn);
        }
    }

    /**
     * Deletes a meal by ID.
     */
    public boolean deleteMeal(int mealId) throws SQLException {
        String sql = "DELETE FROM `diet_meals` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, mealId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(null, ps, conn);
        }
    }

    /**
     * Updates or inserts daily water intake in the `progress` table for a user.
     */
    public boolean logWaterIntake(int userId, Date date, double waterLiters) throws SQLException {
        String checkSql = "SELECT `id`, `water_liters` FROM `progress` WHERE `user_id` = ? AND `record_date` = ?";
        String updateSql = "UPDATE `progress` SET `water_liters` = ? WHERE `user_id` = ? AND `record_date` = ?";
        String insertSql = "INSERT INTO `progress` (`user_id`, `record_date`, `weight_kg`, `bmi`, `water_liters`) VALUES (?, ?, 70.0, 22.5, ?)";

        Connection conn = null;
        PreparedStatement psCheck = null;
        PreparedStatement psUpd = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            psCheck = conn.prepareStatement(checkSql);
            psCheck.setInt(1, userId);
            psCheck.setDate(2, date);
            rs = psCheck.executeQuery();

            if (rs.next()) {
                psUpd = conn.prepareStatement(updateSql);
                psUpd.setDouble(1, waterLiters);
                psUpd.setInt(2, userId);
                psUpd.setDate(3, date);
                return psUpd.executeUpdate() > 0;
            } else {
                psUpd = conn.prepareStatement(insertSql);
                psUpd.setInt(1, userId);
                psUpd.setDate(2, date);
                psUpd.setDouble(3, waterLiters);
                return psUpd.executeUpdate() > 0;
            }
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception ignored) {}
            if (psCheck != null) try { psCheck.close(); } catch (Exception ignored) {}
            if (psUpd != null) try { psUpd.close(); } catch (Exception ignored) {}
            if (conn != null) try { conn.close(); } catch (Exception ignored) {}
        }
    }

    /**
     * Retrieves today's logged water intake from the `progress` table.
     */
    public double getWaterIntake(int userId, Date date) throws SQLException {
        String sql = "SELECT `water_liters` FROM `progress` WHERE `user_id` = ? AND `record_date` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setDate(2, date);
            rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getDouble("water_liters");
            }
            return 0.0;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Helper to load meals for a plan using an existing connection.
     */
    private List<DietMeal> getMealsForPlan(Connection conn, int planId) throws SQLException {
        String sql = "SELECT * FROM `diet_meals` WHERE `diet_plan_id` = ? ORDER BY `id` ASC";
        List<DietMeal> list = new ArrayList<>();
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            ps = conn.prepareStatement(sql);
            ps.setInt(1, planId);
            rs = ps.executeQuery();
            while (rs.next()) {
                DietMeal m = new DietMeal();
                m.setId(rs.getInt("id"));
                m.setDietPlanId(rs.getInt("diet_plan_id"));
                m.setMealType(rs.getString("meal_type"));
                m.setItemName(rs.getString("item_name"));
                m.setQuantity(rs.getString("quantity"));
                m.setCalories(rs.getInt("calories"));
                m.setProteinG(rs.getInt("protein_g"));
                m.setCarbsG(rs.getInt("carbs_g"));
                m.setFatsG(rs.getInt("fats_g"));
                m.setTimeSlot(rs.getString("time_slot"));
                m.setNotes(rs.getString("notes"));
                list.add(m);
            }
            return list;
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception ignored) {}
            if (ps != null) try { ps.close(); } catch (Exception ignored) {}
        }
    }

    /**
     * Maps ResultSet to DietPlan entity.
     */
    private DietPlan mapResultSetToDietPlan(ResultSet rs) throws SQLException {
        DietPlan p = new DietPlan();
        p.setId(rs.getInt("id"));
        int coachId = rs.getInt("coach_id");
        if (!rs.wasNull()) {
            p.setCoachId(coachId);
        }
        p.setUserId(rs.getInt("user_id"));
        p.setTitle(rs.getString("title"));
        p.setPlanType(rs.getString("plan_type"));
        p.setTargetCalories(rs.getInt("target_calories"));
        p.setProteinG(rs.getInt("protein_g"));
        p.setCarbsG(rs.getInt("carbs_g"));
        p.setFatsG(rs.getInt("fats_g"));
        p.setStartDate(rs.getDate("start_date"));
        p.setEndDate(rs.getDate("end_date"));
        p.setActive(rs.getBoolean("is_active"));
        p.setNotes(rs.getString("notes"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        return p;
    }
}
