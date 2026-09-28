package util;

import model.Coach;
import model.DietMeal;
import model.DietPlan;
import model.Message;
import model.Notification;
import model.Progress;
import model.Report;
import model.User;
import model.Workout;
import model.WorkoutExercise;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lightweight JSON utility for serialization and deserialization
 * without external library dependencies.
 */
public class JsonUtil {

    private static final Pattern KEY_VALUE_PATTERN = Pattern.compile(
            "\"([^\"]+)\"\\s*:\\s*(\"(?:[^\\\\\"]++|\\\\.)*+\"|true|false|null|-?\\d+(?:\\.\\d+)?)"
    );

    /**
     * Parses a simple flat JSON object string into a key-value Map.
     */
    public static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) return map;

        Matcher matcher = KEY_VALUE_PATTERN.matcher(json);
        while (matcher.find()) {
            String key = matcher.group(1);
            String rawVal = matcher.group(2);
            String cleanVal;
            if (rawVal.startsWith("\"") && rawVal.endsWith("\"")) {
                cleanVal = rawVal.substring(1, rawVal.length() - 1)
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\")
                        .replace("\\n", "\n")
                        .replace("\\r", "\r")
                        .replace("\\t", "\t");
            } else if ("null".equals(rawVal)) {
                cleanVal = null;
            } else {
                cleanVal = rawVal;
            }
            map.put(key, cleanVal);
        }
        return map;
    }

    /**
     * Escapes a string for safe JSON embedding.
     */
    public static String escape(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (c < 32) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }

    /**
     * Serializes a User model to JSON string (excluding password hash/salt).
     */
    public static String userToJson(User u) {
        if (u == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(u.getId()).append(",");
        sb.append("\"fullName\":\"").append(escape(u.getFullName())).append("\",");
        sb.append("\"email\":\"").append(escape(u.getEmail())).append("\",");
        sb.append("\"mobileCountry\":\"").append(escape(u.getMobileCountry())).append("\",");
        sb.append("\"mobileNumber\":\"").append(escape(u.getMobileNumber())).append("\",");
        sb.append("\"gender\":\"").append(escape(u.getGender())).append("\",");
        sb.append("\"age\":").append(u.getAge()).append(",");
        sb.append("\"heightCm\":").append(u.getHeightCm()).append(",");
        sb.append("\"weightKg\":").append(u.getWeightKg()).append(",");
        sb.append("\"targetWeightKg\":").append(u.getTargetWeightKg() != null ? u.getTargetWeightKg() : "null").append(",");
        sb.append("\"fitnessGoal\":\"").append(escape(u.getFitnessGoal())).append("\",");
        sb.append("\"activityLevel\":\"").append(escape(u.getActivityLevel())).append("\",");
        sb.append("\"gymExperience\":\"").append(escape(u.getGymExperience())).append("\",");
        sb.append("\"workoutPreference\":\"").append(escape(u.getWorkoutPreference())).append("\",");
        sb.append("\"workoutDays\":\"").append(escape(u.getWorkoutDays())).append("\",");
        sb.append("\"workoutDurationMin\":").append(u.getWorkoutDurationMin()).append(",");
        sb.append("\"dietPreference\":\"").append(escape(u.getDietPreference())).append("\",");
        sb.append("\"waterIntake\":\"").append(escape(u.getWaterIntake())).append("\",");
        sb.append("\"sleepHours\":\"").append(escape(u.getSleepHours())).append("\",");
        sb.append("\"medicalConditions\":\"").append(escape(u.getMedicalConditions())).append("\",");
        sb.append("\"medicalDetails\":\"").append(escape(u.getMedicalDetails())).append("\",");
        sb.append("\"avatarUrl\":\"").append(escape(u.getAvatarUrl())).append("\",");
        sb.append("\"role\":\"").append(escape(u.getRole())).append("\",");
        sb.append("\"assignedCoachId\":").append(u.getAssignedCoachId() != null ? u.getAssignedCoachId() : "null").append(",");
        sb.append("\"streakDays\":").append(u.getStreakDays()).append(",");
        sb.append("\"totalWorkouts\":").append(u.getTotalWorkouts()).append(",");
        sb.append("\"totalCaloriesBurned\":").append(u.getTotalCaloriesBurned()).append(",");
        sb.append("\"memberSince\":\"").append(escape(u.getMemberSince())).append("\",");
        sb.append("\"preferredLanguage\":\"").append(escape(u.getPreferredLanguage())).append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes a Progress entry to JSON string.
     */
    public static String progressToJson(Progress p) {
        if (p == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(p.getId()).append(",");
        sb.append("\"userId\":").append(p.getUserId()).append(",");
        sb.append("\"recordDate\":\"").append(p.getRecordDate() != null ? p.getRecordDate().toString() : "").append("\",");
        sb.append("\"weightKg\":").append(p.getWeightKg()).append(",");
        sb.append("\"bmi\":").append(p.getBmi()).append(",");
        sb.append("\"bodyFatPct\":").append(p.getBodyFatPct() != null ? p.getBodyFatPct() : "null").append(",");
        sb.append("\"muscleMassKg\":").append(p.getMuscleMassKg() != null ? p.getMuscleMassKg() : "null").append(",");
        sb.append("\"caloriesBurned\":").append(p.getCaloriesBurned()).append(",");
        sb.append("\"steps\":").append(p.getSteps()).append(",");
        sb.append("\"waterLiters\":").append(p.getWaterLiters()).append(",");
        sb.append("\"workoutsCompleted\":").append(p.getWorkoutsCompleted()).append(",");
        sb.append("\"sleepHours\":").append(p.getSleepHours()).append(",");
        sb.append("\"notes\":\"").append(escape(p.getNotes())).append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes a list of Progress entries to a JSON array string.
     */
    public static String progressListToJson(List<Progress> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(progressToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes WorkoutExercise to JSON.
     */
    public static String exerciseToJson(WorkoutExercise ex) {
        if (ex == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(ex.getId()).append(",");
        sb.append("\"workoutId\":").append(ex.getWorkoutId()).append(",");
        sb.append("\"exerciseName\":\"").append(escape(ex.getExerciseName())).append("\",");
        sb.append("\"sets\":").append(ex.getSets()).append(",");
        sb.append("\"reps\":").append(ex.getReps()).append(",");
        sb.append("\"weightKg\":").append(ex.getWeightKg()).append(",");
        sb.append("\"restSec\":").append(ex.getRestSec()).append(",");
        sb.append("\"orderIdx\":").append(ex.getOrderIdx()).append(",");
        sb.append("\"notes\":\"").append(escape(ex.getNotes())).append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes Workout to JSON.
     */
    public static String workoutToJson(Workout w) {
        if (w == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(w.getId()).append(",");
        sb.append("\"coachId\":").append(w.getCoachId() != null ? w.getCoachId() : "null").append(",");
        sb.append("\"userId\":").append(w.getUserId()).append(",");
        sb.append("\"title\":\"").append(escape(w.getTitle())).append("\",");
        sb.append("\"category\":\"").append(escape(w.getCategory())).append("\",");
        sb.append("\"targetMuscle\":\"").append(escape(w.getTargetMuscle())).append("\",");
        sb.append("\"difficulty\":\"").append(escape(w.getDifficulty())).append("\",");
        sb.append("\"durationMin\":").append(w.getDurationMin()).append(",");
        sb.append("\"caloriesBurned\":").append(w.getCaloriesBurned()).append(",");
        sb.append("\"scheduledDate\":\"").append(w.getScheduledDate() != null ? w.getScheduledDate().toString() : "").append("\",");
        sb.append("\"scheduledTime\":\"").append(escape(w.getScheduledTime())).append("\",");
        sb.append("\"isCompleted\":").append(w.isCompleted()).append(",");
        sb.append("\"notes\":\"").append(escape(w.getNotes())).append("\",");
        sb.append("\"exercises\":[");
        if (w.getExercises() != null) {
            for (int i = 0; i < w.getExercises().size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(exerciseToJson(w.getExercises().get(i)));
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    /**
     * Serializes list of workouts to JSON array.
     */
    public static String workoutListToJson(List<Workout> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(workoutToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes list of WorkoutExercise to JSON array.
     */
    public static String exerciseListToJson(List<WorkoutExercise> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(exerciseToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes DietMeal to JSON.
     */
    public static String dietMealToJson(DietMeal m) {
        if (m == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(m.getId()).append(",");
        sb.append("\"dietPlanId\":").append(m.getDietPlanId()).append(",");
        sb.append("\"mealType\":\"").append(escape(m.getMealType())).append("\",");
        sb.append("\"itemName\":\"").append(escape(m.getItemName())).append("\",");
        sb.append("\"quantity\":\"").append(escape(m.getQuantity())).append("\",");
        sb.append("\"calories\":").append(m.getCalories()).append(",");
        sb.append("\"proteinG\":").append(m.getProteinG()).append(",");
        sb.append("\"carbsG\":").append(m.getCarbsG()).append(",");
        sb.append("\"fatsG\":").append(m.getFatsG()).append(",");
        sb.append("\"timeSlot\":\"").append(escape(m.getTimeSlot())).append("\",");
        sb.append("\"notes\":\"").append(escape(m.getNotes())).append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes DietPlan to JSON.
     */
    public static String dietPlanToJson(DietPlan dp) {
        if (dp == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(dp.getId()).append(",");
        sb.append("\"coachId\":").append(dp.getCoachId() != null ? dp.getCoachId() : "null").append(",");
        sb.append("\"userId\":").append(dp.getUserId()).append(",");
        sb.append("\"title\":\"").append(escape(dp.getTitle())).append("\",");
        sb.append("\"planType\":\"").append(escape(dp.getPlanType())).append("\",");
        sb.append("\"targetCalories\":").append(dp.getTargetCalories()).append(",");
        sb.append("\"proteinG\":").append(dp.getProteinG()).append(",");
        sb.append("\"carbsG\":").append(dp.getCarbsG()).append(",");
        sb.append("\"fatsG\":").append(dp.getFatsG()).append(",");
        sb.append("\"startDate\":\"").append(dp.getStartDate() != null ? dp.getStartDate().toString() : "").append("\",");
        sb.append("\"endDate\":\"").append(dp.getEndDate() != null ? dp.getEndDate().toString() : "").append("\",");
        sb.append("\"isActive\":").append(dp.isActive()).append(",");
        sb.append("\"notes\":\"").append(escape(dp.getNotes())).append("\",");
        sb.append("\"meals\":[");
        if (dp.getMeals() != null) {
            for (int i = 0; i < dp.getMeals().size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(dietMealToJson(dp.getMeals().get(i)));
            }
        }
        sb.append("]}");
        return sb.toString();
    }

    /**
     * Serializes a list of DietMeal objects to a JSON array.
     */
    public static String dietMealListToJson(List<DietMeal> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(dietMealToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes a list of DietPlan objects to a JSON array.
     */
    public static String dietPlanListToJson(List<DietPlan> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(dietPlanToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes Notification to JSON.
     */
    public static String notificationToJson(Notification n) {
        if (n == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(n.getId()).append(",");
        sb.append("\"userId\":").append(n.getUserId()).append(",");
        sb.append("\"title\":\"").append(escape(n.getTitle())).append("\",");
        sb.append("\"message\":\"").append(escape(n.getMessage())).append("\",");
        sb.append("\"notifType\":\"").append(escape(n.getNotifType())).append("\",");
        sb.append("\"isRead\":").append(n.isRead()).append(",");
        sb.append("\"targetUrl\":\"").append(escape(n.getTargetUrl())).append("\",");
        sb.append("\"createdAt\":\"").append(n.getCreatedAt() != null ? n.getCreatedAt().toString() : "").append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes list of notifications to JSON array.
     */
    public static String notificationListToJson(List<Notification> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(notificationToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes Coach to JSON.
     */
    public static String coachToJson(Coach c) {
        if (c == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(c.getId()).append(",");
        sb.append("\"fullName\":\"").append(escape(c.getFullName())).append("\",");
        sb.append("\"email\":\"").append(escape(c.getEmail())).append("\",");
        sb.append("\"phone\":\"").append(escape(c.getPhone())).append("\",");
        sb.append("\"bio\":\"").append(escape(c.getBio())).append("\",");
        sb.append("\"specialties\":\"").append(escape(c.getSpecialties())).append("\",");
        sb.append("\"experienceYears\":").append(c.getExperienceYears()).append(",");
        sb.append("\"rating\":").append(c.getRating()).append(",");
        sb.append("\"avatarUrl\":\"").append(escape(c.getAvatarUrl())).append("\",");
        sb.append("\"isActive\":").append(c.isActive()).append(",");
        sb.append("\"accountStatus\":\"").append(escape(c.getAccountStatus())).append("\",");
        sb.append("\"activeClientsCount\":").append(c.getActiveClientsCount());
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes a list of Coach objects to a JSON array.
     */
    public static String coachListToJson(List<Coach> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(coachToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes a Message object to JSON.
     */
    public static String messageToJson(Message m) {
        if (m == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(m.getId()).append(",");
        sb.append("\"senderId\":").append(m.getSenderId()).append(",");
        sb.append("\"senderType\":\"").append(escape(m.getSenderType())).append("\",");
        sb.append("\"receiverId\":").append(m.getReceiverId()).append(",");
        sb.append("\"receiverType\":\"").append(escape(m.getReceiverType())).append("\",");
        sb.append("\"messageText\":\"").append(escape(m.getMessageText())).append("\",");
        sb.append("\"isRead\":").append(m.isRead()).append(",");
        sb.append("\"sentAt\":\"").append(m.getSentAt() != null ? m.getSentAt().toString() : "").append("\",");
        sb.append("\"senderName\":\"").append(escape(m.getSenderName())).append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes a list of Message objects to a JSON array.
     */
    public static String messageListToJson(List<Message> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(messageToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes a list of User objects to a JSON array.
     */
    public static String userListToJson(List<User> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(userToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes a Report object to JSON.
     */
    public static String reportToJson(Report r) {
        if (r == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        sb.append("\"id\":").append(r.getId()).append(",");
        sb.append("\"userId\":").append(r.getUserId()).append(",");
        sb.append("\"reportType\":\"").append(escape(r.getReportType())).append("\",");
        sb.append("\"dateRangeStart\":\"").append(r.getDateRangeStart() != null ? r.getDateRangeStart().toString() : "").append("\",");
        sb.append("\"dateRangeEnd\":\"").append(r.getDateRangeEnd() != null ? r.getDateRangeEnd().toString() : "").append("\",");
        sb.append("\"summaryJson\":").append(r.getSummaryJson() != null && !r.getSummaryJson().trim().isEmpty() ? r.getSummaryJson() : "{}").append(",");
        sb.append("\"generatedAt\":\"").append(r.getGeneratedAt() != null ? r.getGeneratedAt().toString() : "").append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes a list of Report objects to a JSON array.
     */
    public static String reportListToJson(List<Report> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(reportToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Generic Map to JSON serializer for Admin data structures.
     */

    public static String mapToJson(Map<String, ?> map) {
        if (map == null) return "null";
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, ?> entry : map.entrySet()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("\"").append(escape(entry.getKey())).append("\":");
            sb.append(valueToJson(entry.getValue()));
        }
        sb.append("}");
        return sb.toString();
    }

    /**
     * Serializes a List of Maps to JSON array.
     */
    public static String mapListToJson(List<? extends Map<String, ?>> list) {
        if (list == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(mapToJson(list.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Serializes any arbitrary value or nested collection to valid JSON.
     */
    @SuppressWarnings("unchecked")
    public static String valueToJson(Object val) {
        if (val == null) {
            return "null";
        } else if (val instanceof String) {
            return "\"" + escape((String) val) + "\"";
        } else if (val instanceof Number || val instanceof Boolean) {
            return val.toString();
        } else if (val instanceof Map) {
            return mapToJson((Map<String, ?>) val);
        } else if (val instanceof List) {
            List<?> list = (List<?>) val;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(valueToJson(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        } else if (val instanceof User) {
            return userToJson((User) val);
        } else if (val instanceof Coach) {
            return coachToJson((Coach) val);
        } else if (val instanceof Workout) {
            return workoutToJson((Workout) val);
        } else if (val instanceof DietPlan) {
            return dietPlanToJson((DietPlan) val);
        } else if (val instanceof Progress) {
            return progressToJson((Progress) val);
        } else if (val instanceof Notification) {
            return notificationToJson((Notification) val);
        } else if (val instanceof Report) {
            return reportToJson((Report) val);
        } else {
            return "\"" + escape(val.toString()) + "\"";
        }
    }

    /**
     * General convenience serializer for any object or map.
     */
    public static String toJson(Object val) {
        return valueToJson(val);
    }
}

