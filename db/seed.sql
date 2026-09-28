-- =============================================================================
-- FITPULSE FITNESS COACHING & TRACKING PLATFORM
-- Seed Data Script
-- Database Name: fitness_coaching
-- =============================================================================

USE `fitness_coaching`;

-- 1. SEED COACHES
INSERT INTO `coaches` (`id`, `full_name`, `email`, `phone`, `bio`, `specialties`, `experience_years`, `rating`, `avatar_url`, `is_active`) VALUES
(1, 'Coach Rahul Sharma', 'coach.rahul@fitpulse.com', '+91 98765 11223', 'Senior Elite Strength & Conditioning Coach certified with NSCA & CSCS. Specializes in hypertrophy, biomechanics, and personalized competition preparation.', 'Hypertrophy, Strength & Conditioning, Powerlifting', 8, 4.9, 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=200&auto=format&fit=crop&q=80', 1),
(2, 'Coach Priya Patel', 'coach.priya@fitpulse.com', '+91 98765 22334', 'Clinical Nutritionist & Functional Fitness Specialist with 6+ years transforming client lifestyles through sustainable macro diets and metabolic conditioning.', 'Clinical Nutrition, Fat Loss, HIIT, Mobility', 6, 4.8, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 1),
(3, 'Coach Vikram Sengupta', 'coach.vikram@fitpulse.com', '+91 98765 33445', 'Former National Athlete & Master Trainer dedicated to athletic performance, kettlebell training, and posture rehabilitation.', 'Athletic Performance, Posture Correction, Kettlebells', 10, 5.0, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 1);

-- 2. SEED DEMO USER (Password: Password@123)
INSERT INTO `users` (
    `id`, `full_name`, `email`, `mobile_country`, `mobile_number`, 
    `password_hash`, `password_salt`, `gender`, `age`, `height_cm`, `weight_kg`, 
    `target_weight_kg`, `fitness_goal`, `activity_level`, `gym_experience`, 
    `workout_preference`, `workout_days`, `workout_duration_min`, `diet_preference`, 
    `water_intake`, `sleep_hours`, `medical_conditions`, `medical_details`, 
    `avatar_url`, `role`, `assigned_coach_id`, `streak_days`, `total_workouts`, 
    `total_calories_burned`, `member_since`, `preferred_language`
) VALUES (
    1, 'Alex Morgan', 'alex.morgan@gmail.com', '+91', '9876543210',
    '9a2e80ce79ab2657872b99d119a405aa91a2712ee698a6da1a58d66dd11238b2', 'fitpulse_demo_salt_2026',
    'male', 26, 178.00, 72.40, 75.00, 'muscle', 'moderate', 'intermediate',
    'gym', '4-5', 45, 'non-vegetarian', '2-3L', '6-8', 'no', '',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'user', 1, 14, 48, 32450, 'Feb 2026', 'en'
);

-- 3. SEED WORKOUTS
INSERT INTO `workouts` (`id`, `coach_id`, `user_id`, `title`, `category`, `target_muscle`, `difficulty`, `duration_min`, `calories_burned`, `scheduled_date`, `scheduled_time`, `is_completed`, `completed_at`, `notes`) VALUES
(1, 1, 1, 'Upper Body Hypertrophy & Chest Blast', 'Strength & Hypertrophy', 'Chest, Shoulders & Triceps', 'intermediate', 45, 380, CURRENT_DATE(), '18:00', 0, NULL, 'Focus on controlled eccentric tempo on all bench presses.'),
(2, 1, 1, 'Lower Body Power & Quad Shred', 'Strength & Power', 'Quads, Hamstrings & Calves', 'advanced', 50, 440, DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), '18:00', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 'Great explosive power on barbell back squats.'),
(3, 1, 1, 'Back & Bicep Pull Mastery', 'Hypertrophy', 'Lats, Rhomboids & Biceps', 'intermediate', 45, 360, DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), '07:30', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), 'Achieved new personal best on weighted pull-ups.'),
(4, 1, 1, 'Core Stability & HIIT Conditioning', 'Cardio & HIIT', 'Core, Abs & Full Body', 'beginner', 35, 310, DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), '18:30', 1, DATE_SUB(NOW(), INTERVAL 3 DAY), 'Completed 5 rounds with minimal rest interval.');

