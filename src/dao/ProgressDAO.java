package dao;

import model.Progress;
import model.User;
import util.DBConnection;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

/**
 * Data Access Object for Progress tracking records.
 * Handles database operations against the `progress` table.
 */
public class ProgressDAO {

    /**
     * Inserts or updates (on duplicate date) a daily progress log.
     */
    public boolean logProgress(Progress p) throws SQLException {
        String sql = "INSERT INTO `progress` (" +
                "`user_id`, `record_date`, `weight_kg`, `bmi`, `body_fat_pct`, " +
                "`muscle_mass_kg`, `calories_burned`, `steps`, `water_liters`, " +
                "`workouts_completed`, `sleep_hours`, `notes`" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "`weight_kg` = VALUES(`weight_kg`), " +
                "`bmi` = VALUES(`bmi`), " +
                "`body_fat_pct` = VALUES(`body_fat_pct`), " +
                "`muscle_mass_kg` = VALUES(`muscle_mass_kg`), " +
                "`calories_burned` = VALUES(`calories_burned`), " +
                "`steps` = VALUES(`steps`), " +
                "`water_liters` = VALUES(`water_liters`), " +
                "`workouts_completed` = VALUES(`workouts_completed`), " +
                "`sleep_hours` = VALUES(`sleep_hours`), " +
                "`notes` = VALUES(`notes`), " +
                "`recorded_at` = CURRENT_TIMESTAMP";

        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);

            ps.setInt(1, p.getUserId());
            ps.setDate(2, p.getRecordDate());
            ps.setDouble(3, p.getWeightKg());
            ps.setDouble(4, p.getBmi());

            if (p.getBodyFatPct() != null) {
                ps.setDouble(5, p.getBodyFatPct());
            } else {
                ps.setNull(5, Types.DOUBLE);
            }

            if (p.getMuscleMassKg() != null) {
                ps.setDouble(6, p.getMuscleMassKg());
            } else {
                ps.setNull(6, Types.DOUBLE);
            }

