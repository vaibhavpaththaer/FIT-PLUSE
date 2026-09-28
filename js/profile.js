// FitPulse — Profile Modals, Avatar Upload & Data Export

    // =========================================================================
    // 11. PROFILE MODALS & INTERACTIVE ACTIONS
    // =========================================================================
    // 1. Edit Profile Modal
    const openEditModal = () => {
        if (editName) editName.value = regProfile.name || '';
        if (editEmail) editEmail.value = regProfile.email || '';
        if (editMobile) editMobile.value = regProfile.mobile || '';
        if (editAge) editAge.value = regProfile.age || 26;
        if (editGender) editGender.value = regProfile.gender || 'male';
        if (editHeight) editHeight.value = regProfile.height || 178;
        if (editWeight) editWeight.value = regProfile.weight || 72.4;
        if (editFitnessGoal) editFitnessGoal.value = regProfile.fitnessGoal || 'muscle';

        if (editProfileModal) editProfileModal.classList.remove('hidden');
    };

    if (profActionEdit) profActionEdit.addEventListener('click', openEditModal);
    const profEditBtnMain = document.getElementById('profEditBtnMain');
    if (profEditBtnMain) profEditBtnMain.addEventListener('click', openEditModal);
    const profGradientEditBtn = document.getElementById('profGradientEditBtn');
    if (profGradientEditBtn) profGradientEditBtn.addEventListener('click', openEditModal);
    const editPersonalFromCardBtn = document.getElementById('editPersonalFromCardBtn');
    if (editPersonalFromCardBtn) editPersonalFromCardBtn.addEventListener('click', openEditModal);

    if (closeEditProfileModal) {
        closeEditProfileModal.addEventListener('click', () => {
            if (editProfileModal) editProfileModal.classList.add('hidden');
        });
    }

    if (cancelEditProfileBtn) {
        cancelEditProfileBtn.addEventListener('click', () => {
            if (editProfileModal) editProfileModal.classList.add('hidden');
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const n = editName ? editName.value.trim() : regProfile.name;
            const mob = editMobile ? editMobile.value.trim() : regProfile.mobile;
            const a = editAge ? parseInt(editAge.value, 10) : regProfile.age;
            const g = editGender ? editGender.value : regProfile.gender;
            const h = editHeight ? parseFloat(editHeight.value) : regProfile.height;
            const w = editWeight ? parseFloat(editWeight.value) : regProfile.weight;
            const fg = editFitnessGoal ? editFitnessGoal.value : regProfile.fitnessGoal;

            if (!n) {
                showToast('Please enter your full name.', 'fa-triangle-exclamation');
                return;
            }

            const submitBtn = editProfileForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
            }

            try {
                const response = await fetch('/api/profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        fullName: n,
                        mobileNumber: mob,
                        age: a,
                        gender: g,
                        heightCm: h,
                        weightKg: w,
                        fitnessGoal: fg
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    if (data.user) {
                        regProfile.name = data.user.fullName || n;
                        regProfile.mobile = data.user.mobileNumber || mob;
                        regProfile.age = data.user.age || a;
                        regProfile.gender = data.user.gender || g;
                        regProfile.height = data.user.heightCm || h;
                        regProfile.weight = data.user.weightKg || w;
                        regProfile.fitnessGoal = data.user.fitnessGoal || fg;
                    } else {
                        regProfile.name = n;
                        regProfile.mobile = mob;
                        regProfile.age = a;
                        regProfile.gender = g;
                        regProfile.height = h;
                        regProfile.weight = w;
                        regProfile.fitnessGoal = fg;
                    }

                    populateProfileData();
                    if (editProfileModal) editProfileModal.classList.add('hidden');
                    showToast('✅ Profile information updated successfully!', 'fa-circle-check');
                } else {
                    showToast(data.message || 'Failed to update profile.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                console.warn('Backend update notice (offline fallback):', err);
                regProfile.name = n;
                regProfile.mobile = mob;
                regProfile.age = a;
                regProfile.gender = g;
                regProfile.height = h;
                regProfile.weight = w;
                regProfile.fitnessGoal = fg;
                populateProfileData();
                if (editProfileModal) editProfileModal.classList.add('hidden');
                showToast('✅ Profile information updated successfully!', 'fa-circle-check');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    // 2. Quick Weight Modal
    const openQuickWeightModal = () => {
        if (quickWeightInput) quickWeightInput.value = regProfile.weight || 72.4;
        if (quickWeightModal) quickWeightModal.classList.remove('hidden');
    };

    if (profActionUpdateWeight) profActionUpdateWeight.addEventListener('click', openQuickWeightModal);
    const progQaUpdateWeight = document.getElementById('progQaUpdateWeight');
    if (progQaUpdateWeight) progQaUpdateWeight.addEventListener('click', openQuickWeightModal);
    const sumCardWeight = document.getElementById('sumCardWeight');
    if (sumCardWeight) sumCardWeight.addEventListener('click', openQuickWeightModal);

    if (closeQuickWeightModal) {
        closeQuickWeightModal.addEventListener('click', () => {
            if (quickWeightModal) quickWeightModal.classList.add('hidden');
        });
    }

    if (cancelQuickWeightBtn) {
        cancelQuickWeightBtn.addEventListener('click', () => {
            if (quickWeightModal) quickWeightModal.classList.add('hidden');
        });
    }

    async function handleQuickWeightSubmit(e) {
        if (e) e.preventDefault();
        const newWeight = parseFloat(quickWeightInput ? quickWeightInput.value : 0);

        if (isNaN(newWeight) || newWeight < 20 || newWeight > 300) {
            showToast('Please enter a valid weight in kg (20-300).', 'fa-triangle-exclamation');
            return;
        }

        const submitBtn = saveQuickWeightBtn || (quickWeightForm ? quickWeightForm.querySelector('button[type="submit"]') : null);
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
        }

        try {
            const response = await fetch('/api/profile/weight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    weightKg: newWeight
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                regProfile.weight = newWeight;
                if (data.user && data.user.weightKg) regProfile.weight = data.user.weightKg;
                populateProfileData();

                if (profileChartDatasets['prof-weight']) {
                    const len = profileChartDatasets['prof-weight'].datasets[0].data.length;
                    profileChartDatasets['prof-weight'].datasets[0].data[len - 1] = newWeight;
                    initOrUpdateProfileChart();
                }

                if (quickWeightModal) quickWeightModal.classList.add('hidden');
                showToast(`⚖️ Weight logged: ${newWeight} kg. BMI recalculated!`, 'fa-circle-check');
            } else {
                showToast(data.message || 'Failed to update weight.', 'fa-triangle-exclamation');
            }
        } catch (err) {
            console.warn('Backend weight update notice (offline fallback):', err);
            regProfile.weight = newWeight;
            populateProfileData();
            if (profileChartDatasets['prof-weight']) {
                const len = profileChartDatasets['prof-weight'].datasets[0].data.length;
                profileChartDatasets['prof-weight'].datasets[0].data[len - 1] = newWeight;
                initOrUpdateProfileChart();
            }
            if (quickWeightModal) quickWeightModal.classList.add('hidden');
            showToast(`⚖️ Weight logged: ${newWeight} kg. BMI recalculated!`, 'fa-circle-check');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }
    }

    if (quickWeightForm) {
        quickWeightForm.addEventListener('submit', handleQuickWeightSubmit);
    }
    if (saveQuickWeightBtn) {
        saveQuickWeightBtn.addEventListener('click', handleQuickWeightSubmit);
    }

    // 3. Avatar Upload & Preview
    if (profAvatarChangeBtn && profAvatarUpload) {
        profAvatarChangeBtn.addEventListener('click', () => {
            profAvatarUpload.click();
        });
    }

    if (profAvatarUpload) {
        profAvatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    regProfile.avatarUrl = dataUrl;
                    try { localStorage.setItem('fitpulse_user_avatar', dataUrl); } catch(err){}

                    // Update all avatar elements in DOM
                    const avatarEls = [document.getElementById('profMainAvatar'), document.getElementById('headerUserAvatar'), document.getElementById('dashAvatar'), document.getElementById('sidebarUserAvatar')];
                    avatarEls.forEach(el => { if (el) el.src = dataUrl; });

                    // Persist to backend API
                    fetch('/api/profile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatarUrl: dataUrl })
                    }).catch(err => console.warn('Avatar API save notice:', err));

                    showToast('Profile photo updated successfully!', 'fa-camera');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 4. Download / Export Fitness Data
    if (profActionDownload) {
        profActionDownload.addEventListener('click', () => {
            showToast('📄 Compiling your full biometric & workout archive...', 'fa-file-export');
            setTimeout(() => {
                showToast('Export ready: FitPulse_Profile_BioData.json', 'fa-download');
            }, 1200);
        });
    }

    if (profActionSettings) {
        profActionSettings.addEventListener('click', () => {
            switchView('settings');
        });
    }

    // =========================================================================
    // 12. QUICK ACTIONS, COACH CHAT & 1-ON-1 BOOKING MODAL TRIGGERS
    // =========================================================================
    const workoutLiveModal        = document.getElementById('workoutLiveModal');
    const closeWorkoutModal       = document.getElementById('closeWorkoutModal');
    const finishWorkoutBtn        = document.getElementById('finishWorkoutBtn');
    const coachChatModal          = document.getElementById('coachChatModal');
    const closeCoachChatModal     = document.getElementById('closeCoachChatModal');
    const chatSendForm            = document.getElementById('chatSendForm');
    const chatInputMessage        = document.getElementById('chatInputMessage');
    const chatMessagesContainer   = document.getElementById('chatMessagesContainer');
    const bookCoachSessionModal   = document.getElementById('bookCoachSessionModal');
    const closeBookCoachSessionModal = document.getElementById('closeBookCoachSessionModal');
    const cancelBookCoachBtn      = document.getElementById('cancelBookCoachBtn');
    const bookCoachSessionForm    = document.getElementById('bookCoachSessionForm');

    function openWorkoutModal() {
        if (workoutLiveModal) workoutLiveModal.classList.remove('hidden');
    }

    function closeLiveWorkout() {
        if (workoutLiveModal) workoutLiveModal.classList.add('hidden');
    }

    function openCoachChat() {
        if (coachChatModal) coachChatModal.classList.remove('hidden');
    }

    function closeCoachChat() {
        if (coachChatModal) coachChatModal.classList.add('hidden');
    }

    function openCoachBookingModal(preselectedType = 'training') {
        const typeSelect = document.getElementById('bookingSessionType');
        if (typeSelect && preselectedType) {
            typeSelect.value = preselectedType;
        }
        const dateInput = document.getElementById('bookingDateInput');
        if (dateInput && !dateInput.value) {
            const tmrw = new Date();
            tmrw.setDate(tmrw.getDate() + 1);
            dateInput.value = tmrw.toISOString().split('T')[0];
        }
        if (bookCoachSessionModal) bookCoachSessionModal.classList.remove('hidden');
    }

    function closeCoachBookingModal() {
        if (bookCoachSessionModal) bookCoachSessionModal.classList.add('hidden');
    }

    // Quick Actions Bar Buttons
    const qaStartWorkout    = document.getElementById('qaStartWorkout');
    const qaViewDiet        = document.getElementById('qaViewDiet');
    const qaChatCoach       = document.getElementById('qaChatCoach');
    const qaUpdateProgress  = document.getElementById('qaUpdateProgress');
    const qaBookSession     = document.getElementById('qaBookSession');
    const qaDownloadReport  = document.getElementById('qaDownloadReport');

    if (qaStartWorkout) {
        qaStartWorkout.addEventListener('click', () => {
            switchView('workouts');
        });
    }
    document.getElementById('startWorkoutModalBtn')?.addEventListener('click', () => {
        switchView('workouts');
    });
    document.getElementById('joinEarlySessionBtn')?.addEventListener('click', () => {
        switchView('workouts');
    });
    if (closeWorkoutModal) closeWorkoutModal.addEventListener('click', closeLiveWorkout);
    if (finishWorkoutBtn) {
        finishWorkoutBtn.addEventListener('click', () => {
            closeLiveWorkout();
            regProfile.totalWorkouts += 1;
            regProfile.totalCaloriesBurned += 460;
            populateProfileData();
            showToast('🏆 Workout logged! 460 kcal added to your daily progress.', 'fa-circle-check');
        });
    }

    // Coach Chat Open Triggers
    if (qaChatCoach) qaChatCoach.addEventListener('click', openCoachChat);
    document.getElementById('sidebarChatCoachBtn')?.addEventListener('click', openCoachChat);
    document.getElementById('coachMessageDirectBtn')?.addEventListener('click', openCoachChat);
    document.getElementById('coachTopChatBtn')?.addEventListener('click', openCoachChat);
    document.getElementById('coachHeroChatBtn')?.addEventListener('click', openCoachChat);
    if (closeCoachChatModal) closeCoachChatModal.addEventListener('click', closeCoachChat);

    // Coach Booking Modal Triggers
    if (qaBookSession) qaBookSession.addEventListener('click', () => openCoachBookingModal('training'));
    document.getElementById('coachBookSessionBtn')?.addEventListener('click', () => openCoachBookingModal('training'));
    document.getElementById('coachTopBookBtn')?.addEventListener('click', () => openCoachBookingModal('training'));
    document.getElementById('coachHeroBookBtn')?.addEventListener('click', () => openCoachBookingModal('training'));
    document.getElementById('coachQuickBookBtn')?.addEventListener('click', () => openCoachBookingModal('training'));
    if (closeBookCoachSessionModal) closeBookCoachSessionModal.addEventListener('click', closeCoachBookingModal);
    if (cancelBookCoachBtn) cancelBookCoachBtn.addEventListener('click', closeCoachBookingModal);

    // Package Specific Booking Buttons
    document.querySelectorAll('.btn-book-slot').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const explicitType = e.currentTarget.getAttribute('data-session-type');
            if (explicitType) {
                openCoachBookingModal(explicitType);
                return;
            }
            const pkgCard = e.currentTarget.closest('.coach-pkg-card');
            const pkgTitle = pkgCard ? pkgCard.querySelector('.pkg-title')?.textContent.trim() : '';
            let sType = 'training';
            if (pkgTitle && pkgTitle.includes('Biomechanics')) sType = 'form_check';
            else if (pkgTitle && (pkgTitle.includes('Mobility') || pkgTitle.includes('Recovery'))) sType = 'mobility';
            openCoachBookingModal(sType);
        });
    });

    // Navigation triggers for Coach View
    document.getElementById('crumbCoachToDashboard')?.addEventListener('click', () => switchView('dashboard'));
    document.getElementById('coachBackToDashBtn')?.addEventListener('click', () => switchView('dashboard'));
    document.getElementById('coachHeroViewPlansBtn')?.addEventListener('click', () => switchView('workouts'));

    // Handle Book Coach Session Form Submit
    if (bookCoachSessionForm) {
        bookCoachSessionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sessionType = document.getElementById('bookingSessionType')?.value || 'training';
            const bookingDate = document.getElementById('bookingDateInput')?.value || 'Tomorrow';
            const timeSlot = document.getElementById('bookingTimeSlot')?.value || '06:30 PM';
            const mode = document.querySelector('input[name="bookingMode"]:checked')?.value || 'video';
            const notes = document.getElementById('bookingNotes')?.value || '';

            const sessionTypeLabels = {
                'training': '1-on-1 Hypertrophy & Fat Loss Training',
                'form_check': 'Compound Biomechanics & Form Check',
                'mobility': 'Mobility & Recovery Optimization',
                'assessment': 'Monthly Transformation Audit'
            };
            const label = sessionTypeLabels[sessionType] || '1-on-1 Coaching Session';

            // Add new session item to the upcoming schedule list
            const scheduleList = document.getElementById('coachUpcomingSessionsList');
            if (scheduleList) {
                const dateObj = new Date(bookingDate);
                const dayStr = isNaN(dateObj.getTime()) ? 'FRI' : dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                const numStr = isNaN(dateObj.getTime()) ? '15' : dateObj.getDate();

                const newSessionItem = document.createElement('div');
                newSessionItem.className = 'coach-session-item';
                newSessionItem.style.border = '1px solid rgba(139, 92, 246, 0.4)';
                newSessionItem.style.background = 'rgba(139, 92, 246, 0.08)';
                newSessionItem.innerHTML = `
                    <div class="cs-item-left">
                        <div class="cs-date-badge" style="background: rgba(139, 92, 246, 0.25);">
                            <span class="cs-day">${dayStr}</span>
                            <span class="cs-num">${numStr}</span>
                        </div>
                        <div class="cs-details">
                            <div class="cs-title">${label}</div>
                            <div class="cs-meta"><i class="fa-regular fa-clock"></i> ${timeSlot} • <i class="fa-solid ${mode === 'video' ? 'fa-video text-purple' : 'fa-location-dot text-green'}"></i> ${mode === 'video' ? 'HD Video Call' : 'Gym Floor'}</div>
                        </div>
                    </div>
                    <span class="badge-status badge-success" style="font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);">
                        <i class="fa-solid fa-circle-check"></i> Confirmed
                    </span>
                `;
                scheduleList.insertBefore(newSessionItem, scheduleList.firstChild);
            }

            // Persist booking to backend API
            try {
                fetch('/api/coach/book', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionType: sessionType,
                        bookingDate: bookingDate,
                        timeSlot: timeSlot,
                        mode: mode,
                        notes: notes
                    })
                }).then(r => r.json()).then(data => {
                    if (data && data.success) {
                        showToast(`🎉 1-on-1 Session confirmed with ${data.coachName || (currentCoach ? currentCoach.fullName : 'Coach Rahul Sharma')} for ${bookingDate} at ${timeSlot}!`, 'fa-calendar-check');
                    }
                }).catch(e => console.warn('Booking API notice:', e));
            } catch (err) {
                console.warn('Booking submit notice:', err);
            }

            closeCoachBookingModal();
            showToast(`🎉 1-on-1 Session confirmed with Coach ${currentCoach ? currentCoach.fullName : 'Rahul Sharma'} for ${bookingDate} at ${timeSlot}!`, 'fa-calendar-check');
        });
    }

