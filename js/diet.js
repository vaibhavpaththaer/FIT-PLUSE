// FitPulse — Diet, Nutrition & Meal Tracking Engine

    // =========================================================================
    // 15. PRECISION DIET & NUTRITION ENGINE (MULTI-DIET ARCHITECTURE)
    // =========================================================================
    
    // Diet Presets for Vegetarian, Non-Vegetarian, and Mixed Diets
    const DIET_PRESETS = {
        'vegetarian': {
            id: 'vegetarian',
            label: 'Vegetarian Diet',
            emoji: '🥗',
            tag: 'Plant & Dairy Powered',
            targetCalories: 2400,
            targetProtein: 145,
            targetCarbs: 310,
            targetFats: 65,
            waterGoal: 3.0,
            meals: [
                {
                    id: 'breakfast',
                    typeNumber: 'MEAL 1 • BREAKFAST',
                    name: 'Oats with Milk, Banana, Almonds & Boiled Corn',
                    time: '08:00 AM',
                    cals: 580,
                    protein: 34,
                    carbs: 82,
                    fat: 15,
                    fiber: 11,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Oats with Milk (80g Rolled Oats in 250ml Warm Milk)', cals: '320 kcal' },
                        { name: 'Fresh Ripe Banana (1 Medium)', cals: '105 kcal' },
                        { name: 'Raw California Almonds (15g)', cals: '85 kcal' },
                        { name: 'Sweet Boiled Corn (80g)', cals: '70 kcal' }
                    ],
                    badgeClass: 'badge-yellow'
                },
                {
                    id: 'morning_snack',
                    typeNumber: 'MEAL 2 • MORNING SNACK',
                    name: 'Fresh Apple & Probiotic Greek Yogurt',
                    time: '11:00 AM',
                    cals: 210,
                    protein: 16,
                    carbs: 32,
                    fat: 3,
                    fiber: 6,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1506802913710-40e2e66339c9?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Fresh Crisp Apple (150g)', cals: '95 kcal' },
                        { name: 'Authentic 0% Fat Greek Yogurt (150g)', cals: '115 kcal' }
                    ],
                    badgeClass: 'badge-blue'
                },
                {
                    id: 'lunch',
                    typeNumber: 'MEAL 3 • LUNCH',
                    name: 'Brown Rice, Dal, Paneer Curry, Mixed Salad & Curd',
                    time: '01:30 PM',
                    cals: 740,
                    protein: 46,
                    carbs: 90,
                    fat: 22,
                    fiber: 14,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Steamed Brown Rice (160g)', cals: '225 kcal' },
                        { name: 'Yellow Tadka Moong Dal (1 Bowl / 200ml)', cals: '140 kcal' },
                        { name: 'Low-Fat Cottage Cheese / Paneer Curry (160g)', cals: '250 kcal' },
                        { name: 'Crunchy Garden Mixed Salad with Lemon', cals: '45 kcal' },
                        { name: 'Fresh Probiotic Set Curd (120g)', cals: '80 kcal' }
                    ],
                    badgeClass: 'badge-purple'
                },
                {
                    id: 'evening_snack',
                    typeNumber: 'MEAL 4 • EVENING SNACK',
                    name: 'Whey Protein Shake & Roasted Chickpeas',
                    time: '05:00 PM',
                    cals: 280,
                    protein: 32,
                    carbs: 28,
                    fat: 4,
                    fiber: 7,
                    completed: false,
                    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Whey Protein Isolate Shake (30g Scoop in Water)', cals: '130 kcal' },
                        { name: 'Crunchy Spiced Roasted Chickpeas (50g)', cals: '150 kcal' }
                    ],
                    badgeClass: 'badge-yellow'
                },
                {
                    id: 'dinner',
                    typeNumber: 'MEAL 5 • DINNER',
                    name: 'Whole Wheat Chapati, Mixed Vegetables, Paneer Bhurji & Soup',
                    time: '08:30 PM',
                    cals: 590,
                    protein: 37,
                    carbs: 78,
                    fat: 16,
                    fiber: 12,
                    completed: false,
                    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: '2 Whole Wheat Fiber Chapatis (80g)', cals: '180 kcal' },
                        { name: 'Sautéed Mixed Vegetables (Broccoli, Beans, Carrots 150g)', cals: '80 kcal' },
                        { name: 'Low-Fat Spiced Paneer Bhurji (150g)', cals: '260 kcal' },
                        { name: 'Clear Herb Vegetable Soup (200ml)', cals: '70 kcal' }
                    ],
                    badgeClass: 'badge-green'
                }
            ],
            timeline: [
                { time: '08:00 AM', title: 'Oats, Milk, Banana & Boiled Corn', cals: '580 kcal • 34g Protein', desc: 'Complex whole grain energy and essential lipids to fuel morning activity.', status: 'completed' },
                { time: '11:00 AM', title: 'Crisp Apple & Greek Yogurt', cals: '210 kcal • 16g Protein', desc: 'Antioxidant pectin fiber and high-yield protein for steady focus.', status: 'completed' },
                { time: '01:30 PM', title: 'Brown Rice, Dal, Paneer & Curd', cals: '740 kcal • 46g Protein', desc: 'Complete plant and dairy amino acid distribution with slow-release carbs.', status: 'completed' },
                { time: '05:00 PM', title: 'Protein Shake & Roasted Chickpeas', cals: '280 kcal • 32g Protein', desc: 'Pre-workout branched-chain amino acids and magnesium crunch.', status: 'active-next' },
                { time: '08:30 PM', title: 'Chapati, Mixed Veggies, Paneer Bhurji & Soup', cals: '590 kcal • 37g Protein', desc: 'Casein protein reservoir and digestive warmth for deep recovery.', status: '' }
            ],
            shoppingList: [
                {
                    category: 'Plant & Dairy Proteins',
                    icon: 'fa-cheese text-purple',
                    items: ['Low-Fat Cottage Cheese / Paneer (1 kg)', 'Yellow Moong & Toor Dal (1 kg)', 'Authentic 0% Greek Yogurt & Curd (1.5 kg)', 'Whey Protein Isolate (1 Tub)']
                },
                {
                    category: 'Complex Carbs & Grains',
                    icon: 'fa-wheat-awn text-yellow',
                    items: ['Whole Rolled Oats (1 kg)', 'Steamed Brown Basmati Rice (1 kg)', 'Whole Wheat Atta for Chapatis (2 kg)', 'Sweet Corn & Fresh Bananas']
                },
                {
                    category: 'Fresh Produce & Snacks',
                    icon: 'fa-leaf text-green',
                    items: ['Crisp Red Apples (1 kg)', 'Mixed Greens & Salad Vegetables (1.5 kg)', 'Roasted Chickpeas (500g)', 'Raw California Almonds (250g)']
                }
            ]
        },
        'non-vegetarian': {
            id: 'non-vegetarian',
            label: 'Non-Vegetarian Diet',
            emoji: '🍗',
            tag: 'High-Protein Animal Sources',
            targetCalories: 2600,
            targetProtein: 215,
            targetCarbs: 245,
            targetFats: 68,
            waterGoal: 3.0,
            meals: [
                {
                    id: 'breakfast',
                    typeNumber: 'MEAL 1 • BREAKFAST',
                    name: 'Boiled Eggs, Rolled Oats, Milk & Fresh Banana',
                    time: '08:00 AM',
                    cals: 610,
                    protein: 50,
                    carbs: 62,
                    fat: 18,
                    fiber: 8,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: '4 Farm Boiled Eggs (2 Whole + 2 Whites)', cals: '240 kcal' },
                        { name: 'Whole Rolled Oats (70g) in Skimmed Milk (200ml)', cals: '265 kcal' },
                        { name: 'Fresh Ripe Banana (1 Medium)', cals: '105 kcal' }
                    ],
                    badgeClass: 'badge-yellow'
                },
                {
                    id: 'morning_snack',
                    typeNumber: 'MEAL 2 • MORNING SNACK',
                    name: 'Crisp Apple & Probiotic Greek Yogurt',
                    time: '11:00 AM',
                    cals: 210,
                    protein: 16,
                    carbs: 32,
                    fat: 3,
                    fiber: 5,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1506802913710-40e2e66339c9?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Fresh Crisp Apple (150g)', cals: '95 kcal' },
                        { name: '0% Fat Probiotic Greek Yogurt (150g)', cals: '115 kcal' }
                    ],
                    badgeClass: 'badge-blue'
                },
                {
                    id: 'lunch',
                    typeNumber: 'MEAL 3 • LUNCH',
                    name: 'Brown Rice, Grilled Chicken Breast, Salad & Yogurt',
                    time: '01:30 PM',
                    cals: 760,
                    protein: 64,
                    carbs: 74,
                    fat: 18,
                    fiber: 10,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Steamed Brown Basmati Rice (160g)', cals: '235 kcal' },
                        { name: 'Grilled Lean Chicken Breast (220g)', cals: '360 kcal' },
                        { name: 'Fresh Garden Crunchy Salad with Olive Oil', cals: '65 kcal' },
                        { name: 'Probiotic Set Yogurt / Curd (150g)', cals: '100 kcal' }
                    ],
                    badgeClass: 'badge-purple'
                },
                {
                    id: 'evening_snack',
                    typeNumber: 'MEAL 4 • EVENING SNACK',
                    name: 'Whey Protein Shake & Boiled Eggs',
                    time: '05:00 PM',
                    cals: 310,
                    protein: 44,
                    carbs: 14,
                    fat: 8,
                    fiber: 3,
                    completed: false,
                    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Whey Protein Isolate Scoop (30g in Water)', cals: '130 kcal' },
                        { name: '3 Hard Boiled Eggs (1 Whole + 2 Whites)', cals: '180 kcal' }
                    ],
                    badgeClass: 'badge-yellow'
                },
                {
                    id: 'dinner',
                    typeNumber: 'MEAL 5 • DINNER',
                    name: 'Grilled Fish, Sweet Potato & Vegetables',
                    time: '08:30 PM',
                    cals: 710,
                    protein: 51,
                    carbs: 63,
                    fat: 21,
                    fiber: 9,
                    completed: false,
                    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Grilled Fresh Wild Fish Fillet (230g)', cals: '430 kcal' },
                        { name: 'Oven-Roasted Sweet Potato (200g)', cals: '180 kcal' },
                        { name: 'Sautéed Greens & Asparagus Vegetables (150g)', cals: '100 kcal' }
                    ],
                    badgeClass: 'badge-green'
                }
            ],
            timeline: [
                { time: '08:00 AM', title: 'Boiled Eggs, Oats, Milk & Banana', cals: '610 kcal • 50g Protein', desc: 'Kickstart metabolic rate with high biological value egg albumin and oats.', status: 'completed' },
                { time: '11:00 AM', title: 'Crisp Apple & Greek Yogurt', cals: '210 kcal • 16g Protein', desc: 'Sustained amino acid elevation with probiotic yogurt and apple pectin.', status: 'completed' },
                { time: '01:30 PM', title: 'Brown Rice, Chicken, Salad & Yogurt', cals: '760 kcal • 64g Protein', desc: 'Glycogen replenishment with lean grilled chicken and fiber-rich brown rice.', status: 'completed' },
                { time: '05:00 PM', title: 'Protein Shake & Boiled Eggs', cals: '310 kcal • 44g Protein', desc: 'Rapid leucine spike and whole-egg micronutrients prior to evening training.', status: 'active-next' },
                { time: '08:30 PM', title: 'Grilled Fish, Sweet Potato & Veggies', cals: '710 kcal • 51g Protein', desc: 'Omega-3 rich wild fish and unrefined sweet potato for deep muscle repair.', status: '' }
            ],
            shoppingList: [
                {
                    category: 'Lean Animal Proteins',
                    icon: 'fa-drumstick-bite text-purple',
                    items: ['Skinless Chicken Breast (1.5 kg)', 'Fresh Wild Fish Fillets (800g)', 'Organic Pasture Eggs (3 Dozen)', '0% Fat Greek Yogurt (1 kg)']
                },
                {
                    category: 'Complex Carbs & Grains',
                    icon: 'fa-wheat-awn text-yellow',
                    items: ['Whole Rolled Oats (1 kg)', 'Steamed Brown Basmati Rice (1 kg)', 'Fresh Sweet Potatoes (2 kg)', 'Fresh Bananas (1 Dozen)']
                },
                {
                    category: 'Greens & Fresh Produce',
                    icon: 'fa-leaf text-green',
                    items: ['Crisp Red Apples (1 kg)', 'Asparagus, Broccoli & Spinach (1.5 kg)', 'Extra Virgin Olive Oil (500ml)', 'Whey Protein Isolate (1 Tub)']
                }
            ]
        },
        'mixed': {
            id: 'mixed',
            label: 'Mixed Diet',
            emoji: '🍽️',
            tag: 'Balanced Omnivore Split',
            targetCalories: 2520,
            targetProtein: 175,
            targetCarbs: 270,
            targetFats: 75,
            waterGoal: 3.0,
            meals: [
                {
                    id: 'breakfast',
                    typeNumber: 'MEAL 1 • BREAKFAST',
                    name: 'Oats, 2 Boiled Eggs, Milk & Banana',
                    time: '08:00 AM',
                    cals: 570,
                    protein: 38,
                    carbs: 68,
                    fat: 16,
                    fiber: 9,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Whole Rolled Oats (75g) in Warm Skimmed Milk (200ml)', cals: '280 kcal' },
                        { name: '2 Farm Boiled Eggs (1 Whole + 1 White)', cals: '185 kcal' },
                        { name: 'Fresh Banana (1 Medium)', cals: '105 kcal' }
                    ],
                    badgeClass: 'badge-yellow'
                },
                {
                    id: 'morning_snack',
                    typeNumber: 'MEAL 2 • MORNING SNACK',
                    name: 'Apple & Mixed Nuts',
                    time: '11:00 AM',
                    cals: 230,
                    protein: 8,
                    carbs: 32,
                    fat: 10,
                    fiber: 6,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Fresh Crisp Apple (150g)', cals: '95 kcal' },
                        { name: 'Roasted Mixed Nuts (Almonds & Walnuts 20g)', cals: '135 kcal' }
                    ],
                    badgeClass: 'badge-blue'
                },
                {
                    id: 'lunch',
                    typeNumber: 'MEAL 3 • LUNCH',
                    name: 'Brown Rice, Grilled Chicken Breast, Dal, Salad & Curd',
                    time: '01:30 PM',
                    cals: 750,
                    protein: 56,
                    carbs: 82,
                    fat: 20,
                    fiber: 12,
                    completed: true,
                    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Steamed Brown Basmati Rice (150g)', cals: '215 kcal' },
                        { name: 'Grilled Chicken Breast (180g)', cals: '290 kcal' },
                        { name: 'Yellow Moong Lentil Dal (1 Bowl / 150ml)', cals: '110 kcal' },
                        { name: 'Fresh Mixed Salad with Lemon Dressing', cals: '45 kcal' },
                        { name: 'Probiotic Set Curd (120g)', cals: '90 kcal' }
                    ],
                    badgeClass: 'badge-purple'
                },
                {
                    id: 'evening_snack',
                    typeNumber: 'MEAL 4 • EVENING SNACK',
                    name: 'Protein Shake & Peanut Butter Sandwich',
                    time: '05:00 PM',
                    cals: 340,
                    protein: 36,
                    carbs: 32,
                    fat: 9,
                    fiber: 5,
                    completed: false,
                    img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: 'Whey Protein Isolate Shake (30g)', cals: '130 kcal' },
                        { name: 'Whole Wheat Bread with Natural Peanut Butter (1 Slice / 25g PB)', cals: '210 kcal' }
                    ],
                    badgeClass: 'badge-yellow'
                },
                {
                    id: 'dinner',
                    typeNumber: 'MEAL 5 • DINNER',
                    name: 'Chapati, Paneer Curry, Grilled Fish & Mixed Vegetables',
                    time: '08:30 PM',
                    cals: 630,
                    protein: 47,
                    carbs: 56,
                    fat: 20,
                    fiber: 10,
                    completed: false,
                    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
                    items: [
                        { name: '2 Whole Wheat Chapatis (80g)', cals: '180 kcal' },
                        { name: 'Low-Fat Paneer Curry (100g)', cals: '160 kcal' },
                        { name: 'Grilled Fresh Fish Fillet (140g)', cals: '210 kcal' },
                        { name: 'Sautéed Mixed Vegetables (120g)', cals: '80 kcal' }
                    ],
                    badgeClass: 'badge-green'
                }
            ],
            timeline: [
                { time: '08:00 AM', title: 'Oats, 2 Boiled Eggs, Milk & Banana', cals: '570 kcal • 38g Protein', desc: 'Balanced macronutrients from pasture eggs, warm oats, and fresh banana.', status: 'completed' },
                { time: '11:00 AM', title: 'Crisp Apple & Mixed Nuts', cals: '230 kcal • 8g Protein', desc: 'Micronutrients and heart-healthy lipids from crisp fruit and walnuts.', status: 'completed' },
                { time: '01:30 PM', title: 'Brown Rice, Chicken, Dal, Salad & Curd', cals: '750 kcal • 56g Protein', desc: 'Multi-source amino acid blend and unrefined complex carbohydrates.', status: 'completed' },
                { time: '05:00 PM', title: 'Protein Shake & Peanut Butter Sandwich', cals: '340 kcal • 36g Protein', desc: 'Sustained muscular fuel and healthy monounsaturated fats.', status: 'active-next' },
                { time: '08:30 PM', title: 'Chapati, Paneer Curry, Fish & Veggies', cals: '630 kcal • 47g Protein', desc: 'Dual-source protein (marine + dairy casein) for complete nighttime restoration.', status: '' }
            ],
            shoppingList: [
                {
                    category: 'Balanced Proteins',
                    icon: 'fa-drumstick-bite text-purple',
                    items: ['Chicken Breast (1 kg)', 'Fresh Fish Fillets (500g)', 'Low-Fat Paneer (500g)', 'Farm Eggs (18 Count) & Dal']
                },
                {
                    category: 'Complex Carbs & Grains',
                    icon: 'fa-wheat-awn text-yellow',
                    items: ['Whole Rolled Oats (1 kg)', 'Brown Basmati Rice (1 kg)', 'Whole Wheat Atta (1.5 kg)', 'Whole Grain Bread & Bananas']
                },
                {
                    category: 'Nuts, Spreads & Veggies',
                    icon: 'fa-leaf text-green',
                    items: ['Natural Peanut Butter (500g)', 'Roasted Almonds & Walnuts (250g)', 'Crisp Apples (1 kg)', 'Mixed Fresh Vegetables (1.5 kg)']
                }
            ]
        }
    };

    function resolveUserDietType() {
        const pref = (regProfile.dietPreference || localStorage.getItem('fitpulse_user_diet') || '').toLowerCase();
        if (pref === 'veg' || pref === 'vegetarian' || pref === 'vegan') return 'vegetarian';
        if (pref === 'mixed' || pref === 'eggetarian') return 'mixed';
        if (pref === 'non-veg' || pref === 'non-vegetarian') return 'non-vegetarian';
        return 'non-vegetarian';
    }

    // Determine initial diet type
    let currentDietType = resolveUserDietType();

    function switchDietType(dType) {
        if (!DIET_PRESETS[dType]) dType = 'non-vegetarian';
        currentDietType = dType;
        dietState.currentDietType = dType;
        sessionStorage.setItem('fitpulse_diet_type', dType);

        const preset = DIET_PRESETS[dType];
        dietState.targetCalories = preset.targetCalories;
        dietState.targetProtein = preset.targetProtein;
        dietState.targetCarbs = preset.targetCarbs;
        dietState.targetFats = preset.targetFats;
        dietState.meals = JSON.parse(JSON.stringify(preset.meals));
        dietState.timeline = JSON.parse(JSON.stringify(preset.timeline));
        dietState.shoppingList = JSON.parse(JSON.stringify(preset.shoppingList));

        // Update UI Tab Active States
        document.querySelectorAll('.diet-type-btn').forEach(btn => {
            if (btn.dataset.dietType === dType) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });

        // Update Badge text
        const badge = document.getElementById('currentDietTypeBadge');
        if (badge) {
            badge.innerHTML = `<i class="fa-solid fa-sparkles"></i> <strong>${preset.label}</strong> Active`;
        }

        renderMealCards(true);
        renderTimeline(true);
        renderShoppingList(true);
        populateDietData();
    }

    let currentEditMealId = null;

    // Active Diet State
    const activePreset = DIET_PRESETS[currentDietType] || DIET_PRESETS['non-vegetarian'];
    const dietState = {
        activePlanId: null,
        currentDietType: currentDietType,
        targetCalories: activePreset.targetCalories,
        targetProtein: activePreset.targetProtein,
        targetCarbs: activePreset.targetCarbs,
        targetFats: activePreset.targetFats,
        waterIntake: 0.0,
        waterGoal: 3.0,
        meals: JSON.parse(JSON.stringify(activePreset.meals)),
        timeline: JSON.parse(JSON.stringify(activePreset.timeline)),
        shoppingList: JSON.parse(JSON.stringify(activePreset.shoppingList)),
        history: []
    };

    // Navigation & Breadcrumbs
    const crumbDietToDashboard = document.getElementById('crumbDietToDashboard');
    const dietBackToDashBtn    = document.getElementById('dietBackToDashBtn');
    if (crumbDietToDashboard) crumbDietToDashboard.addEventListener('click', () => switchView('dashboard'));
    if (dietBackToDashBtn) dietBackToDashBtn.addEventListener('click', () => switchView('dashboard'));

    // DOM Elements for Diet Hero & Matrix
    const heroCalConsumed          = document.getElementById('heroCalConsumed');
    const dietHeroRingProgress     = document.getElementById('dietHeroRingProgress');
    const dietCalRemainingHighlight= document.getElementById('dietCalRemainingHighlight');
    const dietCalSubText           = document.getElementById('dietCalSubText');
    const heroProteinShort         = document.getElementById('heroProteinShort');
    const heroTargetProtein        = document.getElementById('heroTargetProtein');
    const heroCarbsShort           = document.getElementById('heroCarbsShort');
    const heroTargetCarbs          = document.getElementById('heroTargetCarbs');
    const heroFatsShort            = document.getElementById('heroFatsShort');
    const heroTargetFats           = document.getElementById('heroTargetFats');
    const dietStatGoal             = document.getElementById('dietStatGoal');
    const dietStatConsumed         = document.getElementById('dietStatConsumed');
    const dietStatRemaining        = document.getElementById('dietStatRemaining');
    const dietStatWater            = document.getElementById('dietStatWater');
    const dietTargetCalPill        = document.getElementById('dietTargetCalPill');
    const currentDietTypeBadge     = document.getElementById('currentDietTypeBadge');
    const mealCompletionCountBadge = document.getElementById('mealCompletionCountBadge');
    const pdfClientName            = document.getElementById('pdfClientName');

    // Right-column Macro targets
    const progProteinVal           = document.getElementById('progProteinVal');
    const progProteinBar           = document.getElementById('progProteinBar');
    const progCarbsVal             = document.getElementById('progCarbsVal');
    const progCarbsBar             = document.getElementById('progCarbsBar');
    const progFatsVal              = document.getElementById('progFatsVal');
    const progFatsBar              = document.getElementById('progFatsBar');

    // ── Render Meals to DOM ──────────────────────────────────────────────────
    function renderMealCards(animate = false) {
        const mealCardsList = document.getElementById('mealCardsList');
        if (!mealCardsList) return;

        if (animate) {
            mealCardsList.classList.remove('diet-fade-transition');
            void mealCardsList.offsetWidth; // Trigger DOM reflow
            mealCardsList.classList.add('diet-fade-transition');
        }

        mealCardsList.innerHTML = '';

        dietState.meals.forEach((meal, idx) => {
            const isCompleted = !!meal.completed;
            const card = document.createElement('div');
            card.className = `meal-card ${isCompleted ? 'completed' : ''}`;
            card.id = `mealCard_${meal.id || idx + 1}`;
            card.dataset.meal = meal.id;
            card.dataset.cals = meal.cals;
            card.dataset.protein = meal.protein;
            card.dataset.carbs = meal.carbs;
            card.dataset.fat = meal.fat;

            const itemsHtml = (meal.items && meal.items.length > 0)
                ? meal.items.map(item => `<li><span>${item.name}</span> <strong>${item.cals}</strong></li>`).join('')
                : `<li><span>${meal.name} (${meal.quantity || '1 Serving'})</span> <strong>${meal.cals} kcal</strong></li>`;

            card.innerHTML = `
                <div class="meal-card-thumb-wrapper">
                    <img src="${meal.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}" alt="${meal.name}" class="meal-card-img" loading="lazy">
                    <span class="meal-time-tag"><i class="fa-regular fa-clock"></i> ${meal.time}</span>
                    <span class="meal-status-pill ${isCompleted ? 'done' : 'upcoming'}">
                        <i class="fa-solid ${isCompleted ? 'fa-check' : 'fa-clock'}"></i> ${isCompleted ? 'Completed' : 'Upcoming'}
                    </span>
                </div>
                <div class="meal-card-content">
                    <div class="meal-card-header">
                        <div>
                            <span class="meal-type-badge ${meal.badgeClass || 'badge-yellow'}">${meal.typeNumber || `MEAL ${idx + 1}`}</span>
                            <h4 class="meal-card-title">${meal.name}</h4>
                        </div>
                        <div class="meal-card-cals-badge">
                            <strong>${meal.cals}</strong> <small>kcal</small>
                        </div>
                    </div>
                    <div class="meal-food-items-box">
                        <span class="food-box-label"><i class="fa-solid fa-list-check"></i> Itemized Ingredients:</span>
                        <ul class="food-ingredients-list">
                            ${itemsHtml}
                        </ul>
                    </div>
                    <div class="meal-macro-grid">
                        <div class="mm-cell">
                            <span class="mm-lbl">Protein</span>
                            <strong class="mm-val text-purple">${meal.protein}g</strong>
                        </div>
                        <div class="mm-cell">
                            <span class="mm-lbl">Carbs</span>
                            <strong class="mm-val text-yellow">${meal.carbs}g</strong>
                        </div>
                        <div class="mm-cell">
                            <span class="mm-lbl">Fats</span>
                            <strong class="mm-val text-green">${meal.fat}g</strong>
                        </div>
                        <div class="mm-cell">
                            <span class="mm-lbl">Fiber</span>
                            <strong class="mm-val">${meal.fiber || 6}g</strong>
                        </div>
                    </div>
                    <div class="meal-card-actions">
                        <button class="meal-complete-toggle-btn ${isCompleted ? 'completed' : ''}" data-meal-id="${meal.id}">
                            <i class="fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-check'}"></i>
                            <span>${isCompleted ? 'Completed' : 'Mark Eaten'}</span>
                        </button>
                        <button class="card-tiny-btn edit-meal-btn" data-meal-id="${meal.id}"><i class="fa-solid fa-pen"></i> Edit Items</button>
                        <button class="card-tiny-btn delete-meal-btn" data-meal-id="${meal.id}" title="Delete Meal" style="color: #ef4444;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            mealCardsList.appendChild(card);
        });

        // Attach completion toggle & edit/delete handlers
        attachMealToggleListeners();
    }

    // ── Render Timeline Flow ─────────────────────────────────────────────────
    function renderTimeline(animate = false) {
        const timelineBox = document.getElementById('mealTimelineFlow');
        if (!timelineBox) return;

        if (animate) {
            timelineBox.classList.remove('diet-fade-transition');
            void timelineBox.offsetWidth;
            timelineBox.classList.add('diet-fade-transition');
        }

        timelineBox.innerHTML = '';
        const timelineList = dietState.timeline || [];

        timelineList.forEach(item => {
            const timeItem = document.createElement('div');
            timeItem.className = `timeline-meal-item ${item.status || ''}`;
            timeItem.innerHTML = `
                <div class="mt-icon-bubble"><i class="fa-solid ${item.status === 'completed' ? 'fa-check' : 'fa-utensils'}"></i></div>
                <div class="mt-info">
                    <div class="mt-head">
                        <strong>${item.time} • ${item.title}</strong>
                        <span class="mt-tag-cals">${item.cals}</span>
                    </div>
                    <p>${item.desc}</p>
                </div>
            `;
            timelineBox.appendChild(timeItem);
        });
    }

    // ── Render Shopping List with Add & Remove Capabilities ──────────────────
    function renderShoppingList(animate = false) {
        const shopContainer = document.getElementById('shoppingListCategories');
        if (!shopContainer) return;

        if (animate) {
            shopContainer.classList.remove('diet-fade-transition');
            void shopContainer.offsetWidth;
            shopContainer.classList.add('diet-fade-transition');
        }

        shopContainer.innerHTML = '';
        const list = dietState.shoppingList || [];

        list.forEach((cat, catIdx) => {
            const group = document.createElement('div');
            group.className = 'shop-category-group';
            const itemsHtml = (cat.items || []).map((item, itemIdx) => `
                <li class="shop-item" style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                    <label style="flex:1;cursor:pointer;"><input type="checkbox" checked> <span>${item}</span></label>
                    <button type="button" class="btn-del-shop-item" data-cat="${catIdx}" data-item="${itemIdx}" style="background:transparent;border:none;color:#f87171;cursor:pointer;padding:2px 6px;font-size:0.82rem;transition:color 0.2s;" title="Remove item" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#f87171'">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </li>
            `).join('');

            group.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.4rem;">
                    <span class="shop-cat-title"><i class="fa-solid ${cat.icon}"></i> ${cat.category}</span>
                    <small style="color:var(--text-muted);font-size:0.75rem;">${(cat.items || []).length} items</small>
                </div>
                <ul class="shop-checklist">
                    ${itemsHtml || '<li style="color:var(--text-muted);font-size:0.8rem;padding:4px 0;">No items in this category.</li>'}
                </ul>
                <div style="display:flex;gap:0.4rem;margin-top:0.6rem;">
                    <input type="text" class="add-shop-input" data-cat="${catIdx}" placeholder="+ Add custom ingredient..." style="flex:1;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:4px 8px;color:#fff;font-size:0.8rem;outline:none;">
                    <button type="button" class="btn-add-shop-item" data-cat="${catIdx}" style="background:linear-gradient(135deg,var(--primary-purple),#7c3aed);border:none;color:#fff;padding:4px 10px;border-radius:6px;font-size:0.78rem;font-weight:600;cursor:pointer;white-space:nowrap;">
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>
            `;
            shopContainer.appendChild(group);
        });

        // Attach event listeners for Remove buttons
        shopContainer.querySelectorAll('.btn-del-shop-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const catIdx = parseInt(e.currentTarget.getAttribute('data-cat'), 10);
                const itemIdx = parseInt(e.currentTarget.getAttribute('data-item'), 10);
                if (dietState.shoppingList[catIdx] && dietState.shoppingList[catIdx].items) {
                    const removed = dietState.shoppingList[catIdx].items.splice(itemIdx, 1);
                    renderShoppingList(false);
                    showToast(`🗑️ Removed "${removed[0] || 'item'}" from shopping list`, 'fa-trash-can');
                }
            });
        });

        // Attach event listeners for Add buttons & Enter key
        shopContainer.querySelectorAll('.btn-add-shop-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const catIdx = parseInt(e.currentTarget.getAttribute('data-cat'), 10);
                const inputEl = shopContainer.querySelector(`.add-shop-input[data-cat="${catIdx}"]`);
                if (inputEl) {
                    const val = inputEl.value.trim();
                    if (val) {
                        if (!dietState.shoppingList[catIdx].items) dietState.shoppingList[catIdx].items = [];
                        dietState.shoppingList[catIdx].items.push(val);
                        renderShoppingList(false);
                        showToast(`🛒 Added "${val}" to shopping list!`, 'fa-cart-plus');
                    } else {
                        showToast('Please type an ingredient name to add.', 'fa-circle-exclamation');
                    }
                }
            });
        });

        shopContainer.querySelectorAll('.add-shop-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const catIdx = parseInt(e.currentTarget.getAttribute('data-cat'), 10);
                    const btn = shopContainer.querySelector(`.btn-add-shop-item[data-cat="${catIdx}"]`);
                    if (btn) btn.click();
                }
            });
        });
    }

    // ── Render 7-Day Nutrition History ───────────────────────────────────────
    function renderDietHistory(historyList) {
        const tbody = document.querySelector('.diet-history-table tbody');
        if (!tbody) return;

        if (!historyList || historyList.length === 0) return;

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const today = new Date();

        tbody.innerHTML = historyList.map((plan, idx) => {
            const planDate = plan.createdAt ? new Date(plan.createdAt) : new Date(Date.now() - (idx * 86400000));
            const isToday = (planDate.toDateString() === today.toDateString()) || (idx === 0);
            const isYesterday = !isToday && (today.getDate() - planDate.getDate() === 1);

            let dayLabel = `${dayNames[planDate.getDay()]}`;
            if (isToday) dayLabel = `Today (${dayNames[today.getDay()]})`;
            else if (isYesterday) dayLabel = `Yesterday (${dayNames[planDate.getDay()]})`;

            const dateSub = `${monthNames[planDate.getMonth()]} ${planDate.getDate()}, ${planDate.getFullYear()}`;
            
            let planCals = 0;
            let planProt = 0;
            let planCarbs = 0;
            let planFats = 0;
            if (Array.isArray(plan.meals)) {
                plan.meals.forEach(m => {
                    planCals += m.calories || 0;
                    planProt += m.proteinG || 0;
                    planCarbs += m.carbsG || 0;
                    planFats += m.fatsG || 0;
                });
            }
            if (planCals === 0) planCals = plan.targetCalories || 2600;
            if (planProt === 0) planProt = plan.targetProteinG || 180;
            if (planCarbs === 0) planCarbs = plan.targetCarbsG || 280;
            if (planFats === 0) planFats = plan.targetFatsG || 70;

            const targetCals = plan.targetCalories || 2600;
            const statusBadge = (idx === 0)
                ? '<span class="badge-status-pill in-progress">In Progress</span>'
                : '<span class="badge-status-pill completed">100% Hit</span>';

            return `
                <tr>
                    <td>
                        <div class="table-user-cell">
                            <strong>${dayLabel}</strong>
                            <small>${dateSub}</small>
                        </div>
                    </td>
                    <td><strong>${planCals.toLocaleString()}</strong> / ${targetCals.toLocaleString()}</td>
                    <td class="text-purple">${planProt}g</td>
                    <td class="text-yellow">${planCarbs}g</td>
                    <td class="text-green">${planFats}g</td>
                    <td>${idx === 0 ? dietState.waterIntake.toFixed(1) : '3.0'} L</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
    }

    // ── Recalculate and Synchronize Diet Totals ───────────────────────────────
    function populateDietData() {
        let consumedCals = 0;
        let consumedProtein = 0;
        let consumedCarbs = 0;
        let consumedFat = 0;
        let completedCount = 0;

        dietState.meals.forEach(m => {
            if (m.completed) {
                consumedCals += m.cals;
                consumedProtein += m.protein;
                consumedCarbs += m.carbs;
                consumedFat += m.fat;
                completedCount++;
            }
        });

        const remainingCals = Math.max(0, dietState.targetCalories - consumedCals);
        const calPercentage = Math.min(100, Math.round((consumedCals / dietState.targetCalories) * 100));

        // Update Hero Ring
        if (heroCalConsumed) heroCalConsumed.textContent = consumedCals.toLocaleString();
        if (dietHeroRingProgress) {
            const deg = Math.round((calPercentage / 100) * 360);
            dietHeroRingProgress.style.background = `conic-gradient(var(--primary-purple) 0deg ${deg}deg, rgba(255, 255, 255, 0.08) ${deg}deg 360deg)`;
        }

        // Update Hero Headings & Subtext
        if (dietCalRemainingHighlight) dietCalRemainingHighlight.textContent = `${remainingCals.toLocaleString()} kcal Remaining`;
        if (dietCalSubText) {
            const uncompletedCount = dietState.meals.length - completedCount;
            dietCalSubText.innerHTML = `You have met <strong>${calPercentage}%</strong> of your daily energy goal. ${uncompletedCount} ${uncompletedCount === 1 ? 'meal' : 'meals'} remaining to hit your target cleanly.`;
        }

        // Update Target Cal Pill
        if (dietTargetCalPill) dietTargetCalPill.innerHTML = `<i class="fa-solid fa-calculator"></i> ${dietState.targetCalories.toLocaleString()} kcal Target`;

        // Update Hero Macro Pills
        if (heroProteinShort) heroProteinShort.textContent = `${consumedProtein}g`;
        if (heroTargetProtein) heroTargetProtein.textContent = `${dietState.targetProtein}g`;
        if (heroCarbsShort) heroCarbsShort.textContent = `${consumedCarbs}g`;
        if (heroTargetCarbs) heroTargetCarbs.textContent = `${dietState.targetCarbs}g`;
        if (heroFatsShort) heroFatsShort.textContent = `${consumedFat}g`;
        if (heroTargetFats) heroTargetFats.textContent = `${dietState.targetFats}g`;

        // Update 4-Stat Hero Matrix
        if (dietStatGoal) dietStatGoal.innerHTML = `${dietState.targetCalories.toLocaleString()} <small>kcal</small>`;
        if (dietStatConsumed) dietStatConsumed.innerHTML = `${consumedCals.toLocaleString()} <small>kcal</small>`;
        if (dietStatRemaining) dietStatRemaining.innerHTML = `${remainingCals.toLocaleString()} <small>kcal</small>`;
        if (dietStatWater) dietStatWater.innerHTML = `${dietState.waterIntake.toFixed(1)} <small>/ ${dietState.waterGoal.toFixed(1)} L</small>`;

        // Update Completion Badge
        if (mealCompletionCountBadge) {
            mealCompletionCountBadge.textContent = `${completedCount} of ${dietState.meals.length} Meals Completed`;
        }

        // Update Right Column Macro Profile Bars
        const proteinPct = Math.min(100, Math.round((consumedProtein / dietState.targetProtein) * 100));
        const carbsPct = Math.min(100, Math.round((consumedCarbs / dietState.targetCarbs) * 100));
        const fatsPct = Math.min(100, Math.round((consumedFat / dietState.targetFats) * 100));

        if (progProteinVal) progProteinVal.textContent = consumedProtein;
        if (progProteinBar) progProteinBar.style.width = `${proteinPct}%`;
        const pLabel = progProteinVal?.closest('.macro-label-row')?.querySelector('strong');
        if (pLabel) pLabel.innerHTML = `<span>${consumedProtein}</span> / ${dietState.targetProtein}g (${proteinPct}%)`;

        if (progCarbsVal) progCarbsVal.textContent = consumedCarbs;
        if (progCarbsBar) progCarbsBar.style.width = `${carbsPct}%`;
        const cLabel = progCarbsVal?.closest('.macro-label-row')?.querySelector('strong');
        if (cLabel) cLabel.innerHTML = `<span>${consumedCarbs}</span> / ${dietState.targetCarbs}g (${carbsPct}%)`;

        if (progFatsVal) progFatsVal.textContent = consumedFat;
        if (progFatsBar) progFatsBar.style.width = `${fatsPct}%`;
        const fLabel = progFatsVal?.closest('.macro-label-row')?.querySelector('strong');
        if (fLabel) fLabel.innerHTML = `<span>${consumedFat}</span> / ${dietState.targetFats}g (${fatsPct}%)`;

        if (pdfClientName) pdfClientName.textContent = regProfile.name || 'Athlete';

        updateWaterUI();
    }

    // ── Load All Diet Data from Backend API ──────────────────────────────────
    async function loadDietData() {
        try {
            const todayRes = await fetch('/api/diet/today', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (todayRes.status === 401) {
                if (handleApiUnauthorized(todayRes)) return;
            }

            if (todayRes.ok) {
                const data = await todayRes.json();
                if (data.success && data.dietPlan) {
                    const plan = data.dietPlan;
                    dietState.activePlanId = plan.id;

                    let dType = (plan.dietType || 'non-vegetarian').toLowerCase();
                    if (dType === 'veg') dType = 'vegetarian';
                    if (DIET_PRESETS[dType]) {
                        currentDietType = dType;
                        dietState.currentDietType = dType;
                        sessionStorage.setItem('fitpulse_diet_type', dType);
                    }

                    dietState.targetCalories = plan.targetCalories || activePreset.targetCalories;
                    dietState.targetProtein = plan.targetProteinG || activePreset.targetProtein;
                    dietState.targetCarbs = plan.targetCarbsG || activePreset.targetCarbs;
                    dietState.targetFats = plan.targetFatsG || activePreset.targetFats;

                    if (data.waterLiters !== undefined) {
                        dietState.waterIntake = data.waterLiters;
                    }

                    // Map backend meals to UI cards
                    if (Array.isArray(plan.meals) && plan.meals.length > 0) {
                        dietState.meals = plan.meals.map((m, idx) => {
                            const typeKey = (m.mealType || 'snack').toLowerCase();
                            let badgeClass = 'badge-yellow';
                            let typeNumber = `MEAL ${idx + 1} • ${typeKey.toUpperCase()}`;
                            if (typeKey.includes('break')) { badgeClass = 'badge-yellow'; typeNumber = 'MEAL 1 • BREAKFAST'; }
                            else if (typeKey.includes('lunch')) { badgeClass = 'badge-purple'; typeNumber = 'MEAL 3 • LUNCH'; }
                            else if (typeKey.includes('dinn')) { badgeClass = 'badge-green'; typeNumber = 'MEAL 5 • DINNER'; }
                            else { badgeClass = 'badge-blue'; typeNumber = `MEAL ${idx + 1} • SNACK`; }

                            let img = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                            if (typeKey.includes('break')) img = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80';
                            else if (typeKey.includes('lunch')) img = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                            else if (typeKey.includes('dinn')) img = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80';
                            else if (typeKey.includes('snack')) img = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80';

                            let items = [];
                            if (m.notes && m.notes.trim().startsWith('[')) {
                                try { items = JSON.parse(m.notes); } catch (ignored) {}
                            }
                            if (!items || items.length === 0) {
                                items = [{ name: `${m.itemName} (${m.quantity || '1 Serving'})`, cals: `${m.calories} kcal` }];
                            }

                            return {
                                id: String(m.id),
                                dbId: m.id,
                                typeNumber: typeNumber,
                                name: m.itemName,
                                time: m.timeSlot || '08:00 AM',
                                cals: m.calories,
                                protein: m.proteinG,
                                carbs: m.carbsG,
                                fat: m.fatsG,
                                fiber: 6,
                                completed: !!m.isCompleted,
                                img: img,
                                items: items,
                                badgeClass: badgeClass,
                                mealType: m.mealType,
                                quantity: m.quantity
                            };
                        });
                    }

                    // Sync timeline and shopping list from preset
                    const p = DIET_PRESETS[dietState.currentDietType] || DIET_PRESETS['non-vegetarian'];
                    if (p) {
                        dietState.timeline = JSON.parse(JSON.stringify(p.timeline));
                        dietState.shoppingList = JSON.parse(JSON.stringify(p.shoppingList));
                    }

                    // Update selector tab buttons UI
                    document.querySelectorAll('.diet-type-btn, .diet-type-tab-btn').forEach(btn => {
                        const isMatch = btn.dataset.dietType === dietState.currentDietType;
                        btn.classList.toggle('active', isMatch);
                        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
                        btn.style.display = isMatch ? '' : 'none';
                    });

                    // Update current diet badge
                    if (currentDietTypeBadge && p) {
                        currentDietTypeBadge.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${p.emoji} ${p.label} Active`;
                    }

                    // Render UI
                    renderMealCards(false);
                    renderTimeline(false);
                    renderShoppingList(false);
                    populateDietData();
                }
            }

            // Fetch diet history
            const histRes = await fetch('/api/diet/history', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (histRes.ok) {
                const histData = await histRes.json();
                if (histData.success && Array.isArray(histData.dietPlans)) {
                    dietState.history = histData.dietPlans;
                    renderDietHistory(histData.dietPlans);
                }
            }
        } catch (err) {
            console.warn('Diet fetch API notice, continuing with loaded defaults:', err);
            renderMealCards(false);
            renderTimeline(false);
            renderShoppingList(false);
            populateDietData();
        }
    }

    // ── Switch Diet Type Handler (Persisted to Backend) ──────────────────────
    async function setDietType(typeKey, animate = true) {
        if (!DIET_PRESETS[typeKey]) return;
        currentDietType = typeKey;
        dietState.currentDietType = typeKey;
        sessionStorage.setItem('fitpulse_diet_type', typeKey);

        const preset = DIET_PRESETS[typeKey];
        dietState.targetCalories = preset.targetCalories;
        dietState.targetProtein = preset.targetProtein;
        dietState.targetCarbs = preset.targetCarbs;
        dietState.targetFats = preset.targetFats;
        dietState.meals = JSON.parse(JSON.stringify(preset.meals));
        dietState.timeline = JSON.parse(JSON.stringify(preset.timeline));
        dietState.shoppingList = JSON.parse(JSON.stringify(preset.shoppingList));

        // Update selector tab buttons UI
        document.querySelectorAll('.diet-type-btn, .diet-type-tab-btn').forEach(btn => {
            const isMatch = btn.dataset.dietType === typeKey;
            btn.classList.toggle('active', isMatch);
            btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
            btn.style.display = isMatch ? '' : 'none';
        });

        // Update current diet badge
        if (currentDietTypeBadge) {
            currentDietTypeBadge.innerHTML = `<i class="fa-solid fa-sparkles"></i> ${preset.emoji} ${preset.label} Active`;
        }

        // Render UI
        renderMealCards(animate);
        renderTimeline(animate);
        renderShoppingList(animate);
        populateDietData();

        // Persist preference to Java/MySQL backend
        try {
            const res = await fetch('/api/diet/preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ preference: typeKey })
            });
            const data = await res.json();
            if (data.success && data.dietPlan) {
                dietState.activePlanId = data.dietPlan.id;
            }
        } catch (ignored) {}

        showToast(`${preset.emoji} Switched to ${preset.label}! Recipes and macro targets updated.`, 'fa-circle-check');
    }

    // Attach click listeners on Diet Type buttons
    document.querySelectorAll('.diet-type-btn, .diet-type-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosenType = btn.dataset.dietType;
            if (chosenType && chosenType !== currentDietType) {
                setDietType(chosenType, true);
            }
        });
    });

    // ── Delete Meal Handler ──────────────────────────────────────────────────
    async function handleDeleteMeal(mealId) {
        if (!mealId) return;
        const mealObj = dietState.meals.find(m => String(m.id) === String(mealId));
        const mealName = mealObj ? mealObj.name : 'Meal';

        if (!confirm(`Are you sure you want to remove "${mealName}" from your diet plan?`)) {
            return;
        }

        // Check if meal exists in database
        const dbId = (mealObj && mealObj.dbId) ? mealObj.dbId : (parseInt(mealId, 10) || null);
        if (dbId) {
            try {
                await fetch('/api/diet/meal/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ mealId: dbId })
                });
            } catch (ignored) {}
        }

        // Remove from client state
        dietState.meals = dietState.meals.filter(m => String(m.id) !== String(mealId));
        renderMealCards(true);
        populateDietData();
        showToast(`🗑️ Removed "${mealName}" from your plan.`, 'fa-trash-can');
    }

    // ── Meal Toggle & Action Event Listeners ──────────────────────────────────
    function attachMealToggleListeners() {
        document.querySelectorAll('.meal-complete-toggle-btn').forEach(btn => {
            btn.onclick = async () => {
                const mealId = btn.dataset.mealId;
                const mealObj = dietState.meals.find(m => String(m.id) === String(mealId));
                const card = btn.closest('.meal-card');

                const isDone = btn.classList.contains('completed');
                if (isDone) {
                    btn.classList.remove('completed');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Mark Eaten</span>';
                    if (card) {
                        card.classList.remove('completed');
                        const pill = card.querySelector('.meal-status-pill');
                        if (pill) {
                            pill.className = 'meal-status-pill upcoming';
                            pill.innerHTML = '<i class="fa-solid fa-clock"></i> Upcoming';
                        }
                    }
                    if (mealObj) mealObj.completed = false;
                    showToast(`Unchecked: ${mealObj ? mealObj.name : 'Meal'} removed from intake.`, 'fa-rotate-left');
                } else {
                    btn.classList.add('completed');
                    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Completed</span>';
                    if (card) {
                        card.classList.add('completed');
                        const pill = card.querySelector('.meal-status-pill');
                        if (pill) {
                            pill.className = 'meal-status-pill done';
                            pill.innerHTML = '<i class="fa-solid fa-check"></i> Completed';
                        }
                    }
                    if (mealObj) mealObj.completed = true;
                    showToast(`🥗 Logged: ${mealObj ? mealObj.name : 'Meal'} (+${mealObj ? mealObj.cals : 0} kcal)!`, 'fa-circle-check');
                }

                // If meal has a backend DB ID, sync completion status
                if (mealObj && mealObj.dbId) {
                    try {
                        await fetch('/api/diet/meal/update', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                mealId: mealObj.dbId,
                                isCompleted: mealObj.completed ? 1 : 0
                            })
                        });
                    } catch (ignored) {}
                }

                populateDietData();
            };
        });

        document.querySelectorAll('.edit-meal-btn').forEach(btn => {
            btn.onclick = () => {
                const mealId = btn.dataset.mealId;
                const mealObj = dietState.meals.find(m => String(m.id) === String(mealId));
                if (mealObj) {
                    openAddMeal(mealObj);
                }
            };
        });

        document.querySelectorAll('.delete-meal-btn').forEach(btn => {
            btn.onclick = () => {
                const mealId = btn.dataset.mealId;
                handleDeleteMeal(mealId);
            };
        });
    }

    // ── Water Hydration Tracker Logic (Persisted to Backend) ──────────────────
    const dietWaterLiveNum    = document.getElementById('dietWaterLiveNum');
    const dietWaterPctBadge   = document.getElementById('dietWaterPctBadge');
    const dietWaterBarFill    = document.getElementById('dietWaterBarFill');
    const waterBottlesRow     = document.getElementById('waterBottlesRow');

    function updateWaterUI() {
        const pct = Math.min(100, Math.round((dietState.waterIntake / dietState.waterGoal) * 100));
        if (dietWaterLiveNum) dietWaterLiveNum.textContent = dietState.waterIntake.toFixed(2);
        if (dietWaterPctBadge) dietWaterPctBadge.textContent = `${pct}%`;
        if (dietWaterBarFill) dietWaterBarFill.style.width = `${pct}%`;
        if (dietStatWater) dietStatWater.innerHTML = `${dietState.waterIntake.toFixed(1)} <small>/ ${dietState.waterGoal.toFixed(1)} L</small>`;

        const valWater = document.getElementById('valWater');
        if (valWater) valWater.textContent = dietState.waterIntake.toFixed(1);

        // Dashboard Water UI sync
        if (typeof window.syncDashboardWater === 'function') {
            window.syncDashboardWater(dietState.waterIntake);
        }
        const dashRingFill = document.getElementById('waterRingFill');
        const dashRingPct = document.getElementById('waterRingPct');
        if (dashRingFill) dashRingFill.style.strokeDashoffset = 238.76 - (238.76 * pct / 100);
        if (dashRingPct) dashRingPct.textContent = `${pct}%`;

        const dashGlassContainer = document.getElementById('waterGlassIcons');
        if (dashGlassContainer) {
            const glasses = dashGlassContainer.querySelectorAll('.w-glass-dot');
            const filledCount = Math.floor(dietState.waterIntake / 0.25);
            glasses.forEach((glass, i) => {
                glass.style.background = i < filledCount ? 'rgba(6,182,212,1)' : 'rgba(6,182,212,0.08)';
                glass.style.boxShadow = i < filledCount ? '0 0 6px rgba(6,182,212,0.6)' : 'none';
            });
        }

        const dashBarFill = document.getElementById('waterProgressBarFill');
        const dashPctText = document.getElementById('waterPctText');
        if (dashBarFill) dashBarFill.style.width = `${pct}%`;
        if (dashPctText) {
            let msg = 'Start drinking!';
            if (pct >= 100) msg = 'Goal reached! 🎉';
            else if (pct >= 50) msg = 'Halfway there!';
            else if (pct > 0) msg = 'Keep it up!';
            dashPctText.textContent = `${pct}% - ${msg}`;
        }

        // Update the 6 visual water bottle icons (0.5L increments: 0.5, 1.0, 1.5, 2.0, 2.5, 3.0)
        if (waterBottlesRow) {
            const bottles = waterBottlesRow.querySelectorAll('.w-bottle');
            bottles.forEach((bottle, i) => {
                const targetL = (i + 1) * 0.5;
                if (dietState.waterIntake >= targetL) {
                    bottle.className = 'w-bottle filled';
                } else if (dietState.waterIntake >= targetL - 0.25) {
                    bottle.className = 'w-bottle half-filled';
                } else {
                    bottle.className = 'w-bottle empty';
                }
            });
        }
    }

    async function logWater(amount) {
        dietState.waterIntake = Math.max(0.0, Math.min(5.0, +((dietState.waterIntake || 0.0) + amount).toFixed(2)));
        updateWaterUI();
        populateDietData();
        showToast(`💧 ${amount >= 0 ? 'Logged +' + Math.round(amount * 1000) + 'ml' : 'Removed ' + Math.round(Math.abs(amount) * 1000) + 'ml'} water! Current intake: ${(dietState.waterIntake || 0.0).toFixed(2)} L`, 'fa-droplet');

        try {
            const res = await fetch('/api/diet/water', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ delta: amount })
            });
            const data = await res.json();
            if (data.success && data.waterLiters !== undefined) {
                dietState.waterIntake = data.waterLiters;
                updateWaterUI();
                populateDietData();
            }
        } catch (ignored) {}
    }

    window.logWater = logWater;

    // Hydration Action Buttons
    document.getElementById('btnLogWater250')?.addEventListener('click', () => logWater(0.25));
    document.getElementById('btnLogWater500')?.addEventListener('click', () => logWater(0.50));
    document.getElementById('dqaAddWater250')?.addEventListener('click', () => logWater(0.25));
    document.getElementById('dqaAddWater500')?.addEventListener('click', () => logWater(0.50));

    // Interactive bottle tapping
    if (waterBottlesRow) {
        waterBottlesRow.querySelectorAll('.w-bottle').forEach((bottle, i) => {
            bottle.addEventListener('click', async () => {
                const targetL = (i + 1) * 0.5;
                dietState.waterIntake = targetL;
                updateWaterUI();
                populateDietData();
                showToast(`💧 Hydration target set to ${targetL.toFixed(1)} Liters!`, 'fa-droplet');

                try {
                    const res = await fetch('/api/diet/water', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ waterLiters: targetL })
                    });
                    const data = await res.json();
                    if (data.success && data.waterLiters !== undefined) {
                        dietState.waterIntake = data.waterLiters;
                        updateWaterUI();
                        populateDietData();
                    }
                } catch (ignored) {}
            });
        });
    }

    // ── Supplements Checklist ────────────────────────────────────────────────
    document.querySelectorAll('.supp-check-item input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', () => {
            const label = chk.closest('.supp-check-item')?.querySelector('strong')?.textContent || 'Supplement';
            if (chk.checked) {
                showToast(`💊 Taken: ${label}`, 'fa-capsules');
            } else {
                showToast(`Unchecked: ${label}`, 'fa-rotate-left');
            }
        });
    });

    // ── Grocery Shopping List & Add Item ─────────────────────────────────────
    const addGroceryForm = document.getElementById('addGroceryForm');
    const newGroceryInput = document.getElementById('newGroceryInput');
    const copyShoppingListBtn = document.getElementById('copyShoppingListBtn');

    if (addGroceryForm && newGroceryInput) {
        addGroceryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const itemName = newGroceryInput.value.trim();
            if (!itemName) return;

            const categoryGroup = document.querySelector('#shoppingListCategories .shop-category-group:last-child .shop-checklist');
            if (categoryGroup) {
                const li = document.createElement('li');
                li.className = 'shop-item';
                li.innerHTML = `<label><input type="checkbox" checked> <span>${itemName}</span></label>`;
                categoryGroup.appendChild(li);
            }

            newGroceryInput.value = '';
            showToast(`🛒 Added "${itemName}" to Grocery Shopping List!`, 'fa-cart-plus');
        });
    }

    if (copyShoppingListBtn) {
        copyShoppingListBtn.addEventListener('click', () => {
            const activeP = DIET_PRESETS[dietState.currentDietType] || DIET_PRESETS['vegetarian'];
            let text = `FITPULSE SHOPPING LIST (${activeP.label.toUpperCase()}):\n\n`;
            dietState.shoppingList.forEach(cat => {
                text += `[${cat.category}]\n`;
                (cat.items || []).forEach(item => text += ` - ${item}\n`);
                text += '\n';
            });
            navigator.clipboard?.writeText(text).then(() => {
                showToast('📋 Shopping list copied to clipboard!', 'fa-copy');
            }).catch(() => {
                showToast('📋 Shopping list ready in your pantry notes!', 'fa-copy');
            });
        });
    }

    // ── Log / Add / Edit Custom Meal Modal ───────────────────────────────────
    const addMealModal        = document.getElementById('addMealModal');
    const closeAddMealModal   = document.getElementById('closeAddMealModal');
    const cancelAddMealBtn    = document.getElementById('cancelAddMealBtn');
    const addMealForm         = document.getElementById('addMealForm');
    const dqaAddMeal          = document.getElementById('dqaAddMeal');

    function openAddMeal(mealObj = null) {
        if (!addMealModal) return;
        const nameInput = document.getElementById('mealCustomName');
        const calsInput = document.getElementById('mealCustomCalories');
        const protInput = document.getElementById('mealCustomProtein');
        const carbInput = document.getElementById('mealCustomCarbs');
        const fatInput  = document.getElementById('mealCustomFats');
        const catSelect = document.getElementById('mealCategorySelect');
        const modalTitle = addMealModal.querySelector('h2');
        const submitBtn = addMealForm ? addMealForm.querySelector('button[type="submit"]') : null;

        if (mealObj) {
            currentEditMealId = mealObj.dbId || mealObj.id;
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square icon-accent"></i> Edit Meal Details`;
            if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Save Meal Updates</span>`;
            if (nameInput) nameInput.value = mealObj.name || '';
            if (calsInput) calsInput.value = mealObj.cals || '';
            if (protInput) protInput.value = mealObj.protein || '';
            if (carbInput) carbInput.value = mealObj.carbs || '';
            if (fatInput)  fatInput.value  = mealObj.fat || '';
            if (catSelect && mealObj.mealType) {
                catSelect.value = mealObj.mealType.toLowerCase();
            }
        } else {
            currentEditMealId = null;
            if (modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-bowl-food icon-accent"></i> Log / Add Custom Meal`;
            if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-plus-circle"></i> <span>Log Meal Entry</span>`;
            if (addMealForm) addMealForm.reset();
        }

        addMealModal.classList.remove('hidden');
    }

    function closeAddMeal() {
        if (addMealModal) addMealModal.classList.add('hidden');
        currentEditMealId = null;
        if (addMealForm) addMealForm.reset();
    }

    if (dqaAddMeal) dqaAddMeal.addEventListener('click', () => openAddMeal(null));
    if (closeAddMealModal) closeAddMealModal.addEventListener('click', closeAddMeal);
    if (cancelAddMealBtn) cancelAddMealBtn.addEventListener('click', closeAddMeal);

    if (addMealForm) {
        addMealForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const cat = document.getElementById('mealCategorySelect')?.value || 'breakfast';
            const name = document.getElementById('mealCustomName')?.value.trim();
            const cals = parseInt(document.getElementById('mealCustomCalories')?.value, 10) || 0;
            const protein = parseInt(document.getElementById('mealCustomProtein')?.value, 10) || 0;
            const carbs = parseInt(document.getElementById('mealCustomCarbs')?.value, 10) || 0;
            const fats = parseInt(document.getElementById('mealCustomFats')?.value, 10) || 0;

            if (!name || cals <= 0) {
                showToast('Please enter a valid meal name and calorie amount.', 'fa-triangle-exclamation');
                return;
            }

            if (currentEditMealId) {
                // UPDATE MEAL ENDPOINT
                try {
                    const res = await fetch('/api/diet/meal/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            mealId: currentEditMealId,
                            mealType: cat,
                            itemName: name,
                            calories: cals,
                            proteinG: protein,
                            carbsG: carbs,
                            fatsG: fats
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast(`✏️ Updated meal: "${name}" (${cals} kcal)!`, 'fa-circle-check');
                        loadDietData();
                    } else {
                        showToast(data.message || 'Failed to update meal.', 'fa-triangle-exclamation');
                    }
                } catch (err) {
                    // Update client state fallback
                    const mObj = dietState.meals.find(m => String(m.id) === String(currentEditMealId));
                    if (mObj) {
                        mObj.name = name;
                        mObj.cals = cals;
                        mObj.protein = protein;
                        mObj.carbs = carbs;
                        mObj.fat = fats;
                    }
                    renderMealCards(true);
                    populateDietData();
                    showToast(`✏️ Updated meal: "${name}"!`, 'fa-circle-check');
                }
            } else {
                // ADD MEAL ENDPOINT
                try {
                    const res = await fetch('/api/diet/meal', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            dietPlanId: dietState.activePlanId,
                            mealType: cat,
                            itemName: name,
                            calories: cals,
                            proteinG: protein,
                            carbsG: carbs,
                            fatsG: fats,
                            timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast(`🍲 Logged meal: "${name}" (+${cals} kcal)!`, 'fa-circle-check');
                        loadDietData();
                    } else {
                        showToast(data.message || 'Failed to save meal.', 'fa-triangle-exclamation');
                    }
                } catch (err) {
                    // Fallback to client state
                    const newMeal = {
                        id: `custom_${Date.now()}`,
                        typeNumber: `CUSTOM • ${cat.toUpperCase()}`,
                        name: name,
                        cals: cals,
                        protein: protein,
                        carbs: carbs,
                        fat: fats,
                        fiber: 5,
                        completed: true,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
                        items: [{ name: name, cals: `${cals} kcal` }],
                        badgeClass: 'badge-purple'
                    };
                    dietState.meals.push(newMeal);
                    renderMealCards(true);
                    populateDietData();
                    showToast(`🍲 Added and logged: "${name}" (+${cals} kcal)!`, 'fa-circle-check');
                }
            }

            closeAddMeal();
        });
    }

    // ── Download Diet Plan PDF Modal & Exporter ───────────────────────────────
    const dietPlanModal         = document.getElementById('dietPlanModal');
    const closeDietPlanModal    = document.getElementById('closeDietPlanModal');
    const closeDietPlanBtn      = document.getElementById('closeDietPlanBtn');
    const confirmDownloadPdfBtn = document.getElementById('confirmDownloadPdfBtn');
    const dqaDownloadPlan       = document.getElementById('dqaDownloadPlan');

    function openDietPlanExport() {
        if (pdfClientName) pdfClientName.textContent = regProfile.name || 'Athlete';
        if (dietPlanModal) dietPlanModal.classList.remove('hidden');
    }

    function closeDietPlanExport() {
        if (dietPlanModal) dietPlanModal.classList.add('hidden');
    }

    if (dqaDownloadPlan) dqaDownloadPlan.addEventListener('click', openDietPlanExport);
    if (closeDietPlanModal) closeDietPlanModal.addEventListener('click', closeDietPlanExport);
    if (closeDietPlanBtn) closeDietPlanBtn.addEventListener('click', closeDietPlanExport);

    if (confirmDownloadPdfBtn) {
        confirmDownloadPdfBtn.addEventListener('click', () => {
            const athleteName = regProfile.name || 'Athlete';
            const activeP = DIET_PRESETS[dietState.currentDietType] || DIET_PRESETS['vegetarian'];
            
            let mealsSummary = '';
            dietState.meals.forEach((m, idx) => {
                mealsSummary += `${idx + 1}. ${m.time} - ${m.name.toUpperCase()} (${m.cals} kcal):\n`;
                (m.items || []).forEach(it => {
                    mealsSummary += `   - ${it.name} (${it.cals})\n`;
                });
                mealsSummary += `   Macros: ${m.protein}g Protein | ${m.carbs}g Carbs | ${m.fat}g Fats\n\n`;
            });

            const dietSummaryText = `
=========================================================
  FITPULSE PRECISION NUTRITION PRESCRIPTION & MEAL PLAN
=========================================================
Client: ${athleteName}
Diet Type: ${activeP.label.toUpperCase()} (${activeP.tag})
Goal: ${getGoalText(regProfile.fitnessGoal).toUpperCase()}
Daily Calorie Target: ${dietState.targetCalories} kcal
Macronutrient Target: ${dietState.targetProtein}g Protein | ${dietState.targetCarbs}g Carbs | ${dietState.targetFats}g Healthy Fats
Daily Hydration Target: ${dietState.waterGoal.toFixed(2)} Liters (6 x 500ml Servings)

DAILY PRESCRIBED MEAL TIMELINE:
${mealsSummary}
SUPPLEMENT REGIMEN:
- Morning: Vitamin D3 + K2 (5000 IU), Ultra Omega-3 / Algal DHA (2000mg)
- Pre-Workout: Creapure Creatine Monohydrate (5g), L-Citrulline Malate (6g)
- Evening: Zinc & Magnesium Glycinate (400mg)

Prescribed by: FitPulse Precision Nutrition Engine & Macro Calculator
FitPulse Performance Systems (c) 2026
=========================================================
`;
            const blob = new Blob([dietSummaryText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FitPulse_${activeP.label.replace(/\s+/g, '_')}_Plan_${athleteName.replace(/\s+/g, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            closeDietPlanExport();
            showToast('📄 Downloaded Precision Diet Prescription document!', 'fa-file-arrow-down');
        });
    }

    // Bind Diet Type Selector Tab Buttons
    document.querySelectorAll('.diet-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedType = btn.dataset.dietType;
            if (selectedType) {
                switchDietType(selectedType);
                showToast(`Switched diet plan to ${DIET_PRESETS[selectedType]?.label || selectedType}`, 'fa-utensils');
            }
        });
    });

    // Initial render & sync with user registration diet preference on startup
    window.syncDietPreference = function() {
        const autoDietType = resolveUserDietType();
        switchDietType(autoDietType);
        loadDietData();
    };
    
    window.syncDietPreference();

