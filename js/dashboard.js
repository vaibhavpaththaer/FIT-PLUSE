// FitPulse — Dashboard, Navigation & Notifications

    // =========================================================================
    // 9. DASHBOARD, PROFILE, WORKOUT, DIET, PROGRESS, COACH, MESSAGES, SETTINGS & ADMIN VIEW SWITCHING
    // =========================================================================
    function switchView(viewName) {
        // Protected route guard: block access if logged out
        const isAuth = sessionStorage.getItem('fitpulse_auth_token') || localStorage.getItem('fitpulse_logged_in');
        if (!isAuth && viewName !== 'auth') {
            if (dashboardScreen) dashboardScreen.classList.add('hidden');
            if (authWrapper) authWrapper.classList.remove('hidden');
            if (loginCard) loginCard.classList.remove('hidden');
            return;
        }

        const currentRole = regProfile.role || sessionStorage.getItem('fitpulse_user_role') || 'user';
        if (viewName && viewName.startsWith('admin') && currentRole !== 'admin') {
            showToast('Access Denied: Administrator privileges required.', 'fa-shield-halved');
            switchView('dashboard');
            return;
        }
        if (viewName === 'coach-dashboard' && currentRole !== 'coach') {
            showToast('Access Denied: Coach portal privileges required.', 'fa-shield-halved');
            switchView('dashboard');
            return;
        }

        activeDashboardView = viewName;
        document.querySelectorAll('.sidebar-nav-list .nav-link').forEach(l => l.classList.remove('active'));
        hideAllDashboardViews();

        if (viewName === 'coach-dashboard') {
            if (coachDashboardView) coachDashboardView.classList.remove('hidden');
            if (navCoachDashboard) navCoachDashboard.classList.add('active');
            loadCoachDashboardData();
            showToast('Coach Portal & Client Roster', 'fa-dumbbell');
        } else if (viewName === 'admin-overview' || viewName === 'admin') {
            if (adminOverviewView) adminOverviewView.classList.remove('hidden');
            if (navAdminOverview) navAdminOverview.classList.add('active');
            loadAdminDashboardData();
            showToast('Admin Overview & Platform Intelligence', 'fa-shield-halved');
        } else if (viewName === 'admin-users') {
            if (adminUsersView) adminUsersView.classList.remove('hidden');
            if (navAdminUsers) navAdminUsers.classList.add('active');
            loadAdminUsersData();
            showToast('Admin User Directory & Management', 'fa-users-gear');
        } else if (viewName === 'admin-coaches') {
            if (adminCoachesView) adminCoachesView.classList.remove('hidden');
            if (navAdminCoaches) navAdminCoaches.classList.add('active');
            loadAdminCoachesData();
            showToast('Admin Certified Coach Registry', 'fa-id-badge');
        } else if (viewName === 'admin-analytics') {
            if (adminAnalyticsView) adminAnalyticsView.classList.remove('hidden');
            if (navAdminAnalytics) navAdminAnalytics.classList.add('active');
            loadAdminAnalyticsData();
            showToast('Enterprise Analytics & Intelligence', 'fa-chart-pie');
        } else if (viewName === 'admin-system') {
            if (adminSystemView) adminSystemView.classList.remove('hidden');
            if (navAdminSystem) navAdminSystem.classList.add('active');
            loadAdminSystemHealthData();
            showToast('System Diagnostics & Console', 'fa-server');
        } else if (viewName === 'profile') {
            if (profileView) profileView.classList.remove('hidden');
            if (navProfile) navProfile.classList.add('active');
            populateProfileData();
            loadProfileData();
            setTimeout(initOrUpdateProfileChart, 200);
            showToast('Switched to User Profile', 'fa-id-card-clip');
        } else if (viewName === 'workouts') {
            if (workoutsView) workoutsView.classList.remove('hidden');
            if (navWorkouts) navWorkouts.classList.add('active');
            loadWorkoutData();
            showToast('Switched to Workout & Exercise Center', 'fa-dumbbell');
        } else if (viewName === 'diet') {
            if (dietView) dietView.classList.remove('hidden');
            if (navDiet) navDiet.classList.add('active');
            loadDietData();
            showToast('Switched to Precision Diet Plan & Nutrition', 'fa-apple-whole');
        } else if (viewName === 'progress') {
            if (progressView) progressView.classList.remove('hidden');
            if (navProgress) navProgress.classList.add('active');
            populateProgressData();
            loadProgressData();
            setTimeout(initOrUpdateProgressCharts, 200);
            showToast('Switched to Fitness Progress & Biometrics', 'fa-chart-line');
        } else if (viewName === 'coach') {
            if (coachView) coachView.classList.remove('hidden');
            if (navCoach) navCoach.classList.add('active');
            loadCoachData();
            showToast(`Viewing Coach ${currentCoach ? currentCoach.fullName : 'Rahul Sharma'} Profile & Booking`, 'fa-user-ninja');
        } else if (viewName === 'messages') {
            if (messagesView) messagesView.classList.remove('hidden');
            if (navMessages) navMessages.classList.add('active');
            const unreadBadge = document.getElementById('messagesBadgeCount');
            if (unreadBadge) unreadBadge.style.display = 'none';
            const coachUnread = document.getElementById('msgCoachUnreadBadge');
            if (coachUnread) coachUnread.style.display = 'none';
            loadCoachData();
            loadMessagesData();
            try {
                fetch('/api/coach/read', { method: 'POST', headers: { 'Accept': 'application/json' } }).catch(() => {});
            } catch (e) {}
            setTimeout(() => {
                const body = document.getElementById('messagesChatBody');
                if (body) body.scrollTop = body.scrollHeight;
            }, 100);
            showToast(`Switched to Direct Messages with Coach ${currentCoach ? currentCoach.fullName.split(' ')[0] : 'Rahul'}`, 'fa-comments');
        } else if (viewName === 'settings') {
            if (settingsView) settingsView.classList.remove('hidden');
            if (navSettings) navSettings.classList.add('active');
            showToast('Switched to Account Settings & Preferences', 'fa-gear');
        } else if (viewName === 'devices') {
            if (devicesView) devicesView.classList.remove('hidden');
            if (navDevices) navDevices.classList.add('active');
            showToast('Switched to Connected Devices & Wearables', 'fa-bluetooth');
        } else {
            if (dashboardView) dashboardView.classList.remove('hidden');
            if (navDashboard) navDashboard.classList.add('active');
            loadDashboardData();
            setTimeout(initOrUpdateChart, 200);
            if (viewName !== 'dashboard') {
                showToast(`Viewing ${viewName.charAt(0).toUpperCase() + viewName.slice(1)} Module`, 'fa-compass');
            }
        }
    }

    function calculateBMI(weightKg, heightCm) {
        if (!weightKg || !heightCm) return 22.8;
        const hM = heightCm / 100;
        return ((weightKg) / (hM * hM)).toFixed(1);
    }

    function populateProfileData() {
        const bmi = calculateBMI(regProfile.weight, regProfile.height);
        const goalText = getGoalText(regProfile.fitnessGoal);

        // Role-based Profile Adjustments
        const currentRole = regProfile.role || sessionStorage.getItem('fitpulse_user_role') || 'user';
        const mainHeading = document.querySelector('.profile-main-heading');
        const subHeading = document.querySelector('.profile-sub-heading');
        const fitnessCard = document.querySelector('.profile-fitness-summary-card');
        const profGoalBadge = document.getElementById('profGoalBadge');
        
        // Quick actions to hide for coaches
        const actionUpdateWeight = document.getElementById('profActionUpdateWeight');
        const actionUpdateGoal = document.getElementById('profActionUpdateGoal');
        
        // Lifetime Stats Section
        const statsTitle = document.querySelector('.profile-stats-section .section-title');
        const statsGrid = document.querySelector('.profile-stats-grid');
        
        // Save athlete HTML if not saved yet
        if (statsGrid && !statsGrid.dataset.athleteHtml) {
            statsGrid.dataset.athleteHtml = statsGrid.innerHTML;
        }

        // Use setDisplay utility if exists, else direct style
        const setDisp = (el, val) => { if (el && el.closest('.pi-field')) el.closest('.pi-field').style.display = val; };
        
        if (currentRole === 'coach' || currentRole === 'admin') {
            if (mainHeading) mainHeading.innerHTML = `<i class="fa-solid fa-id-card-clip icon-accent"></i> Professional ${currentRole === 'admin' ? 'Admin' : 'Coach'} Profile`;
            if (subHeading) subHeading.textContent = 'Manage your professional account credentials, bio, and platform settings.';
            if (profInfoAge) setDisp(profInfoAge, 'none');
            if (profInfoHeight) setDisp(profInfoHeight, 'none');
            if (profInfoWeight) setDisp(profInfoWeight, 'none');
            if (profInfoBMI) setDisp(profInfoBMI, 'none');
            if (profInfoGoal) setDisp(profInfoGoal, 'none');
            if (profInfoMedical) setDisp(profInfoMedical, 'none');
            if (fitnessCard) fitnessCard.style.display = 'none';
            if (profGoalBadge) profGoalBadge.style.display = 'none';
            
            if (actionUpdateWeight) actionUpdateWeight.style.display = 'none';
            if (actionUpdateGoal) actionUpdateGoal.style.display = 'none';
            
            if (statsTitle) statsTitle.innerHTML = `<i class="fa-solid fa-chart-simple icon-accent"></i> Professional Coaching Statistics`;
            if (statsGrid) {
                statsGrid.innerHTML = `
                    <div class="metric-card">
                        <div class="metric-icon-box icon-purple"><i class="fa-solid fa-users"></i></div>
                        <div class="metric-details"><span class="metric-label">Active Athletes</span>
                        <div class="metric-value-row"><span class="metric-value">12</span><span class="metric-unit">Clients</span></div>
                        <span class="metric-trend trend-positive"><i class="fa-solid fa-arrow-up"></i> +2 this month</span></div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon-box icon-blue"><i class="fa-solid fa-dumbbell"></i></div>
                        <div class="metric-details"><span class="metric-label">Assigned Workouts</span>
                        <div class="metric-value-row"><span class="metric-value">145</span><span class="metric-unit">Plans</span></div>
                        <span class="metric-badge-status status-good">Lifetime</span></div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon-box icon-orange"><i class="fa-solid fa-utensils"></i></div>
                        <div class="metric-details"><span class="metric-label">Diet Plans Sent</span>
                        <div class="metric-value-row"><span class="metric-value">84</span><span class="metric-unit">Diets</span></div>
                        <span class="metric-sub-info">Lifetime</span></div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-icon-box icon-cyan"><i class="fa-solid fa-star"></i></div>
                        <div class="metric-details"><span class="metric-label">Client Rating</span>
                        <div class="metric-value-row"><span class="metric-value">4.9</span><span class="metric-unit">/ 5.0</span></div>
                        <span class="metric-trend trend-positive"><i class="fa-solid fa-check"></i> Highly Rated</span></div>
                    </div>
                `;
            }
        } else {
            if (mainHeading) mainHeading.innerHTML = '<i class="fa-solid fa-id-card-clip icon-accent"></i> Athlete Profile & Bio-Analytics';
            if (subHeading) subHeading.textContent = 'Manage personal information, track long-term fitness milestones, and analyze body composition progression.';
            if (profInfoAge) setDisp(profInfoAge, 'flex');
            if (profInfoHeight) setDisp(profInfoHeight, 'flex');
            if (profInfoWeight) setDisp(profInfoWeight, 'flex');
            if (profInfoBMI) setDisp(profInfoBMI, 'flex');
            if (profInfoGoal) setDisp(profInfoGoal, 'flex');
            if (profInfoMedical) setDisp(profInfoMedical, 'flex');
            if (fitnessCard) fitnessCard.style.display = 'block';
            if (profGoalBadge) profGoalBadge.style.display = 'inline-flex';
            
            if (actionUpdateWeight) actionUpdateWeight.style.display = 'flex';
            if (actionUpdateGoal) actionUpdateGoal.style.display = 'flex';
            
            if (statsTitle) statsTitle.innerHTML = `<i class="fa-solid fa-chart-simple icon-accent"></i> Lifetime Profile Statistics`;
            if (statsGrid && statsGrid.dataset.athleteHtml) {
                statsGrid.innerHTML = statsGrid.dataset.athleteHtml;
            }
        }

        const currentName = (regProfile.name && regProfile.name !== 'Alex Morgan') ? regProfile.name : (localStorage.getItem('fitpulse_user_name') || regProfile.name || 'User');
        const currentEmail = (regProfile.email && regProfile.email !== 'alex.morgan@gmail.com') ? regProfile.email : (localStorage.getItem('fitpulse_user_email') || regProfile.email || '');

        // 1. Profile Hero
        if (profHeaderName) profHeaderName.textContent = currentName;
        if (profHeaderEmail) profHeaderEmail.textContent = currentEmail;
        if (profGoalBadgeText) profGoalBadgeText.textContent = goalText;
        if (profMemberSinceTag) profMemberSinceTag.textContent = `Member since ${regProfile.memberSince || 'Aug 2026'}`;

        // 2. Personal Information Card
        if (profInfoName) profInfoName.textContent = currentName;
        if (profInfoEmail) profInfoEmail.textContent = currentEmail;
        const formattedMobile = `${regProfile.countryCode || '+91'} ${regProfile.mobile || '98765 43210'}`.trim();
        if (profInfoPhone) profInfoPhone.textContent = formattedMobile;
        if (profInfoMobile) profInfoMobile.textContent = formattedMobile;
        if (profInfoGender) profInfoGender.textContent = (regProfile.gender || 'male').charAt(0).toUpperCase() + (regProfile.gender || 'male').slice(1);
        if (profInfoAge) profInfoAge.textContent = `${regProfile.age || 25} Years`;
        if (profInfoHeight) profInfoHeight.textContent = `${regProfile.height || 178} cm`;
        if (profInfoWeight) profInfoWeight.textContent = `${regProfile.weight || 72.4} kg`;

        let bmiCategory = 'Optimal';
        const numBMI = parseFloat(bmi);
        if (numBMI < 18.5) bmiCategory = 'Underweight';
        else if (numBMI < 25.0) bmiCategory = 'Optimal';
        else if (numBMI < 30.0) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';

        if (profInfoBMI) profInfoBMI.textContent = `${bmi} (${bmiCategory})`;
        if (profInfoGoal) profInfoGoal.textContent = goalText;
        if (profInfoCreated) profInfoCreated.textContent = regProfile.memberSince || 'August 07, 2026';
        if (profInfoMedical) {
            profInfoMedical.textContent = regProfile.medicalDetails 
                || (regProfile.medicalConditions === 'yes' ? 'Reported Condition (Under Management)' : 'None reported • Cleared for high-intensity training');
        }

        // 3. Profile Statistics
        if (statProfWeight) statProfWeight.textContent = regProfile.weight || 72.4;
        if (statProfBMI) statProfBMI.textContent = bmi;
        if (statProfCalories) statProfCalories.textContent = '2,400';
        if (statProfDailyCal) statProfDailyCal.textContent = '2,400';
        if (statProfWater) statProfWater.textContent = regProfile.waterIntake ? `${regProfile.waterIntake}` : '3.0';
        if (statProfStreak) statProfStreak.textContent = `${regProfile.streak || 7}`;
        if (statProfTotalWorkouts) statProfTotalWorkouts.textContent = regProfile.totalWorkouts || 48;
        const totalCalsFormatted = (regProfile.totalCaloriesBurned || 34850).toLocaleString();
        if (statProfTotalCals) statProfTotalCals.textContent = `${totalCalsFormatted} kcal`;
        if (statProfTotalBurned) statProfTotalBurned.textContent = totalCalsFormatted;

        // 4. Fitness Summary Card
        if (fsiGoalTitle) fsiGoalTitle.textContent = goalText;
        if (profSummaryGoal) profSummaryGoal.textContent = goalText;
        const targetWt = regProfile.targetWeight || (regProfile.fitnessGoal && regProfile.fitnessGoal.includes('weight_loss') ? (regProfile.weight - 5) : (regProfile.weight + 2.6));
        const diffWt = Math.abs(+(regProfile.weight - targetWt).toFixed(1));
        if (fsiTargetWeight) fsiTargetWeight.textContent = `${targetWt} kg`;
        if (profSummaryTargetWeight) profSummaryTargetWeight.textContent = `${targetWt} kg`;
        if (fsiRemainingWeight) fsiRemainingWeight.textContent = `${diffWt} kg to goal`;
        if (profSummaryRemainingWeight) profSummaryRemainingWeight.textContent = `${(regProfile.weight < targetWt ? '+' : '-')}${diffWt} kg`;
        if (fsiWeeklyTarget) fsiWeeklyTarget.textContent = '5 Sessions';
        if (profSummaryTargetWorkouts) profSummaryTargetWorkouts.textContent = '5 Sessions';
        if (fsiWeeklyCompleted) fsiWeeklyCompleted.textContent = '4 Done (80%)';
        if (profSummaryCompletedWorkouts) profSummaryCompletedWorkouts.textContent = '4 Done (80%)';
        if (fsiProgressBarFill) fsiProgressBarFill.style.width = '78%';
        if (profSummaryProgressFill) profSummaryProgressFill.style.width = '78%';
        if (fsiProgressPct) fsiProgressPct.textContent = '78% Completed';
        if (profSummaryProgressText) profSummaryProgressText.textContent = '78% Completed';

        // Header sync
        if (dashUserName) dashUserName.textContent = currentName;
        if (dashUserEmail) dashUserEmail.textContent = currentName ? currentName.split(' ')[0] : 'Athlete';
        if (valWeight) valWeight.textContent = regProfile.weight;
        if (valHeight) valHeight.textContent = regProfile.height;
        if (valBMI) valBMI.textContent = bmi;
    }

    function handleApiUnauthorized(res) {
        if (!res || res.status !== 401) return false;
        const isLoggedIn = localStorage.getItem('fitpulse_logged_in') === 'true' || sessionStorage.getItem('fitpulse_auth_token');
        if (!isLoggedIn) {
            performLogout();
            return true;
        }
        console.warn('Backend API 401 notice, retaining active client session.');
        return false;
    }

    async function loadDashboardData() {
        try {
            const res = await fetch('/api/dashboard', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401) {
                if (handleApiUnauthorized(res)) return;
            }

            if (!res.ok) {
                console.warn('Dashboard fetch response status:', res.status);
                return;
            }

            const data = await res.json();
            if (!data || !data.success) return;

            // 1. Sync User Info
            if (data.user) {
                regProfile.id                  = data.user.id;
                if (data.user.fullName) {
                    regProfile.name = data.user.fullName;
                    try { localStorage.setItem('fitpulse_user_name', data.user.fullName); } catch(e){}
                }
                if (data.user.email) {
                    regProfile.email = data.user.email;
                    try { localStorage.setItem('fitpulse_user_email', data.user.email); } catch(e){}
                }
                regProfile.countryCode         = data.user.mobileCountry || regProfile.countryCode;
                regProfile.mobile              = data.user.mobileNumber || regProfile.mobile;
                regProfile.gender              = data.user.gender || regProfile.gender;
                regProfile.age                 = data.user.age || regProfile.age;
                regProfile.height              = data.user.heightCm || regProfile.height;
                regProfile.weight              = data.user.weightKg || regProfile.weight;
                regProfile.targetWeight        = data.user.targetWeightKg || regProfile.targetWeight;
                regProfile.fitnessGoal         = data.user.fitnessGoal || regProfile.fitnessGoal;
                regProfile.gymExperience       = data.user.gymExperience || regProfile.gymExperience;
                regProfile.workoutPreference   = data.user.workoutPreference || regProfile.workoutPreference;
                regProfile.workoutDays         = data.user.workoutDays || regProfile.workoutDays;
                regProfile.workoutDuration     = String(data.user.workoutDurationMin || 45);
                regProfile.dietPreference      = data.user.dietPreference || regProfile.dietPreference;
                regProfile.waterIntake         = data.user.waterIntake || regProfile.waterIntake;
                regProfile.sleep               = data.user.sleepHours || regProfile.sleep;
                regProfile.medicalConditions   = data.user.medicalConditions || regProfile.medicalConditions;
                regProfile.medicalDetails      = data.user.medicalDetails || regProfile.medicalDetails;
                regProfile.memberSince         = data.user.memberSince || regProfile.memberSince;
                regProfile.streak              = data.user.streakDays || regProfile.streak;
                regProfile.totalWorkouts       = data.user.totalWorkouts || regProfile.totalWorkouts;
                regProfile.totalCaloriesBurned = data.user.totalCaloriesBurned || regProfile.totalCaloriesBurned;

                if (dashUserName) dashUserName.textContent = data.user.fullName;
                if (dashUserEmail) dashUserEmail.textContent = data.user.fullName ? data.user.fullName.split(' ')[0] : 'Athlete';
            }

            // 2. Metrics & Dynamic Dashboard Cards
            if (data.metrics) {
                if (valWeight) valWeight.textContent = data.metrics.weightKg;
                if (valHeight) valHeight.textContent = data.metrics.heightCm;
                if (valBMI) valBMI.textContent = data.metrics.bmi;
                if (valCaloriesBurned) valCaloriesBurned.textContent = (data.metrics.caloriesBurned || 0).toLocaleString();
                if (valCaloriesRemaining) valCaloriesRemaining.textContent = (data.metrics.caloriesRemaining || 0).toLocaleString();
                if (valSleep) valSleep.textContent = `${data.metrics.sleepHours !== undefined ? data.metrics.sleepHours : 6.5} hrs`;
                if (valWater) valWater.textContent = `${data.metrics.waterLiters !== undefined ? data.metrics.waterLiters : 0.0} L`;

                const progValWeight = document.getElementById('progValWeight');
                const progValTargetWeight = document.getElementById('progValTargetWeight');
                const progValBMI = document.getElementById('progValBMI');
                const progValCalories = document.getElementById('progValCalories');
                const progValStreak = document.getElementById('progValStreak');
                if (progValWeight) progValWeight.textContent = data.metrics.weightKg;
                if (progValTargetWeight) progValTargetWeight.textContent = data.metrics.targetWeightKg || regProfile.targetWeight;
                if (progValBMI) progValBMI.textContent = data.metrics.bmi;
                if (progValCalories) progValCalories.textContent = (data.metrics.caloriesBurned || 0).toLocaleString();
                if (progValStreak) progValStreak.textContent = data.metrics.streakDays || regProfile.streak;
            }

            // 3. Notifications — render from backend data
            if (data.notifications && Array.isArray(data.notifications)) {
                // Use the loadNotificationsData function for full rendering
                // (called separately), but update badge immediately
                if (data.unreadNotifCount !== undefined) {
                    if (typeof updateNotifBadges === 'function') {
                        updateNotifBadges(data.unreadNotifCount);
                    } else {
                        const dashNotifPillStatus = document.getElementById('dashNotifPillStatus');
                        if (dashNotifPillStatus) {
                            dashNotifPillStatus.textContent = data.unreadNotifCount > 0 ? `${data.unreadNotifCount} Active Alerts` : 'All Caught Up';
                        }
                    }
                }
            } else if (data.unreadNotifCount !== undefined) {
                const dashNotifPillStatus = document.getElementById('dashNotifPillStatus');
                if (dashNotifPillStatus) {
                    dashNotifPillStatus.textContent = data.unreadNotifCount > 0 ? `${data.unreadNotifCount} Active Alerts` : 'All Caught Up';
                }
            }

            // 4. Historical Chart Data Sync
            if (data.history && Array.isArray(data.history) && data.history.length > 0) {
                const labels = data.history.map(h => {
                    if (!h.recordDate) return '';
                    const d = new Date(h.recordDate);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                const cals = data.history.map(h => h.caloriesBurned || 0);
                const weights = data.history.map(h => h.weightKg || 0);
                const steps = data.history.map(h => h.stepsCount || 0);
                const waters = data.history.map(h => h.waterLiters || 0);
                const workouts = data.history.map(h => h.workoutsCompleted || 1);

                if (dashboardChartDatasets.calories) {
                    dashboardChartDatasets.calories.labels = labels;
                    dashboardChartDatasets.calories.datasets[0].data = cals;
                }
                if (dashboardChartDatasets.weight) {
                    dashboardChartDatasets.weight.labels = labels;
                    dashboardChartDatasets.weight.datasets[0].data = weights;
                }
                if (dashboardChartDatasets.waterSteps) {
                    dashboardChartDatasets.waterSteps.labels = labels;
                    if (dashboardChartDatasets.waterSteps.datasets[0]) dashboardChartDatasets.waterSteps.datasets[0].data = steps;
                    if (dashboardChartDatasets.waterSteps.datasets[1]) dashboardChartDatasets.waterSteps.datasets[1].data = waters;
                }
                if (dashboardChartDatasets.workouts) {
                    dashboardChartDatasets.workouts.labels = labels;
                    dashboardChartDatasets.workouts.datasets[0].data = workouts;
                }

                if (profileChartDatasets['prof-weight']) {
                    profileChartDatasets['prof-weight'].labels = labels;
                    profileChartDatasets['prof-weight'].datasets[0].data = weights;
                }

                initOrUpdateChart();
            }

            populateProfileData();
        } catch (err) {
            console.warn('Dashboard fetch API notice:', err);
        }
    }

    async function loadProfileData() {
        try {
            const res = await fetch('/api/profile', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401) {
                if (handleApiUnauthorized(res)) return;
            }

            if (!res.ok) return;
            const data = await res.json();
            if (!data || !data.success || !data.user) return;

            regProfile.id                  = data.user.id;
            regProfile.name                = data.user.fullName || regProfile.name;
            regProfile.email               = data.user.email || regProfile.email;
            regProfile.countryCode         = data.user.mobileCountry || regProfile.countryCode;
            regProfile.mobile              = data.user.mobileNumber || regProfile.mobile;
            regProfile.gender              = data.user.gender || regProfile.gender;
            regProfile.age                 = data.user.age || regProfile.age;
            regProfile.height              = data.user.heightCm || regProfile.height;
            regProfile.weight              = data.user.weightKg || regProfile.weight;
            regProfile.targetWeight        = data.user.targetWeightKg || regProfile.targetWeight;
            regProfile.fitnessGoal         = data.user.fitnessGoal || regProfile.fitnessGoal;
            regProfile.gymExperience       = data.user.gymExperience || regProfile.gymExperience;
            regProfile.workoutPreference   = data.user.workoutPreference || regProfile.workoutPreference;
            regProfile.workoutDays         = data.user.workoutDays || regProfile.workoutDays;
            regProfile.workoutDuration     = String(data.user.workoutDurationMin || 45);
            regProfile.dietPreference      = data.user.dietPreference || regProfile.dietPreference;
            regProfile.waterIntake         = data.user.waterIntake || regProfile.waterIntake;
            regProfile.sleep               = data.user.sleepHours || regProfile.sleep;
            regProfile.medicalConditions   = data.user.medicalConditions || regProfile.medicalConditions;
            regProfile.medicalDetails      = data.user.medicalDetails || regProfile.medicalDetails;
            regProfile.memberSince         = data.user.memberSince || regProfile.memberSince;
            regProfile.streak              = data.user.streakDays || regProfile.streak;
            regProfile.totalWorkouts       = data.user.totalWorkouts || regProfile.totalWorkouts;
            regProfile.totalCaloriesBurned = data.user.totalCaloriesBurned || regProfile.totalCaloriesBurned;

            populateProfileData();
        } catch (err) {
            console.warn('Profile fetch API notice:', err);
        }
    }

    function openDashboardScreen(name, email, role) {
        window.openDashboardScreen = openDashboardScreen;
        sessionStorage.setItem('fitpulse_auth_token', 'active_athlete_session_' + Date.now());
        localStorage.setItem('fitpulse_logged_in', 'true');

        if (name) {
            regProfile.name = name;
            try { localStorage.setItem('fitpulse_user_name', name); } catch(e){}
        }
        if (email) {
            regProfile.email = email;
            try { localStorage.setItem('fitpulse_user_email', email); } catch(e){}
        }
        if (role) regProfile.role = role;

        const currentRole = role || regProfile.role || sessionStorage.getItem('fitpulse_user_role') || 'user';
        sessionStorage.setItem('fitpulse_user_role', currentRole);

        if (authWrapper) authWrapper.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');

        const avatarSrc = regProfile.avatarUrl || localStorage.getItem('fitpulse_user_avatar');
        if (avatarSrc) {
            const avatarEls = [document.getElementById('profMainAvatar'), document.getElementById('headerUserAvatar'), document.getElementById('dashAvatar'), document.getElementById('sidebarUserAvatar')];
            avatarEls.forEach(el => { if (el) el.src = avatarSrc; });
        }

        if (typeof window.syncDietPreference === 'function') {
            window.syncDietPreference();
        }

        const adminNavGroup = document.getElementById('adminNavGroup');
        const coachNavGroup = document.getElementById('coachNavGroup');
        const sidebarNavGroups = document.querySelectorAll('.dash-sidebar .sidebar-nav-group');
        const userNavGroup1 = sidebarNavGroups[0];
        const userNavGroup2 = sidebarNavGroups[1];

        if (currentRole === 'admin') {
            if (adminNavGroup) adminNavGroup.classList.remove('hidden');
            if (coachNavGroup) coachNavGroup.classList.add('hidden');
            if (userNavGroup1) userNavGroup1.classList.add('hidden');
            if (userNavGroup2) userNavGroup2.classList.add('hidden');

            history.pushState({ auth: true, view: 'admin-overview' }, '', window.location.href);
            switchView('admin-overview');
        } else if (currentRole === 'coach') {
            if (adminNavGroup) adminNavGroup.classList.add('hidden');
            if (coachNavGroup) coachNavGroup.classList.remove('hidden');
            if (userNavGroup1) userNavGroup1.classList.add('hidden');
            if (userNavGroup2) userNavGroup2.classList.add('hidden');

            history.pushState({ auth: true, view: 'coach-dashboard' }, '', window.location.href);
            switchView('coach-dashboard');
        } else {
            if (adminNavGroup) adminNavGroup.classList.add('hidden');
            if (coachNavGroup) coachNavGroup.classList.add('hidden');
            if (userNavGroup1) userNavGroup1.classList.remove('hidden');
            if (userNavGroup2) userNavGroup2.classList.remove('hidden');

            history.pushState({ auth: true, view: 'dashboard' }, '', window.location.href);
            populateProfileData();
            loadDashboardData();
            loadWorkoutData();
            loadDietData();
            loadProgressData();
            loadCoachData();
            loadMessagesData();
            switchView('dashboard');
        }
    }

    // =========================================================================
    // PERFECT LOGOUT FLOW & MODAL MANAGEMENT
    // =========================================================================
    const logoutConfirmModal = document.getElementById('logoutConfirmModal');
    const closeLogoutModalBtn = document.getElementById('closeLogoutModalBtn');
    const cancelLogoutModalBtn = document.getElementById('cancelLogoutModalBtn');
    const confirmLogoutFinalBtn = document.getElementById('confirmLogoutFinalBtn');

    function openLogoutModal() {
        if (logoutConfirmModal) {
            logoutConfirmModal.classList.remove('hidden');
        }
    }

    function closeLogoutModal() {
        if (logoutConfirmModal) {
            logoutConfirmModal.classList.add('hidden');
        }
    }

    function performLogout() {
        closeLogoutModal();

        // 1. Notify Java Backend to destroy server-side HttpSession & clear cookies
        try {
            fetch('/api/logout', {
                method: 'POST',
                headers: { 'Accept': 'application/json' }
            }).catch(e => console.warn('Logout endpoint notice:', e));
        } catch (e) {
            // Non-blocking
        }

        // 2. Clear client session flags & stored tokens
        sessionStorage.removeItem('fitpulse_auth_token');
        localStorage.removeItem('fitpulse_logged_in');
        localStorage.removeItem('fitpulse_user_name');
        localStorage.removeItem('fitpulse_user_email');
        localStorage.removeItem('fitpulse_user_avatar');

        // Retrieve current active language for toast
        const curLang = localStorage.getItem('fitpulse_language') || 'en';
        const langPack = (typeof FITPULSE_TRANSLATIONS !== 'undefined' && FITPULSE_TRANSLATIONS[curLang]) 
            ? FITPULSE_TRANSLATIONS[curLang] 
            : (typeof FITPULSE_TRANSLATIONS !== 'undefined' ? FITPULSE_TRANSLATIONS.en : null);
        
        const logoutToastMsg = (langPack && langPack.logout_success_toast) 
            ? langPack.logout_success_toast 
            : '👋 You have logged out successfully. See you next workout!';
        
        showToast(logoutToastMsg, 'fa-arrow-right-from-bracket');

        // Smooth dashboard fadeout animation
        if (dashboardScreen) {
            dashboardScreen.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            dashboardScreen.style.opacity = '0';
            dashboardScreen.style.transform = 'scale(0.98)';
        }

        setTimeout(() => {
            if (dashboardScreen) {
                dashboardScreen.classList.add('hidden');
                dashboardScreen.style.opacity = '1';
                dashboardScreen.style.transform = 'none';
            }
            if (authWrapper) authWrapper.classList.remove('hidden');
            if (loginCard) loginCard.classList.remove('hidden');
            if (registerCard) registerCard.classList.add('hidden');

            // Reset password and sensitive input fields
            if (passwordInput) passwordInput.value = '';
            const regPassInp = document.getElementById('regPasswordInput');
            if (regPassInp) regPassInp.value = '';
            const regConfInp = document.getElementById('regConfirmPasswordInput');
            if (regConfInp) regConfInp.value = '';

            // Reset and close mobile navigation and open overlays
            if (dashSidebar) {
                dashSidebar.classList.remove('mobile-open');
            }
            if (sidebarBackdrop) {
                sidebarBackdrop.classList.remove('active');
            }
            document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.add('hidden'));

            // Reset navigation active state to Dashboard
            activeDashboardView = 'dashboard';
            const navDash = document.getElementById('navDashboard');
            if (navDash) navDash.classList.add('active');
            document.querySelectorAll('.sidebar-nav-list .nav-link').forEach(link => {
                if (link !== navDash) link.classList.remove('active');
            });

            // Neutralize browser back history to prevent re-entering authenticated screens
            history.replaceState({ auth: false, view: 'login' }, '', window.location.href);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 350);
    }

    // Intercept back button to guard protected dashboard
    window.addEventListener('popstate', () => {
        const isAuth = sessionStorage.getItem('fitpulse_auth_token') || localStorage.getItem('fitpulse_logged_in');
        if (!isAuth) {
            if (dashboardScreen) dashboardScreen.classList.add('hidden');
            if (authWrapper) authWrapper.classList.remove('hidden');
            if (loginCard) loginCard.classList.remove('hidden');
            if (registerCard) registerCard.classList.add('hidden');
            history.replaceState({ auth: false, view: 'login' }, '', window.location.href);
        }
    });

    if (logoutBtn) logoutBtn.addEventListener('click', openLogoutModal);
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', openLogoutModal);
    if (profActionLogout) profActionLogout.addEventListener('click', openLogoutModal);
    if (closeLogoutModalBtn) closeLogoutModalBtn.addEventListener('click', closeLogoutModal);
    if (cancelLogoutModalBtn) cancelLogoutModalBtn.addEventListener('click', closeLogoutModal);
    if (confirmLogoutFinalBtn) confirmLogoutFinalBtn.addEventListener('click', performLogout);
    if (logoutConfirmModal) {
        logoutConfirmModal.addEventListener('click', (e) => {
            if (e.target === logoutConfirmModal) closeLogoutModal();
        });
    }

    // Sidebar Desktop Collapse Toggle
    if (sidebarCollapseTrigger) {
        sidebarCollapseTrigger.addEventListener('click', () => {
            dashSidebar.classList.toggle('collapsed');
        });
    }

    // Sidebar Mobile Drawer Toggle
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            dashSidebar.classList.toggle('mobile-open');
            sidebarBackdrop.classList.toggle('active');
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            dashSidebar.classList.remove('mobile-open');
            sidebarBackdrop.classList.remove('active');
        });
    }

    // Sidebar Navigation Links
    document.querySelectorAll('.sidebar-nav-list .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const navType = link.dataset.nav;
            switchView(navType);

            // Close mobile drawer on item tap
            if (window.innerWidth < 992) {
                dashSidebar.classList.remove('mobile-open');
                sidebarBackdrop.classList.remove('active');
            }
        });
    });

    // Profile Click from Header & Breadcrumb
    if (headerUserProfile) {
        headerUserProfile.addEventListener('click', () => {
            switchView('profile');
        });
    }

    if (crumbToDashboard) {
        crumbToDashboard.addEventListener('click', () => {
            switchView('dashboard');
        });
    }

    if (profileBackToDashBtn) {
        profileBackToDashBtn.addEventListener('click', () => {
            switchView('dashboard');
        });
    }

    if (headerBrandLogo) {
        headerBrandLogo.addEventListener('click', () => {
            switchView('dashboard');
        });
    }

    // =========================================================================
    // 9. NOTIFICATION MODULE — BACKEND INTEGRATION (Step 12)
    // =========================================================================

    // --- Notification Timestamp Formatter ---
    function formatNotifTime(createdAtStr) {
        if (!createdAtStr) return '';
        const created = new Date(createdAtStr.replace(' ', 'T'));
        const now = new Date();
        const diffMs = now - created;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // --- Notification Type Mappings ---
    function getNotifIconClass(notifType) {
        const map = { workout: 'icon-purple', diet: 'icon-orange', message: 'icon-blue', progress: 'icon-green', system: 'icon-cyan' };
        return map[notifType] || 'icon-purple';
    }

    function getNotifActionType(notifType) {
        const map = { workout: 'workout', diet: 'diet', message: 'messages', progress: 'progress', system: 'system' };
        return map[notifType] || 'system';
    }

    function getNotifBadgeLabel(notifType) {
        const map = { workout: 'Workout', diet: 'Diet', message: 'Message', progress: 'Analytics', system: 'System' };
        return map[notifType] || 'System';
    }

    function getNotifBadgeClass(notifType) {
        const map = { workout: '', diet: 'badge-orange', message: 'badge-blue', progress: 'badge-green', system: 'badge-cyan' };
        return map[notifType] || '';
    }

    function getNotifFaIcon(notifType) {
        const map = { workout: 'fa-dumbbell', diet: 'fa-utensils', message: 'fa-comment-dots', progress: 'fa-chart-line', system: 'fa-bell' };
        return map[notifType] || 'fa-bell';
    }

    // --- Render Notification Items ---
    function renderHeaderNotifItem(notif) {
        const unreadClass = notif.isRead ? '' : ' unread';
        const dotDisplay = notif.isRead ? 'style="display:none"' : '';
        const iconClass = getNotifIconClass(notif.notifType);
        const actionType = getNotifActionType(notif.notifType);
        const timeStr = formatNotifTime(notif.createdAt);

        return `<div class="notif-item${unreadClass} notif-action-item" data-notif-action="${actionType}" data-notif-id="${notif.id}" title="Click to view">
            <div class="notif-item-icon ${iconClass}"><i class="fa-solid fa-bell"></i></div>
            <div class="notif-item-body">
                <div class="notif-item-header-line">
                    <p class="notif-title-text"><strong>${notif.title}</strong></p>
                    <span class="notif-dot-unread" ${dotDisplay}></span>
                </div>
                <p class="notif-subtext">${notif.message}</p>
                <small><i class="fa-regular fa-clock"></i> ${timeStr}</small>
            </div>
        </div>`;
    }

    function renderDashNotifRow(notif) {
        const unreadClass = notif.isRead ? '' : ' unread';
        const iconClass = getNotifIconClass(notif.notifType);
        const actionType = getNotifActionType(notif.notifType);
        const badgeLabel = getNotifBadgeLabel(notif.notifType);
        const badgeClass = getNotifBadgeClass(notif.notifType);
        const timeStr = formatNotifTime(notif.createdAt);

        return `<div class="dash-notif-row${unreadClass} notif-action-item" data-notif-action="${actionType}" data-notif-id="${notif.id}" title="Click to view">
            <div class="dnr-icon ${iconClass}"><i class="fa-solid fa-bell"></i></div>
            <div class="dnr-content">
                <div class="dnr-header-flex">
                    <span class="dnr-title">${notif.title}</span>
                    <span class="dnr-badge-pill ${badgeClass}">${badgeLabel}</span>
                </div>
                <p>${notif.message}</p>
                <small><i class="fa-regular fa-clock"></i> ${timeStr}</small>
            </div>
        </div>`;
    }

    // --- Update Unread Badge Counts ---
    function updateNotifBadges(unreadCount) {
        const countTag = document.getElementById('notifCountTag');
        if (countTag) countTag.textContent = unreadCount > 0 ? `${unreadCount} New` : '0 New';

        if (notifBadgeDot) notifBadgeDot.style.display = unreadCount > 0 ? '' : 'none';

        const pillStatus = document.getElementById('dashNotifPillStatus');
        if (pillStatus) {
            if (unreadCount > 0) {
                pillStatus.textContent = `${unreadCount} Active Alerts`;
                pillStatus.className = 'badge-pill-green';
            } else {
                pillStatus.textContent = 'All Caught Up';
                pillStatus.className = 'badge-pill-green';
            }
        }
    }

    // --- Bind Click Events to Dynamic Notification Items ---
    function bindNotifClickEvents() {
        document.querySelectorAll('.notif-action-item[data-notif-id]').forEach(item => {
            item.addEventListener('click', async (e) => {
                const notifId = item.getAttribute('data-notif-id');
                const action = item.getAttribute('data-notif-action');

                // Mark as read in backend
                if (notifId && item.classList.contains('unread')) {
                    try {
                        await fetch('/api/notifications/read', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: parseInt(notifId) })
                        });
                    } catch (err) {}

                    // Mark as read in UI
                    document.querySelectorAll(`[data-notif-id="${notifId}"]`).forEach(el => {
                        el.classList.remove('unread');
                        const dot = el.querySelector('.notif-dot-unread');
                        if (dot) dot.style.display = 'none';
                    });
                }

                // Close dropdown
                if (notifQuickDropdown && !notifQuickDropdown.classList.contains('hidden')) {
                    notifQuickDropdown.classList.add('hidden');
                }

                // Navigate to relevant view
                if (action === 'workout') {
                    switchView('workouts');
                    showToast('🔔 Opening workout...', 'fa-dumbbell');
                } else if (action === 'diet') {
                    switchView('diet');
                    showToast('🍎 Opening diet plan...', 'fa-utensils');
                } else if (action === 'messages') {
                    switchView('messages');
                    showToast('💬 Opening messages...', 'fa-comment-dots');
                } else if (action === 'progress') {
                    switchView('progress');
                    showToast('📈 Opening progress analytics...', 'fa-chart-line');
                }

                // Update unread counts from remaining DOM elements
                const remaining = document.querySelectorAll('#headerNotifDropdownList .notif-item.unread');
                updateNotifBadges(remaining.length);
            });
        });
    }

    // --- Load Notifications from Backend ---
    async function loadNotificationsData(isSilent = false) {
        try {
            const res = await fetch('/api/notifications?limit=20', {
                method: 'GET',
                credentials: 'same-origin'
            });

            if (res.status === 401) {
                if (!isSilent) return;
                return;
            }

            if (!res.ok) return;
            const data = await res.json();

            if (!data.success) return;

            const notifications = data.notifications || [];
            const unreadCount = data.unreadCount || 0;

            // Render header dropdown list
            const headerList = document.getElementById('headerNotifDropdownList');
            if (headerList) {
                if (notifications.length === 0) {
                    headerList.innerHTML = '<div class="notif-item" style="text-align:center;opacity:0.6;"><div class="notif-item-body"><p class="notif-subtext">No notifications yet</p></div></div>';
                } else {
                    headerList.innerHTML = notifications.map(n => renderHeaderNotifItem(n)).join('');
                }
            }

            // Render dashboard notification card list
            const dashList = document.getElementById('dashNotifListContainer');
            if (dashList) {
                if (notifications.length === 0) {
                    dashList.innerHTML = '<div class="dash-notif-row" style="text-align:center;opacity:0.6;"><div class="dnr-content"><p>No notifications yet. Stay active!</p></div></div>';
                } else {
                    dashList.innerHTML = notifications.map(n => renderDashNotifRow(n)).join('');
                }
            }

            // Update badges
            updateNotifBadges(unreadCount);

            // Bind click events to newly rendered items
            bindNotifClickEvents();

        } catch (err) {
            if (!isSilent) console.warn('[Notifications] Load error:', err);
        }
    }

    // --- Poll Unread Count Only (lightweight) ---
    async function pollNotifUnreadCount() {
        try {
            const res = await fetch('/api/notifications/count', {
                method: 'GET',
                credentials: 'same-origin'
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                updateNotifBadges(data.unreadCount || 0);
            }
        } catch (err) {}
    }

    // --- Notification Bell Toggle (with live data fetch) ---
    if (notifBellBtn && notifQuickDropdown) {
        notifBellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadNotificationsData(true);
            notifQuickDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!notifQuickDropdown.contains(e.target) && e.target !== notifBellBtn) {
                notifQuickDropdown.classList.add('hidden');
            }
        });
    }

    // --- Mark All Read Button ---
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();

            // Call backend
            try {
                await fetch('/api/notifications/read-all', {
                    method: 'POST',
                    credentials: 'same-origin'
                });
            } catch (err) {}

            // Update UI
            document.querySelectorAll('.notif-item.unread, .dash-notif-row.unread').forEach(item => {
                item.classList.remove('unread');
            });
            document.querySelectorAll('.notif-dot-unread').forEach(dot => {
                dot.style.display = 'none';
            });
            updateNotifBadges(0);
            showToast('All notifications marked as read', 'fa-check-double');
        });
    }

    // --- Initial Load & Polling Setup ---
    loadNotificationsData(true);

    // Poll unread count every 30 seconds
    setInterval(() => {
        pollNotifUnreadCount();
    }, 30000);

    // Search Keyboard Shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (dashSearchInput) dashSearchInput.focus();
        }
        if (e.key === '/' && document.activeElement !== dashSearchInput && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            if (dashSearchInput) dashSearchInput.focus();
        }
    });

