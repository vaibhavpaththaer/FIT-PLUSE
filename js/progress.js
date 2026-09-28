// FitPulse — Fitness Progress, Biometric Analytics & Reports

    // =========================================================================
    // 15.5 FITNESS PROGRESS & BIOMETRIC ANALYTICS DASHBOARD MODULE
    // =========================================================================

    const progressState = {
        currentWeight: 72.0,
        startingWeight: 76.5,
        targetWeight: 70.0,
        heightCm: 176,
        bodyFat: 18.0,
        startingBodyFat: 22.5,
        targetBodyFat: 15.0,
        muscleMass: 34.2,
        startingMuscleMass: 31.4,
        workoutStreak: 14,
        totalWorkouts: 48,
        totalHours: 42.5,
        monthlyGoalWorkouts: 20,
        completedMonthlyWorkouts: 18,
        weeklyGoalWorkouts: 5,
        completedWeeklyWorkouts: 4,
        caloriesBurned: 32450,
        avgSteps: 10420,
        waterAvg: 3.2,
        sleepHours: 7.8,
        activeTimeRange: '30d',
        measurements: {
            chest: { current: 104.0, initial: 100.5, delta: '+3.5 cm', unit: 'cm' },
            waist: { current: 81.0, initial: 85.0, delta: '-4.0 cm', unit: 'cm' },
            arms: { current: 38.5, initial: 36.5, delta: '+2.0 cm', unit: 'cm' },
            hips: { current: 96.0, initial: 98.5, delta: '-2.5 cm', unit: 'cm' },
            thighs: { current: 58.0, initial: 56.5, delta: '+1.5 cm', unit: 'cm' },
            shoulders: { current: 122.0, initial: 118.0, delta: '+4.0 cm', unit: 'cm' }
        },
        workoutHistory: [
            { id: 1, date: 'Aug 6, 2026', time: '06:30 PM', title: 'Lower Body Power & Quad Squats', category: 'hypertrophy', meta: '5 Exercises • 18 Sets • Coach Marcus', duration: '58 mins', cals: '585 kcal', hr: '154 bpm', isPR: true, prText: '🏆 PR 120kg Squat', status: 'Completed' },
            { id: 2, date: 'Aug 5, 2026', time: '07:00 AM', title: 'Back Width & Biceps Hypertrophy', category: 'hypertrophy', meta: '5 Exercises • 16 Sets', duration: '52 mins', cals: '490 kcal', hr: '142 bpm', isPR: false, prText: '', status: 'Completed' },
            { id: 3, date: 'Aug 4, 2026', time: '06:00 PM', title: 'Active Mobility & Core Stability', category: 'mobility', meta: '4 Exercises • 12 Sets', duration: '35 mins', cals: '210 kcal', hr: '120 bpm', isPR: false, prText: '', status: 'Completed' },
            { id: 4, date: 'Aug 2, 2026', time: '06:15 PM', title: 'Chest & Triceps Overload', category: 'hypertrophy', meta: '5 Exercises • 18 Sets', duration: '55 mins', cals: '530 kcal', hr: '148 bpm', isPR: true, prText: '🏆 PR 34kg DB Press', status: 'Completed' },
            { id: 5, date: 'Aug 1, 2026', time: '07:30 AM', title: 'High-Intensity HIIT & Sprints', category: 'hiit', meta: '6 Circuits • 24 Mins', duration: '40 mins', cals: '465 kcal', hr: '168 bpm', isPR: false, prText: '', status: 'Completed' },
            { id: 6, date: 'Jul 30, 2026', time: '06:30 PM', title: 'Leg Hypertrophy & Calves Blast', category: 'hypertrophy', meta: '6 Exercises • 20 Sets', duration: '60 mins', cals: '610 kcal', hr: '158 bpm', isPR: true, prText: '🏆 PR 140kg Hack Squat', status: 'Completed' }
        ],
        photos: [
            { id: 'p1', date: 'Jan 1, 2026', weight: '76.5 kg', bf: '22.5%', tag: 'Jan 1 • 76.5kg', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80' },
            { id: 'p2', date: 'Mar 15, 2026', weight: '75.0 kg', bf: '21.0%', tag: 'Mar 15 • 75.0kg', url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80' },
            { id: 'p3', date: 'May 10, 2026', weight: '74.2 kg', bf: '19.8%', tag: 'May 10 • 74.2kg', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80' },
            { id: 'p4', date: 'Jun 28, 2026', weight: '73.1 kg', bf: '18.9%', tag: 'Jun 28 • 73.1kg', url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&auto=format&fit=crop&q=80' },
            { id: 'p5', date: 'Jul 20, 2026', weight: '72.4 kg', bf: '18.4%', tag: 'Jul 20 • 72.4kg', url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80' },
            { id: 'p6', date: 'Aug 7, 2026', weight: '72.0 kg', bf: '18.0%', tag: 'Aug 7 • 72.0kg', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80' }
        ]
    };

    // Chart instances store
    let progressCharts = {
        weekly: null,
        monthly: null,
        workoutHistory: null,
        activity: null,
        radar: null
    };

    // Chart Data Presets per Time Range
    const PROGRESS_CHART_PRESETS = {
        '7d': {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'],
            weeklyWorkouts: [1, 1, 0, 1, 1, 1, 0],
            weeklyCalories: [2300, 2550, 2100, 2700, 2450, 2800, 2150],
            monthlyWeight: [72.6, 72.4, 72.5, 72.2, 72.1, 72.0, 72.0],
            monthlyBmi: [23.4, 23.3, 23.3, 23.2, 23.2, 23.1, 23.1],
            historyDurations: [45, 60, 0, 55, 52, 58, 35],
            historyCalories: [480, 620, 0, 580, 490, 585, 210],
            dailySteps: [9800, 11200, 8900, 12400, 10600, 14100, 10850],
            dailyWater: [3.0, 3.4, 2.8, 3.6, 3.2, 3.8, 3.2]
        },
        '30d': {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'],
            weeklyWorkouts: [4, 5, 4, 5, 4],
            weeklyCalories: [17200, 18400, 16900, 19100, 17800],
            monthlyWeight: [74.2, 73.6, 73.0, 72.4, 72.0],
            monthlyBmi: [23.9, 23.7, 23.5, 23.3, 23.1],
            historyDurations: [210, 260, 220, 280, 250],
            historyCalories: [2200, 2700, 2300, 2900, 2600],
            dailySteps: [71000, 78200, 70500, 81400, 76200],
            dailyWater: [22.5, 24.8, 22.0, 25.5, 23.4]
        },
        '90d': {
            labels: ['Jun 2026', 'Jul 2026', 'Aug 2026'],
            weeklyWorkouts: [18, 20, 18],
            weeklyCalories: [74000, 78500, 72000],
            monthlyWeight: [75.0, 73.4, 72.0],
            monthlyBmi: [24.1, 23.6, 23.1],
            historyDurations: [980, 1100, 960],
            historyCalories: [10200, 11500, 10100],
            dailySteps: [315000, 335000, 318000],
            dailyWater: [98.0, 105.0, 96.0]
        },
        '1y': {
            labels: ['Oct', 'Dec', 'Feb', 'Apr', 'Jun', 'Aug'],
            weeklyWorkouts: [15, 17, 18, 20, 20, 18],
            weeklyCalories: [62000, 68000, 72000, 78000, 79500, 74200],
            monthlyWeight: [77.5, 76.5, 75.2, 74.0, 72.8, 72.0],
            monthlyBmi: [25.0, 24.6, 24.2, 23.8, 23.4, 23.1],
            historyDurations: [820, 950, 1020, 1140, 1150, 1050],
            historyCalories: [8600, 9900, 10700, 11800, 12000, 11100],
            dailySteps: [275000, 295000, 310000, 332000, 338000, 318000],
            dailyWater: [88.0, 94.0, 98.0, 104.0, 106.0, 98.0]
        }
    };

    // Calculate BMI Helper
    function getBMICategory(bmi) {
        if (bmi < 18.5) return { label: 'Underweight', color: '#38bdf8' };
        if (bmi < 25.0) return { label: 'Normal Weight (Optimal)', color: '#10b981' };
        if (bmi < 30.0) return { label: 'Overweight', color: '#f59e0b' };
        return { label: 'Obese', color: '#ef4444' };
    }

    // Dynamic Backend Integration: Fetch Progress & Biometrics Data from Java Servlet
    async function loadProgressData(rangeParam, customStart, customEnd) {
        try {
            let url = '/api/progress';
            const params = new URLSearchParams();
            if (customStart && customEnd) {
                params.append('startDate', customStart);
                params.append('endDate', customEnd);
            } else if (rangeParam) {
                params.append('range', rangeParam);
            } else if (progressState.activeTimeRange) {
                params.append('range', progressState.activeTimeRange);
            }
            const qs = params.toString();
            if (qs) url += `?${qs}`;

            const res = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401) {
                if (handleApiUnauthorized(res)) return;
            }

            if (!res.ok) {
                console.warn('Progress fetch HTTP status:', res.status);
                return;
            }

            const data = await res.json();
            if (!data || !data.success) return;

            // 1. Sync User Biometrics & Live State
            if (data.metrics) {
                if (data.metrics.weightKg) progressState.currentWeight = data.metrics.weightKg;
                if (data.metrics.targetWeightKg) progressState.targetWeight = data.metrics.targetWeightKg;
                if (data.metrics.heightCm) progressState.heightCm = data.metrics.heightCm;
                if (data.metrics.bodyFatPct !== undefined && data.metrics.bodyFatPct !== null) {
                    progressState.bodyFat = data.metrics.bodyFatPct;
                }
                if (data.metrics.muscleMassKg !== undefined && data.metrics.muscleMassKg !== null) {
                    progressState.muscleMass = data.metrics.muscleMassKg;
                }
                if (data.metrics.caloriesBurned) progressState.caloriesBurned = data.metrics.caloriesBurned;
                if (data.metrics.streakDays !== undefined) progressState.workoutStreak = data.metrics.streakDays;
                if (data.metrics.totalWorkouts !== undefined) progressState.totalWorkouts = data.metrics.totalWorkouts;

                if (typeof regProfile !== 'undefined') {
                    if (data.metrics.weightKg) regProfile.weight = data.metrics.weightKg;
                    if (data.metrics.heightCm) regProfile.height = data.metrics.heightCm;
                    if (data.metrics.streakDays !== undefined) regProfile.streak = data.metrics.streakDays;
                    if (data.metrics.totalWorkouts !== undefined) regProfile.totalWorkouts = data.metrics.totalWorkouts;
                }
            }

            // 2. Summary stats sync
            if (data.summary) {
                if (data.summary.avgSteps) progressState.avgSteps = data.summary.avgSteps;
                if (data.summary.avgWater) progressState.waterAvg = data.summary.avgWater;
                if (data.summary.startWeightKg) progressState.startingWeight = data.summary.startWeightKg;
                if (data.summary.weeklyWorkouts !== undefined) progressState.completedWeeklyWorkouts = data.summary.weeklyWorkouts;
                if (data.summary.monthlyWorkouts !== undefined) progressState.completedMonthlyWorkouts = data.summary.monthlyWorkouts;
            }

            // 3. Dynamic Chart Presets update from live database history
            if (data.history && Array.isArray(data.history) && data.history.length > 0) {
                const hist = data.history;
                const labels = hist.map(h => {
                    if (!h.recordDate) return '';
                    const parts = h.recordDate.split('-');
                    if (parts.length === 3) {
                        const mIndex = parseInt(parts[1], 10) - 1;
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${monthNames[mIndex] || ''} ${parseInt(parts[2], 10)}`;
                    }
                    const d = new Date(h.recordDate);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });

                const cals = hist.map(h => h.caloriesBurned || 0);
                const weights = hist.map(h => h.weightKg || progressState.currentWeight);
                const bmis = hist.map(h => {
                    const w = h.weightKg || progressState.currentWeight;
                    const hM = (progressState.heightCm || 176) / 100;
                    return parseFloat((w / (hM * hM)).toFixed(1));
                });
                const workouts = hist.map(h => h.workoutsCompleted || 1);
                const durations = hist.map(h => (h.workoutsCompleted > 0 ? (h.workoutsCompleted * 50) : 0));
                const steps = hist.map(h => h.steps || 0);
                const waters = hist.map(h => h.waterLiters || 0);

                const activeKey = rangeParam || progressState.activeTimeRange || '30d';
                PROGRESS_CHART_PRESETS[activeKey] = {
                    labels: labels,
                    weeklyWorkouts: workouts,
                    weeklyCalories: cals,
                    monthlyWeight: weights,
                    monthlyBmi: bmis,
                    historyDurations: durations,
                    historyCalories: cals,
                    dailySteps: steps,
                    dailyWater: waters
                };
            }

            populateProgressData();
            initOrUpdateProgressCharts();
        } catch (err) {
            console.warn('Progress fetch API notice:', err);
        }
    }

    // Populate all text, numbers, progress bars in the Progress View
    function populateProgressData() {
        const curW = progressState.currentWeight;
        const startW = progressState.startingWeight;
        const tgtW = progressState.targetWeight;
        const netLost = (startW - curW).toFixed(1);
        const remToTgt = (curW - tgtW).toFixed(1);

        const hM = progressState.heightCm / 100;
        const bmiVal = (curW / (hM * hM)).toFixed(1);
        const bmiCat = getBMICategory(parseFloat(bmiVal));

        // Goal Progress Calculation
        const totalWeightJourney = Math.max(0.1, startW - tgtW); // 76.5 - 70.0 = 6.5kg
        const weightProgressMade = Math.max(0, startW - curW); // 76.5 - 72.0 = 4.5kg
        const goalPercent = Math.min(100, Math.max(0, Math.round((weightProgressMade / totalWeightJourney) * 100)));

        // 1. Dashboard Summary 8 Metric Cards (Requirement 1 & 12)
        const progValWeight = document.getElementById('progValWeight');
        const progValTargetWeight = document.getElementById('progValTargetWeight');
        const progValBMI = document.getElementById('progValBMI');
        const progValBodyFat = document.getElementById('progValBodyFat');
        const progValMuscleMass = document.getElementById('progValMuscleMass');
        const progValCompletionRate = document.getElementById('progValCompletionRate');
        const progValCalories = document.getElementById('progValCalories');
        const progValStreak = document.getElementById('progValStreak');

        if (progValWeight) progValWeight.textContent = curW.toFixed(1);
        if (progValTargetWeight) progValTargetWeight.textContent = tgtW.toFixed(1);
        if (progValBMI) progValBMI.textContent = bmiVal;
        if (progValBodyFat) progValBodyFat.textContent = progressState.bodyFat.toFixed(1);
        if (progValMuscleMass) progValMuscleMass.textContent = progressState.muscleMass.toFixed(1);
        const compRate = Math.round((progressState.completedMonthlyWorkouts / progressState.monthlyGoalWorkouts) * 100);
        if (progValCompletionRate) progValCompletionRate.textContent = compRate;
        if (progValCalories) progValCalories.textContent = progressState.caloriesBurned.toLocaleString();
        if (progValStreak) progValStreak.textContent = progressState.workoutStreak;

        // 2. Core Biometric Focus Cards (Requirement 2)
        // Card A: Current Weight
        const pccCurrentWeightVal = document.getElementById('pccCurrentWeightVal');
        const pccTargetWeightVal = document.getElementById('pccTargetWeightVal');
        const pccWeightDeltaVal = document.getElementById('pccWeightDeltaVal');
        if (pccCurrentWeightVal) pccCurrentWeightVal.textContent = curW.toFixed(1);
        if (pccTargetWeightVal) pccTargetWeightVal.textContent = `${tgtW.toFixed(1)} kg`;
        if (pccWeightDeltaVal) pccWeightDeltaVal.innerHTML = `<i class="fa-solid fa-arrow-down"></i> -${netLost} kg`;

        // Card B: BMI
        const pccCurrentBmiVal = document.getElementById('pccCurrentBmiVal');
        const pccBmiCategoryVal = document.getElementById('pccBmiCategoryVal');
        if (pccCurrentBmiVal) pccCurrentBmiVal.textContent = bmiVal;
        if (pccBmiCategoryVal) pccBmiCategoryVal.textContent = bmiCat.label;

        // Card C: Body Fat %
        const pccCurrentBodyFatVal = document.getElementById('pccCurrentBodyFatVal');
        const pccTargetBodyFatVal = document.getElementById('pccTargetBodyFatVal');
        const pccBodyFatProgressVal = document.getElementById('pccBodyFatProgressVal');
        const pccBodyFatProgressFill = document.getElementById('pccBodyFatProgressFill');
        const bfLost = (progressState.startingBodyFat - progressState.bodyFat).toFixed(1);
        const bfTotalSpan = progressState.startingBodyFat - progressState.targetBodyFat;
        const bfPctDone = Math.min(100, Math.max(0, Math.round(((progressState.startingBodyFat - progressState.bodyFat) / bfTotalSpan) * 100)));

        if (pccCurrentBodyFatVal) pccCurrentBodyFatVal.textContent = progressState.bodyFat.toFixed(1);
        if (pccTargetBodyFatVal) pccTargetBodyFatVal.textContent = `${progressState.targetBodyFat.toFixed(1)}%`;
        if (pccBodyFatProgressVal) pccBodyFatProgressVal.innerHTML = `<i class="fa-solid fa-arrow-down"></i> -${bfLost}% reduction reached`;
        if (pccBodyFatProgressFill) pccBodyFatProgressFill.style.width = `${bfPctDone}%`;

        // Card D: Workout Completion
        const pccCompletedCount = document.getElementById('pccCompletedCount');
        const pccRemainingCount = document.getElementById('pccRemainingCount');
        const pccCompletionPctText = document.getElementById('pccCompletionPctText');
        const pccCompletionPctNum = document.getElementById('pccCompletionPctNum');
        const progCompletionCircle = document.getElementById('progCompletionCircle');

        const remWorkouts = Math.max(0, progressState.monthlyGoalWorkouts - progressState.completedMonthlyWorkouts);
        if (pccCompletedCount) pccCompletedCount.textContent = `${progressState.completedMonthlyWorkouts} Sessions`;
        if (pccRemainingCount) pccRemainingCount.textContent = `${remWorkouts} Sessions`;
        if (pccCompletionPctText) pccCompletionPctText.textContent = `${compRate}% Target Met`;
        if (pccCompletionPctNum) pccCompletionPctNum.textContent = `${compRate}%`;

        if (progCompletionCircle) {
            // Circumference for r=42 is ~264
            const offset = 264 - (264 * (compRate / 100));
            progCompletionCircle.style.strokeDashoffset = offset.toFixed(1);
        }

        // 3. Goal Progress Banner (Requirement 6)
        const progGoalPct = document.getElementById('progGoalPct');
        const progGoalBarFill = document.getElementById('progGoalBarFill');
        if (progGoalPct) progGoalPct.textContent = `${goalPercent}%`;
        if (progGoalBarFill) progGoalBarFill.style.width = `${goalPercent}%`;

        // 4. Anthropometric Measurements & Trends (Requirement 4)
        const m = progressState.measurements;
        const measWeight = document.getElementById('measWeight');
        const deltaMeasWeight = document.getElementById('deltaMeasWeight');
        const measHeight = document.getElementById('measHeight');
        const measChest = document.getElementById('measChest');
        const deltaMeasChest = document.getElementById('deltaMeasChest');
        const measWaist = document.getElementById('measWaist');
        const deltaMeasWaist = document.getElementById('deltaMeasWaist');
        const measArms = document.getElementById('measArms');
        const deltaMeasArms = document.getElementById('deltaMeasArms');
        const measHips = document.getElementById('measHips');
        const deltaMeasHips = document.getElementById('deltaMeasHips');
        const measThighs = document.getElementById('measThighs');
        const deltaMeasThighs = document.getElementById('deltaMeasThighs');

        if (measWeight) measWeight.textContent = curW.toFixed(1);
        if (deltaMeasWeight) deltaMeasWeight.textContent = `↓ -${netLost} kg`;
        if (measHeight) measHeight.textContent = (progressState.heightCm).toFixed(1);
        if (measChest) measChest.textContent = m.chest.current.toFixed(1);
        if (deltaMeasChest) deltaMeasChest.textContent = `↑ ${m.chest.delta}`;
        if (measWaist) measWaist.textContent = m.waist.current.toFixed(1);
        if (deltaMeasWaist) deltaMeasWaist.textContent = `↓ ${m.waist.delta}`;
        if (measArms) measArms.textContent = m.arms.current.toFixed(1);
        if (deltaMeasArms) deltaMeasArms.textContent = `↑ ${m.arms.delta}`;
        if (measHips) measHips.textContent = m.hips.current.toFixed(1);
        if (deltaMeasHips) deltaMeasHips.textContent = `↓ ${m.hips.delta}`;
        if (measThighs) measThighs.textContent = m.thighs.current.toFixed(1);
        if (deltaMeasThighs) deltaMeasThighs.textContent = `↑ ${m.thighs.delta}`;

        // 5. Fitness Statistics (Requirement 5)
        const statTotalWorkouts = document.getElementById('statTotalWorkouts');
        const statTotalHours = document.getElementById('statTotalHours');
        const statCaloriesBurned = document.getElementById('statCaloriesBurned');
        const statAvgSteps = document.getElementById('statAvgSteps');
        const statWaterIntake = document.getElementById('statWaterIntake');
        const statSleepHours = document.getElementById('statSleepHours');

        if (statTotalWorkouts) statTotalWorkouts.textContent = progressState.totalWorkouts;
        if (statTotalHours) statTotalHours.textContent = progressState.totalHours;
        if (statCaloriesBurned) statCaloriesBurned.textContent = progressState.caloriesBurned.toLocaleString();
        if (statAvgSteps) statAvgSteps.textContent = progressState.avgSteps.toLocaleString();
        if (statWaterIntake) statWaterIntake.textContent = `${progressState.waterAvg.toFixed(1)} L`;
        if (statSleepHours) statSleepHours.textContent = progressState.sleepHours.toFixed(1);

        // Chart Stat Pills Sync
        const wtCurrentPill = document.getElementById('wtCurrentPill');
        if (wtCurrentPill) wtCurrentPill.textContent = `${curW.toFixed(1)} kg`;

        // Render workout history table
        renderWorkoutHistoryTable();
    }

    // Render Workout History Table with Filter Support (Requirement 11)
    function renderWorkoutHistoryTable(filterCategory = 'all') {
        const tbody = document.getElementById('progHistoryTableBody');
        if (!tbody) return;

        const list = progressState.workoutHistory.filter(w => {
            if (filterCategory === 'all') return true;
            if (filterCategory === 'hypertrophy') return w.category === 'hypertrophy';
            if (filterCategory === 'pr') return w.isPR;
            return true;
        });

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">No workout records found for this filter.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(item => `
            <tr>
                <td>
                    <strong>${item.date}</strong>
                    <small class="table-sub-text">${item.time}</small>
                </td>
                <td>
                    <strong class="table-main-title">${item.title}</strong>
                    <small class="table-sub-text">${item.meta}</small>
                </td>
                <td><strong>${item.duration}</strong></td>
                <td><strong class="text-orange">${item.cals}</strong></td>
                <td>
                    ${item.isPR 
                        ? `<span class="perf-badge badge-pr">${item.prText}</span>` 
                        : `<span class="perf-badge badge-completed"><i class="fa-solid fa-check"></i> 100% Completed</span>`}
                </td>
                <td><button class="table-action-btn" title="View Details" onclick="showToast('Viewing details for ${item.title.replace(/'/g, "\\'")}', 'fa-eye')"><i class="fa-solid fa-eye"></i></button></td>
            </tr>
        `).join('');

        // Trigger dynamic report synchronization with real database metrics
        if (typeof fetchReportData === 'function') {
            fetchReportData('monthly');
        }
    }

    // Common Chart Styling Options
    const darkChartCommonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' },
                    boxWidth: 12,
                    boxHeight: 12,
                    borderRadius: 3
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(139, 92, 246, 0.4)',
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
                usePointStyle: true
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { size: 10 } }
            }
        }
    };

    // Initialize or Update All 5 Progress Charts (Requirement 3 & 4)
    function initOrUpdateProgressCharts() {
        if (typeof Chart === 'undefined') return;

        const timeKey = progressState.activeTimeRange || '30d';
        const d = PROGRESS_CHART_PRESETS[timeKey] || PROGRESS_CHART_PRESETS['30d'];

        // 1. CHART 1: WEEKLY PROGRESS (Interactive Line Chart: Workout Completion & Calories Burned)
        const weeklyCtx = document.getElementById('weeklyProgressChart');
        if (weeklyCtx) {
            if (progressCharts.weekly) progressCharts.weekly.destroy();
            const grad1 = weeklyCtx.getContext('2d').createLinearGradient(0, 0, 0, 260);
            grad1.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
            grad1.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

            const grad2 = weeklyCtx.getContext('2d').createLinearGradient(0, 0, 0, 260);
            grad2.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
            grad2.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

            progressCharts.weekly = new Chart(weeklyCtx, {
                type: 'line',
                data: {
                    labels: d.labels,
                    datasets: [
                        {
                            label: 'Calories Burned (kcal)',
                            data: d.weeklyCalories,
                            borderColor: '#f59e0b',
                            backgroundColor: grad2,
                            yAxisID: 'yCals',
                            fill: true,
                            tension: 0.35,
                            pointBackgroundColor: '#f59e0b',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            borderWidth: 2.5
                        },
                        {
                            label: 'Workout Sessions',
                            data: d.weeklyWorkouts,
                            borderColor: '#8b5cf6',
                            backgroundColor: grad1,
                            yAxisID: 'ySessions',
                            fill: true,
                            tension: 0.35,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            borderWidth: 2.5
                        }
                    ]
                },
                options: {
                    ...darkChartCommonOptions,
                    scales: {
                        x: darkChartCommonOptions.scales.x,
                        yCals: {
                            type: 'linear',
                            position: 'left',
                            grid: { color: 'rgba(255, 255, 255, 0.04)' },
                            ticks: {
                                color: '#f59e0b',
                                font: { size: 10 },
                                callback: val => `${val} kcal`
                            }
                        },
                        ySessions: {
                            type: 'linear',
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: {
                                color: '#a78bfa',
                                font: { size: 10 },
                                stepSize: 1,
                                callback: val => `${val} sess`
                            }
                        }
                    }
                }
            });
        }

        // 2. CHART 2: MONTHLY PROGRESS (Interactive Line Chart: Weight Progress & BMI Progress)
        const monthlyCtx = document.getElementById('monthlyProgressChart');
        if (monthlyCtx) {
            if (progressCharts.monthly) progressCharts.monthly.destroy();
            const wtGrad = monthlyCtx.getContext('2d').createLinearGradient(0, 0, 0, 260);
            wtGrad.addColorStop(0, 'rgba(236, 72, 153, 0.35)');
            wtGrad.addColorStop(1, 'rgba(236, 72, 153, 0.0)');

            progressCharts.monthly = new Chart(monthlyCtx, {
                type: 'line',
                data: {
                    labels: d.labels,
                    datasets: [
                        {
                            label: 'Body Weight (kg)',
                            data: d.monthlyWeight,
                            borderColor: '#ec4899',
                            backgroundColor: wtGrad,
                            yAxisID: 'yWeight',
                            fill: true,
                            tension: 0.35,
                            pointBackgroundColor: '#ec4899',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            borderWidth: 2.5
                        },
                        {
                            label: 'BMI Trend',
                            data: d.monthlyBmi,
                            borderColor: '#38bdf8',
                            yAxisID: 'yBmi',
                            fill: false,
                            tension: 0.35,
                            pointBackgroundColor: '#38bdf8',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 4,
                            borderWidth: 2.5
                        },
                        {
                            label: 'Goal Weight (70.0 kg)',
                            data: Array(d.labels.length).fill(70.0),
                            borderColor: 'rgba(16, 185, 129, 0.7)',
                            borderDash: [5, 5],
                            borderWidth: 1.5,
                            fill: false,
                            pointRadius: 0,
                            yAxisID: 'yWeight'
                        }
                    ]
                },
                options: {
                    ...darkChartCommonOptions,
                    scales: {
                        x: darkChartCommonOptions.scales.x,
                        yWeight: {
                            type: 'linear',
                            position: 'left',
                            min: 68,
                            max: 80,
                            grid: { color: 'rgba(255, 255, 255, 0.04)' },
                            ticks: {
                                color: '#ec4899',
                                font: { size: 10 },
                                callback: val => `${val} kg`
                            }
                        },
                        yBmi: {
                            type: 'linear',
                            position: 'right',
                            min: 21,
                            max: 27,
                            grid: { drawOnChartArea: false },
                            ticks: {
                                color: '#38bdf8',
                                font: { size: 10 },
                                callback: val => `${val}`
                            }
                        }
                    }
                }
            });
        }

        // 3. CHART 3: WORKOUT HISTORY (Weekly Bar Chart: Daily Workout Duration & Volume)
        const historyCtx = document.getElementById('workoutHistoryBarChart');
        if (historyCtx) {
            if (progressCharts.workoutHistory) progressCharts.workoutHistory.destroy();
            progressCharts.workoutHistory = new Chart(historyCtx, {
                type: 'bar',
                data: {
                    labels: d.labels,
                    datasets: [
                        {
                            label: 'Workout Duration (Mins)',
                            data: d.historyDurations,
                            backgroundColor: 'rgba(20, 184, 166, 0.75)',
                            borderColor: '#14b8a6',
                            borderWidth: 1.5,
                            borderRadius: 6,
                            hoverBackgroundColor: '#2dd4bf'
                        }
                    ]
                },
                options: {
                    ...darkChartCommonOptions,
                    scales: {
                        ...darkChartCommonOptions.scales,
                        y: {
                            ...darkChartCommonOptions.scales.y,
                            beginAtZero: true,
                            ticks: {
                                color: '#94a3b8',
                                font: { size: 10 },
                                callback: val => `${val} min`
                            }
                        }
                    }
                }
            });
        }

        // 4. CHART 4: STEP COUNT & WATER INTAKE PROGRESS
        const actCtx = document.getElementById('activityProgressChart');
        if (actCtx) {
            if (progressCharts.activity) progressCharts.activity.destroy();
            progressCharts.activity = new Chart(actCtx, {
                type: 'bar',
                data: {
                    labels: d.labels,
                    datasets: [
                        {
                            type: 'bar',
                            label: 'Daily Steps',
                            data: d.dailySteps,
                            backgroundColor: 'rgba(16, 185, 129, 0.75)',
                            borderColor: '#10b981',
                            borderWidth: 1.5,
                            borderRadius: 6,
                            yAxisID: 'ySteps'
                        },
                        {
                            type: 'line',
                            label: 'Water Intake (L)',
                            data: d.dailyWater,
                            borderColor: '#06b6d4',
                            backgroundColor: 'rgba(6, 182, 212, 0.15)',
                            fill: true,
                            tension: 0.35,
                            pointRadius: 4,
                            pointBackgroundColor: '#06b6d4',
                            borderWidth: 2,
                            yAxisID: 'yWater'
                        }
                    ]
                },
                options: {
                    ...darkChartCommonOptions,
                    scales: {
                        x: darkChartCommonOptions.scales.x,
                        ySteps: {
                            type: 'linear',
                            position: 'left',
                            grid: { color: 'rgba(255, 255, 255, 0.04)' },
                            ticks: {
                                color: '#10b981',
                                font: { size: 10 },
                                callback: val => `${val.toLocaleString()}`
                            }
                        },
                        yWater: {
                            type: 'linear',
                            position: 'right',
                            grid: { drawOnChartArea: false },
                            ticks: {
                                color: '#06b6d4',
                                font: { size: 10 },
                                callback: val => `${val}L`
                            }
                        }
                    }
                }
            });
        }

        // 5. CHART 5: RADAR CHART FOR BODY MEASUREMENTS (Requirement 4)
        const radarCtx = document.getElementById('bodyMeasurementsChart');
        if (radarCtx) {
            if (progressCharts.radar) progressCharts.radar.destroy();
            const m = progressState.measurements;
            progressCharts.radar = new Chart(radarCtx, {
                type: 'radar',
                data: {
                    labels: ['Chest', 'Waist', 'Arms', 'Hips', 'Thighs', 'Shoulders'],
                    datasets: [
                        {
                            label: 'Initial Baseline (Jan 1)',
                            data: [m.chest.initial, m.waist.initial, m.arms.initial, m.hips.initial, m.thighs.initial, m.shoulders.initial],
                            borderColor: 'rgba(148, 163, 184, 0.6)',
                            backgroundColor: 'rgba(148, 163, 184, 0.1)',
                            borderWidth: 1.5,
                            pointRadius: 3
                        },
                        {
                            label: 'Current Physique (Aug 7)',
                            data: [m.chest.current, m.waist.current, m.arms.current, m.hips.current, m.thighs.current, m.shoulders.current],
                            borderColor: '#8b5cf6',
                            backgroundColor: 'rgba(139, 92, 246, 0.35)',
                            borderWidth: 2,
                            pointRadius: 4,
                            pointBackgroundColor: '#8b5cf6',
                            pointBorderColor: '#ffffff'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
                            grid: { color: 'rgba(255, 255, 255, 0.08)' },
                            pointLabels: {
                                color: '#94a3b8',
                                font: { size: 11, weight: '700' }
                            },
                            ticks: {
                                display: false,
                                backdropColor: 'transparent'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#94a3b8',
                                font: { size: 10 }
                            }
                        }
                    }
                }
            });
        }
    }

    // Set Up All Progress View Events, Filters, Modals and Interactions
    function setupProgressInteractions() {
        // ── 1. Global Time Range Filter Buttons (Requirement 9 & 10) ──
        document.querySelectorAll('.prog-time-filters .prog-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const period = btn.dataset.period;
                if (period === 'custom') {
                    const customModal = document.getElementById('customDateRangeModal');
                    if (customModal) customModal.classList.remove('hidden');
                    return;
                }

                document.querySelectorAll('.prog-time-filters .prog-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                progressState.activeTimeRange = period;
                loadProgressData(period);
                showToast(`Calibrated analytics to ${btn.textContent.trim()} window`, 'fa-filter');
            });
        });

        // Chart Card Header Time Tabs
        document.querySelectorAll('.chart-time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const parent = btn.parentElement;
                parent.querySelectorAll('.chart-time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const range = (btn.dataset.range || '30D').toLowerCase();
                progressState.activeTimeRange = range;
                loadProgressData(range);
            });
        });

        // ── 2. Breadcrumb & Back Navigation ──
        const crumbProgToDashboard = document.getElementById('crumbProgToDashboard');
        const progBackToDashBtn = document.getElementById('progBackToDashBtn');
        if (crumbProgToDashboard) crumbProgToDashboard.addEventListener('click', () => switchView('dashboard'));
        if (progBackToDashBtn) progBackToDashBtn.addEventListener('click', () => switchView('dashboard'));

        // ── 3. Workout History Filters (Requirement 11) ──
        document.querySelectorAll('.prog-table-filters .card-tiny-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.prog-table-filters .card-tiny-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.histFilter || 'all';
                renderWorkoutHistoryTable(filter);
            });
        });

        // ── 4. Photo Gallery Thumbnails (Requirement 8) ──
        const galleryThumbs = document.querySelectorAll('#photoGalleryThumbnails .gallery-thumb-item');
        galleryThumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                galleryThumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                const imgUrl = thumb.dataset.img;
                const afterImg = document.getElementById('photoAfterImg');
                if (afterImg && imgUrl) {
                    afterImg.src = imgUrl;
                    showToast(`Loaded preview for ${thumb.dataset.date} (${thumb.dataset.weight})`, 'fa-image');
                }
            });
        });

        // ── 5. UPDATE / LOG WEIGHT MODAL (Requirement 10 & 2) ──
        const updateWeightModal = document.getElementById('updateWeightModal');
        const closeUpdateWeightModal = document.getElementById('closeUpdateWeightModal');
        const cancelUpdateWeightBtn = document.getElementById('cancelUpdateWeightBtn');
        const updateWeightForm = document.getElementById('updateWeightForm');
        const progQaUpdateWeight = document.getElementById('progQaUpdateWeight');
        const pccLogWeightBtn = document.getElementById('pccLogWeightBtn');

        const openWeightModal = () => {
            if (updateWeightModal) {
                const wInput = document.getElementById('newWeightInput');
                if (wInput) wInput.value = progressState.currentWeight;
                const bfInput = document.getElementById('newBodyFatInput');
                if (bfInput) bfInput.value = progressState.bodyFat;
                updateWeightModal.classList.remove('hidden');
            }
        };
        const closeWeightModal = () => {
            if (updateWeightModal) updateWeightModal.classList.add('hidden');
        };

        if (progQaUpdateWeight) progQaUpdateWeight.addEventListener('click', openWeightModal);
        if (pccLogWeightBtn) pccLogWeightBtn.addEventListener('click', openWeightModal);
        if (closeUpdateWeightModal) closeUpdateWeightModal.addEventListener('click', closeWeightModal);
        if (cancelUpdateWeightBtn) cancelUpdateWeightBtn.addEventListener('click', closeWeightModal);

        if (updateWeightForm) {
            updateWeightForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newW = parseFloat(document.getElementById('newWeightInput').value);
                const newBf = parseFloat(document.getElementById('newBodyFatInput').value);
                if (!newW || isNaN(newW)) return;

                try {
                    const res = await fetch('/api/progress/weight', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            weightKg: newW,
                            bodyFatPct: !isNaN(newBf) && newBf > 0 ? newBf : progressState.bodyFat
                        })
                    });

                    if (res.status === 401) {
                        if (handleApiUnauthorized(res)) return;
                    }

                    const data = await res.json();
                    if (data && data.success) {
                        progressState.currentWeight = data.weightKg || newW;
                        if (!isNaN(newBf) && newBf > 0) progressState.bodyFat = newBf;
                        if (typeof regProfile !== 'undefined') regProfile.weight = progressState.currentWeight;

                        populateProgressData();
                        initOrUpdateProgressCharts();
                        if (typeof loadDashboardData === 'function') loadDashboardData();
                        closeWeightModal();
                        showToast(`✅ Logged Weigh-In: ${newW.toFixed(1)} kg! Dynamic BMI: ${data.bmi || ''} (${data.bmiCategory || ''})`, 'fa-weight-scale');
                    } else {
                        showToast(data.message || 'Failed to update weight.', 'fa-triangle-exclamation');
                    }
                } catch (err) {
                    console.error('Error logging weight to API:', err);
                    progressState.currentWeight = newW;
                    if (!isNaN(newBf) && newBf > 0) progressState.bodyFat = newBf;
                    if (typeof regProfile !== 'undefined') regProfile.weight = newW;
                    populateProgressData();
                    initOrUpdateProgressCharts();
                    closeWeightModal();
                    showToast(`✅ Logged Weigh-In: ${newW.toFixed(1)} kg!`, 'fa-weight-scale');
                }
            });
        }

        // ── 6. LOG BODY MEASUREMENTS MODAL (Requirement 4 & 10) ──
        const measurementsModal = document.getElementById('measurementsModal');
        const closeMeasurementsModal = document.getElementById('closeMeasurementsModal');
        const cancelMeasurementsBtn = document.getElementById('cancelMeasurementsBtn');
        const measurementsForm = document.getElementById('measurementsForm');
        const progQaAddMeasurements = document.getElementById('progQaAddMeasurements');
        const progAddMeasurementsBtn = document.getElementById('progAddMeasurementsBtn');

        const openMeasModal = () => {
            if (measurementsModal) {
                const m = progressState.measurements;
                const cEl = document.getElementById('inputMeasChest');
                const wEl = document.getElementById('inputMeasWaist');
                const aEl = document.getElementById('inputMeasArms');
                const hEl = document.getElementById('inputMeasHips');
                const tEl = document.getElementById('inputMeasThighs');
                const sEl = document.getElementById('inputMeasShoulders');

                if (cEl) cEl.value = m.chest.current;
                if (wEl) wEl.value = m.waist.current;
                if (aEl) aEl.value = m.arms.current;
                if (hEl) hEl.value = m.hips.current;
                if (tEl) tEl.value = m.thighs.current;
                if (sEl) sEl.value = m.shoulders.current;

                measurementsModal.classList.remove('hidden');
            }
        };
        const closeMeasModal = () => {
            if (measurementsModal) measurementsModal.classList.add('hidden');
        };

        if (progQaAddMeasurements) progQaAddMeasurements.addEventListener('click', openMeasModal);
        if (progAddMeasurementsBtn) progAddMeasurementsBtn.addEventListener('click', openMeasModal);
        if (closeMeasurementsModal) closeMeasurementsModal.addEventListener('click', closeMeasModal);
        if (cancelMeasurementsBtn) cancelMeasurementsBtn.addEventListener('click', closeMeasModal);

        if (measurementsForm) {
            measurementsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const c = parseFloat(document.getElementById('inputMeasChest').value) || 104;
                const w = parseFloat(document.getElementById('inputMeasWaist').value) || 81;
                const a = parseFloat(document.getElementById('inputMeasArms').value) || 38.5;
                const h = parseFloat(document.getElementById('inputMeasHips').value) || 96;
                const t = parseFloat(document.getElementById('inputMeasThighs').value) || 58;
                const s = parseFloat(document.getElementById('inputMeasShoulders').value) || 122;

                try {
                    const res = await fetch('/api/progress/measurements', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            chestCm: c,
                            waistCm: w,
                            bicepsCm: a,
                            hipsCm: h,
                            thighsCm: t,
                            shouldersCm: s,
                            weightKg: progressState.currentWeight,
                            bodyFatPct: progressState.bodyFat,
                            muscleMassKg: progressState.muscleMass
                        })
                    });

                    if (res.status === 401) {
                        if (handleApiUnauthorized(res)) return;
                    }
                } catch (err) {
                    console.warn('Measurements API sync notice:', err);
                }

                const m = progressState.measurements;
                m.chest.current = c;
                m.chest.delta = `${(c - m.chest.initial) >= 0 ? '+' : ''}${(c - m.chest.initial).toFixed(1)} cm`;

                m.waist.current = w;
                m.waist.delta = `${(w - m.waist.initial) >= 0 ? '+' : ''}${(w - m.waist.initial).toFixed(1)} cm`;

                m.arms.current = a;
                m.arms.delta = `${(a - m.arms.initial) >= 0 ? '+' : ''}${(a - m.arms.initial).toFixed(1)} cm`;

                m.hips.current = h;
                m.hips.delta = `${(h - m.hips.initial) >= 0 ? '+' : ''}${(h - m.hips.initial).toFixed(1)} cm`;

                m.thighs.current = t;
                m.thighs.delta = `${(t - m.thighs.initial) >= 0 ? '+' : ''}${(t - m.thighs.initial).toFixed(1)} cm`;

                m.shoulders.current = s;
                m.shoulders.delta = `${(s - m.shoulders.initial) >= 0 ? '+' : ''}${(s - m.shoulders.initial).toFixed(1)} cm`;

                populateProgressData();
                initOrUpdateProgressCharts();
                closeMeasModal();
                showToast('📐 Body circumference measurements saved & updated on Radar!', 'fa-ruler-combined');
            });
        }

        // ── 7. UPLOAD PROGRESS PHOTO MODAL (Requirement 8 & 10) ──
        const uploadPhotoModal = document.getElementById('uploadPhotoModal');
        const closeUploadPhotoModal = document.getElementById('closeUploadPhotoModal');
        const cancelUploadPhotoBtn = document.getElementById('cancelUploadPhotoBtn');
        const uploadPhotoForm = document.getElementById('uploadPhotoForm');
        const progQaUploadPhoto = document.getElementById('progQaUploadPhoto');
        const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
        const photoDropzone = document.getElementById('photoDropzone');
        const progressPhotoFileInput = document.getElementById('progressPhotoFileInput');
        const photoPreviewBox = document.getElementById('photoPreviewBox');
        const photoPreviewImg = document.getElementById('photoPreviewImg');
        const photoFileName = document.getElementById('photoFileName');

        const openPhotoModal = () => {
            if (uploadPhotoModal) {
                const wInput = document.getElementById('photoCheckinWeight');
                if (wInput) wInput.value = progressState.currentWeight;
                uploadPhotoModal.classList.remove('hidden');
            }
        };
        const closePhotoModal = () => {
            if (uploadPhotoModal) uploadPhotoModal.classList.add('hidden');
        };

        if (progQaUploadPhoto) progQaUploadPhoto.addEventListener('click', openPhotoModal);
        if (uploadPhotoBtn) uploadPhotoBtn.addEventListener('click', openPhotoModal);
        if (closeUploadPhotoModal) closeUploadPhotoModal.addEventListener('click', closePhotoModal);
        if (cancelUploadPhotoBtn) cancelUploadPhotoBtn.addEventListener('click', closePhotoModal);

        if (photoDropzone && progressPhotoFileInput) {
            photoDropzone.addEventListener('click', () => progressPhotoFileInput.click());
            progressPhotoFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        if (photoPreviewImg) photoPreviewImg.src = re.target.result;
                        if (photoFileName) photoFileName.textContent = file.name;
                        if (photoPreviewBox) photoPreviewBox.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (uploadPhotoForm) {
            uploadPhotoForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const w = parseFloat(document.getElementById('photoCheckinWeight').value);

                if (photoPreviewImg && photoPreviewImg.src) {
                    const currentPhotoEl = document.getElementById('photoAfterImg');
                    if (currentPhotoEl) currentPhotoEl.src = photoPreviewImg.src;
                }

                if (w && !isNaN(w)) {
                    try {
                        await fetch('/api/progress/weight', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ weightKg: w })
                        });
                        progressState.currentWeight = w;
                        if (typeof regProfile !== 'undefined') regProfile.weight = w;
                        populateProgressData();
                        initOrUpdateProgressCharts();
                        if (typeof loadDashboardData === 'function') loadDashboardData();
                    } catch (err) {
                        console.warn('Photo weight sync notice:', err);
                    }
                }

                closePhotoModal();
                showToast(`📸 Progress check-in photo saved successfully (${w || progressState.currentWeight} kg)!`, 'fa-camera');
            });
        }

        // ── 8. COMPARE PHOTOS MODAL (Requirement 8) ──
        const comparePhotosModal = document.getElementById('comparePhotosModal');
        const closeComparePhotosModal = document.getElementById('closeComparePhotosModal');
        const closeCompareModalBtn = document.getElementById('closeCompareModalBtn');
        const comparePhotosBtn = document.getElementById('comparePhotosBtn');

        const openCompareModal = () => {
            if (comparePhotosModal) comparePhotosModal.classList.remove('hidden');
        };
        const closeCompareModal = () => {
            if (comparePhotosModal) comparePhotosModal.classList.add('hidden');
        };

        if (comparePhotosBtn) comparePhotosBtn.addEventListener('click', openCompareModal);
        if (closeComparePhotosModal) closeComparePhotosModal.addEventListener('click', closeCompareModal);
        if (closeCompareModalBtn) closeCompareModalBtn.addEventListener('click', closeCompareModal);

        // ── 9. CUSTOM DATE RANGE FILTER MODAL (Requirement 9) ──
        const customDateRangeModal = document.getElementById('customDateRangeModal');
        const closeCustomDateRangeModal = document.getElementById('closeCustomDateRangeModal');
        const cancelCustomDateBtn = document.getElementById('cancelCustomDateBtn');
        const customDateRangeForm = document.getElementById('customDateRangeForm');

        const closeCustomDateModal = () => {
            if (customDateRangeModal) customDateRangeModal.classList.add('hidden');
        };

        if (closeCustomDateRangeModal) closeCustomDateRangeModal.addEventListener('click', closeCustomDateModal);
        if (cancelCustomDateBtn) cancelCustomDateBtn.addEventListener('click', closeCustomDateModal);

        if (customDateRangeForm) {
            customDateRangeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const sDate = document.getElementById('customStartDate').value;
                const eDate = document.getElementById('customEndDate').value;

                if (sDate && eDate) {
                    loadProgressData('custom', sDate, eDate);
                }
                closeCustomDateModal();
                showToast(`Applied custom analytics date filter: ${sDate} to ${eDate}`, 'fa-calendar-check');
            });
        }

        // ── 10. REAL DATABASE INTEGRATION: MONTHLY & COMPREHENSIVE REPORTS ──
        let latestReportData = null;
        let currentReportPeriod = 'monthly';

        const progressReportModal = document.getElementById('progressReportModal');
        const closeProgressReportModal = document.getElementById('closeProgressReportModal');
        const closeProgressReportBtn = document.getElementById('closeProgressReportBtn');
        const confirmDownloadReportBtn = document.getElementById('confirmDownloadReportBtn');
        const progQaReport = document.getElementById('progQaReport');
        const progReportTopBtn = document.getElementById('progReportTopBtn');
        const monthlyReportCardDownloadBtn = document.getElementById('monthlyReportCardDownloadBtn');
        const monthlyReportCardDownloadFullBtn = document.getElementById('monthlyReportCardDownloadFullBtn');

        /**
         * Fetches real reports data from Java ReportServlet API.
         * Updates both the Monthly Overview card on Progress page and the Report Modal.
         */
        async function fetchReportData(period, startDate, endDate) {
            try {
                let url = '/api/reports';
                const params = new URLSearchParams();
                if (startDate && endDate) {
                    params.append('startDate', startDate);
                    params.append('endDate', endDate);
                } else {
                    params.append('period', period || 'monthly');
                }
                url += `?${params.toString()}`;

                const res = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });

                if (res.status === 401) return null;
                if (!res.ok) return null;

                const data = await res.json();
                if (!data || !data.success) return null;

                latestReportData = data;
                currentReportPeriod = period || 'monthly';

                // 1. Update Monthly Overview Card in Progress View
                const mrSection = document.getElementById('monthlyReportSection');
                if (mrSection) {
                    const tiles = mrSection.querySelectorAll('.mr-stat-tile-value');
                    if (tiles && tiles.length >= 4) {
                        const weightLost = data.summary ? data.summary.weightLostKg : (data.weightReport ? data.weightReport.weightLostKg : 3);
                        const calsBurned = data.summary ? data.summary.caloriesBurned : (data.caloriesReport ? data.caloriesReport.totalCaloriesBurned : 12500);
                        const workoutsDone = data.summary ? data.summary.workoutsCompleted : (data.workoutReport ? data.workoutReport.workoutsCompleted : 24);
                        const attendance = data.summary ? data.summary.attendancePct : (data.workoutReport ? data.workoutReport.attendancePct : 95);

                        tiles[0].textContent = `${weightLost > 0 ? weightLost : 0} kg`;
                        tiles[1].textContent = `${calsBurned.toLocaleString()} kcal`;
                        tiles[2].textContent = `${workoutsDone}`;
                        tiles[3].textContent = `${attendance}%`;
                    }

                    const footerText = mrSection.querySelector('.mrc-footer-info span');
                    if (footerText && data.summary) {
                        footerText.innerHTML = `Monthly Status: <strong>${data.summary.status || 'Goals on Track'}</strong> (${data.period})`;
                    }
                }

                // 2. Update Progress Report Modal UI
                if (progressReportModal) {
                    const clientEl = document.getElementById('repClientName');
                    if (clientEl) clientEl.textContent = data.athlete ? data.athlete.name : ((typeof regProfile !== 'undefined' && regProfile.name) ? regProfile.name : 'Athlete');

                    const periodSubtitle = progressReportModal.querySelector('.card-title-lockup p');
                    if (periodSubtitle) {
                        const athleteName = data.athlete ? data.athlete.name : ((typeof regProfile !== 'undefined' && regProfile.name) ? regProfile.name : 'Athlete');
                        periodSubtitle.innerHTML = `Period: <strong>${data.period}</strong> • Athlete: <strong id="repClientName">${athleteName}</strong>`;
                    }

                    const modalCards = progressReportModal.querySelectorAll('.mr-stat-card');
                    if (modalCards && modalCards.length >= 4) {
                        const weightValEl = modalCards[0].querySelector('div > div');
                        if (weightValEl && data.weightReport) {
                            const wLost = data.weightReport.weightLostKg > 0 ? data.weightReport.weightLostKg : 0;
                            weightValEl.textContent = `${wLost} kg`;
                        }

                        const calsValEl = modalCards[1].querySelector('div > div');
                        if (calsValEl && data.caloriesReport) {
                            calsValEl.textContent = `${data.caloriesReport.totalCaloriesBurned.toLocaleString()} kcal`;
                        }

                        const workoutsValEl = modalCards[2].querySelector('div > div');
                        if (workoutsValEl && data.workoutReport) {
                            workoutsValEl.textContent = `${data.workoutReport.workoutsCompleted}`;
                        }

                        const attValEl = modalCards[3].querySelector('div > div');
                        if (attValEl && data.workoutReport) {
                            attValEl.textContent = `${data.workoutReport.attendancePct}%`;
                        }
                    }

                    const complianceSpan = progressReportModal.querySelector('.monthly-report-body-box > div:last-child span:first-child');
                    if (complianceSpan && data.overallReport) {
                        complianceSpan.innerHTML = `<i class="fa-solid fa-circle-check text-green"></i> Compliance Status: <strong style="color: #ffffff;">${data.overallReport.complianceTier}</strong>`;
                    }
                    const statusBadge = progressReportModal.querySelector('.monthly-report-body-box > div:last-child span:last-child');
                    if (statusBadge && data.overallReport) {
                        statusBadge.textContent = data.overallReport.status ? data.overallReport.status.split('(')[0].trim() : 'Goals on Track';
                    }
                }

                return data;
            } catch (err) {
                console.warn('Report fetch API notice:', err);
                return null;
            }
        }

        const openReportModal = async (period) => {
            const clientEl = document.getElementById('repClientName');
            if (clientEl) clientEl.textContent = (typeof regProfile !== 'undefined' && regProfile.name) ? regProfile.name : 'Athlete';
            if (progressReportModal) progressReportModal.classList.remove('hidden');
            // Fetch and bind latest database analytics
            await fetchReportData(period || currentReportPeriod || 'monthly');
        };

        const closeReportModal = () => {
            if (progressReportModal) progressReportModal.classList.add('hidden');
        };

        /**
         * Generates and downloads real performance dossier & printable report derived from MySQL data.
         * Saves an audit snapshot record via POST /api/reports.
         */
        const executeDownloadMonthlyReportPDF = async () => {
            let reportData = latestReportData;
            if (!reportData) {
                reportData = await fetchReportData(currentReportPeriod || 'monthly');
            }

            const athleteName = reportData && reportData.athlete ? reportData.athlete.name : ((typeof regProfile !== 'undefined' && regProfile.name) ? regProfile.name : 'Athlete');
            const athleteEmail = reportData && reportData.athlete ? reportData.athlete.email : 'athlete@fitpulse.internal';
            const athleteGoal = reportData && reportData.athlete ? reportData.athlete.goal : 'Strength & Hypertrophy';
            const reportDate = reportData ? reportData.period : 'August 2026';

            // Real Metrics from Database
            const weightLost = reportData && reportData.weightReport ? `${reportData.weightReport.weightLostKg > 0 ? reportData.weightReport.weightLostKg : 0} kg` : '3 kg';
            const startWeight = reportData && reportData.weightReport ? `${reportData.weightReport.startWeightKg} kg` : '78.5 kg';
            const currentWeight = reportData && reportData.weightReport ? `${reportData.weightReport.currentWeightKg} kg` : '75.5 kg';
            const bmiVal = reportData && reportData.bmiReport ? `${reportData.bmiReport.currentBmi} (${reportData.bmiReport.bmiCategory})` : '24.2 (Normal)';
            const caloriesBurned = reportData && reportData.caloriesReport ? `${reportData.caloriesReport.totalCaloriesBurned.toLocaleString()} kcal` : '12,500 kcal';
            const avgCalories = reportData && reportData.caloriesReport ? `${reportData.caloriesReport.avgDailyCalories} kcal/day` : '415 kcal/day';
            const workoutsDone = reportData && reportData.workoutReport ? `${reportData.workoutReport.workoutsCompleted}` : '24';
            const scheduledWorkouts = reportData && reportData.workoutReport ? `${reportData.workoutReport.totalScheduled}` : '25';
            const attendancePct = reportData && reportData.workoutReport ? `${reportData.workoutReport.attendancePct}%` : '95%';
            const trainingMin = reportData && reportData.workoutReport ? `${reportData.workoutReport.totalDurationMin} mins` : '1,200 mins';
            const waterIntake = reportData && reportData.waterReport ? `${reportData.waterReport.avgWaterLiters} L/day` : '3.2 L/day';
            const stepsAvg = reportData && reportData.stepReport ? `${reportData.stepReport.avgDailySteps.toLocaleString()} steps/day` : '8,850 steps/day';
            const dietRegimen = reportData && reportData.dietReport ? `${reportData.dietReport.planTitle} (${reportData.dietReport.targetCalories} kcal)` : 'High Protein & Lean Mass (2200 kcal)';
            const complianceTier = reportData && reportData.overallReport ? reportData.overallReport.complianceTier : 'Elite Tier (95%)';
            const overallStatus = reportData && reportData.overallReport ? reportData.overallReport.status : 'Goals on Track (Outstanding Consistency)';
            const streak = reportData && reportData.overallReport ? `${reportData.overallReport.streakDays} Days` : '14 Days';

            // 1. Open Printable PDF Popup Window
            const printWindow = window.open('', '_blank', 'width=840,height=900');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>FitPulse Performance Report - ${reportDate}</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                                background: #0f1120;
                                color: #f8fafc;
                                padding: 36px;
                                margin: 0;
                            }
                            .report-card {
                                max-width: 680px;
                                margin: 0 auto;
                                background: #16192e;
                                border: 2px solid #8b5cf6;
                                border-radius: 16px;
                                padding: 32px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                            }
                            .header {
                                border-bottom: 2px solid rgba(255,255,255,0.1);
                                padding-bottom: 20px;
                                margin-bottom: 20px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            }
                            .title { font-size: 26px; font-weight: 800; color: #8b5cf6; margin: 0; }
                            .subtitle { font-size: 14px; color: #94a3b8; margin-top: 4px; }
                            .badge {
                                background: rgba(16, 185, 129, 0.2);
                                color: #10b981;
                                padding: 6px 14px;
                                border-radius: 999px;
                                font-size: 13px;
                                font-weight: 700;
                            }
                            .grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 14px;
                                margin-bottom: 20px;
                            }
                            .stat-box {
                                background: rgba(255,255,255,0.04);
                                border: 1px solid rgba(255,255,255,0.08);
                                border-radius: 12px;
                                padding: 16px;
                                text-align: center;
                            }
                            .stat-label {
                                font-size: 12px;
                                color: #94a3b8;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                                font-weight: 600;
                                margin-bottom: 4px;
                            }
                            .stat-value {
                                font-size: 28px;
                                font-weight: 800;
                                line-height: 1.2;
                            }
                            .val-green { color: #10b981; }
                            .val-orange { color: #f97316; }
                            .val-purple { color: #a78bfa; }
                            .val-cyan { color: #06b6d4; }
                            .details-table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-bottom: 20px;
                                font-size: 13px;
                            }
                            .details-table td {
                                padding: 8px 12px;
                                border-bottom: 1px solid rgba(255,255,255,0.06);
                            }
                            .details-table td.lbl { color: #94a3b8; font-weight: 600; width: 45%; }
                            .details-table td.val { color: #ffffff; font-weight: 700; }
                            .footer {
                                border-top: 2px solid rgba(255,255,255,0.1);
                                padding-top: 16px;
                                font-size: 12px;
                                color: #94a3b8;
                                display: flex;
                                justify-content: space-between;
                            }
                            @media print {
                                body { background: #ffffff; color: #000000; padding: 20px; }
                                .report-card { background: #ffffff; border: 2px solid #333; color: #000000; box-shadow: none; }
                                .stat-box { border: 1px solid #ccc; background: #f9f9f9; }
                                .title { color: #6d28d9; }
                                .details-table td.lbl { color: #555; }
                                .details-table td.val { color: #000; }
                                .details-table td { border-bottom: 1px solid #ddd; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="report-card">
                            <div class="header">
                                <div>
                                    <h1 class="title">FitPulse Performance Report</h1>
                                    <div class="subtitle">Certified Performance Systems • Period: ${reportDate}</div>
                                    <div class="subtitle">Athlete: <strong>${athleteName}</strong> (${athleteGoal})</div>
                                </div>
                                <span class="badge">${attendancePct} Attendance</span>
                            </div>
                            <div class="grid">
                                <div class="stat-box">
                                    <div class="stat-label">Weight Lost</div>
                                    <div class="stat-value val-green">${weightLost}</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-label">Calories Burned</div>
                                    <div class="stat-value val-orange">${caloriesBurned}</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-label">Workouts Completed</div>
                                    <div class="stat-value val-purple">${workoutsDone}</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-label">Attendance Rate</div>
                                    <div class="stat-value val-cyan">${attendancePct}</div>
                                </div>
                            </div>
                            <table class="details-table">
                                <tr><td class="lbl">Body Mass & BMI:</td><td class="val">${currentWeight} • BMI ${bmiVal}</td></tr>
                                <tr><td class="lbl">Active Training Time:</td><td class="val">${trainingMin} (Scheduled: ${scheduledWorkouts} sessions)</td></tr>
                                <tr><td class="lbl">Daily Calorie Burn:</td><td class="val">${avgCalories}</td></tr>
                                <tr><td class="lbl">Hydration & Steps:</td><td class="val">${waterIntake} • ${stepsAvg}</td></tr>
                                <tr><td class="lbl">Nutrition Regimen:</td><td class="val">${dietRegimen}</td></tr>
                                <tr><td class="lbl">Active Workout Streak:</td><td class="val">${streak}</td></tr>
                                <tr><td class="lbl">Compliance Rating:</td><td class="val">${complianceTier}</td></tr>
                            </table>
                            <div class="footer">
                                <div>Status: <strong>${overallStatus}</strong></div>
                                <div>Issued: ${new Date().toLocaleDateString()}</div>
                            </div>
                        </div>
                        <script>
                            window.onload = function() {
                                window.print();
                            };
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            }

            // 2. Download Real Data Structured Dossier File
            const dossierText = `================================================================================
                     FITPULSE ATHLETE PERFORMANCE DOSSIER                       
================================================================================
Athlete Name        : ${athleteName}
Email Account       : ${athleteEmail}
Primary Goal        : ${athleteGoal}
Reporting Period    : ${reportDate}
Generated Date      : ${new Date().toLocaleString()}
--------------------------------------------------------------------------------
1. BIOMETRIC PROGRESSION & BODY COMPOSITION
   - Starting Weight : ${startWeight}
   - Current Weight  : ${currentWeight}
   - Weight Change   : Lost ${weightLost}
   - Body Mass Index : ${bmiVal}
--------------------------------------------------------------------------------
2. TRAINING & WORKOUT EXECUTION
   - Scheduled       : ${scheduledWorkouts} sessions
   - Completed       : ${workoutsDone} sessions
   - Attendance Rate : ${attendancePct}
   - Active Training : ${trainingMin}
--------------------------------------------------------------------------------
3. ENERGY EXPENDITURE & VITAL LOGS
   - Calories Burned : ${caloriesBurned}
   - Daily Avg Burn  : ${avgCalories}
   - Step Count Avg  : ${stepsAvg}
   - Water Hydration : ${waterIntake}
--------------------------------------------------------------------------------
4. NUTRITION & REGIMEN TARGETS
   - Active Regimen  : ${dietRegimen}
--------------------------------------------------------------------------------
5. EXECUTIVE SUMMARY & COMPLIANCE
   - Tier Ranking    : ${complianceTier}
   - Current Status  : ${overallStatus}
   - Active Streak   : ${streak}
================================================================================
FitPulse Certified Coaching Engine • Powered by Real Database Analytics
================================================================================
`;
            // 3. Asynchronously archive generated report in database
            try {
                fetch('/api/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reportType: 'monthly_performance',
                        period: currentReportPeriod || 'monthly'
                    })
                }).then(() => {
                    if (typeof loadNotificationsData === 'function') {
                        loadNotificationsData();
                    }
                }).catch(e => console.warn('Report audit log notice:', e));
            } catch (e) {}

            const blob = new Blob([dossierText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FitPulse_Report_${athleteName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            closeReportModal();
            showToast('📄 FitPulse Performance Report (PDF & Dossier) downloaded!', 'fa-file-arrow-down');
        };

        if (progQaReport) progQaReport.addEventListener('click', () => openReportModal('monthly'));
        if (progReportTopBtn) progReportTopBtn.addEventListener('click', () => openReportModal('monthly'));
        if (monthlyReportCardDownloadBtn) monthlyReportCardDownloadBtn.addEventListener('click', () => executeDownloadMonthlyReportPDF());
        if (monthlyReportCardDownloadFullBtn) monthlyReportCardDownloadFullBtn.addEventListener('click', () => executeDownloadMonthlyReportPDF());
        if (closeProgressReportModal) closeProgressReportModal.addEventListener('click', closeReportModal);
        if (closeProgressReportBtn) closeProgressReportBtn.addEventListener('click', closeReportModal);
        if (confirmDownloadReportBtn) confirmDownloadReportBtn.addEventListener('click', () => executeDownloadMonthlyReportPDF());

        // Sidebar Reports Nav and Profile trigger
        const navReports = document.getElementById('navReports');
        if (navReports) {
            navReports.addEventListener('click', (e) => {
                e.preventDefault();
                openReportModal('monthly');
            });
        }
        const profActionDownloadReport = document.getElementById('profActionDownloadReport');
        if (profActionDownloadReport) {
            profActionDownloadReport.addEventListener('click', (e) => {
                e.preventDefault();
                openReportModal('monthly');
            });
        }
        if (qaDownloadReport) {
            qaDownloadReport.addEventListener('click', (e) => {
                e.preventDefault();
                openReportModal('monthly');
            });
        }

        // ── 11. SHARE PROGRESS MODAL (Requirement 10) ──
        const shareProgressModal = document.getElementById('shareProgressModal');
        const closeShareProgressModal = document.getElementById('closeShareProgressModal');
        const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');
        const progQaShare = document.getElementById('progQaShare');
        const progShareTopBtn = document.getElementById('progShareTopBtn');
        const shareTwitterBtn = document.getElementById('shareTwitterBtn');
        const shareInstagramBtn = document.getElementById('shareInstagramBtn');
        const shareWhatsAppBtn = document.getElementById('shareWhatsAppBtn');

        const openShareModal = () => {
            if (shareProgressModal) shareProgressModal.classList.remove('hidden');
        };
        const closeShareModal = () => {
            if (shareProgressModal) shareProgressModal.classList.add('hidden');
        };

        if (progQaShare) progQaShare.addEventListener('click', openShareModal);
        if (progShareTopBtn) progShareTopBtn.addEventListener('click', openShareModal);
        if (closeShareProgressModal) closeShareProgressModal.addEventListener('click', closeShareModal);

        if (copyShareLinkBtn) {
            copyShareLinkBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href);
                showToast('📋 Share link copied to clipboard!', 'fa-clipboard-check');
                closeShareModal();
            });
        }

        const handleSocialShare = (platform) => {
            showToast(`Shared transformation card to ${platform}! 🚀`, 'fa-share-nodes');
            closeShareModal();
        };

        if (shareTwitterBtn) shareTwitterBtn.addEventListener('click', () => handleSocialShare('Twitter / X'));
        if (shareInstagramBtn) shareInstagramBtn.addEventListener('click', () => handleSocialShare('Instagram Stories'));
        if (shareWhatsAppBtn) shareWhatsAppBtn.addEventListener('click', () => handleSocialShare('WhatsApp'));
    }

    // Call setup once
    setupProgressInteractions();

