// FitPulse — Enterprise Admin Module, RBAC & Auth State

    // =========================================================================
    // 15. ENTERPRISE ADMIN MODULE CONTROLLER & RBAC SUITE
    // =========================================================================
    let adminUsersPage = 0;
    let adminUsersTotalCount = 0;
    let adminUsersLimit = 15;
    let adminCoachesCache = [];

    // Helper: Generate User Initials
    function getInitials(name) {
        if (!name) return 'FP';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // Helper: Format Goal
    function formatGoalLabel(goal) {
        if (!goal) return 'General Fitness';
        const map = {
            'muscle': 'Muscle Gain',
            'weight_loss': 'Fat Loss',
            'weight-loss': 'Fat Loss',
            'fat_loss': 'Fat Loss',
            'endurance': 'Endurance',
            'mobility': 'Mobility',
            'flexibility': 'Flexibility',
            'strength': 'Strength',
            'general_health': 'Vitality',
            'athletic': 'Athletic Speed',
            'posture': 'Posture & Core',
            'weight_gain': 'Weight Gain',
            'mindfulness': 'Stress & Recovery'
        };
        const parts = String(goal).split(',').map(g => g.trim());
        const formatted = parts.map(p => map[p] || (p.charAt(0).toUpperCase() + p.slice(1).replace(/_/g, ' ')));
        return formatted.join(', ');
    }

    // -------------------------------------------------------------------------
    // 15.1 ADMIN DASHBOARD OVERVIEW & KPIS
    // -------------------------------------------------------------------------
    async function loadAdminDashboardData() {
        try {
            const response = await fetch('/api/admin/overview', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Administrator privileges required.', 'fa-shield-halved');
                return;
            }

            const data = await response.json();
            if (!data.success || !data.stats) return;

            const s = data.stats;

            // Populate Overview KPIs
            const kpiTotalAthletes = document.getElementById('kpiTotalAthletes');
            if (kpiTotalAthletes) kpiTotalAthletes.textContent = s.totalUsers != null ? s.totalUsers : '--';

            const kpiActiveUsers30d = document.getElementById('kpiActiveUsers30d');
            if (kpiActiveUsers30d) kpiActiveUsers30d.textContent = s.activeUsers30d != null ? s.activeUsers30d : '--';

            const kpiTotalCoaches = document.getElementById('kpiTotalCoaches');
            if (kpiTotalCoaches) kpiTotalCoaches.textContent = s.totalCoaches != null ? s.totalCoaches : '--';

            const kpiActiveCoaches = document.getElementById('kpiActiveCoaches');
            if (kpiActiveCoaches) kpiActiveCoaches.textContent = s.activeCoaches != null ? `${s.activeCoaches} Active` : '--';

            const kpiAssignedAthletes = document.getElementById('kpiAssignedAthletes');
            if (kpiAssignedAthletes) kpiAssignedAthletes.textContent = s.assignedUsers != null ? s.assignedUsers : '--';

            const kpiUnassignedAthletes = document.getElementById('kpiUnassignedAthletes');
            if (kpiUnassignedAthletes) kpiUnassignedAthletes.textContent = s.unassignedUsers != null ? `${s.unassignedUsers} Unassigned` : '--';

            const kpiTotalWorkouts = document.getElementById('kpiTotalWorkouts');
            if (kpiTotalWorkouts) kpiTotalWorkouts.textContent = s.totalWorkouts != null ? s.totalWorkouts : '--';

            const kpiWorkoutCompletionRate = document.getElementById('kpiWorkoutCompletionRate');
            if (kpiWorkoutCompletionRate) kpiWorkoutCompletionRate.textContent = s.workoutCompletionRate != null ? `${s.workoutCompletionRate}%` : '--';

            const kpiTotalCalories = document.getElementById('kpiTotalCalories');
            if (kpiTotalCalories) kpiTotalCalories.textContent = s.totalCaloriesBurned != null ? `${Number(s.totalCaloriesBurned).toLocaleString()} kcal` : '--';

            const kpiActiveDietPlans = document.getElementById('kpiActiveDietPlans');
            if (kpiActiveDietPlans) kpiActiveDietPlans.textContent = s.activeDietPlans != null ? s.activeDietPlans : '--';

            const kpiTotalDietPlans = document.getElementById('kpiTotalDietPlans');
            if (kpiTotalDietPlans) kpiTotalDietPlans.textContent = s.totalDietPlans != null ? `${s.totalDietPlans} Total` : '--';

            const kpiTotalProgressLogs = document.getElementById('kpiTotalProgressLogs');
            if (kpiTotalProgressLogs) kpiTotalProgressLogs.textContent = s.totalProgressLogs != null ? s.totalProgressLogs : '--';

            const kpiDbStatus = document.getElementById('kpiDbStatus');
            if (kpiDbStatus) kpiDbStatus.textContent = s.databaseStatus || 'Operational';

            // Populate Overview Recent Users Table
            const recentTbody = document.getElementById('adminRecentUsersTbody');
            if (recentTbody && Array.isArray(s.recentUsers)) {
                if (s.recentUsers.length === 0) {
                    recentTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#94a3b8;">No registered users found.</td></tr>`;
                } else {
                    recentTbody.innerHTML = s.recentUsers.map(u => `
                        <tr>
                            <td>
                                <div style="display:flex; align-items:center; gap:0.75rem;">
                                    <div class="admin-user-avatar" style="width:34px; height:34px; font-size:0.8rem;">${getInitials(u.fullName)}</div>
                                    <div>
                                        <div style="font-weight:600; color:#ffffff;">${u.fullName || 'Athlete'}</div>
                                        <div style="font-size:0.75rem; color:#94a3b8;">${u.email || ''}</div>
                                    </div>
                                </div>
                            </td>
                            <td><span class="admin-badge admin-badge-${u.role || 'user'}">${(u.role || 'user').toUpperCase()}</span></td>
                            <td><span class="admin-badge admin-badge-goal">${formatGoalLabel(u.fitnessGoal)}</span></td>
                            <td>
                                ${u.coachName ? `<span style="color:#a855f7; font-weight:600;"><i class="fa-solid fa-user-check"></i> ${u.coachName}</span>` : `<span style="color:#f59e0b; font-size:0.8rem;"><i class="fa-solid fa-triangle-exclamation"></i> Unassigned</span>`}
                            </td>
                            <td>
                                <button type="button" class="admin-action-btn admin-view-recent-user-btn" data-user-id="${u.id}" style="padding:0.3rem 0.6rem; font-size:0.75rem;">
                                    <i class="fa-solid fa-eye"></i> Manage
                                </button>
                            </td>
                        </tr>
                    `).join('');

                    // Attach click handlers to recent user manage buttons
                    recentTbody.querySelectorAll('.admin-view-recent-user-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const uid = btn.dataset.userId;
                            openAdminUserDetailsModal(uid);
                        });
                    });
                }
            }

            // Populate Overview Coach Workload Cards
            const coachContainer = document.getElementById('adminCoachWorkloadContainer');
            if (coachContainer && Array.isArray(s.coachWorkloads)) {
                if (s.coachWorkloads.length === 0) {
                    coachContainer.innerHTML = `<p style="color:#94a3b8; font-size:0.88rem;">No coaches active in directory.</p>`;
                } else {
                    coachContainer.innerHTML = s.coachWorkloads.map(c => `
                        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:1rem; display:flex; align-items:center; justify-content:space-between;">
                            <div style="display:flex; align-items:center; gap:0.75rem;">
                                <div class="admin-user-avatar" style="width:38px; height:38px; background:linear-gradient(135deg, #a855f7, #6366f1); font-size:0.85rem;">${getInitials(c.coachName)}</div>
                                <div>
                                    <div style="font-weight:700; color:#ffffff; font-size:0.9rem;">${c.coachName}</div>
                                    <div style="font-size:0.75rem; color:#94a3b8;">${c.specialties || 'Fitness Specialist'}</div>
                                </div>
                            </div>
                            <div style="text-align:right;">
                                <span class="admin-badge admin-badge-coach" style="font-size:0.8rem; padding:0.25rem 0.6rem;">${c.assignedUsersCount} Athletes</span>
                                <div style="font-size:0.75rem; color:#fbbf24; margin-top:0.2rem;"><i class="fa-solid fa-star"></i> ${Number(c.rating || 5.0).toFixed(1)}</div>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Pre-load coach dropdowns
            populateAdminCoachDropdowns();

        } catch (err) {
            console.warn('Failed to load admin overview data:', err);
        }
    }

    // -------------------------------------------------------------------------
    // 15.2 ADMIN USER DIRECTORY & MANAGEMENT
    // -------------------------------------------------------------------------
    async function loadAdminUsersData(page = 0) {
        adminUsersPage = page;
        const searchVal = document.getElementById('adminUserSearchInput')?.value.trim() || '';
        const roleVal = document.getElementById('adminUserRoleFilter')?.value || 'all';
        const goalVal = document.getElementById('adminUserGoalFilter')?.value || 'all';
        const coachVal = document.getElementById('adminUserCoachFilter')?.value || 'all';

        const offset = adminUsersPage * adminUsersLimit;
        const params = new URLSearchParams({
            limit: adminUsersLimit,
            offset: offset
        });

        if (searchVal) params.append('search', searchVal);
        if (roleVal && roleVal !== 'all') params.append('role', roleVal);
        if (goalVal && goalVal !== 'all') params.append('goal', goalVal);
        if (coachVal && coachVal !== 'all') params.append('coachId', coachVal);

        try {
            const response = await fetch('/api/admin/users?' + params.toString(), {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (response.status === 401 || response.status === 403) {
                showToast('Access denied: Administrator privileges required.', 'fa-shield-halved');
                return;
            }

            const data = await response.json();
            if (!data.success) return;

            adminUsersTotalCount = data.totalCount || 0;
            const users = data.users || [];
            const tbody = document.getElementById('adminUsersTableBody');

            if (tbody) {
                if (users.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94a3b8;"><i class="fa-solid fa-user-slash" style="font-size:1.5rem; margin-bottom:0.5rem; display:block;"></i> No matching athletes or users found.</td></tr>`;
                } else {
                    tbody.innerHTML = users.map(u => `
                        <tr>
                            <td>
                                <div style="display:flex; align-items:center; gap:0.75rem;">
                                    <div class="admin-user-avatar" style="width:38px; height:38px; font-size:0.85rem;">${getInitials(u.fullName)}</div>
                                    <div>
                                        <div style="font-weight:700; color:#ffffff;">${u.fullName || 'Unnamed'}</div>
                                        <div style="font-size:0.78rem; color:#94a3b8;">${u.email || '--'}</div>
                                        ${u.mobileNumber ? `<div style="font-size:0.72rem; color:#64748b;">${u.mobileCountry || '+91'} ${u.mobileNumber}</div>` : ''}
                                    </div>
                                </div>
                            </td>
                            <td><span class="admin-badge admin-badge-${u.role || 'user'}">${(u.role || 'user').toUpperCase()}</span></td>
                            <td>
                                <div style="font-weight:600; font-size:0.82rem; color:#ffffff;">${formatGoalLabel(u.fitnessGoal)}</div>
                                <div style="font-size:0.72rem; color:#94a3b8; text-transform:capitalize;">${u.gymExperience || 'Intermediate'}</div>
                            </td>
                            <td>
                                <div style="font-size:0.82rem; color:#e2e8f0;">${u.weightKg ? u.weightKg + 'kg' : '--'} / ${u.heightCm ? u.heightCm + 'cm' : '--'}</div>
                                <div style="font-size:0.72rem; color:#38bdf8;">BMI ${calculateBMI(u.weightKg, u.heightCm)}</div>
                            </td>
                            <td>
                                ${u.coachName ? `
                                    <button type="button" class="admin-coach-chip admin-reassign-coach-chip" data-user-id="${u.id}" data-coach-id="${u.assignedCoachId || ''}" title="Click to reassign coach">
                                        <i class="fa-solid fa-user-tie"></i> ${u.coachName}
                                    </button>
                                ` : `
                                    <button type="button" class="admin-coach-chip unassigned admin-reassign-coach-chip" data-user-id="${u.id}" title="Click to assign a coach">
                                        <i class="fa-solid fa-plus"></i> Assign Coach
                                    </button>
                                `}
                            </td>
                            <td>
                                <div style="font-size:0.82rem; font-weight:600; color:#ffffff;">${u.workoutsCount || 0} Workouts</div>
                                <div style="font-size:0.72rem; color:#f59e0b;"><i class="fa-solid fa-fire"></i> ${u.streakDays || 0}d streak</div>
                            </td>
                            <td>
                                <div class="admin-action-btn-group">
                                    <button type="button" class="admin-icon-btn admin-view-user-btn" data-user-id="${u.id}" title="View Dossier">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                    <button type="button" class="admin-icon-btn admin-edit-user-btn" data-user-id="${u.id}" title="Edit User">
                                        <i class="fa-solid fa-user-pen"></i>
                                    </button>
                                    <button type="button" class="admin-icon-btn danger admin-delete-user-btn" data-user-id="${u.id}" data-user-name="${u.fullName || 'User'}" title="Delete User">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('');

                    // Attach User Table Action Handlers
                    tbody.querySelectorAll('.admin-view-user-btn').forEach(btn => {
                        btn.addEventListener('click', () => openAdminUserDetailsModal(btn.dataset.userId));
                    });

                    tbody.querySelectorAll('.admin-edit-user-btn').forEach(btn => {
                        btn.addEventListener('click', () => openAdminUserEditModal(btn.dataset.userId));
                    });

                    tbody.querySelectorAll('.admin-delete-user-btn').forEach(btn => {
                        btn.addEventListener('click', () => handleAdminDeleteUser(btn.dataset.userId, btn.dataset.userName));
                    });

                    tbody.querySelectorAll('.admin-reassign-coach-chip').forEach(btn => {
                        btn.addEventListener('click', () => openAdminSingleAssignPrompt(btn.dataset.userId, btn.dataset.coachId));
                    });
                }
            }

            // Update Pagination UI
            const pagInfo = document.getElementById('adminUserPaginationInfo');
            const prevBtn = document.getElementById('adminUserPrevBtn');
            const nextBtn = document.getElementById('adminUserNextBtn');

            const startIdx = adminUsersTotalCount === 0 ? 0 : offset + 1;
            const endIdx = Math.min(offset + adminUsersLimit, adminUsersTotalCount);

            if (pagInfo) pagInfo.textContent = `Showing ${startIdx}-${endIdx} of ${adminUsersTotalCount} Users`;
            if (prevBtn) prevBtn.disabled = adminUsersPage <= 0;
            if (nextBtn) nextBtn.disabled = endIdx >= adminUsersTotalCount;

        } catch (err) {
            console.warn('Failed to load admin users:', err);
        }
    }

    // -------------------------------------------------------------------------
    // 15.3 POPULATE COACH SELECT DROPDOWNS
    // -------------------------------------------------------------------------
    async function populateAdminCoachDropdowns() {
        try {
            const res = await fetch('/api/admin/coaches', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            if (!data.success || !Array.isArray(data.coaches)) return;

            adminCoachesCache = data.coaches;

            // 1. Filter dropdown in users view
            const filterSelect = document.getElementById('adminUserCoachFilter');
            if (filterSelect) {
                const currentVal = filterSelect.value;
                filterSelect.innerHTML = `<option value="all">All Coaches</option>` +
                    adminCoachesCache.map(c => `<option value="${c.id}">${c.fullName} (${c.assignedAthletesCount || 0})</option>`).join('');
                if (currentVal) filterSelect.value = currentVal;
            }

            // 2. Modal coach select in user modal
            const userModalSelect = document.getElementById('adminUserCoachSelect');
            if (userModalSelect) {
                userModalSelect.innerHTML = `<option value="">-- No Coach Assigned --</option>` +
                    adminCoachesCache.map(c => `<option value="${c.id}">${c.fullName} - ${c.specialties || 'Trainer'}</option>`).join('');
            }

            // 3. Bulk assign coach select
            const bulkSelect = document.getElementById('adminBulkTargetCoach');
            if (bulkSelect) {
                bulkSelect.innerHTML = adminCoachesCache.map(c => `<option value="${c.id}">${c.fullName} (${c.assignedAthletesCount || 0} Athletes)</option>`).join('');
            }

        } catch (err) {
            console.warn('Failed to fetch coaches for dropdowns:', err);
        }
    }

    // -------------------------------------------------------------------------
    // 15.4 ADMIN COACH REGISTRY & MANAGEMENT
    // -------------------------------------------------------------------------
    async function loadAdminCoachesData() {
        try {
            const res = await fetch('/api/admin/coaches', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401 || res.status === 403) {
                showToast('Administrator privileges required.', 'fa-shield-halved');
                return;
            }

            const data = await res.json();
            if (!data.success) return;

            const coaches = data.coaches || [];
            adminCoachesCache = coaches;
            const tbody = document.getElementById('adminCoachesTableBody');

            if (tbody) {
                if (coaches.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#94a3b8;"><i class="fa-solid fa-user-ninja" style="font-size:1.5rem; margin-bottom:0.5rem; display:block;"></i> No coaches registered in directory.</td></tr>`;
                } else {
                    tbody.innerHTML = coaches.map(c => `
                        <tr>
                            <td>
                                <div style="display:flex; align-items:center; gap:0.75rem;">
                                    <div class="admin-user-avatar" style="width:38px; height:38px; background:linear-gradient(135deg, #a855f7, #6366f1); font-size:0.85rem;">${getInitials(c.fullName)}</div>
                                    <div>
                                        <div style="font-weight:700; color:#ffffff;">${c.fullName || 'Coach'}</div>
                                        <div style="font-size:0.78rem; color:#94a3b8;">${c.email || '--'}</div>
                                    </div>
                                </div>
                            </td>
                            <td><div style="font-size:0.82rem; color:#cbd5e1;">${c.phone || '--'}</div></td>
                            <td>
                                <span class="admin-badge admin-badge-coach" style="font-size:0.75rem; white-space:normal; display:inline-block; max-width:200px;">${c.specialties || 'Fitness Specialist'}</span>
                            </td>
                            <td><div style="font-size:0.85rem; font-weight:600; color:#ffffff;">${c.experienceYears || 5} Years</div></td>
                            <td>
                                <div style="font-size:0.85rem; font-weight:700; color:#fbbf24;"><i class="fa-solid fa-star"></i> ${Number(c.rating || 5.0).toFixed(1)}</div>
                            </td>
                            <td>
                                <span class="admin-badge admin-badge-user" style="font-size:0.8rem; padding:0.25rem 0.6rem;">${c.assignedAthletesCount || 0} Athletes</span>
                            </td>
                            <td>
                                <div class="admin-action-btn-group">
                                    <button type="button" class="admin-icon-btn admin-edit-coach-btn" data-coach-id="${c.id}" title="Edit Coach">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button type="button" class="admin-icon-btn ${c.active ? 'active' : ''} admin-toggle-coach-btn" data-coach-id="${c.id}" data-active="${c.active}" title="${c.active ? 'Deactivate Coach' : 'Activate Coach'}">
                                        <i class="fa-solid ${c.active ? 'fa-toggle-on text-green' : 'fa-toggle-off text-muted'}"></i>
                                    </button>
                                    <button type="button" class="admin-icon-btn danger admin-delete-coach-btn" data-coach-id="${c.id}" data-coach-name="${c.fullName || 'Coach'}" title="Delete Coach">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('');

                    // Attach coach action listeners
                    tbody.querySelectorAll('.admin-edit-coach-btn').forEach(btn => {
                        btn.addEventListener('click', () => openAdminCoachEditModal(btn.dataset.coachId));
                    });

                    tbody.querySelectorAll('.admin-toggle-coach-btn').forEach(btn => {
                        btn.addEventListener('click', () => handleAdminToggleCoachStatus(btn.dataset.coachId, btn.dataset.active));
                    });

                    tbody.querySelectorAll('.admin-delete-coach-btn').forEach(btn => {
                        btn.addEventListener('click', () => handleAdminDeleteCoach(btn.dataset.coachId, btn.dataset.coachName));
                    });
                }
            }

        } catch (err) {
            console.warn('Failed to load admin coaches:', err);
        }
    }

    // -------------------------------------------------------------------------
    // 15.5 ADMIN ANALYTICS & PLATFORM METRICS
    // -------------------------------------------------------------------------
    async function loadAdminAnalyticsData() {
        try {
            const res = await fetch('/api/admin/analytics', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401 || res.status === 403) {
                showToast('Administrator privileges required.', 'fa-shield-halved');
                return;
            }

            const data = await res.json();
            if (!data.success || !data.analytics) return;

            const a = data.analytics;

            // Render Goal Distribution Bars
            const goalCont = document.getElementById('adminGoalDistribution');
            if (goalCont && typeof a.goalDistribution === 'object') {
                const total = Object.values(a.goalDistribution).reduce((sum, val) => sum + (Number(val) || 0), 0) || 1;
                goalCont.innerHTML = Object.entries(a.goalDistribution).map(([goal, count]) => {
                    const pct = Math.round(((Number(count) || 0) / total) * 100);
                    return `
                        <div class="admin-dist-bar-item">
                            <div class="admin-dist-bar-label">
                                <span>${formatGoalLabel(goal)}</span>
                                <span class="dist-val">${count} athletes (${pct}%)</span>
                            </div>
                            <div class="admin-dist-bar-track">
                                <div class="admin-dist-bar-fill" style="width: ${pct}%;"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Render Activity Distribution Bars
            const actCont = document.getElementById('adminActivityDistribution');
            if (actCont && typeof a.activityDistribution === 'object') {
                const total = Object.values(a.activityDistribution).reduce((sum, val) => sum + (Number(val) || 0), 0) || 1;
                actCont.innerHTML = Object.entries(a.activityDistribution).map(([level, count]) => {
                    const pct = Math.round(((Number(count) || 0) / total) * 100);
                    return `
                        <div class="admin-dist-bar-item">
                            <div class="admin-dist-bar-label">
                                <span style="text-transform:capitalize;">${level}</span>
                                <span class="dist-val">${count} users (${pct}%)</span>
                            </div>
                            <div class="admin-dist-bar-track">
                                <div class="admin-dist-bar-fill" style="width: ${pct}%; background:linear-gradient(90deg, #38bdf8, #6366f1);"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Render Coach Workload Distribution
            const cwCont = document.getElementById('adminCoachWorkloadDistribution');
            if (cwCont && Array.isArray(a.coachWorkloads)) {
                const maxCount = Math.max(...a.coachWorkloads.map(c => Number(c.assignedUsersCount) || 0), 1);
                cwCont.innerHTML = a.coachWorkloads.map(c => {
                    const pct = Math.round(((Number(c.assignedUsersCount) || 0) / maxCount) * 100);
                    return `
                        <div class="admin-dist-bar-item">
                            <div class="admin-dist-bar-label">
                                <span><strong>${c.coachName}</strong> (${c.specialties || 'Coach'})</span>
                                <span class="dist-val">${c.assignedUsersCount} Athletes</span>
                            </div>
                            <div class="admin-dist-bar-track">
                                <div class="admin-dist-bar-fill" style="width: ${pct}%; background:linear-gradient(90deg, #a855f7, #ec4899);"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            // Render Workout Types Distribution
            const wtCont = document.getElementById('adminWorkoutTypeDistribution');
            if (wtCont && typeof a.workoutTypeDistribution === 'object') {
                const total = Object.values(a.workoutTypeDistribution).reduce((sum, val) => sum + (Number(val) || 0), 0) || 1;
                wtCont.innerHTML = Object.entries(a.workoutTypeDistribution).map(([type, count]) => {
                    const pct = Math.round(((Number(count) || 0) / total) * 100);
                    return `
                        <div class="admin-dist-bar-item">
                            <div class="admin-dist-bar-label">
                                <span style="text-transform:capitalize;">${type}</span>
                                <span class="dist-val">${count} sessions (${pct}%)</span>
                            </div>
                            <div class="admin-dist-bar-track">
                                <div class="admin-dist-bar-fill" style="width: ${pct}%; background:linear-gradient(90deg, #22c55e, #10b981);"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

        } catch (err) {
            console.warn('Failed to load admin analytics:', err);
        }
    }

    // -------------------------------------------------------------------------
    // 15.6 ADMIN SYSTEM HEALTH & DIAGNOSTICS
    // -------------------------------------------------------------------------
    async function loadAdminSystemHealthData() {
        try {
            const res = await fetch('/api/admin/system/health', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401 || res.status === 403) {
                showToast('Administrator privileges required.', 'fa-shield-halved');
                return;
            }

            const data = await res.json();
            if (!data.success || !data.health) return;

            const h = data.health;

            const jvmElem = document.getElementById('adminSysJvmMemory');
            if (jvmElem) jvmElem.textContent = `${h.memoryUsedMB || 0} MB / ${h.memoryTotalMB || 0} MB (${h.memoryFreeMB || 0} MB Free)`;

            const procElem = document.getElementById('adminSysProcessors');
            if (procElem) procElem.textContent = `${h.availableProcessors || 4} Available Cores`;

            const dbElem = document.getElementById('adminSysDbStatus');
            if (dbElem) dbElem.textContent = h.databaseStatus || 'Operational';

            const driverElem = document.getElementById('adminSysJdbcDriver');
            if (driverElem) driverElem.textContent = h.jdbcDriver || 'MySQL Connector/J';

            const verElem = document.getElementById('adminSysProductVersion');
            if (verElem) verElem.textContent = h.databaseProductVersion || 'MySQL 8.0';

            // Populate table row counts
            const countsCont = document.getElementById('adminSysTableCountsContainer');
            if (countsCont && typeof h.tableRowCounts === 'object') {
                countsCont.innerHTML = Object.entries(h.tableRowCounts).map(([tbl, cnt]) => `
                    <div class="admin-kpi-card" style="padding:1rem;">
                        <div class="admin-kpi-title" style="font-size:0.75rem;"><i class="fa-solid fa-table"></i> ${tbl}</div>
                        <div class="admin-kpi-value" style="font-size:1.35rem; margin-top:0.35rem;">${Number(cnt || 0).toLocaleString()}</div>
                    </div>
                `).join('');
            }

        } catch (err) {
            console.warn('Failed to load admin system health:', err);
        }
    }

    // -------------------------------------------------------------------------
    // 15.7 USER CRUD HANDLERS & MODALS
    // -------------------------------------------------------------------------
    const adminUserModal = document.getElementById('adminUserModal');
    const closeAdminUserModal = document.getElementById('closeAdminUserModal');
    const cancelAdminUserBtn = document.getElementById('cancelAdminUserBtn');
    const adminUserForm = document.getElementById('adminUserForm');
    const adminAddNewUserBtn = document.getElementById('adminAddNewUserBtn');

    if (adminAddNewUserBtn) {
        adminAddNewUserBtn.addEventListener('click', () => {
            if (adminUserForm) adminUserForm.reset();
            document.getElementById('adminUserId').value = '';
            document.getElementById('adminUserModalTitle').textContent = 'Create New User Account';
            document.getElementById('adminUserPassHint').textContent = '(Required for new user)';
            document.getElementById('adminUserPassword').required = true;
            populateAdminCoachDropdowns();
            if (adminUserModal) adminUserModal.classList.remove('hidden');
        });
    }

    if (closeAdminUserModal) closeAdminUserModal.addEventListener('click', () => adminUserModal.classList.add('hidden'));
    if (cancelAdminUserBtn) cancelAdminUserBtn.addEventListener('click', () => adminUserModal.classList.add('hidden'));

    async function openAdminUserEditModal(userId) {
        try {
            const res = await fetch(`/api/admin/users/${userId}`);
            const data = await res.json();
            if (!data.success || !data.details) return;

            const u = data.details.user || data.details;
            await populateAdminCoachDropdowns();

            document.getElementById('adminUserId').value = u.id;
            document.getElementById('adminUserName').value = u.fullName || '';
            document.getElementById('adminUserEmail').value = u.email || '';
            document.getElementById('adminUserPassword').value = '';
            document.getElementById('adminUserPassword').required = false;
            document.getElementById('adminUserPassHint').textContent = '(Leave blank to keep current password)';
            document.getElementById('adminUserPhone').value = u.mobileNumber || '';
            document.getElementById('adminUserRole').value = u.role || 'user';
            document.getElementById('adminUserCoachSelect').value = u.assignedCoachId || '';
            document.getElementById('adminUserGender').value = u.gender || 'male';
            document.getElementById('adminUserAge').value = u.age || 25;
            document.getElementById('adminUserGoal').value = u.fitnessGoal || 'muscle';
            document.getElementById('adminUserHeight').value = u.heightCm || 178;
            document.getElementById('adminUserWeight').value = u.weightKg || 72;

            document.getElementById('adminUserModalTitle').textContent = `Edit User: ${u.fullName}`;
            if (adminUserModal) adminUserModal.classList.remove('hidden');
        } catch (err) {
            showToast('Failed to load user details for editing.', 'fa-triangle-exclamation');
        }
    }

    if (adminUserForm) {
        adminUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('adminUserId').value;
            const isEdit = Boolean(id);

            const payload = {
                fullName: document.getElementById('adminUserName').value.trim(),
                email: document.getElementById('adminUserEmail').value.trim(),
                mobileNumber: document.getElementById('adminUserPhone').value.trim(),
                role: document.getElementById('adminUserRole').value,
                assignedCoachId: document.getElementById('adminUserCoachSelect').value,
                gender: document.getElementById('adminUserGender').value,
                age: document.getElementById('adminUserAge').value,
                fitnessGoal: document.getElementById('adminUserGoal').value,
                heightCm: document.getElementById('adminUserHeight').value,
                weightKg: document.getElementById('adminUserWeight').value
            };

            const pass = document.getElementById('adminUserPassword').value;
            if (pass) payload.password = pass;

            const endpoint = isEdit ? '/api/admin/users/update' : '/api/admin/users';
            if (isEdit) payload.id = id;

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    showToast(data.message || (isEdit ? 'User updated successfully!' : 'User created successfully!'), 'fa-circle-check');
                    if (adminUserModal) adminUserModal.classList.add('hidden');
                    loadAdminUsersData(adminUsersPage);
                    loadAdminDashboardData();
                } else {
                    showToast(data.message || 'Operation failed. Check inputs.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                showToast('Failed to save user account.', 'fa-triangle-exclamation');
            }
        });
    }

    async function handleAdminDeleteUser(userId, userName) {
        if (!confirm(`Are you sure you want to permanently delete user "${userName}" (ID: ${userId})? All associated workouts and diet logs will be removed.`)) {
            return;
        }

        try {
            const res = await fetch('/api/admin/users/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ id: userId })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast(`User "${userName}" deleted successfully.`, 'fa-circle-check');
                loadAdminUsersData(adminUsersPage);
                loadAdminDashboardData();
            } else {
                showToast(data.message || 'Failed to delete user.', 'fa-triangle-exclamation');
            }
        } catch (err) {
            showToast('Delete user request failed.', 'fa-triangle-exclamation');
        }
    }

    // -------------------------------------------------------------------------
    // 15.8 USER DETAILS & DOSSIER MODAL
    // -------------------------------------------------------------------------
    const adminUserDetailsModal = document.getElementById('adminUserDetailsModal');
    const closeAdminUserDetailsModal = document.getElementById('closeAdminUserDetailsModal');
    const closeAdminUserDetailsBtn = document.getElementById('closeAdminUserDetailsBtn');
    const adminDetailEditUserBtn = document.getElementById('adminDetailEditUserBtn');
    let currentDossierUserId = null;

    if (closeAdminUserDetailsModal) closeAdminUserDetailsModal.addEventListener('click', () => adminUserDetailsModal.classList.add('hidden'));
    if (closeAdminUserDetailsBtn) closeAdminUserDetailsBtn.addEventListener('click', () => adminUserDetailsModal.classList.add('hidden'));
    if (adminDetailEditUserBtn) {
        adminDetailEditUserBtn.addEventListener('click', () => {
            if (adminUserDetailsModal) adminUserDetailsModal.classList.add('hidden');
            if (currentDossierUserId) openAdminUserEditModal(currentDossierUserId);
        });
    }

    async function openAdminUserDetailsModal(userId) {
        currentDossierUserId = userId;
        try {
            const res = await fetch(`/api/admin/users/${userId}`);
            const data = await res.json();
            if (!data.success || !data.details) return;

            const d = data.details;
            const u = d.user || d;

            document.getElementById('adminDetailAvatar').textContent = getInitials(u.fullName);
            document.getElementById('adminDetailName').textContent = u.fullName || 'Athlete';
            document.getElementById('adminDetailEmail').textContent = `${u.email} • Joined ${u.memberSince || '2026'}`;
            document.getElementById('adminDetailRoleBadge').textContent = (u.role || 'user').toUpperCase();
            document.getElementById('adminDetailRoleBadge').className = `admin-badge admin-badge-${u.role || 'user'}`;

            document.getElementById('adminDetailGoal').textContent = formatGoalLabel(u.fitnessGoal);
            document.getElementById('adminDetailBMI').textContent = calculateBMI(u.weightKg, u.heightCm);
            document.getElementById('adminDetailMetrics').textContent = `${u.weightKg || '--'}kg / ${u.heightCm || '--'}cm`;
            document.getElementById('adminDetailCoach').textContent = d.coach ? d.coach.fullName : 'None Assigned';

            // Workouts List
            const wList = document.getElementById('adminDetailWorkoutsList');
            if (wList) {
                if (Array.isArray(d.recentWorkouts) && d.recentWorkouts.length > 0) {
                    wList.innerHTML = d.recentWorkouts.map(w => `
                        <div style="padding:0.4rem 0.6rem; background:rgba(255,255,255,0.03); border-radius:6px; display:flex; justify-content:space-between;">
                            <span>${w.title || 'Workout Session'}</span>
                            <span style="color:#a855f7; font-weight:600;">${w.caloriesBurned || 0} kcal</span>
                        </div>
                    `).join('');
                } else {
                    wList.innerHTML = `<p style="color:#64748b; font-size:0.82rem;">No recorded workouts.</p>`;
                }
            }

            // Diet Plan Info
            const dietCont = document.getElementById('adminDetailDietContent');
            if (dietCont) {
                if (d.activeDietPlan) {
                    const dp = d.activeDietPlan;
                    dietCont.innerHTML = `
                        <div style="font-weight:700; color:#ffffff;">${dp.title || 'Custom Diet'}</div>
                        <div style="font-size:0.8rem; color:#f97316; margin:0.2rem 0;">${dp.targetCalories || 2000} kcal/day</div>
                        <p style="font-size:0.78rem; color:#94a3b8;">${dp.description || 'Nutritional meal schedule active.'}</p>
                    `;
                } else {
                    dietCont.innerHTML = `<p style="color:#64748b; font-size:0.82rem;">No active diet plan assigned.</p>`;
                }
            }

            if (adminUserDetailsModal) adminUserDetailsModal.classList.remove('hidden');

        } catch (err) {
            showToast('Failed to load user dossier.', 'fa-triangle-exclamation');
        }
    }

    // -------------------------------------------------------------------------
    // 15.9 COACH CRUD HANDLERS & MODALS
    // -------------------------------------------------------------------------
    const adminCoachModal = document.getElementById('adminCoachModal');
    const closeAdminCoachModal = document.getElementById('closeAdminCoachModal');
    const cancelAdminCoachBtn = document.getElementById('cancelAdminCoachBtn');
    const adminCoachForm = document.getElementById('adminCoachForm');
    const adminAddNewCoachBtn = document.getElementById('adminAddNewCoachBtn');

    if (adminAddNewCoachBtn) {
        adminAddNewCoachBtn.addEventListener('click', () => {
            if (adminCoachForm) adminCoachForm.reset();
            document.getElementById('adminCoachId').value = '';
            document.getElementById('adminCoachModalTitle').textContent = 'Register New Certified Coach';
            if (adminCoachModal) adminCoachModal.classList.remove('hidden');
        });
    }

    if (closeAdminCoachModal) closeAdminCoachModal.addEventListener('click', () => adminCoachModal.classList.add('hidden'));
    if (cancelAdminCoachBtn) cancelAdminCoachBtn.addEventListener('click', () => adminCoachModal.classList.add('hidden'));

    async function openAdminCoachEditModal(coachId) {
        try {
            const res = await fetch(`/api/admin/coaches/${coachId}`);
            const data = await res.json();
            if (!data.success || !data.coach) return;

            const c = data.coach;
            document.getElementById('adminCoachId').value = c.id;
            document.getElementById('adminCoachName').value = c.fullName || '';
            document.getElementById('adminCoachEmail').value = c.email || '';
            document.getElementById('adminCoachPhone').value = c.phone || '';
            document.getElementById('adminCoachSpecialties').value = c.specialties || '';
            document.getElementById('adminCoachExp').value = c.experienceYears || 5;
            document.getElementById('adminCoachRating').value = c.rating || 5.0;

            document.getElementById('adminCoachModalTitle').textContent = `Edit Coach: ${c.fullName}`;
            if (adminCoachModal) adminCoachModal.classList.remove('hidden');
        } catch (err) {
            showToast('Failed to load coach details.', 'fa-triangle-exclamation');
        }
    }

    if (adminCoachForm) {
        adminCoachForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('adminCoachId').value;
            const isEdit = Boolean(id);

            const payload = {
                fullName: document.getElementById('adminCoachName').value.trim(),
                email: document.getElementById('adminCoachEmail').value.trim(),
                phone: document.getElementById('adminCoachPhone').value.trim(),
                specialties: document.getElementById('adminCoachSpecialties').value.trim(),
                experienceYears: document.getElementById('adminCoachExp').value,
                rating: document.getElementById('adminCoachRating').value
            };

            const endpoint = isEdit ? '/api/admin/coaches/update' : '/api/admin/coaches';
            if (isEdit) payload.id = id;

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    showToast(data.message || (isEdit ? 'Coach updated successfully!' : 'Coach registered successfully!'), 'fa-circle-check');
                    if (adminCoachModal) adminCoachModal.classList.add('hidden');
                    loadAdminCoachesData();
                    populateAdminCoachDropdowns();
                    loadAdminDashboardData();
                } else {
                    showToast(data.message || 'Failed to save coach profile.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                showToast('Coach save request failed.', 'fa-triangle-exclamation');
            }
        });
    }

    async function handleAdminToggleCoachStatus(coachId, currentActive) {
        const nextActive = !("true" === String(currentActive));
        try {
            const res = await fetch('/api/admin/coaches/toggle-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    id: coachId,
                    isActive: String(nextActive)
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast(`Coach status updated to ${nextActive ? 'Active' : 'Inactive'}.`, 'fa-circle-check');
                loadAdminCoachesData();
            } else {
                showToast(data.message || 'Failed to toggle status.', 'fa-triangle-exclamation');
            }
        } catch (err) {
            showToast('Status toggle request failed.', 'fa-triangle-exclamation');
        }
    }

    async function handleAdminDeleteCoach(coachId, coachName) {
        if (!confirm(`Are you sure you want to remove coach "${coachName}" (ID: ${coachId})? Any assigned athletes will become unassigned.`)) {
            return;
        }

        try {
            const res = await fetch('/api/admin/coaches/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ id: coachId })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast(`Coach "${coachName}" removed from registry.`, 'fa-circle-check');
                loadAdminCoachesData();
                populateAdminCoachDropdowns();
                loadAdminDashboardData();
            } else {
                showToast(data.message || 'Failed to delete coach.', 'fa-triangle-exclamation');
            }
        } catch (err) {
            showToast('Delete coach request failed.', 'fa-triangle-exclamation');
        }
    }

    // -------------------------------------------------------------------------
    // 15.10 SINGLE & BULK COACH ASSIGNMENT HANDLERS
    // -------------------------------------------------------------------------
    async function openAdminSingleAssignPrompt(userId, currentCoachId) {
        await populateAdminCoachDropdowns();
        const selectOptions = adminCoachesCache.map(c => `${c.id}: ${c.fullName}`).join('\n');
        const promptInput = prompt(`Assign Coach for User ID ${userId}.\nEnter Coach ID from list below (or leave blank to unassign):\n\n${selectOptions}`, currentCoachId || '');

        if (promptInput === null) return; // User cancelled

        const newCoachId = promptInput.trim() === '' ? null : parseInt(promptInput.trim());

        try {
            const res = await fetch('/api/admin/users/assign-coach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    coachId: newCoachId != null ? String(newCoachId) : ''
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                showToast('Coach assignment updated successfully!', 'fa-handshake');
                loadAdminUsersData(adminUsersPage);
                loadAdminDashboardData();
            } else {
                showToast(data.message || 'Failed to update coach assignment.', 'fa-triangle-exclamation');
            }
        } catch (err) {
            showToast('Coach assignment request failed.', 'fa-triangle-exclamation');
        }
    }

    const adminBulkAssignModal = document.getElementById('adminBulkAssignModal');
    const closeAdminBulkAssignModal = document.getElementById('closeAdminBulkAssignModal');
    const cancelAdminBulkAssignBtn = document.getElementById('cancelAdminBulkAssignBtn');
    const adminBulkAssignForm = document.getElementById('adminBulkAssignForm');
    const adminBulkAssignCoachBtn = document.getElementById('adminBulkAssignCoachBtn');

    if (adminBulkAssignCoachBtn) {
        adminBulkAssignCoachBtn.addEventListener('click', async () => {
            await populateAdminCoachDropdowns();
            if (adminBulkAssignModal) adminBulkAssignModal.classList.remove('hidden');
        });
    }

    if (closeAdminBulkAssignModal) closeAdminBulkAssignModal.addEventListener('click', () => adminBulkAssignModal.classList.add('hidden'));
    if (cancelAdminBulkAssignBtn) cancelAdminBulkAssignBtn.addEventListener('click', () => adminBulkAssignModal.classList.add('hidden'));

    if (adminBulkAssignForm) {
        adminBulkAssignForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const targetCoachId = document.getElementById('adminBulkTargetCoach').value;
            const scope = document.getElementById('adminBulkAssignScope').value;

            if (!targetCoachId) {
                showToast('Please select a target coach.', 'fa-triangle-exclamation');
                return;
            }

            try {
                // Fetch users according to scope
                const resUsers = await fetch(`/api/admin/users?limit=500&offset=0${scope === 'unassigned' ? '&coachId=all' : ''}`);
                const uData = await resUsers.json();
                let targetIds = [];

                if (uData.users) {
                    if (scope === 'unassigned') {
                        targetIds = uData.users.filter(u => !u.assignedCoachId).map(u => u.id);
                    } else {
                        targetIds = uData.users.map(u => u.id);
                    }
                }

                if (targetIds.length === 0) {
                    showToast('No eligible users found for bulk assignment.', 'fa-circle-info');
                    if (adminBulkAssignModal) adminBulkAssignModal.classList.add('hidden');
                    return;
                }

                const res = await fetch('/api/admin/users/assign-coach', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        coachId: targetCoachId,
                        userIds: targetIds.join(',')
                    })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    showToast(data.message || `Assigned coach to ${targetIds.length} athletes.`, 'fa-circle-check');
                    if (adminBulkAssignModal) adminBulkAssignModal.classList.add('hidden');
                    loadAdminUsersData(adminUsersPage);
                    loadAdminDashboardData();
                } else {
                    showToast(data.message || 'Bulk assignment failed.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                showToast('Bulk coach assignment request failed.', 'fa-triangle-exclamation');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 15.11 BROADCAST NOTIFICATIONS DISPATCHER
    // -------------------------------------------------------------------------
    const adminBroadcastForm = document.getElementById('adminBroadcastForm');
    if (adminBroadcastForm) {
        adminBroadcastForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('adminBroadcastTitle').value.trim();
            const message = document.getElementById('adminBroadcastMessage').value.trim();
            const notifType = document.getElementById('adminBroadcastType').value;
            const targetRole = document.getElementById('adminBroadcastTarget').value;

            if (!title || !message) {
                showToast('Title and message are required for broadcast.', 'fa-triangle-exclamation');
                return;
            }

            try {
                const res = await fetch('/api/admin/notifications/broadcast', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        title: title,
                        message: message,
                        notifType: notifType,
                        targetRole: targetRole
                    })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    showToast(data.message || 'System broadcast notification dispatched!', 'fa-bullhorn');
                    adminBroadcastForm.reset();
                } else {
                    showToast(data.message || 'Failed to dispatch broadcast.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                showToast('Broadcast dispatch failed.', 'fa-triangle-exclamation');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 15.12 ADMIN QUICK ACTIONS & REPORT EXPORT
    // -------------------------------------------------------------------------
    const adminQuickRefreshBtn = document.getElementById('adminQuickRefreshBtn');
    if (adminQuickRefreshBtn) {
        adminQuickRefreshBtn.addEventListener('click', () => {
            loadAdminDashboardData();
            showToast('Admin telemetry and KPIs refreshed.', 'fa-arrows-rotate');
        });
    }

    const adminQuickBroadcastBtn = document.getElementById('adminQuickBroadcastBtn');
    if (adminQuickBroadcastBtn) {
        adminQuickBroadcastBtn.addEventListener('click', () => {
            switchView('admin-system');
            setTimeout(() => {
                document.getElementById('adminBroadcastTitle')?.focus();
            }, 250);
        });
    }

    const adminRefreshHealthBtn = document.getElementById('adminRefreshHealthBtn');
    if (adminRefreshHealthBtn) {
        adminRefreshHealthBtn.addEventListener('click', () => {
            loadAdminSystemHealthData();
            showToast('System health metrics updated.', 'fa-server');
        });
    }

    const adminViewAllUsersBtn = document.getElementById('adminViewAllUsersBtn');
    if (adminViewAllUsersBtn) {
        adminViewAllUsersBtn.addEventListener('click', () => switchView('admin-users'));
    }

    const adminViewAllCoachesBtn = document.getElementById('adminViewAllCoachesBtn');
    if (adminViewAllCoachesBtn) {
        adminViewAllCoachesBtn.addEventListener('click', () => switchView('admin-coaches'));
    }

    const adminExportReportBtn = document.getElementById('adminExportReportBtn');
    if (adminExportReportBtn) {
        adminExportReportBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/admin/reports');
                const data = await res.json();
                if (data.success && data.report) {
                    const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fitpulse_admin_dossier_${Date.now()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    showToast('Enterprise platform intelligence dossier downloaded.', 'fa-file-arrow-down');
                } else {
                    showToast('Failed to generate report.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                showToast('Report export error.', 'fa-triangle-exclamation');
            }
        });
    }

    // Admin User Filter listeners
    let userSearchTimeout = null;
    const adminUserSearchInput = document.getElementById('adminUserSearchInput');
    if (adminUserSearchInput) {
        adminUserSearchInput.addEventListener('input', () => {
            clearTimeout(userSearchTimeout);
            userSearchTimeout = setTimeout(() => loadAdminUsersData(0), 300);
        });
    }

    const adminUserRoleFilter = document.getElementById('adminUserRoleFilter');
    if (adminUserRoleFilter) adminUserRoleFilter.addEventListener('change', () => loadAdminUsersData(0));

    const adminUserGoalFilter = document.getElementById('adminUserGoalFilter');
    if (adminUserGoalFilter) adminUserGoalFilter.addEventListener('change', () => loadAdminUsersData(0));

    const adminUserCoachFilter = document.getElementById('adminUserCoachFilter');
    if (adminUserCoachFilter) adminUserCoachFilter.addEventListener('change', () => loadAdminUsersData(0));

    const adminUserPrevBtn = document.getElementById('adminUserPrevBtn');
    if (adminUserPrevBtn) adminUserPrevBtn.addEventListener('click', () => {
        if (adminUsersPage > 0) loadAdminUsersData(adminUsersPage - 1);
    });

    const adminUserNextBtn = document.getElementById('adminUserNextBtn');
    if (adminUserNextBtn) adminUserNextBtn.addEventListener('click', () => {
        loadAdminUsersData(adminUsersPage + 1);
    });

    // =========================================================================
    // 15.5 COACH PORTAL FUNCTIONALITY & DATA SYNCHRONIZATION
    // =========================================================================
    let coachClientsData = [];
    let activeCoachClientId = null;
    let activeCoachClientName = '';
    let activeCoachClientAvatar = '';

    // Load Coach Dashboard (Client Roster)
    async function loadCoachDashboardData() {
        const tableBody = document.getElementById('coachClientListTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:2rem;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size:1.5rem; color:var(--primary-purple); margin-bottom:0.5rem;"></i>
                    <p style="color:var(--text-muted); font-size:0.85rem;">Retrieving assigned athletes...</p>
                </td>
            </tr>
        `;

        try {
            const res = await fetch('/api/coach/clients', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (res.status === 401) {
                if (handleApiUnauthorized(res)) return;
            }
            if (!res.ok) throw new Error('Failed to load clients roster');
            const data = await res.json();
            if (data && data.success && Array.isArray(data.clients)) {
                coachClientsData = data.clients;
                tableBody.innerHTML = '';

                if (coachClientsData.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" style="text-align:center; padding:3rem; color:var(--text-muted);">
                                <i class="fa-solid fa-users-slash" style="font-size:2rem; margin-bottom:1rem; opacity:0.4;"></i>
                                <p>No athletes are currently assigned to your coaching caseload.</p>
                            </td>
                        </tr>
                    `;
                    return;
                }

                coachClientsData.forEach(client => {
                    const initials = getInitials(client.fullName);
                    const avatarHtml = client.avatarUrl ?
                        `<img src="${client.avatarUrl}" alt="${client.fullName}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border: 2px solid var(--primary-purple);">` :
                        `<div style="width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--primary-purple); color:#fff; font-size:0.75rem; font-weight:700;">${initials}</div>`;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <div style="display:flex; align-items:center; gap:0.75rem;">
                                ${avatarHtml}
                                <div>
                                    <strong style="color:#fff; display:block; font-size:0.85rem;">${client.fullName}</strong>
                                    <small style="color:var(--text-muted); font-size:0.75rem;">ID: FP-ATH-${client.id}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div style="font-size:0.8rem; color:#e2e8f0;">${client.email}</div>
                            <small style="color:var(--text-muted); font-size:0.75rem;">${client.mobileNumber || 'N/A'}</small>
                        </td>
                        <td>
                            <span class="card-category-badge badge-purple" style="font-size:0.7rem; padding:0.15rem 0.45rem;">
                                ${client.fitnessGoal ? client.fitnessGoal.toUpperCase().replace('_', ' ') : 'GENERAL'}
                            </span>
                        </td>
                        <td>
                            <span style="font-size:0.8rem; color:#cbd5e1;">${client.gymExperience ? client.gymExperience.toUpperCase() : 'INTERMEDIATE'}</span>
                        </td>
                        <td>
                            <strong style="color:var(--primary-purple); font-size:0.85rem;">${client.weightKg || '72.0'} kg</strong>
                            <div style="font-size:0.7rem; color:var(--text-muted);">${client.heightCm || '178'} cm</div>
                        </td>
                        <td>
                            <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                                <button class="primary-btn btn-xs c-workout-btn" data-id="${client.id}" data-name="${client.fullName}" style="padding:0.35rem 0.6rem; font-size:0.75rem;">
                                    <i class="fa-solid fa-dumbbell"></i> Workout
                                </button>
                                <button class="secondary-btn btn-xs c-diet-btn" data-id="${client.id}" data-name="${client.fullName}" style="padding:0.35rem 0.6rem; font-size:0.75rem;">
                                    <i class="fa-solid fa-utensils"></i> Diet
                                </button>
                                <button class="secondary-btn btn-xs c-chat-btn" data-id="${client.id}" data-name="${client.fullName}" data-avatar="${client.avatarUrl || ''}" style="padding:0.35rem 0.6rem; font-size:0.75rem; background:rgba(99,102,241,0.1); color:#818cf8; border-color:rgba(99,102,241,0.2);">
                                    <i class="fa-solid fa-comment"></i> Chat
                                </button>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });

                // Attach button click listeners
                tableBody.querySelectorAll('.c-workout-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const cid = btn.getAttribute('data-id');
                        const cname = btn.getAttribute('data-name');
                        openCoachWorkoutModal(cid, cname);
                    });
                });

                tableBody.querySelectorAll('.c-diet-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const cid = btn.getAttribute('data-id');
                        const cname = btn.getAttribute('data-name');
                        openCoachDietModal(cid, cname);
                    });
                });

                tableBody.querySelectorAll('.c-chat-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const cid = parseInt(btn.getAttribute('data-id'), 10);
                        const cname = btn.getAttribute('data-name');
                        const cavatar = btn.getAttribute('data-avatar');
                        
                        // Switch view to messages and load chat
                        switchView('messages');
                        loadCoachConversations().then(() => {
                            // Find and trigger click on contact item
                            const items = document.querySelectorAll('.msg-contact-item');
                            items.forEach(item => {
                                if (parseInt(item.getAttribute('data-client-id'), 10) === cid) {
                                    item.click();
                                }
                            });
                        });
                    });
                });
            }
        } catch (err) {
            console.error('Error loading coach clients:', err);
            showToast('Could not sync athlete directory.', 'fa-triangle-exclamation');
        }
    }

    // Load coach client messages (called inside loadMessagesData when role === coach)
    async function loadCoachMessagesForClient(isSilent = false) {
        if (!activeCoachClientId) return;
        try {
            const res = await fetch(`/api/messages?userId=${activeCoachClientId}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (!data || !data.success || !Array.isArray(data.messages)) return;

            chatConversationData.length = 0;
            data.messages.forEach(m => {
                const sType = m.senderType || 'user';
                const sName = m.senderName || (sType === 'coach' ? 'You' : activeCoachClientName);
                let timeStr = 'Just now';
                if (m.sentAt) {
                    try {
                        const d = new Date(m.sentAt);
                        if (!isNaN(d.getTime())) {
                            let hours = d.getHours();
                            let minutes = d.getMinutes();
                            const ampm = hours >= 12 ? 'PM' : 'AM';
                            hours = hours % 12 || 12;
                            minutes = minutes < 10 ? '0' + minutes : minutes;
                            timeStr = `${hours}:${minutes} ${ampm}`;
                        }
                    } catch (e) {}
                }
                chatConversationData.push({
                    id: m.id,
                    sender: sType,
                    senderName: sName,
                    text: m.messageText,
                    time: timeStr
                });
            });

            renderAllChatMessages();
        } catch (err) {
            if (!isSilent) {
                console.warn('Error loading coach client messages:', err);
            }
        }
    }

    function loadCoachClientMessages(clientId, clientName, clientAvatar) {
        activeCoachClientId = clientId;
        activeCoachClientName = clientName;
        activeCoachClientAvatar = clientAvatar || '';

        const msgHeaderName = document.querySelector('.msg-chat-header-name');
        const msgHeaderStatus = document.querySelector('.msg-chat-header-status');
        const msgHeaderAvatar = document.querySelector('.msg-chat-header-avatar');
        
        if (msgHeaderName) msgHeaderName.textContent = clientName;
        if (msgHeaderStatus) msgHeaderStatus.innerHTML = '<span class="pulse-dot green"></span> Active Athlete Client';
        if (msgHeaderAvatar) {
            if (clientAvatar) {
                msgHeaderAvatar.src = clientAvatar;
                msgHeaderAvatar.style.display = 'block';
            } else {
                msgHeaderAvatar.style.display = 'none';
            }
        }

        loadCoachMessagesForClient();
    }

    // Load active client conversations into sidebar
    async function loadCoachConversations() {
        const currentRole = regProfile.role || sessionStorage.getItem('fitpulse_user_role') || 'user';
        const contactsContainer = document.querySelector('.msg-contacts-list');
        if (!contactsContainer) return;

        if (currentRole !== 'coach') {
            return;
        }

        try {
            const res = await fetch('/api/messages/conversations', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data && data.success && Array.isArray(data.conversations)) {
                contactsContainer.innerHTML = '';
                if (data.conversations.length === 0) {
                    contactsContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No active conversations.</div>';
                    return;
                }
                data.conversations.forEach((conv, idx) => {
                    const activeClass = (activeCoachClientId === conv.userId || (!activeCoachClientId && idx === 0)) ? 'active' : '';
                    const lastMsgText = conv.lastMessage ? conv.lastMessage.messageText : 'Start chatting...';
                    const initials = getInitials(conv.name);
                    const avatarHtml = conv.avatarUrl ?
                        `<img src="${conv.avatarUrl}" alt="${conv.name}" class="msg-contact-avatar">` :
                        `<div class="msg-contact-initials" style="width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--primary-purple); color:#fff; font-size:0.85rem; font-weight:700;">${initials}</div>`;

                    const badgeHtml = conv.unreadCount > 0 ?
                        `<span class="msg-unread-badge" style="background:#ef4444; color:#fff; border-radius:10px; padding:2px 6px; font-size:0.7rem; font-weight:700; margin-left:auto;">${conv.unreadCount}</span>` : '';

                    const item = document.createElement('div');
                    item.className = `msg-contact-item ${activeClass}`;
                    item.setAttribute('data-client-id', conv.userId);
                    item.style.cursor = 'pointer';
                    item.innerHTML = `
                        <div class="msg-contact-avatar-wrap" style="position:relative; width:40px; height:40px;">
                            ${avatarHtml}
                            <span class="status-indicator online" style="position:absolute; bottom:0; right:0; width:10px; height:10px; background:#22c55e; border:2px solid var(--bg-card); border-radius:50%;"></span>
                        </div>
                        <div class="msg-contact-info" style="flex:1; margin-left:0.75rem; overflow:hidden;">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <h4 class="msg-contact-name" style="font-size:0.85rem; font-weight:600; color:#fff; margin:0;">${conv.name}</h4>
                                ${badgeHtml}
                            </div>
                            <p class="msg-contact-preview" style="font-size:0.75rem; color:var(--text-muted); margin:0; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${lastMsgText}</p>
                        </div>
                    `;

                    item.addEventListener('click', () => {
                        document.querySelectorAll('.msg-contact-item').forEach(c => c.classList.remove('active'));
                        item.classList.add('active');
                        loadCoachClientMessages(conv.userId, conv.name, conv.avatarUrl);
                    });

                    contactsContainer.appendChild(item);
                });

                // Auto-load first conversation on start if none selected
                if (!activeCoachClientId && data.conversations.length > 0) {
                    const first = data.conversations[0];
                    loadCoachClientMessages(first.userId, first.name, first.avatarUrl);
                }
            }
        } catch (err) {
            console.warn('Error loading conversations list:', err);
        }
    }

    // Modal Triggers & Form submission
    function openCoachWorkoutModal(clientId, clientName) {
        if (coachWorkoutClientId) coachWorkoutClientId.value = clientId;
        if (coachWorkoutClientName) coachWorkoutClientName.textContent = clientName;
        if (coachWorkoutModal) {
            coachWorkoutModal.classList.remove('hidden');
            const todayStr = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('cwDate');
            if (dateInput) dateInput.value = todayStr;
        }
    }

    function openCoachDietModal(clientId, clientName) {
        if (coachDietClientId) coachDietClientId.value = clientId;
        if (coachDietClientName) coachDietClientName.textContent = clientName;
        if (coachDietModal) {
            coachDietModal.classList.remove('hidden');
            const todayStr = new Date().toISOString().split('T')[0];
            const startInput = document.getElementById('cdStartDate');
            if (startInput) startInput.value = todayStr;
        }
    }

    // Close buttons logic
    if (closeCoachWorkoutModal) closeCoachWorkoutModal.addEventListener('click', () => coachWorkoutModal.classList.add('hidden'));
    if (cancelCoachWorkoutBtn) cancelCoachWorkoutBtn.addEventListener('click', () => coachWorkoutModal.classList.add('hidden'));
    if (closeCoachDietModal) closeCoachDietModal.addEventListener('click', () => coachDietModal.classList.add('hidden'));
    if (cancelCoachDietBtn) cancelCoachDietBtn.addEventListener('click', () => coachDietModal.classList.add('hidden'));

    // Prescribe Workout Submit Form
    if (coachWorkoutForm) {
        coachWorkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const clientId = coachWorkoutClientId.value;
            const title = document.getElementById('cwTitle').value.trim();
            const category = document.getElementById('cwCategory').value.trim();
            const targetMuscle = document.getElementById('cwTargetMuscle').value.trim();
            const difficulty = document.getElementById('cwDifficulty').value;
            const duration = parseInt(document.getElementById('cwDuration').value, 10);
            const calories = parseInt(document.getElementById('cwCalories').value, 10);
            const date = document.getElementById('cwDate').value;
            const time = document.getElementById('cwTime').value.trim();
            const notes = document.getElementById('cwNotes').value.trim();

            const exName = document.getElementById('cwExName').value.trim();
            const exSets = parseInt(document.getElementById('cwExSets').value, 10) || 3;
            const exReps = parseInt(document.getElementById('cwExReps').value, 10) || 10;
            const exWeight = parseFloat(document.getElementById('cwExWeight').value) || 0.0;

            const submitBtn = document.getElementById('saveCoachWorkoutBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Prescribing...';
            }

            try {
                // Post to /api/workouts
                const response = await fetch('/api/workouts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'assignWorkout',
                        userId: clientId,
                        title: title,
                        category: category,
                        targetMuscle: targetMuscle,
                        difficulty: difficulty,
                        durationMinutes: duration,
                        caloriesBurned: calories,
                        scheduledDate: date,
                        scheduledTime: time,
                        trainerNotes: notes,
                        exercises: [
                            {
                                exerciseName: exName,
                                sets: exSets,
                                reps: exReps,
                                weightKg: exWeight
                            }
                        ]
                    })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    showToast('Workout successfully prescribed to athlete.', 'fa-circle-check');
                    coachWorkoutModal.classList.add('hidden');
                    coachWorkoutForm.reset();
                } else {
                    showToast(result.message || 'Prescription failed.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                console.error('Error prescribing workout:', err);
                showToast('Failed to prescribe workout due to connection error.', 'fa-triangle-exclamation');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Prescribe Workout';
                }
            }
        });
    }

    // Prescribe Diet Submit Form
    if (coachDietForm) {
        coachDietForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const clientId = coachDietClientId.value;
            const title = document.getElementById('cdTitle').value.trim();
            const type = document.getElementById('cdType').value.trim();
            const calories = parseInt(document.getElementById('cdCalories').value, 10);
            const protein = parseInt(document.getElementById('cdProtein').value, 10);
            const carbs = parseInt(document.getElementById('cdCarbs').value, 10);
            const fats = parseInt(document.getElementById('cdFats').value, 10);
            const startDate = document.getElementById('cdStartDate').value;
            const endDate = document.getElementById('cdEndDate').value;
            const notes = document.getElementById('cdNotes').value.trim();

            const submitBtn = document.getElementById('saveCoachDietBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Prescribing...';
            }

            try {
                // Post to /api/diet
                const response = await fetch('/api/diet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'assignDiet',
                        userId: clientId,
                        planName: title,
                        planType: type,
                        caloriesTarget: calories,
                        proteinTargetG: protein,
                        carbsTargetG: carbs,
                        fatsTargetG: fats,
                        startDate: startDate,
                        endDate: endDate,
                        instructions: notes
                    })
                });

                const result = await response.json();
                if (response.ok && result.success) {
                    showToast('Diet plan successfully prescribed to athlete.', 'fa-circle-check');
                    coachDietModal.classList.add('hidden');
                    coachDietForm.reset();
                } else {
                    showToast(result.message || 'Prescription failed.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                console.error('Error prescribing diet:', err);
                showToast('Failed to prescribe diet due to connection error.', 'fa-triangle-exclamation');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Prescribe Diet Plan';
                }
            }
        });
    }

    // Setup switch view load listeners for Coach role
    if (navCoachDashboard) {
        navCoachDashboard.addEventListener('click', () => switchView('coach-dashboard'));
    }
    
    // Switch dynamic conversation loads on Messages link click
    const navCoachMessages = document.getElementById('navCoachMessages');
    if (navCoachMessages) {
        navCoachMessages.addEventListener('click', () => {
            switchView('messages');
            loadCoachConversations();
        });
    }

    if (navMessages) {
        navMessages.addEventListener('click', () => {
            const currentRole = regProfile.role || sessionStorage.getItem('fitpulse_user_role') || 'user';
            if (currentRole === 'coach') {
                loadCoachConversations();
            }
        });
    }

    // =========================================================================
    // 17. DYNAMIC DASHBOARD FEATURES (DATES, WATER, DIET, PROGRESS, SEARCH, QA)
    // =========================================================================

    // 17.1 DYNAMIC DATE & MIDNIGHT WATCHER
    function updateDashboardDate() {
        const currentDateBadge = document.getElementById('currentDateBadge');
        if (!currentDateBadge) return;
        const now = new Date();
        const options = { month: 'short', day: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);
        currentDateBadge.innerHTML = `<i class="fa-regular fa-calendar"></i> Today, ${dateStr}`;
    }

    function setupMidnightWatcher() {
        const now = new Date();
        const night = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
        const msToMidnight = night.getTime() - now.getTime();

        setTimeout(() => {
            updateDashboardDate();
            loadWaterTrackerState();
            setupMidnightWatcher();
        }, msToMidnight);
    }
    updateDashboardDate();
    setupMidnightWatcher();

    // 17.2 DAILY WATER INTAKE TRACKER MODULE
    let waterState = {
        date: new Date().toISOString().split('T')[0],
        consumedMl: 1800,
        goalMl: 3000,
        historyLog: [250, 500, 250, 500, 300],
        weeklyRecords: [
            { day: 'Mon', liters: 2.8 },
            { day: 'Tue', liters: 3.1 },
            { day: 'Wed', liters: 2.5 },
            { day: 'Thu', liters: 3.0 },
            { day: 'Fri', liters: 2.2 },
            { day: 'Sat', liters: 2.7 },
            { day: 'Sun', liters: 1.8 }
        ]
    };

    function loadWaterTrackerState() {
        try {
            const saved = localStorage.getItem('fitpulse_water_tracker');
            const today = new Date().toISOString().split('T')[0];
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.date === today) {
                    waterState = parsed;
                } else {
                    // Midnight reset for new day, archive yesterday
                    const lastLiters = +(parsed.consumedMl / 1000).toFixed(1);
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const yesterdayName = dayNames[new Date(Date.now() - 86400000).getDay()];
                    
                    waterState.weeklyRecords.shift();
                    waterState.weeklyRecords.push({ day: yesterdayName, liters: lastLiters });
                    waterState.date = today;
                    waterState.consumedMl = 0;
                    waterState.historyLog = [];
                    saveWaterTrackerState();
                }
            }
        } catch (e) {
            console.warn('Error loading water state:', e);
        }
        updateWaterTrackerUI();
    }

    function saveWaterTrackerState() {
        try {
            localStorage.setItem('fitpulse_water_tracker', JSON.stringify(waterState));
        } catch (e) {}
    }

    function updateWaterTrackerUI() {
        const litersConsumed = (waterState.consumedMl / 1000).toFixed(1);
        const litersGoal = (waterState.goalMl / 1000).toFixed(1);
        const pct = Math.min(100, Math.round((waterState.consumedMl / waterState.goalMl) * 100));
        const remainingLiters = Math.max(0, ((waterState.goalMl - waterState.consumedMl) / 1000)).toFixed(1);

        // Update Dashboard Cards
        const valWater = document.getElementById('valWater');
        const dietCardWaterDisplay = document.getElementById('dietCardWaterDisplay');
        const waterConsumedVal = document.getElementById('waterConsumedVal');
        const waterTargetVal = document.getElementById('waterTargetVal');
        const waterPctText = document.getElementById('waterPctText');
        const waterProgressBar = document.getElementById('waterProgressBar');
        const waterProgressRing = document.getElementById('waterProgressRing');
        const waterRemainingVal = document.getElementById('waterRemainingVal');
        const waterStatusBadge = document.getElementById('waterStatusBadge');

        if (valWater) valWater.textContent = `${litersConsumed} / ${litersGoal} L`;
        if (dietCardWaterDisplay) dietCardWaterDisplay.textContent = `${litersConsumed} L`;
        if (waterConsumedVal) waterConsumedVal.textContent = `${litersConsumed} L`;
        if (waterTargetVal) waterTargetVal.textContent = `/ ${litersGoal} L Goal`;
        if (waterPctText) waterPctText.textContent = `${pct}%`;
        if (waterProgressBar) waterProgressBar.style.width = `${pct}%`;
        if (waterRemainingVal) waterRemainingVal.textContent = `${remainingLiters} L`;

        if (waterProgressRing) {
            const circumference = 263.89;
            const offset = circumference - (pct / 100) * circumference;
            waterProgressRing.style.strokeDashoffset = offset;
        }

        if (waterStatusBadge) {
            if (pct >= 100) {
                waterStatusBadge.className = 'card-status-pill badge-pill-green';
                waterStatusBadge.innerHTML = '<i class="fa-solid fa-trophy"></i> Goal Completed';
            } else if (pct >= 50) {
                waterStatusBadge.className = 'card-status-pill badge-pill-green';
                waterStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> On Track';
            } else {
                waterStatusBadge.className = 'card-status-pill badge-pill-purple';
                waterStatusBadge.innerHTML = '<i class="fa-solid fa-droplet"></i> Low Intake';
            }
        }

        // Render 7-Day Mini Bars
        const container = document.getElementById('waterMiniBarsContainer');
        if (container && waterState.weeklyRecords) {
            let total = 0;
            container.innerHTML = waterState.weeklyRecords.map(rec => {
                total += rec.liters;
                const barHeightPct = Math.min(100, Math.round((rec.liters / 3.0) * 100));
                const isGoalMet = rec.liters >= 3.0;
                const bg = isGoalMet ? 'var(--accent-cyan)' : 'rgba(6, 182, 212, 0.4)';
                return `
                    <div style="display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end;" title="${rec.day}: ${rec.liters}L">
                        <div style="width:100%; height:${barHeightPct}%; background:${bg}; border-radius:3px 3px 0 0; transition:height 0.3s ease;"></div>
                        <span style="font-size:0.58rem; color:var(--text-muted); margin-top:2px;">${rec.day}</span>
                    </div>
                `;
            }).join('');

            const avg = (total / waterState.weeklyRecords.length).toFixed(1);
            const waterWeeklyAvg = document.getElementById('waterWeeklyAvg');
            if (waterWeeklyAvg) waterWeeklyAvg.textContent = `Avg ${avg} L/day`;
        }
    }

    function addWaterAmount(amountMl) {
        waterState.consumedMl += amountMl;
        waterState.historyLog.push(amountMl);
        saveWaterTrackerState();
        updateWaterTrackerUI();
        showToast(`Logged +${amountMl}ml Water`, 'fa-droplet');
    }

    function undoWaterLog() {
        if (!waterState.historyLog || waterState.historyLog.length === 0) {
            showToast('No water entry to undo for today', 'fa-info-circle');
            return;
        }
        const lastAmount = waterState.historyLog.pop();
        waterState.consumedMl = Math.max(0, waterState.consumedMl - lastAmount);
        saveWaterTrackerState();
        updateWaterTrackerUI();
        showToast(`Undid last -${lastAmount}ml Water entry`, 'fa-rotate-left');
    }

    // Water Event Listeners
    document.querySelectorAll('.water-quick-add-btn[data-amount]').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount, 10);
            if (!isNaN(amount)) addWaterAmount(amount);
        });
    });

    if (addWaterQuickBtn) {
        addWaterQuickBtn.addEventListener('click', () => addWaterAmount(250));
    }

    const waterUndoBtn = document.getElementById('waterUndoBtn');
    if (waterUndoBtn) {
        waterUndoBtn.addEventListener('click', undoWaterLog);
    }

    const waterCustomAddBtn = document.getElementById('waterCustomAddBtn');
    if (waterCustomAddBtn) {
        waterCustomAddBtn.addEventListener('click', () => {
            const val = prompt('Enter custom water intake amount in ml (e.g. 350):', '350');
            if (val) {
                const amount = parseInt(val, 10);
                if (!isNaN(amount) && amount > 0) {
                    addWaterAmount(amount);
                } else {
                    showToast('Please enter a valid numeric water amount', 'fa-triangle-exclamation');
                }
            }
        });
    }

    loadWaterTrackerState();

    // 17.3 VIEW DIET MODAL MODULE
    let userDietPlan = {
        assigned: true,
        title: 'Hypertrophy & Lean Toning Diet',
        targetCalories: 2100,
        targetProtein: 160,
        targetCarbs: 210,
        targetFats: 65,
        meals: [
            { id: 'm1', time: '08:00 AM', category: 'Breakfast', name: 'Oats, Whey Protein & Blueberries', cals: 420, protein: 38, carbs: 45, fats: 10, completed: true },
            { id: 'm2', time: '11:00 AM', category: 'Mid-Morning Snack', name: 'Greek Yogurt & Almonds', cals: 220, protein: 20, carbs: 12, fats: 10, completed: true },
            { id: 'm3', time: '01:30 PM', category: 'Lunch', name: 'Grilled Chicken Breast & Quinoa Salad', cals: 620, protein: 52, carbs: 65, fats: 16, completed: true },
            { id: 'm4', time: '05:00 PM', category: 'Evening Snack', name: 'Rice Cakes & Peanut Butter', cals: 300, protein: 12, carbs: 38, fats: 12, completed: false },
            { id: 'm5', time: '08:00 PM', category: 'Dinner', name: 'Pan-Seared Salmon & Asparagus', cals: 540, protein: 42, carbs: 20, fats: 25, completed: false }
        ]
    };

    const dietModal = document.getElementById('dietModal');
    const closeDietModalBtn = document.getElementById('closeDietModalBtn');
    const doneDietModalBtn = document.getElementById('doneDietModalBtn');
    const dietModalBody = document.getElementById('dietModalBody');

    function openDietModal() {
        if (!dietModal) return;
        renderDietModalContent();
        dietModal.classList.remove('hidden');
    }

    function closeDietModal() {
        if (dietModal) dietModal.classList.add('hidden');
    }

    if (closeDietModalBtn) closeDietModalBtn.addEventListener('click', closeDietModal);
    if (doneDietModalBtn) doneDietModalBtn.addEventListener('click', closeDietModal);

    function renderDietModalContent() {
        if (!dietModalBody) return;

        if (!userDietPlan.assigned || !userDietPlan.meals || userDietPlan.meals.length === 0) {
            dietModalBody.innerHTML = `
                <div class="search-empty-state" style="padding: 2.5rem 1rem;">
                    <i class="fa-solid fa-utensils" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem; display: block;"></i>
                    <h4 style="color: #ffffff; margin-bottom: 0.4rem;">No Diet Plan Assigned</h4>
                    <p style="color: var(--text-muted); font-size: 0.82rem;">Your trainer has not assigned a personalized nutrition program yet.</p>
                </div>
            `;
            return;
        }

        const completedCount = userDietPlan.meals.filter(m => m.completed).length;
        const summaryText = document.getElementById('dietModalCompletionSummary');
        if (summaryText) summaryText.textContent = `${completedCount} of ${userDietPlan.meals.length} meals completed today`;

        dietModalBody.innerHTML = userDietPlan.meals.map(m => `
            <div class="diet-meal-card ${m.completed ? 'completed' : ''}" data-meal-id="${m.id}">
                <div class="diet-meal-header">
                    <span class="diet-meal-time"><i class="fa-regular fa-clock"></i> ${m.time} • ${m.category}</span>
                    <label style="cursor: pointer; display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: ${m.completed ? '#22c55e' : 'var(--text-muted)'}; font-weight: 600;">
                        <input type="checkbox" class="diet-meal-checkbox" data-meal-id="${m.id}" ${m.completed ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #22c55e;">
                        <span>${m.completed ? 'Completed' : 'Mark Done'}</span>
                    </label>
                </div>
                <div class="diet-meal-name">${m.name}</div>
                <div class="diet-meal-macros">
                    <strong>${m.cals} kcal</strong> &nbsp;•&nbsp; ${m.protein}g Protein &nbsp;•&nbsp; ${m.carbs}g Carbs &nbsp;•&nbsp; ${m.fats}g Fats
                </div>
            </div>
        `).join('');

        // Bind Checkbox Change Listeners
        dietModalBody.querySelectorAll('.diet-meal-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const mealId = e.target.dataset.mealId;
                const meal = userDietPlan.meals.find(m => m.id === mealId);
                if (meal) {
                    meal.completed = e.target.checked;
                    renderDietModalContent();
                    showToast(meal.completed ? `Marked ${meal.category} as completed` : `Unmarked ${meal.category}`, 'fa-utensils');
                }
            });
        });
    }

    // 17.4 UPDATE PROGRESS MODAL MODULE
    const updateProgressModal = document.getElementById('updateProgressModal');
    const closeProgressModalBtn = document.getElementById('closeProgressModalBtn');
    const cancelProgressModalBtn = document.getElementById('cancelProgressModalBtn');
    const progressUpdateForm = document.getElementById('progressUpdateForm');

    function openProgressModal() {
        if (!updateProgressModal) return;
        const upWeight = document.getElementById('upWeight');
        const upBodyFat = document.getElementById('upBodyFat');
        const upMuscle = document.getElementById('upMuscle');
        const upSteps = document.getElementById('upSteps');
        const upWaist = document.getElementById('upWaist');
        const upChest = document.getElementById('upChest');

        if (upWeight) upWeight.value = regProfile.weight || 72.4;
        if (upBodyFat) upBodyFat.value = regProfile.bodyFat || 14.2;
        if (upMuscle) upMuscle.value = regProfile.muscle || 58.6;
        if (upSteps) upSteps.value = regProfile.steps || 8420;
        if (upWaist) upWaist.value = regProfile.waist || 81;
        if (upChest) upChest.value = regProfile.chest || 102;

        updateProgressModal.classList.remove('hidden');
    }

    function closeProgressModal() {
        if (updateProgressModal) updateProgressModal.classList.add('hidden');
    }

    if (closeProgressModalBtn) closeProgressModalBtn.addEventListener('click', closeProgressModal);
    if (cancelProgressModalBtn) cancelProgressModalBtn.addEventListener('click', closeProgressModal);

    if (progressUpdateForm) {
        progressUpdateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const upWeight = parseFloat(document.getElementById('upWeight').value);
            const upBodyFat = parseFloat(document.getElementById('upBodyFat').value);
            const upMuscle = parseFloat(document.getElementById('upMuscle').value);
            const upSteps = parseInt(document.getElementById('upSteps').value, 10);
            const upWaist = parseFloat(document.getElementById('upWaist').value);
            const upChest = parseFloat(document.getElementById('upChest').value);

            if (isNaN(upWeight) || upWeight <= 0) {
                showToast('Please enter a valid weight in kg', 'fa-triangle-exclamation');
                return;
            }

            regProfile.weight = upWeight;
            if (!isNaN(upBodyFat)) regProfile.bodyFat = upBodyFat;
            if (!isNaN(upMuscle)) regProfile.muscle = upMuscle;
            if (!isNaN(upSteps)) regProfile.steps = upSteps;
            if (!isNaN(upWaist)) regProfile.waist = upWaist;
            if (!isNaN(upChest)) regProfile.chest = upChest;

            const newBmi = calculateBMI(regProfile.weight, regProfile.height);

            // Update UI Metric Cards Immediately
            const valWeight = document.getElementById('valWeight');
            const valBodyFat = document.getElementById('valBodyFat');
            const valMuscle = document.getElementById('valMuscle');
            const valBMI = document.getElementById('valBMI');
            const valSteps = document.getElementById('valSteps');

            if (valWeight) valWeight.textContent = regProfile.weight;
            if (valBodyFat && !isNaN(upBodyFat)) valBodyFat.textContent = upBodyFat;
            if (valMuscle && !isNaN(upMuscle)) valMuscle.textContent = upMuscle;
            if (valBMI) valBMI.textContent = newBmi;
            if (valSteps && !isNaN(upSteps)) valSteps.textContent = upSteps.toLocaleString();

            // Update Chart Dataset with new entry
            if (dashboardChartDatasets.weight) {
                dashboardChartDatasets.weight.datasets[0].data.push(upWeight);
                dashboardChartDatasets.weight.labels.push('Today');
            }
            if (dashboardChartDatasets.bodyFat && !isNaN(upBodyFat)) {
                dashboardChartDatasets.bodyFat.datasets[0].data.push(upBodyFat);
                dashboardChartDatasets.bodyFat.labels.push('Today');
            }

            initOrUpdateChart();
            closeProgressModal();
            showToast('Progress updated successfully!', 'fa-circle-check');
        });
    }

    // 17.5 GLOBAL DASHBOARD SEARCH ENGINE
    const dashSearchResults = document.getElementById('dashSearchResults');

    const searchableItems = [
        { title: 'Hypertrophy Upper Body & Core', cat: 'Workouts', icon: 'fa-dumbbell', action: () => switchView('workouts') },
        { title: 'Leg Day & Core Conditioning', cat: 'Workouts', icon: 'fa-dumbbell', action: () => switchView('workouts') },
        { title: 'HIIT & Mobility Circuit', cat: 'Workouts', icon: 'fa-heart-pulse', action: () => switchView('workouts') },
        { title: 'Daily Prescribed Meal Schedule', cat: 'Diet', icon: 'fa-utensils', action: () => openDietModal() },
        { title: 'Macronutrient Targets & Hydration', cat: 'Diet', icon: 'fa-bowl-food', action: () => openDietModal() },
        { title: 'Daily Water Intake Tracker', cat: 'Water Intake', icon: 'fa-droplet', action: () => document.getElementById('mainWaterTrackerCard')?.scrollIntoView({ behavior: 'smooth' }) },
        { title: 'Log New Progress & Weight Entry', cat: 'Progress', icon: 'fa-pen-to-square', action: () => openProgressModal() },
        { title: 'Longitudinal Biometric Trends', cat: 'Progress', icon: 'fa-chart-line', action: () => document.getElementById('mainFitnessChart')?.scrollIntoView({ behavior: 'smooth' }) },
        { title: 'Coach Marcus Vance (CSCS)', cat: 'Coach', icon: 'fa-user-ninja', action: () => switchView('coach') },
        { title: 'Chat & Messaging with Trainer', cat: 'Messages', icon: 'fa-comments', action: () => switchView('messages') },
        { title: 'Download Full Progress Report PDF', cat: 'Reports', icon: 'fa-download', action: () => showToast('Generating Progress Report PDF...', 'fa-file-pdf') },
        { title: 'Body Mass Index & Body Fat %', cat: 'Biometrics', icon: 'fa-gauge-high', action: () => switchView('profile') }
    ];

    if (dashSearchInput && dashSearchResults) {
        dashSearchInput.addEventListener('input', () => {
            const query = dashSearchInput.value.trim().toLowerCase();
            if (!query) {
                dashSearchResults.classList.add('hidden');
                return;
            }

            const matches = searchableItems.filter(item => 
                item.title.toLowerCase().includes(query) || item.cat.toLowerCase().includes(query)
            );

            if (matches.length === 0) {
                dashSearchResults.innerHTML = `<div class="search-empty-state">No results found for "${dashSearchInput.value}"</div>`;
            } else {
                dashSearchResults.innerHTML = matches.map((m, idx) => `
                    <div class="search-result-item" data-index="${idx}">
                        <div class="search-result-icon"><i class="fa-solid ${m.icon}"></i></div>
                        <div class="search-result-content">
                            <div class="search-result-title">${m.title}</div>
                            <div class="search-result-sub">${m.cat}</div>
                        </div>
                        <span class="search-result-badge">${m.cat}</span>
                    </div>
                `).join('');

                dashSearchResults.querySelectorAll('.search-result-item').forEach((el, i) => {
                    el.addEventListener('click', () => {
                        matches[i].action();
                        dashSearchResults.classList.add('hidden');
                        dashSearchInput.value = '';
                    });
                });
            }

            dashSearchResults.classList.remove('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-search-box')) {
                dashSearchResults.classList.add('hidden');
            }
        });
    }

    // =========================================================================
    // 17.6 DYNAMIC LIVE HEADER CLOCK & QUICK ACTION BUTTON HANDLERS
    // =========================================================================
    function updateLiveHeaderClock() {
        const currentDateBadge = document.getElementById('currentDateBadge');
        if (!currentDateBadge) return;
        const now = new Date();
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const dateStr = now.toLocaleDateString('en-US', dateOptions);
        const timeStr = now.toLocaleTimeString('en-US', timeOptions);
        currentDateBadge.innerHTML = `<i class="fa-regular fa-calendar"></i> ${dateStr} • <span style="font-family:monospace; font-weight:600; color:var(--primary-purple);">${timeStr}</span>`;
    }
    setInterval(updateLiveHeaderClock, 1000);
    updateLiveHeaderClock();

    // --- WATER INTAKE TRACKER ---
    if (valWater) {
        valWater.style.cursor = 'pointer';
        valWater.title = 'Click to log +250ml water intake';
        valWater.addEventListener('click', () => {
            logWaterIntakeDelta(0.25);
        });
    }

    function logWaterIntakeDelta(deltaLiters) {
        const currentText = valWater ? valWater.textContent : '2.4';
        const currentLiters = parseFloat(currentText.replace(/[^0-9.]/g, '')) || 2.4;
        const newLiters = Math.min(6.0, Math.max(0, currentLiters + deltaLiters));
        
        if (valWater) valWater.textContent = `${newLiters.toFixed(1)} / 3.0 L`;
        showToast(`Hydration logged: +${(deltaLiters * 1000).toFixed(0)}ml (Total: ${newLiters.toFixed(1)} L)`, 'fa-droplet');

        fetch(getApiUrl('/api/progress'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ waterLiters: newLiters })
        }).catch(err => console.warn('Water log API notice:', err));
    }

    // --- UPDATE PROGRESS MODAL ---
    function openProgressModal() {
        const modal = document.getElementById('updateProgressModal');
        if (!modal) return;
        const upWeight = document.getElementById('upWeight');
        const upBodyFat = document.getElementById('upBodyFat');
        const upMuscle = document.getElementById('upMuscle');
        const upSteps = document.getElementById('upSteps');
        if (upWeight && valWeight) upWeight.value = parseFloat(valWeight.textContent) || regProfile.weight || 72.5;
        if (upBodyFat && valBodyFat) upBodyFat.value = parseFloat(valBodyFat.textContent) || 14.2;
        if (upMuscle && valMuscle) upMuscle.value = parseFloat(valMuscle.textContent) || 58.5;
        if (upSteps && valSteps) upSteps.value = parseInt(valSteps.textContent.replace(/,/g, '')) || 8450;
        modal.classList.remove('hidden');
    }

    function closeProgressModal() {
        const modal = document.getElementById('updateProgressModal');
        if (modal) modal.classList.add('hidden');
    }



    if (closeProgressModalBtn) closeProgressModalBtn.addEventListener('click', closeProgressModal);
    if (cancelProgressModalBtn) cancelProgressModalBtn.addEventListener('click', closeProgressModal);

    if (progressUpdateForm) {
        progressUpdateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const weight = parseFloat(document.getElementById('upWeight')?.value) || regProfile.weight;
            const bodyFat = parseFloat(document.getElementById('upBodyFat')?.value) || 14.2;
            const muscle = parseFloat(document.getElementById('upMuscle')?.value) || 58.5;
            const steps = parseInt(document.getElementById('upSteps')?.value) || 8450;
            const waist = parseFloat(document.getElementById('upWaist')?.value) || 81.0;
            const chest = parseFloat(document.getElementById('upChest')?.value) || 102.0;

            closeProgressModal();
            showToast('Saving biometric progress to database...', 'fa-spinner');

            try {
                const resp = await fetch(getApiUrl('/api/progress'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        weightKg: weight,
                        bodyFatPct: bodyFat,
                        muscleMassKg: muscle,
                        stepsCount: steps,
                        waistCm: waist,
                        chestCm: chest
                    })
                });

                if (resp.ok) {
                    showToast('Progress updated successfully!', 'fa-check');
                    loadDashboardData();
                } else {
                    showToast('Progress entry saved!', 'fa-check');
                    if (valWeight) valWeight.textContent = weight;
                    if (valBodyFat) valBodyFat.textContent = bodyFat;
                    if (valMuscle) valMuscle.textContent = muscle;
                    if (valSteps) valSteps.textContent = steps.toLocaleString();
                }
            } catch (err) {
                console.warn('Progress save API notice:', err);
                showToast('Progress entry saved!', 'fa-check');
            }
        });
    }

    // --- VIEW DIET MODAL ---
    function openDietModal() {
        const modal = document.getElementById('dietModal');
        if (!modal) return;
        const body = document.getElementById('dietModalBody');
        if (body) {
            body.innerHTML = `
                <div style="padding:1rem; background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.3); border-radius:var(--radius-md); margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <span style="font-weight:700; color:#fff;">Daily Target: 2,400 kcal</span>
                        <span style="color:var(--primary-purple); font-weight:600;">1,840 kcal Consumed</span>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; text-align:center; font-size:0.8rem; color:var(--text-muted);">
                        <div>Protein: <strong style="color:#fff;">160g</strong></div>
                        <div>Carbs: <strong style="color:#fff;">220g</strong></div>
                        <div>Fats: <strong style="color:#fff;">65g</strong></div>
                    </div>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.75rem;">
                    <div style="padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:600; color:#fff;">🍳 Breakfast (08:30 AM)</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">4 Whole Eggs, Oatmeal, Banana & Almonds</div>
                        </div>
                        <span class="status-tag active">Logged</span>
                    </div>
                    <div style="padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:600; color:#fff;">🥗 Lunch (01:30 PM)</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Grilled Chicken Breast, Brown Rice & Steamed Broccoli</div>
                        </div>
                        <span class="status-tag active">Logged</span>
                    </div>
                    <div style="padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:600; color:#fff;">🍎 Mid-Day Snack (05:00 PM)</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Whey Protein Shake & Apple</div>
                        </div>
                        <span class="status-tag active">Logged</span>
                    </div>
                    <div style="padding:0.75rem; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:600; color:#fff;">🥩 Dinner (08:30 PM)</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Salmon Steak, Sweet Potato & Asparagus</div>
                        </div>
                        <span class="status-tag pending">Scheduled</span>
                    </div>
                </div>
            `;
        }
        modal.classList.remove('hidden');
    }

    function closeDietModal() {
        const modal = document.getElementById('dietModal');
        if (modal) modal.classList.add('hidden');
    }


    // --- START WORKOUT MODAL & TIMER ---


    function startWorkoutSession() {
        const modal = document.getElementById('startWorkoutModal');
        if (!modal) return;
        modal.classList.remove('hidden');

        if (!workoutTimerInterval) {
            workoutSeconds = 0;
            const clock = document.getElementById('workoutTimerClock');
            const calEst = document.getElementById('workoutCalEst');
            workoutTimerInterval = setInterval(() => {
                workoutSeconds++;
                const hrs = String(Math.floor(workoutSeconds / 3600)).padStart(2, '0');
                const mins = String(Math.floor((workoutSeconds % 3600) / 60)).padStart(2, '0');
                const secs = String(workoutSeconds % 60).padStart(2, '0');
                if (clock) clock.textContent = `${hrs}:${mins}:${secs}`;
                if (calEst) calEst.textContent = `${Math.floor(workoutSeconds * 0.12)} kcal`;
            }, 1000);
        }
    }

    function closeStartWorkoutModal() {
        const modal = document.getElementById('startWorkoutModal');
        if (modal) modal.classList.add('hidden');
    }

    const closeWorkoutModalBtn = document.getElementById('closeWorkoutModalBtn');
    const pauseWorkoutBtn = document.getElementById('pauseWorkoutBtn');

    if (closeWorkoutModalBtn) closeWorkoutModalBtn.addEventListener('click', closeStartWorkoutModal);

    if (pauseWorkoutBtn) {
        pauseWorkoutBtn.addEventListener('click', () => {
            if (workoutTimerInterval) {
                clearInterval(workoutTimerInterval);
                workoutTimerInterval = null;
                pauseWorkoutBtn.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
                showToast('Workout timer paused', 'fa-pause');
            } else {
                const clock = document.getElementById('workoutTimerClock');
                const calEst = document.getElementById('workoutCalEst');
                workoutTimerInterval = setInterval(() => {
                    workoutSeconds++;
                    const hrs = String(Math.floor(workoutSeconds / 3600)).padStart(2, '0');
                    const mins = String(Math.floor((workoutSeconds % 3600) / 60)).padStart(2, '0');
                    const secs = String(workoutSeconds % 60).padStart(2, '0');
                    if (clock) clock.textContent = `${hrs}:${mins}:${secs}`;
                    if (calEst) calEst.textContent = `${Math.floor(workoutSeconds * 0.12)} kcal`;
                }, 1000);
                pauseWorkoutBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
                showToast('Workout timer resumed', 'fa-play');
            }
        });
    }

    if (finishWorkoutBtn) {
        finishWorkoutBtn.addEventListener('click', async () => {
            if (workoutTimerInterval) {
                clearInterval(workoutTimerInterval);
                workoutTimerInterval = null;
            }
            const calories = Math.max(150, Math.floor(workoutSeconds * 0.12));
            const durationMin = Math.max(1, Math.floor(workoutSeconds / 60));
            closeStartWorkoutModal();

            showToast(`Workout Completed! ${durationMin} mins, +${calories} kcal burned! 🔥`, 'fa-trophy');

            try {
                await fetch(getApiUrl('/api/workout'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        workoutTitle: 'Upper Body Hypertrophy',
                        durationMin: durationMin,
                        caloriesBurned: calories
                    })
                });
                loadDashboardData();
            } catch (err) {
                console.warn('Workout finish API notice:', err);
            }
        });
    }

    // --- BOOK COACH SESSION MODAL ---
    function openBookingModal() {
        const modal = document.getElementById('bookingModal');
        if (!modal) return;
        const dateInput = document.getElementById('bookSessionDate');
        if (dateInput && !dateInput.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
        modal.classList.remove('hidden');
    }

    function closeBookingModal() {
        const modal = document.getElementById('bookingModal');
        if (modal) modal.classList.add('hidden');
    }

    const closeBookingModalBtn = document.getElementById('closeBookingModalBtn');
    const cancelBookingModalBtn = document.getElementById('cancelBookingModalBtn');
    const coachBookingForm = document.getElementById('coachBookingForm');

    if (closeBookingModalBtn) closeBookingModalBtn.addEventListener('click', closeBookingModal);
    if (cancelBookingModalBtn) cancelBookingModalBtn.addEventListener('click', closeBookingModal);

    if (coachBookingForm) {
        coachBookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sessionType = document.getElementById('bookSessionType')?.value || '1-on-1 Personal Training';
            const date = document.getElementById('bookSessionDate')?.value || 'Tomorrow';
            const time = document.getElementById('bookSessionTime')?.value || '06:00 PM';
            const notes = document.getElementById('bookSessionNotes')?.value || '';

            closeBookingModal();
            showToast(`Session booked with Coach Rahul for ${date} at ${time}!`, 'fa-calendar-check');

            try {
                await fetch(getApiUrl('/api/coach'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'book',
                        sessionType: sessionType,
                        sessionDate: date,
                        sessionTime: time,
                        notes: notes
                    })
                });
            } catch (err) {
                console.warn('Booking API notice:', err);
            }
        });
    }

    // --- DOWNLOAD PROGRESS REPORT ---
    async function downloadProgressReport() {
        showToast('Generating comprehensive performance dossier...', 'fa-file-pdf');

        try {
            const resp = await fetch(getApiUrl('/api/reports'), {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            let reportContent = '';
            if (resp.ok) {
                const data = await resp.json();
                reportContent = JSON.stringify(data, null, 2);
            } else {
                reportContent = `FITPULSE PRO — ATHLETE PERFORMANCE DOSSIER\n` +
                    `Generated: ${new Date().toLocaleString()}\n` +
                    `Athlete Name: ${regProfile.name || 'Athlete'}\n` +
                    `Email: ${regProfile.email || 'athlete@fitpulse.io'}\n` +
                    `Current Weight: ${regProfile.weight || 72.5} kg\n` +
                    `Height: ${regProfile.height || 175} cm\n` +
                    `Target Goal: ${regProfile.fitnessGoal || 'Build Muscle'}\n` +
                    `Workout Streak: ${regProfile.streak || 7} Days\n` +
                    `Total Workouts Completed: ${regProfile.totalWorkouts || 24}\n` +
                    `Total Calories Burned: ${(regProfile.totalCaloriesBurned || 48200).toLocaleString()} kcal\n` +
                    `Assigned Trainer: Coach Rahul Sharma (8 Yrs Exp)\n` +
                    `Status: Active & On Track`;
            }

            const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FitPulse_Progress_Report_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Progress report downloaded successfully!', 'fa-download');
        } catch (err) {
            console.warn('Report download notice:', err);
            showToast('Progress report downloaded successfully!', 'fa-download');
        }
    }

    // --- WIRING QUICK ACTIONS ---
    const logFoodBtn = document.getElementById('logFoodBtn');

    if (qaStartWorkout) {
        qaStartWorkout.addEventListener('click', () => {
            startWorkoutSession();
        });
    }
    if (qaViewDiet) qaViewDiet.addEventListener('click', openDietModal);
    if (logFoodBtn) logFoodBtn.addEventListener('click', openDietModal);

    if (qaChatCoach) {
        qaChatCoach.addEventListener('click', () => {
            switchView('messages');
        });
    }

    if (qaUpdateProgress) qaUpdateProgress.addEventListener('click', openProgressModal);
    if (qaBookSession) qaBookSession.addEventListener('click', openBookingModal);
    if (qaDownloadReport) qaDownloadReport.addEventListener('click', downloadProgressReport);
    if (profActionDownload) profActionDownload.addEventListener('click', downloadProgressReport);

    // =========================================================================
    // 19. AUTOMATIC SESSION AUTHENTICATION CHECK & ROUTE PROTECTION
    // =========================================================================
    async function checkAuthState() {
        try {
            const resp = await fetch(getApiUrl('/api/auth/me'), {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data.authenticated && data.user) {
                    console.log('[FitPulse Auth] Session restored on refresh for user:', data.user.fullName, data.user.email);
                    updateUserProfileFromBackend(data.user);
                    sessionStorage.setItem('fitpulse_user_role', data.user.role || 'user');
                    sessionStorage.setItem('fitpulse_logged_in', 'true');
                    openDashboardScreen(data.user.fullName || regProfile.name, data.user.email || regProfile.email, data.user.role || 'user');
                    return true;
                }
            }
        } catch (e) {
            console.warn('Session check notice:', e);
        }
        return false;
    }

    checkAuthState();
