package model;

import java.io.Serializable;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Entity representing a User in the FitPulse platform.
 * Maps to the `users` MySQL table.
 */
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private String fullName;
    private String email;
    private String mobileCountry = "+91";
    private String mobileNumber;
    private String passwordHash;
    private String passwordSalt;
    private String gender = "male";
    private int age;
    private double heightCm;
    private double weightKg;
    private Double targetWeightKg;
    private String fitnessGoal = "muscle";
    private String activityLevel = "moderate";
    private String gymExperience = "intermediate";
    private String workoutPreference = "gym";
    private String workoutDays = "4-5";
    private int workoutDurationMin = 45;
    private String dietPreference = "non-vegetarian";
    private String waterIntake = "2-3L";
    private String sleepHours = "6-8";
    private String medicalConditions = "no";
    private String medicalDetails;
    private String avatarUrl;
    private String role = "user";
    private Integer assignedCoachId;
    private String assignedCoachName;
    private int streakDays = 0;
    private int totalWorkouts = 0;
    private int totalCaloriesBurned = 0;
    private String memberSince = new SimpleDateFormat("MMM yyyy", Locale.ENGLISH).format(new Date());
    private String preferredLanguage = "en";
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public User() {}

    public User(int id, String fullName, String email, String mobileNumber) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.mobileNumber = mobileNumber;
    }

    /**
     * Calculates BMI = weight (kg) / [height (m)]^2
     */
    public double getCalculatedBMI() {
        if (heightCm <= 0) return 0.0;
        double heightM = heightCm / 100.0;
        double bmi = weightKg / (heightM * heightM);
        return Math.round(bmi * 100.0) / 100.0;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobileCountry() { return mobileCountry; }
    public void setMobileCountry(String mobileCountry) { this.mobileCountry = mobileCountry; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getPasswordSalt() { return passwordSalt; }
    public void setPasswordSalt(String passwordSalt) { this.passwordSalt = passwordSalt; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public double getHeightCm() { return heightCm; }
    public void setHeightCm(double heightCm) { this.heightCm = heightCm; }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }

    public Double getTargetWeightKg() { return targetWeightKg; }
    public void setTargetWeightKg(Double targetWeightKg) { this.targetWeightKg = targetWeightKg; }

    public String getFitnessGoal() { return fitnessGoal; }
    public void setFitnessGoal(String fitnessGoal) { this.fitnessGoal = fitnessGoal; }

    public String getActivityLevel() { return activityLevel; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }

    public String getGymExperience() { return gymExperience; }
    public void setGymExperience(String gymExperience) { this.gymExperience = gymExperience; }

    public String getWorkoutPreference() { return workoutPreference; }
    public void setWorkoutPreference(String workoutPreference) { this.workoutPreference = workoutPreference; }

    public String getWorkoutDays() { return workoutDays; }
    public void setWorkoutDays(String workoutDays) { this.workoutDays = workoutDays; }

    public int getWorkoutDurationMin() { return workoutDurationMin; }
    public void setWorkoutDurationMin(int workoutDurationMin) { this.workoutDurationMin = workoutDurationMin; }

    public String getDietPreference() { return dietPreference; }
    public void setDietPreference(String dietPreference) { this.dietPreference = dietPreference; }

    public String getWaterIntake() { return waterIntake; }
    public void setWaterIntake(String waterIntake) { this.waterIntake = waterIntake; }

    public String getSleepHours() { return sleepHours; }
    public void setSleepHours(String sleepHours) { this.sleepHours = sleepHours; }

    public String getMedicalConditions() { return medicalConditions; }
    public void setMedicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; }

    public String getMedicalDetails() { return medicalDetails; }
    public void setMedicalDetails(String medicalDetails) { this.medicalDetails = medicalDetails; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getAssignedCoachId() { return assignedCoachId; }
    public void setAssignedCoachId(Integer assignedCoachId) { this.assignedCoachId = assignedCoachId; }

    public String getAssignedCoachName() { return assignedCoachName; }
    public void setAssignedCoachName(String assignedCoachName) { this.assignedCoachName = assignedCoachName; }

    public int getStreakDays() { return streakDays; }
    public void setStreakDays(int streakDays) { this.streakDays = streakDays; }

    public int getTotalWorkouts() { return totalWorkouts; }
    public void setTotalWorkouts(int totalWorkouts) { this.totalWorkouts = totalWorkouts; }

    public int getTotalCaloriesBurned() { return totalCaloriesBurned; }
    public void setTotalCaloriesBurned(int totalCaloriesBurned) { this.totalCaloriesBurned = totalCaloriesBurned; }

    public String getMemberSince() { return memberSince; }
    public void setMemberSince(String memberSince) { this.memberSince = memberSince; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
