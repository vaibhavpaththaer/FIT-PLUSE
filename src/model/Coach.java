package model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Entity representing a Certified Fitness Coach in the FitPulse platform.
 * Maps to the `coaches` MySQL table.
 */
public class Coach implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private String fullName;
    private String email;
    private String phone;
    private String bio;
    private String specialties;
    private int experienceYears;
    private double rating = 5.0;
    private String avatarUrl;
    private boolean isActive = true;
    private String accountStatus = "pending"; // pending | active | rejected
    private Timestamp createdAt;
    private int activeClientsCount = 0;

    // Registration-specific helper fields (not separate DB columns — stored via specialties/bio)
    private String certifications;
    private String coachingType;

    public Coach() {}

    public Coach(int id, String fullName, String email, String specialties, int experienceYears, double rating) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.specialties = specialties;
        this.experienceYears = experienceYears;
        this.rating = rating;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getSpecialties() { return specialties; }
    public void setSpecialties(String specialties) { this.specialties = specialties; }

    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public int getActiveClientsCount() { return activeClientsCount; }
    public void setActiveClientsCount(int activeClientsCount) { this.activeClientsCount = activeClientsCount; }

    public String getCertifications() { return certifications; }
    public void setCertifications(String certifications) { this.certifications = certifications; }

    public String getCoachingType() { return coachingType; }
    public void setCoachingType(String coachingType) { this.coachingType = coachingType; }
}