            ps.setInt(7, p.getCaloriesBurned());
            ps.setInt(8, p.getSteps());
            ps.setDouble(9, p.getWaterLiters());
            ps.setInt(10, p.getWorkoutsCompleted());
            ps.setDouble(11, p.getSleepHours());
            ps.setString(12, p.getNotes());

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Retrieves progress history for the past N days, ordered chronologically ascending (for chart plotting).
     */
    public List<Progress> getProgressHistory(int userId, int limitDays) throws SQLException {
        String sql = "SELECT * FROM `progress` WHERE `user_id` = ? " +
                "ORDER BY `record_date` DESC LIMIT ?";
        List<Progress> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setInt(2, limitDays > 0 ? limitDays : 30);
            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(0, mapResultSetToProgress(rs)); // prepend to preserve ascending order for charts
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves progress history between two specific dates (inclusive), ordered ascending.
     */
    public List<Progress> getProgressDateRange(int userId, Date startDate, Date endDate) throws SQLException {
        String sql = "SELECT * FROM `progress` WHERE `user_id` = ? " +
                "AND `record_date` >= ? AND `record_date` <= ? " +
                "ORDER BY `record_date` ASC";
        List<Progress> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setDate(2, startDate);
            ps.setDate(3, endDate);
            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToProgress(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves all recorded progress entries for a user, ordered newest first.
     */
    public List<Progress> getAllProgressHistory(int userId) throws SQLException {
        String sql = "SELECT * FROM `progress` WHERE `user_id` = ? ORDER BY `record_date` DESC";
        List<Progress> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToProgress(rs));
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves a progress entry for a specific date.
     */
    public Progress getProgressByDate(int userId, Date date) throws SQLException {
        String sql = "SELECT * FROM `progress` WHERE `user_id` = ? AND `record_date` = ?";
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
                return mapResultSetToProgress(rs);
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves the most recently recorded progress entry for a user.
     */
    public Progress getLatestProgress(int userId) throws SQLException {
        String sql = "SELECT * FROM `progress` WHERE `user_id` = ? ORDER BY `record_date` DESC LIMIT 1";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToProgress(rs);
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Deletes a progress entry for a user on a given date.
     */
    public boolean deleteProgress(int userId, Date date) throws SQLException {
        String sql = "DELETE FROM `progress` WHERE `user_id` = ? AND `record_date` = ?";
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setDate(2, date);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Ensures an active progress history baseline exists for a user if they have no records.
     * Generates a realistic 7-day initial progression matching their weight and height.
     */
    public void ensureInitialProgressIfEmpty(User user) throws SQLException {
        if (user == null) return;
        Progress latest = getLatestProgress(user.getId());
        if (latest != null) return; // already has data

        double baseWeight = user.getWeightKg() > 0 ? user.getWeightKg() : 72.0;
        double height = user.getHeightCm() > 0 ? user.getHeightCm() : 175.0;
        double hM = height / 100.0;

        Calendar cal = Calendar.getInstance();
        for (int i = 6; i >= 0; i--) {
            Calendar day = (Calendar) cal.clone();
            day.add(Calendar.DAY_OF_MONTH, -i);
            Date recDate = new Date(day.getTimeInMillis());

            double wtDelta = (i * 0.12);
            double dayWeight = Math.round((baseWeight + (user.getFitnessGoal() != null && user.getFitnessGoal().contains("loss") ? wtDelta : -wtDelta)) * 10.0) / 10.0;
            double dayBmi = Math.round((dayWeight / (hM * hM)) * 10.0) / 10.0;

            Progress p = new Progress();
            p.setUserId(user.getId());
            p.setRecordDate(recDate);
            p.setWeightKg(dayWeight);
            p.setBmi(dayBmi);
            p.setBodyFatPct(Math.round((14.5 + (i * 0.05)) * 10.0) / 10.0);
            p.setMuscleMassKg(Math.round((dayWeight * 0.8) * 10.0) / 10.0);
            p.setCaloriesBurned(1700 + ((6 - i) * 60) + (i % 2 == 0 ? 150 : 0));
            p.setSteps(8000 + ((6 - i) * 300) + (i % 2 == 0 ? 800 : 0));
            p.setWaterLiters(2.5 + (i % 2 == 0 ? 0.5 : 0.2));
            p.setWorkoutsCompleted(i == 0 ? 0 : (i % 4 == 0 ? 0 : 1));
            p.setSleepHours(7.0 + (i % 2 == 0 ? 0.5 : 0.2));
            p.setNotes(i == 0 ? "Today's dynamic progress log" : "Completed daily fitness and nutrition targets");

            logProgress(p);
        }
    }

    /**
     * Maps ResultSet to Progress entity.
     */
    private Progress mapResultSetToProgress(ResultSet rs) throws SQLException {
        Progress p = new Progress();
        p.setId(rs.getInt("id"));
        p.setUserId(rs.getInt("user_id"));
        p.setRecordDate(rs.getDate("record_date"));
        p.setWeightKg(rs.getDouble("weight_kg"));
        p.setBmi(rs.getDouble("bmi"));

        double fat = rs.getDouble("body_fat_pct");
        if (!rs.wasNull()) {
            p.setBodyFatPct(fat);
        }

        double muscle = rs.getDouble("muscle_mass_kg");
        if (!rs.wasNull()) {
            p.setMuscleMassKg(muscle);
        }

        p.setCaloriesBurned(rs.getInt("calories_burned"));
        p.setSteps(rs.getInt("steps"));
        p.setWaterLiters(rs.getDouble("water_liters"));
        p.setWorkoutsCompleted(rs.getInt("workouts_completed"));
        p.setSleepHours(rs.getDouble("sleep_hours"));
        p.setNotes(rs.getString("notes"));
        p.setRecordedAt(rs.getTimestamp("recorded_at"));

        return p;
    }
}
