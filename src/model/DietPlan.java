package model;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a Diet & Nutrition Plan.
 * Maps to the `diet_plans` MySQL table.
 */
public class DietPlan implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private Integer coachId;
    private int userId;
    private String title;
    private String planType = "High Protein & Lean Mass";
    private int targetCalories = 2200;
    private int proteinG = 160;
    private int carbsG = 220;
    private int fatsG = 65;
    private Date startDate;
    private Date endDate;
    private boolean isActive = true;
    private String notes;
    private Timestamp createdAt;

    // Associated list of meals (composite)
    private List<DietMeal> meals = new ArrayList<>();

    public DietPlan() {}

    public DietPlan(int id, int userId, String title, int targetCalories, Date startDate) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.targetCalories = targetCalories;
        this.startDate = startDate;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Integer getCoachId() { return coachId; }
    public void setCoachId(Integer coachId) { this.coachId = coachId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) { this.planType = planType; }

    public int getTargetCalories() { return targetCalories; }
    public void setTargetCalories(int targetCalories) { this.targetCalories = targetCalories; }

    public int getProteinG() { return proteinG; }
    public void setProteinG(int proteinG) { this.proteinG = proteinG; }

    public int getCarbsG() { return carbsG; }
    public void setCarbsG(int carbsG) { this.carbsG = carbsG; }

    public int getFatsG() { return fatsG; }
    public void setFatsG(int fatsG) { this.fatsG = fatsG; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public List<DietMeal> getMeals() { return meals; }
    public void setMeals(List<DietMeal> meals) { this.meals = meals; }

    public void addMeal(DietMeal meal) {
        if (this.meals == null) {
            this.meals = new ArrayList<>();
        }
        this.meals.add(meal);
    }
}
