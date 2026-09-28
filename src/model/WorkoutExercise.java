package model;

import java.io.Serializable;

/**
 * Entity representing an Exercise within a Workout session.
 * Maps to the `workout_exercises` MySQL table.
 */
public class WorkoutExercise implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private int workoutId;
    private String exerciseName;
    private int sets = 3;
    private int reps = 10;
    private double weightKg = 0.0;
    private int restSec = 60;
    private int orderIdx = 1;
    private String notes;

    public WorkoutExercise() {}

    public WorkoutExercise(int workoutId, String exerciseName, int sets, int reps, double weightKg, int restSec, int orderIdx) {
        this.workoutId = workoutId;
        this.exerciseName = exerciseName;
        this.sets = sets;
        this.reps = reps;
        this.weightKg = weightKg;
        this.restSec = restSec;
        this.orderIdx = orderIdx;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getWorkoutId() { return workoutId; }
    public void setWorkoutId(int workoutId) { this.workoutId = workoutId; }

    public String getExerciseName() { return exerciseName; }
    public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }

    public int getSets() { return sets; }
    public void setSets(int sets) { this.sets = sets; }

    public int getReps() { return reps; }
    public void setReps(int reps) { this.reps = reps; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public int getRestSec() { return restSec; }
    public void setRestSec(int restSec) { this.restSec = restSec; }

    public int getOrderIdx() { return orderIdx; }
    public void setOrderIdx(int orderIdx) { this.orderIdx = orderIdx; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
