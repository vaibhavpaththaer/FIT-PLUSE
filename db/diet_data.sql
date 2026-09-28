USE fitness_coaching;

-- Veg Breakfast
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Oats with Milk, Banana, Almonds & Boiled Corn', 'breakfast', 'vegetarian', 580, 20, 80, 15, 10),
('Paneer Bhurji with Whole Wheat Roti', 'breakfast', 'vegetarian', 450, 25, 45, 20, 8),
('Vegetable Poha with Curd', 'breakfast', 'vegetarian', 380, 12, 60, 10, 5),
('Besan Chilla with Paneer Filling', 'breakfast', 'vegetarian', 420, 22, 40, 18, 7),
('Vegetable Upma with Greek Yogurt', 'breakfast', 'vegetarian', 400, 15, 55, 12, 6);

-- Veg Mid-Morning
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Apple with Almonds', 'morning_snack', 'vegetarian', 200, 5, 25, 10, 6),
('Banana with Peanut Butter', 'morning_snack', 'vegetarian', 250, 8, 30, 12, 5),
('Greek Yogurt with Chia Seeds', 'morning_snack', 'vegetarian', 180, 15, 15, 8, 4),
('Mixed Fruit Bowl', 'morning_snack', 'vegetarian', 150, 2, 35, 1, 8),
('Sprouts Salad', 'morning_snack', 'vegetarian', 170, 12, 25, 3, 9);

-- Veg Lunch
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Paneer Brown Rice Bowl with Vegetables', 'lunch', 'vegetarian', 600, 30, 65, 25, 12),
('Dal, Brown Rice & Mixed Vegetables', 'lunch', 'vegetarian', 550, 20, 85, 15, 15),
('Rajma Rice with Salad', 'lunch', 'vegetarian', 580, 22, 90, 12, 18),
('Chole with Whole Wheat Roti', 'lunch', 'vegetarian', 520, 20, 75, 18, 14),
('Palak Paneer with Roti', 'lunch', 'vegetarian', 550, 25, 60, 22, 10);

-- Veg Evening Snack
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Peanut Butter Banana Toast', 'evening_snack', 'vegetarian', 300, 10, 40, 14, 6),
('Roasted Chana & Nuts', 'evening_snack', 'vegetarian', 250, 12, 25, 12, 7),
('Fruit Protein Smoothie', 'evening_snack', 'vegetarian', 280, 20, 35, 5, 4),
('Paneer Sandwich', 'evening_snack', 'vegetarian', 350, 18, 40, 15, 5),
('Boiled Corn with Lemon', 'evening_snack', 'vegetarian', 150, 5, 30, 2, 4);

-- Veg Dinner
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Paneer Stir Fry with Vegetables', 'dinner', 'vegetarian', 450, 25, 30, 25, 8),
('Dal with Roti & Salad', 'dinner', 'vegetarian', 500, 18, 70, 15, 12),
('Vegetable Khichdi with Curd', 'dinner', 'vegetarian', 400, 15, 65, 10, 8),
('Tofu Stir Fry with Brown Rice', 'dinner', 'vegetarian', 480, 22, 60, 18, 10),
('Mixed Vegetable Soup with Paneer', 'dinner', 'vegetarian', 350, 20, 25, 15, 7);

-- Non-Veg Breakfast
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Egg Omelette with Whole Wheat Toast & Banana', 'breakfast', 'non-vegetarian', 520, 28, 55, 20, 7),
('Boiled Eggs with Oats', 'breakfast', 'non-vegetarian', 480, 25, 50, 18, 8),
('Scrambled Eggs with Toast', 'breakfast', 'non-vegetarian', 450, 24, 45, 18, 5),
('Chicken Sandwich', 'breakfast', 'non-vegetarian', 400, 30, 40, 12, 4),
('Egg & Vegetable Wrap', 'breakfast', 'non-vegetarian', 420, 22, 45, 15, 6);

-- Non-Veg Mid-Morning
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Boiled Eggs with Fruit', 'morning_snack', 'non-vegetarian', 250, 14, 25, 10, 4),
('Greek Yogurt with Boiled Egg', 'morning_snack', 'non-vegetarian', 280, 22, 15, 15, 0),
('Chicken Salad Cup', 'morning_snack', 'non-vegetarian', 200, 25, 5, 8, 2),
('Tuna Salad', 'morning_snack', 'non-vegetarian', 220, 20, 10, 10, 3),
('Egg White Sandwich', 'morning_snack', 'non-vegetarian', 260, 18, 30, 8, 4);

-- Non-Veg Lunch
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Grilled Chicken Rice Bowl', 'lunch', 'non-vegetarian', 650, 45, 70, 20, 8),
('Chicken Curry with Roti', 'lunch', 'non-vegetarian', 600, 40, 65, 22, 10),
('Grilled Fish with Rice & Vegetables', 'lunch', 'non-vegetarian', 550, 35, 60, 18, 7),
('Chicken Biryani with Raita', 'lunch', 'non-vegetarian', 700, 38, 85, 25, 6),
('Egg Curry with Roti', 'lunch', 'non-vegetarian', 520, 25, 60, 20, 8);

-- Non-Veg Evening Snack
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Egg & Chicken Sandwich', 'evening_snack', 'non-vegetarian', 350, 25, 35, 12, 4),
('Boiled Eggs', 'evening_snack', 'non-vegetarian', 150, 12, 1, 10, 0),
('Chicken Wrap', 'evening_snack', 'non-vegetarian', 400, 28, 45, 15, 5),
('Tuna Sandwich', 'evening_snack', 'non-vegetarian', 320, 22, 40, 8, 4),
('Egg White Roll', 'evening_snack', 'non-vegetarian', 280, 20, 35, 6, 3);

-- Non-Veg Dinner
INSERT INTO meals (meal_name, meal_category, food_preference, calories, protein, carbs, fats, fiber) VALUES 
('Grilled Chicken with Vegetables', 'dinner', 'non-vegetarian', 450, 45, 20, 18, 8),
('Grilled Fish with Sweet Potato', 'dinner', 'non-vegetarian', 480, 35, 45, 15, 7),
('Chicken Stir Fry', 'dinner', 'non-vegetarian', 420, 40, 25, 16, 6),
('Egg Curry with Roti', 'dinner', 'non-vegetarian', 500, 24, 60, 18, 10),
('Chicken Soup with Whole Wheat Toast', 'dinner', 'non-vegetarian', 350, 30, 40, 8, 5);

-- (Mix diets will naturally fetch from both Veg and Non-Veg based on frontend API requests)
