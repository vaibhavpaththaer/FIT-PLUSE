USE fitness_coaching;

CREATE TABLE IF NOT EXISTS meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_name VARCHAR(255) NOT NULL,
    meal_category VARCHAR(50) NOT NULL, -- e.g., 'breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner'
    food_preference VARCHAR(50) NOT NULL, -- e.g., 'vegetarian', 'non-vegetarian'
    fitness_goal VARCHAR(50) DEFAULT 'Maintenance',
    calories INT NOT NULL,
    protein INT NOT NULL,
    carbs INT NOT NULL,
    fats INT NOT NULL,
    fiber INT NOT NULL,
    prep_time VARCHAR(50) DEFAULT '15 mins',
    serving_size VARCHAR(50) DEFAULT '1 Bowl'
);

CREATE TABLE IF NOT EXISTS meal_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id INT NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    calories INT NOT NULL,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_diet_plan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_id INT NOT NULL,
    selected_date DATE NOT NULL,
    meal_category VARCHAR(50) NOT NULL,
    completed_status BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
);