-- 4. SEED WORKOUT EXERCISES
INSERT INTO `workout_exercises` (`workout_id`, `exercise_name`, `sets`, `reps`, `weight_kg`, `rest_sec`, `order_idx`, `notes`) VALUES
-- Exercises for Workout 1 (Chest & Push)
(1, 'Barbell Flat Bench Press', 4, 10, 75.00, 90, 1, 'Warm up with empty bar, then 4 working sets'),
(1, 'Incline Dumbbell Press', 3, 12, 28.00, 60, 2, 'Maintain 30-degree bench angle for upper chest'),
(1, 'Standing Cable Chest Flyes', 3, 15, 14.00, 60, 3, 'Squeeze at peak contraction for 1 second'),
(1, 'Overhead Dumbbell Shoulder Press', 3, 10, 22.00, 75, 4, 'Keep core tight and neutral spine'),
(1, 'Tricep Rope Cable Pushdowns', 4, 12, 25.00, 45, 5, 'Spread rope at the bottom of the movement'),

-- Exercises for Workout 2 (Legs)
(2, 'Barbell Back Squats', 4, 8, 100.00, 120, 1, 'Hit parallel depth with knees tracking toes'),
(2, 'Romanian Deadlifts (RDLs)', 3, 10, 80.00, 90, 2, 'Hinge at hips, feel stretch in hamstrings'),
(2, '45-Degree Leg Press', 3, 12, 180.00, 75, 3, 'Feet shoulder width on platform'),
(2, 'Walking Dumbbell Lunges', 3, 12, 16.00, 60, 4, '12 steps per leg with upright posture'),
(2, 'Standing Machine Calf Raises', 4, 15, 60.00, 45, 5, 'Full stretch at bottom, pause at top');

-- 5. SEED DIET PLANS
INSERT INTO `diet_plans` (`id`, `coach_id`, `user_id`, `title`, `plan_type`, `target_calories`, `protein_g`, `carbs_g`, `fats_g`, `start_date`, `end_date`, `is_active`, `notes`) VALUES
(1, 2, 1, 'Lean Mass Hypertrophy & Performance Plan', 'High Protein & Clean Carb Cycling', 2400, 180, 260, 70, DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY), DATE_ADD(CURRENT_DATE(), INTERVAL 45 DAY), 1, 'Tailored for lean muscle development without fat accumulation.');

-- 6. SEED DIET MEALS
INSERT INTO `diet_meals` (`diet_plan_id`, `meal_type`, `item_name`, `quantity`, `calories`, `protein_g`, `carbs_g`, `fats_g`, `time_slot`, `notes`) VALUES
(1, 'breakfast', 'Rolled Oats with Whey Protein, Chia Seeds & Blueberries', '1 Large Bowl (80g oats + 30g whey)', 520, 42, 65, 12, '08:00 AM', 'Provides sustained complex carbs and fast-absorbing protein'),
(1, 'lunch', 'Grilled Herb Chicken Breast, Brown Rice & Steamed Broccoli', '200g Chicken + 150g Rice', 680, 52, 75, 16, '01:00 PM', 'Primary midday fuel for muscle recovery'),
(1, 'snack', 'Low-Fat Greek Yogurt with Almonds & Organic Honey', '200g Yogurt + 15g Almonds', 320, 24, 28, 11, '04:30 PM', 'Pre-workout energy booster with healthy fats'),
(1, 'dinner', 'Pan-Seared Atlantic Salmon, Sweet Potato Mash & Asparagus', '180g Salmon + 150g Potato', 620, 44, 58, 22, '08:30 PM', 'Rich in essential Omega-3 fatty acids and micronutrients'),
(1, 'snack', 'Post-Workout Whey Isolate & 2 Whole Grain Rice Cakes', '1 Scoop Isolate + 2 Cakes', 260, 28, 24, 3, '06:45 PM', 'Immediate post-exercise amino acid delivery');

