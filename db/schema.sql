-- =============================================================================
-- FITPULSE FITNESS COACHING & TRACKING PLATFORM
-- MySQL Relational Database Schema DDL
-- Database Name: fitness_coaching
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `fitness_coaching`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `fitness_coaching`;

-- Disable foreign key checks during drop & recreate
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `progress`;
DROP TABLE IF EXISTS `diet_meals`;
DROP TABLE IF EXISTS `diet_plans`;
DROP TABLE IF EXISTS `workout_exercises`;
DROP TABLE IF EXISTS `workouts`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `coaches`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. COACHES TABLE
-- Stores certified fitness coaches, trainers, bios, and ratings
-- =============================================================================
CREATE TABLE `coaches` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `phone` VARCHAR(30) NULL,
    `bio` TEXT NULL,
    `specialties` VARCHAR(255) NULL,
    `experience_years` INT NOT NULL DEFAULT 0,
    `rating` DECIMAL(3, 1) NOT NULL DEFAULT 5.0,
    `avatar_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `account_status` ENUM('pending','active','rejected') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_coaches_email` (`email`),
    INDEX `idx_coaches_active` (`is_active`),
    INDEX `idx_coaches_status` (`account_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 2. USERS TABLE
-- Stores user credentials, demographic details, baseline biometrics, and preferences
-- =============================================================================
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `mobile_country` VARCHAR(10) NOT NULL DEFAULT '+91',
    `mobile_number` VARCHAR(30) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `password_salt` VARCHAR(64) NOT NULL,
    `gender` ENUM('male', 'female', 'other') NOT NULL DEFAULT 'male',
    `age` INT NOT NULL,
    `height_cm` DECIMAL(5, 2) NOT NULL,
    `weight_kg` DECIMAL(5, 2) NOT NULL,
    `target_weight_kg` DECIMAL(5, 2) NULL,
    `fitness_goal` VARCHAR(255) NOT NULL DEFAULT 'muscle',
    `activity_level` VARCHAR(50) NOT NULL DEFAULT 'moderate',
    `gym_experience` VARCHAR(50) NOT NULL DEFAULT 'intermediate',
    `workout_preference` VARCHAR(50) NOT NULL DEFAULT 'gym',
    `workout_days` VARCHAR(20) NOT NULL DEFAULT '4-5',
    `workout_duration_min` INT NOT NULL DEFAULT 45,
    `diet_preference` VARCHAR(50) NOT NULL DEFAULT 'non-vegetarian',
    `water_intake` VARCHAR(20) NOT NULL DEFAULT '2-3L',
    `sleep_hours` VARCHAR(20) NOT NULL DEFAULT '6-8',
    `medical_conditions` VARCHAR(10) NOT NULL DEFAULT 'no',
    `medical_details` TEXT NULL,
    `medical_report_name` VARCHAR(255) NULL,
    `medical_report_url` LONGTEXT NULL,
    `avatar_url` LONGTEXT NULL,
    `role` ENUM('user', 'coach', 'admin') NOT NULL DEFAULT 'user',
    `assigned_coach_id` INT NULL,
    `streak_days` INT NOT NULL DEFAULT 0,
    `total_workouts` INT NOT NULL DEFAULT 0,
    `total_calories_burned` INT NOT NULL DEFAULT 0,
    `member_since` VARCHAR(50) NOT NULL DEFAULT 'Feb 2026',
    `preferred_language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_coach` FOREIGN KEY (`assigned_coach_id`) REFERENCES `coaches` (`id`) ON DELETE SET NULL,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_mobile` (`mobile_number`),
    INDEX `idx_users_coach` (`assigned_coach_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. WORKOUTS TABLE
-- Stores scheduled, active, and completed workout sessions
-- =============================================================================
CREATE TABLE `workouts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `coach_id` INT NULL,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `target_muscle` VARCHAR(100) NULL,
    `difficulty` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'intermediate',
    `duration_min` INT NOT NULL DEFAULT 45,
    `calories_burned` INT NOT NULL DEFAULT 0,
    `scheduled_date` DATE NOT NULL,
    `scheduled_time` VARCHAR(20) NOT NULL DEFAULT '18:00',
    `is_completed` BOOLEAN NOT NULL DEFAULT FALSE,
    `completed_at` TIMESTAMP NULL DEFAULT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_workouts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_workouts_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE SET NULL,
    INDEX `idx_workouts_user_date` (`user_id`, `scheduled_date`),
    INDEX `idx_workouts_completed` (`user_id`, `is_completed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. WORKOUT_EXERCISES TABLE
-- Stores individual exercises, sets, reps, weight, and order for a workout
-- =============================================================================
CREATE TABLE `workout_exercises` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workout_id` INT NOT NULL,
    `exercise_name` VARCHAR(100) NOT NULL,
    `sets` INT NOT NULL DEFAULT 3,
    `reps` INT NOT NULL DEFAULT 10,
    `weight_kg` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `rest_sec` INT NOT NULL DEFAULT 60,
    `order_idx` INT NOT NULL DEFAULT 1,
    `notes` VARCHAR(255) NULL,
    CONSTRAINT `fk_exercises_workout` FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`) ON DELETE CASCADE,
    INDEX `idx_workout_exercises_order` (`workout_id`, `order_idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. DIET_PLANS TABLE
-- Stores assigned nutrition plans with macro targets and durations
-- =============================================================================
CREATE TABLE `diet_plans` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `coach_id` INT NULL,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `plan_type` VARCHAR(50) NOT NULL DEFAULT 'High Protein & Lean Mass',
    `target_calories` INT NOT NULL DEFAULT 2200,
    `protein_g` INT NOT NULL DEFAULT 160,
    `carbs_g` INT NOT NULL DEFAULT 220,
    `fats_g` INT NOT NULL DEFAULT 65,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_diet_plans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_diet_plans_coach` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE SET NULL,
    INDEX `idx_diet_plans_user_active` (`user_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. DIET_MEALS TABLE
-- Stores individual meal items, portions, calories, and macros
-- =============================================================================
CREATE TABLE `diet_meals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `diet_plan_id` INT NOT NULL,
    `meal_type` ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
    `item_name` VARCHAR(150) NOT NULL,
    `quantity` VARCHAR(100) NOT NULL,
    `calories` INT NOT NULL,
    `protein_g` INT NOT NULL DEFAULT 0,
    `carbs_g` INT NOT NULL DEFAULT 0,
    `fats_g` INT NOT NULL DEFAULT 0,
    `time_slot` VARCHAR(50) NULL,
    `notes` VARCHAR(255) NULL,
    CONSTRAINT `fk_meals_diet_plan` FOREIGN KEY (`diet_plan_id`) REFERENCES `diet_plans` (`id`) ON DELETE CASCADE,
    INDEX `idx_diet_meals_type` (`diet_plan_id`, `meal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. PROGRESS TABLE
-- Stores daily and weekly biometric tracking logs for charts and history
-- =============================================================================
CREATE TABLE `progress` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `record_date` DATE NOT NULL,
    `weight_kg` DECIMAL(5, 2) NOT NULL,
    `bmi` DECIMAL(4, 2) NOT NULL,
    `body_fat_pct` DECIMAL(4, 2) NULL,
    `muscle_mass_kg` DECIMAL(5, 2) NULL,
    `calories_burned` INT NOT NULL DEFAULT 0,
    `steps` INT NOT NULL DEFAULT 0,
    `water_liters` DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
    `workouts_completed` INT NOT NULL DEFAULT 0,
    `sleep_hours` DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
    `notes` TEXT NULL,
    `recorded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `uk_user_record_date` (`user_id`, `record_date`),
    INDEX `idx_progress_user_history` (`user_id`, `record_date` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. MESSAGES TABLE
-- Stores user <-> coach chat conversations
-- =============================================================================
CREATE TABLE `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `sender_id` INT NOT NULL,
    `sender_type` ENUM('user', 'coach') NOT NULL,
    `receiver_id` INT NOT NULL,
    `receiver_type` ENUM('user', 'coach') NOT NULL,
    `message_text` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_messages_conversation` (`sender_id`, `receiver_id`, `sent_at`),
    INDEX `idx_messages_unread` (`receiver_id`, `receiver_type`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 9. NOTIFICATIONS TABLE
-- Stores user alerts, workout reminders, and system notifications
-- =============================================================================
CREATE TABLE `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `message` TEXT NOT NULL,
    `notif_type` ENUM('workout', 'diet', 'message', 'progress', 'system') NOT NULL DEFAULT 'system',
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `target_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_notifications_user_unread` (`user_id`, `is_read`, `created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 10. REPORTS TABLE
-- Stores generated monthly/quarterly progress summaries and performance snapshots
-- =============================================================================
CREATE TABLE `reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `report_type` VARCHAR(50) NOT NULL DEFAULT 'monthly_performance',
    `date_range_start` DATE NOT NULL,
    `date_range_end` DATE NOT NULL,
    `summary_json` LONGTEXT NULL,
    `generated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_reports_user` (`user_id`, `generated_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
