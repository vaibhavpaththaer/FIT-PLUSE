package model;

import java.io.Serializable;

/**
 * Entity representing an individual meal item in a Diet Plan.
 * Maps to the `diet_meals` MySQL table.
 */
public class DietMeal implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private int dietPlanId;
    private String mealType; // 'breakfast', 'lunch', 'dinner', 'snack'
    private String itemName;
    private String quantity;
    private int calories;
    private int proteinG = 0;
    private int carbsG = 0;
    private int fatsG = 0;
    private String timeSlot;
    private String notes;

    public DietMeal() {}

    public DietMeal(int dietPlanId, String mealType, String itemName, String quantity, int calories, int proteinG, int carbsG, int fatsG) {
        this.dietPlanId = dietPlanId;
        this.mealType = mealType;
        this.itemName = itemName;
        this.quantity = quantity;
        this.calories = calories;
        this.proteinG = proteinG;
        this.carbsG = carbsG;
        this.fatsG = fatsG;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getDietPlanId() { return dietPlanId; }
    public void setDietPlanId(int dietPlanId) { this.dietPlanId = dietPlanId; }

    public String getMealType() { return mealType; }
    public void setMealType(String mealType) { this.mealType = mealType; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }

    public int getCalories() { return calories; }
    public void setCalories(int calories) { this.calories = calories; }

    public int getProteinG() { return proteinG; }
    public void setProteinG(int proteinG) { this.proteinG = proteinG; }

    public int getCarbsG() { return carbsG; }
    public void setCarbsG(int carbsG) { this.carbsG = carbsG; }

    public int getFatsG() { return fatsG; }
    public void setFatsG(int fatsG) { this.fatsG = fatsG; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
