package dao;

import model.Workout;
import model.WorkoutExercise;
import util.DBConnection;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Workout and WorkoutExercise entities.
 * Handles database operations against `workouts` and `workout_exercises` tables.
 */
public class WorkoutDAO {

    /**
     * Creates a workout along with all its child exercises in a single atomic transaction.
     */
    public int createWorkoutWithExercises(Workout workout) throws SQLException {
        String workoutSql = "INSERT INTO `workouts` (" +
                "`coach_id`, `user_id`, `title`, `category`, `target_muscle`, " +
                "`difficulty`, `duration_min`, `calories_burned`, `scheduled_date`, " +
                "`scheduled_time`, `is_completed`, `notes`" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        String exerciseSql = "INSERT INTO `workout_exercises` (" +
                "`workout_id`, `exercise_name`, `sets`, `reps`, `weight_kg`, `rest_sec`, `order_idx`, `notes`" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement psWorkout = null;
        PreparedStatement psEx = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            psWorkout = conn.prepareStatement(workoutSql, Statement.RETURN_GENERATED_KEYS);
            if (workout.getCoachId() != null && workout.getCoachId() > 0) {
                psWorkout.setInt(1, workout.getCoachId());
            } else {
                psWorkout.setNull(1, Types.INTEGER);
            }
            psWorkout.setInt(2, workout.getUserId());
            psWorkout.setString(3, workout.getTitle());
            psWorkout.setString(4, workout.getCategory());
            psWorkout.setString(5, workout.getTargetMuscle());
            psWorkout.setString(6, workout.getDifficulty() != null ? workout.getDifficulty() : "intermediate");
            psWorkout.setInt(7, workout.getDurationMin());
            psWorkout.setInt(8, workout.getCaloriesBurned());
            psWorkout.setDate(9, workout.getScheduledDate());
            psWorkout.setString(10, workout.getScheduledTime() != null ? workout.getScheduledTime() : "18:00");
            psWorkout.setBoolean(11, workout.isCompleted());
            psWorkout.setString(12, workout.getNotes());

            psWorkout.executeUpdate();
            rs = psWorkout.getGeneratedKeys();
            int workoutId = -1;
            if (rs.next()) {
                workoutId = rs.getInt(1);
                workout.setId(workoutId);
            } else {
                conn.rollback();
                return -1;
            }

            if (workout.getExercises() != null && !workout.getExercises().isEmpty()) {
                psEx = conn.prepareStatement(exerciseSql);
                int order = 1;
                for (WorkoutExercise ex : workout.getExercises()) {
                    psEx.setInt(1, workoutId);
                    psEx.setString(2, ex.getExerciseName());
                    psEx.setInt(3, ex.getSets());
                    psEx.setInt(4, ex.getReps());
                    psEx.setDouble(5, ex.getWeightKg());
                    psEx.setInt(6, ex.getRestSec());
                    psEx.setInt(7, ex.getOrderIdx() > 0 ? ex.getOrderIdx() : order++);
                    psEx.setString(8, ex.getNotes());
                    psEx.addBatch();
                }
                psEx.executeBatch();
            }

            conn.commit();
            return workoutId;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            DBConnection.close(rs, psEx, psWorkout, conn);
        }
    }

    /**
     * Retrieves a workout with all its exercises by workout ID.
     */
    public Workout getWorkoutById(int workoutId) throws SQLException {
        String sql = "SELECT * FROM `workouts` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, workoutId);
            rs = ps.executeQuery();
            if (rs.next()) {
                Workout w = mapResultSetToWorkout(rs);
                w.setExercises(getExercisesForWorkout(conn, workoutId));
                return w;
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves all workouts for a user ordered by scheduled date descending.
     */
    public List<Workout> getWorkoutsByUserId(int userId) throws SQLException {
        String sql = "SELECT * FROM `workouts` WHERE `user_id` = ? ORDER BY `scheduled_date` DESC, `id` DESC";
        List<Workout> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            while (rs.next()) {
                Workout w = mapResultSetToWorkout(rs);
                w.setExercises(getExercisesForWorkout(conn, w.getId()));
                list.add(w);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves the scheduled workout for a user on a given date.
     */
    public Workout getWorkoutByDate(int userId, Date date) throws SQLException {
        String sql = "SELECT * FROM `workouts` WHERE `user_id` = ? AND `scheduled_date` = ? ORDER BY `id` DESC LIMIT 1";
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
                Workout w = mapResultSetToWorkout(rs);
                w.setExercises(getExercisesForWorkout(conn, w.getId()));
                return w;
            }
            return null;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Marks a workout as completed or incomplete.
     */
    public boolean updateWorkoutCompletion(int workoutId, boolean isCompleted, int caloriesBurned) throws SQLException {
        String sql = "UPDATE `workouts` SET `is_completed` = ?, `completed_at` = ?, `calories_burned` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setBoolean(1, isCompleted);
            if (isCompleted) {
                ps.setTimestamp(2, new Timestamp(System.currentTimeMillis()));
            } else {
                ps.setNull(2, Types.TIMESTAMP);
            }
            ps.setInt(3, caloriesBurned);
            ps.setInt(4, workoutId);

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Atomically marks a workout as completed, updates workout duration and calories,
     * increments the user's total workouts, total calories burned, and streak count,
     * and logs/updates the daily progress metrics entry in the `progress` table.
     */
    public boolean completeWorkout(int workoutId, int userId, int caloriesBurned, int durationMin) throws SQLException {
        String updateWorkoutSql = "UPDATE `workouts` SET `is_completed` = TRUE, " +
                "`completed_at` = CURRENT_TIMESTAMP, `calories_burned` = ?, `duration_min` = ? " +
                "WHERE `id` = ? AND `user_id` = ?";

        String updateUserSql = "UPDATE `users` SET " +
                "`total_workouts` = `total_workouts` + 1, " +
                "`total_calories_burned` = `total_calories_burned` + ?, " +
                "`streak_days` = `streak_days` + 1 " +
                "WHERE `id` = ?";

        String checkProgressSql = "SELECT `id` FROM `progress` WHERE `user_id` = ? AND `record_date` = CURRENT_DATE()";
        String updateProgressSql = "UPDATE `progress` SET " +
                "`workouts_completed` = `workouts_completed` + 1, " +
                "`calories_burned` = `calories_burned` + ? " +
                "WHERE `user_id` = ? AND `record_date` = CURRENT_DATE()";
        String insertProgressSql = "INSERT INTO `progress` (`user_id`, `record_date`, `calories_burned`, `workouts_completed`, `weight_kg`, `bmi`) " +
                "SELECT `id`, CURRENT_DATE(), ?, 1, `weight_kg`, " +
                "ROUND(`weight_kg` / ((`height_cm`/100.0)*(`height_cm`/100.0)), 2) " +
                "FROM `users` WHERE `id` = ?";

        Connection conn = null;
        PreparedStatement psWorkout = null;
        PreparedStatement psUser = null;
        PreparedStatement psCheckProg = null;
        PreparedStatement psUpdateProg = null;
        PreparedStatement psInsertProg = null;
        ResultSet rsProg = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Update Workout Status
            psWorkout = conn.prepareStatement(updateWorkoutSql);
            psWorkout.setInt(1, caloriesBurned);
            psWorkout.setInt(2, durationMin);
            psWorkout.setInt(3, workoutId);
            psWorkout.setInt(4, userId);
            int workoutRows = psWorkout.executeUpdate();
            if (workoutRows <= 0) {
                conn.rollback();
                return false;
            }

            // 2. Update User Aggregates
            psUser = conn.prepareStatement(updateUserSql);
            psUser.setInt(1, caloriesBurned);
            psUser.setInt(2, userId);
            psUser.executeUpdate();

            // 3. Update or Insert Today's Daily Progress Log
            psCheckProg = conn.prepareStatement(checkProgressSql);
            psCheckProg.setInt(1, userId);
            rsProg = psCheckProg.executeQuery();

            if (rsProg.next()) {
                psUpdateProg = conn.prepareStatement(updateProgressSql);
                psUpdateProg.setInt(1, caloriesBurned);
                psUpdateProg.setInt(2, userId);
                psUpdateProg.executeUpdate();
            } else {
                psInsertProg = conn.prepareStatement(insertProgressSql);
                psInsertProg.setInt(1, caloriesBurned);
                psInsertProg.setInt(2, userId);
                psInsertProg.executeUpdate();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            DBConnection.close(rsProg, psInsertProg, psUpdateProg, psCheckProg, psUser, psWorkout, conn);
        }
    }

    /**
     * Atomically updates a workout's header metadata and all child exercises.
     */
    public boolean updateWorkoutWithExercises(Workout workout) throws SQLException {
        String updateWorkoutSql = "UPDATE `workouts` SET " +
                "`title` = ?, `category` = ?, `target_muscle` = ?, `difficulty` = ?, " +
                "`duration_min` = ?, `calories_burned` = ?, `scheduled_date` = ?, " +
                "`scheduled_time` = ?, `is_completed` = ?, `notes` = ? " +
                "WHERE `id` = ?";

        String deleteOldExSql = "DELETE FROM `workout_exercises` WHERE `workout_id` = ?";
        String insertExSql = "INSERT INTO `workout_exercises` (" +
                "`workout_id`, `exercise_name`, `sets`, `reps`, `weight_kg`, `rest_sec`, `order_idx`, `notes`" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        Connection conn = null;
        PreparedStatement psWorkout = null;
        PreparedStatement psDelEx = null;
        PreparedStatement psInsEx = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            psWorkout = conn.prepareStatement(updateWorkoutSql);
            psWorkout.setString(1, workout.getTitle());
            psWorkout.setString(2, workout.getCategory());
            psWorkout.setString(3, workout.getTargetMuscle());
            psWorkout.setString(4, workout.getDifficulty() != null ? workout.getDifficulty() : "intermediate");
            psWorkout.setInt(5, workout.getDurationMin());
            psWorkout.setInt(6, workout.getCaloriesBurned());
            psWorkout.setDate(7, workout.getScheduledDate());
            psWorkout.setString(8, workout.getScheduledTime() != null ? workout.getScheduledTime() : "18:00");
            psWorkout.setBoolean(9, workout.isCompleted());
            psWorkout.setString(10, workout.getNotes());
            psWorkout.setInt(11, workout.getId());

            int affected = psWorkout.executeUpdate();
            if (affected <= 0) {
                conn.rollback();
                return false;
            }

            // Replace child exercises if specified
            if (workout.getExercises() != null) {
                psDelEx = conn.prepareStatement(deleteOldExSql);
                psDelEx.setInt(1, workout.getId());
                psDelEx.executeUpdate();

                if (!workout.getExercises().isEmpty()) {
                    psInsEx = conn.prepareStatement(insertExSql);
                    int order = 1;
                    for (WorkoutExercise ex : workout.getExercises()) {
                        psInsEx.setInt(1, workout.getId());
                        psInsEx.setString(2, ex.getExerciseName());
                        psInsEx.setInt(3, ex.getSets());
                        psInsEx.setInt(4, ex.getReps());
                        psInsEx.setDouble(5, ex.getWeightKg());
                        psInsEx.setInt(6, ex.getRestSec());
                        psInsEx.setInt(7, ex.getOrderIdx() > 0 ? ex.getOrderIdx() : order++);
                        psInsEx.setString(8, ex.getNotes());
                        psInsEx.addBatch();
                    }
                    psInsEx.executeBatch();
                }
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            throw e;
        } finally {
            DBConnection.close(null, psInsEx, psDelEx, psWorkout, conn);
        }
    }

    /**
     * Retrieves all workouts created or assigned by a coach.
     */
    public List<Workout> getWorkoutsByCoachId(int coachId) throws SQLException {
        String sql = "SELECT * FROM `workouts` WHERE `coach_id` = ? ORDER BY `scheduled_date` DESC, `id` DESC";
        List<Workout> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, coachId);
            rs = ps.executeQuery();
            while (rs.next()) {
                Workout w = mapResultSetToWorkout(rs);
                w.setExercises(getExercisesForWorkout(conn, w.getId()));
                list.add(w);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves completed workouts for a user (history).
     */
    public List<Workout> getCompletedWorkoutsByUserId(int userId) throws SQLException {
        String sql = "SELECT * FROM `workouts` WHERE `user_id` = ? AND `is_completed` = TRUE ORDER BY `scheduled_date` DESC, `id` DESC";
        List<Workout> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            while (rs.next()) {
                Workout w = mapResultSetToWorkout(rs);
                w.setExercises(getExercisesForWorkout(conn, w.getId()));
                list.add(w);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves pending/upcoming workouts for a user.
     */
    public List<Workout> getPendingWorkoutsByUserId(int userId) throws SQLException {
        String sql = "SELECT * FROM `workouts` WHERE `user_id` = ? AND `is_completed` = FALSE ORDER BY `scheduled_date` ASC, `id` ASC";
        List<Workout> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            rs = ps.executeQuery();
            while (rs.next()) {
                Workout w = mapResultSetToWorkout(rs);
                w.setExercises(getExercisesForWorkout(conn, w.getId()));
                list.add(w);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Retrieves the most recent completed workouts for history preview.
     */
    public List<Workout> getRecentWorkoutHistory(int userId, int limit) throws SQLException {
        String sql = "SELECT * FROM `workouts` WHERE `user_id` = ? AND `is_completed` = TRUE ORDER BY `scheduled_date` DESC, `id` DESC LIMIT ?";
        List<Workout> list = new ArrayList<>();
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, userId);
            ps.setInt(2, limit > 0 ? limit : 10);
            rs = ps.executeQuery();
            while (rs.next()) {
                Workout w = mapResultSetToWorkout(rs);
                w.setExercises(getExercisesForWorkout(conn, w.getId()));
                list.add(w);
            }
            return list;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Verifies if a workout belongs to a given user.
     */
    public boolean isWorkoutOwnedByUser(int workoutId, int userId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM `workouts` WHERE `id` = ? AND `user_id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, workoutId);
            ps.setInt(2, userId);
            rs = ps.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Verifies if a workout was assigned/created by a given coach.
     */
    public boolean isWorkoutOwnedByCoach(int workoutId, int coachId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM `workouts` WHERE `id` = ? AND `coach_id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, workoutId);
            ps.setInt(2, coachId);
            rs = ps.executeQuery();
            return rs.next() && rs.getInt(1) > 0;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Updates an individual exercise.
     */
    public boolean updateExercise(WorkoutExercise ex) throws SQLException {
        String sql = "UPDATE `workout_exercises` SET `exercise_name` = ?, `sets` = ?, `reps` = ?, `weight_kg` = ?, `rest_sec` = ?, `order_idx` = ?, `notes` = ? WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setString(1, ex.getExerciseName());
            ps.setInt(2, ex.getSets());
            ps.setInt(3, ex.getReps());
            ps.setDouble(4, ex.getWeightKg());
            ps.setInt(5, ex.getRestSec());
            ps.setInt(6, ex.getOrderIdx());
            ps.setString(7, ex.getNotes());
            ps.setInt(8, ex.getId());

            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Deletes an individual exercise.
     */
    public boolean deleteExercise(int exerciseId) throws SQLException {
        String sql = "DELETE FROM `workout_exercises` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, exerciseId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Adds an individual exercise to an existing workout.
     */
    public int addExercise(WorkoutExercise ex) throws SQLException {
        String sql = "INSERT INTO `workout_exercises` (`workout_id`, `exercise_name`, `sets`, `reps`, `weight_kg`, `rest_sec`, `order_idx`, `notes`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, ex.getWorkoutId());
            ps.setString(2, ex.getExerciseName());
            ps.setInt(3, ex.getSets());
            ps.setInt(4, ex.getReps());
            ps.setDouble(5, ex.getWeightKg());
            ps.setInt(6, ex.getRestSec());
            ps.setInt(7, ex.getOrderIdx());
            ps.setString(8, ex.getNotes());

            int affected = ps.executeUpdate();
            if (affected > 0) {
                rs = ps.getGeneratedKeys();
                if (rs.next()) {
                    int genId = rs.getInt(1);
                    ex.setId(genId);
                    return genId;
                }
            }
            return -1;
        } finally {
            DBConnection.close(rs, ps, conn);
        }
    }

    /**
     * Deletes a workout by ID (cascades to exercises).
     */
    public boolean deleteWorkout(int workoutId) throws SQLException {
        String sql = "DELETE FROM `workouts` WHERE `id` = ?";
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            ps = conn.prepareStatement(sql);
            ps.setInt(1, workoutId);
            return ps.executeUpdate() > 0;
        } finally {
            DBConnection.close(ps, conn);
        }
    }

    /**
     * Helper to load exercises for a workout using an existing connection.
     */
    private List<WorkoutExercise> getExercisesForWorkout(Connection conn, int workoutId) throws SQLException {
        String sql = "SELECT * FROM `workout_exercises` WHERE `workout_id` = ? ORDER BY `order_idx` ASC, `id` ASC";
        List<WorkoutExercise> list = new ArrayList<>();
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            ps = conn.prepareStatement(sql);
            ps.setInt(1, workoutId);
            rs = ps.executeQuery();
            while (rs.next()) {
                WorkoutExercise ex = new WorkoutExercise();
                ex.setId(rs.getInt("id"));
                ex.setWorkoutId(rs.getInt("workout_id"));
                ex.setExerciseName(rs.getString("exercise_name"));
                ex.setSets(rs.getInt("sets"));
                ex.setReps(rs.getInt("reps"));
                ex.setWeightKg(rs.getDouble("weight_kg"));
                ex.setRestSec(rs.getInt("rest_sec"));
                ex.setOrderIdx(rs.getInt("order_idx"));
                ex.setNotes(rs.getString("notes"));
                list.add(ex);
            }
            return list;
        } finally {
            if (rs != null) try { rs.close(); } catch (Exception ignored) {}
            if (ps != null) try { ps.close(); } catch (Exception ignored) {}
        }
    }

    /**
     * Maps ResultSet row to Workout entity.
     */
    private Workout mapResultSetToWorkout(ResultSet rs) throws SQLException {
        Workout w = new Workout();
        w.setId(rs.getInt("id"));
        int coachId = rs.getInt("coach_id");
        if (!rs.wasNull()) {
            w.setCoachId(coachId);
        }
        w.setUserId(rs.getInt("user_id"));
        w.setTitle(rs.getString("title"));
        w.setCategory(rs.getString("category"));
        w.setTargetMuscle(rs.getString("target_muscle"));
        w.setDifficulty(rs.getString("difficulty"));
        w.setDurationMin(rs.getInt("duration_min"));
        w.setCaloriesBurned(rs.getInt("calories_burned"));
        w.setScheduledDate(rs.getDate("scheduled_date"));
        w.setScheduledTime(rs.getString("scheduled_time"));
        w.setCompleted(rs.getBoolean("is_completed"));
        w.setCompletedAt(rs.getTimestamp("completed_at"));
        w.setNotes(rs.getString("notes"));
        w.setCreatedAt(rs.getTimestamp("created_at"));
        return w;
    }
}
