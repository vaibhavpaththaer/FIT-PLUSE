package model;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;

/**
 * Entity representing a Daily/Periodic Biometric & Activity Progress entry.
 * Maps to the `progress` MySQL table.
 */
public class Progress implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private int userId;
    private Date recordDate;
    private double weightKg;
    private double bmi;
    private Double bodyFatPct;
    private Double muscleMassKg;
    private int caloriesBurned = 0;
    private int steps = 0;
    private double waterLiters = 0.0;
    private int workoutsCompleted = 0;
    private double sleepHours = 0.0;
    private String notes;
    private Timestamp recordedAt;

    public Progress() {}

    public Progress(int userId, Date recordDate, double weightKg, double bmi) {
        this.userId = userId;
        this.recordDate = recordDate;
        this.weightKg = weightKg;
        this.bmi = bmi;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public Date getRecordDate() { return recordDate; }
    public void setRecordDate(Date recordDate) { this.recordDate = recordDate; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public double getBmi() { return bmi; }
    public void setBmi(double bmi) { this.bmi = bmi; }

    public Double getBodyFatPct() { return bodyFatPct; }
    public void setBodyFatPct(Double bodyFatPct) { this.bodyFatPct = bodyFatPct; }

    public Double getMuscleMassKg() { return muscleMassKg; }
    public void setMuscleMassKg(Double muscleMassKg) { this.muscleMassKg = muscleMassKg; }

    public int getCaloriesBurned() { return caloriesBurned; }
    public void setCaloriesBurned(int caloriesBurned) { this.caloriesBurned = caloriesBurned; }

    public int getSteps() { return steps; }
    public void setSteps(int steps) { this.steps = steps; }

    public double getWaterLiters() { return waterLiters; }
    public void setWaterLiters(double waterLiters) { this.waterLiters = waterLiters; }

    public int getWorkoutsCompleted() { return workoutsCompleted; }
    public void setWorkoutsCompleted(int workoutsCompleted) { this.workoutsCompleted = workoutsCompleted; }

    public double getSleepHours() { return sleepHours; }
    public void setSleepHours(double sleepHours) { this.sleepHours = sleepHours; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Timestamp getRecordedAt() { return recordedAt; }
    public void setRecordedAt(Timestamp recordedAt) { this.recordedAt = recordedAt; }
}