-- 7. SEED PROGRESS LOGS (Last 7 Days)
INSERT INTO `progress` (`user_id`, `record_date`, `weight_kg`, `bmi`, `body_fat_pct`, `muscle_mass_kg`, `calories_burned`, `steps`, `water_liters`, `workouts_completed`, `sleep_hours`, `notes`) VALUES
(1, DATE_SUB(CURRENT_DATE(), INTERVAL 6 DAY), 73.20, 23.10, 14.80, 58.00, 1750, 8420, 2.5, 1, 7.5, 'Consistent hydration throughout the day.'),
(1, DATE_SUB(CURRENT_DATE(), INTERVAL 5 DAY), 73.00, 23.04, 14.60, 58.10, 1920, 9600, 3.0, 1, 7.0, 'Strong upper-body session completed.'),
(1, DATE_SUB(CURRENT_DATE(), INTERVAL 4 DAY), 72.80, 22.98, 14.50, 58.20, 1680, 7850, 2.8, 1, 8.0, 'Active recovery and light mobility routine.'),
(1, DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY), 72.70, 22.95, 14.40, 58.30, 2100, 11200, 3.2, 1, 7.2, 'High energy leg day and 10k+ steps hit.'),
(1, DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY), 72.50, 22.88, 14.30, 58.50, 1850, 9100, 3.0, 1, 7.5, 'Back workout felt amazing, form on point.'),
(1, DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY), 72.40, 22.85, 14.20, 58.60, 1840, 8800, 3.0, 1, 7.8, 'Resting heart rate down, feeling recovered.'),
(1, CURRENT_DATE(), 72.40, 22.85, 14.20, 58.60, 1840, 8950, 3.0, 0, 7.5, 'Today active metrics live calibrated.');

-- 8. SEED MESSAGES
INSERT INTO `messages` (`sender_id`, `sender_type`, `receiver_id`, `receiver_type`, `message_text`, `is_read`, `sent_at`) VALUES
(1, 'coach', 1, 'user', 'Hey Alex! Great job crushing your leg day yesterday. I noticed your squat depth and control looked much cleaner.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'user', 1, 'coach', 'Thanks Coach Rahul! Lowering the weight slightly and focusing on eccentric tempo really helped my stability.', 1, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(1, 'coach', 1, 'user', 'Exactly. For today\'s Upper Body session, keep your rest between bench press working sets at 90 seconds. Let\'s push for 10 reps!', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 9. SEED NOTIFICATIONS
INSERT INTO `notifications` (`user_id`, `title`, `message`, `notif_type`, `is_read`, `target_url`, `created_at`) VALUES
(1, 'Today\'s Workout Assigned', 'Coach Rahul assigned "Upper Body Hypertrophy & Chest Blast" for 6:00 PM today.', 'workout', 0, '#workouts', NOW()),
(1, 'Macro Target Reminder', 'You have 560 kcal remaining today. Make sure to hit your 44g dinner protein target!', 'diet', 0, '#diet', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(1, '14-Day Streak Unlocked! 🔥', 'Congratulations! You have maintained a continuous 14-day training & nutrition logging streak.', 'system', 1, '#progress', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'New Coach Message', 'Coach Rahul sent you feedback regarding your bench press form.', 'message', 0, '#messages', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 10. SEED REPORTS
INSERT INTO `reports` (`user_id`, `report_type`, `date_range_start`, `date_range_end`, `summary_json`, `generated_at`) VALUES
(1, 'monthly_performance', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY), CURRENT_DATE(), '{"total_workouts": 22, "completion_rate": 92.5, "avg_calories_burned": 410, "weight_delta_kg": -1.8, "muscle_gain_kg": 0.9, "water_adherence_pct": 95, "coach_feedback": "Outstanding adherence across all macro targets and strength progressions."}', NOW());
