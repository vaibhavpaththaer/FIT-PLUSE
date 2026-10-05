// FitPulse — Workout Center, Live Tracker & Exercise Engine

    // =========================================================================
    // 13. PREMIUM WORKOUT CENTER & LIVE TRACKER SUITE (BACKEND INTEGRATED)
    // =========================================================================
    // Global Workout State
    let workoutState = {
        todayWorkout: null,
        allWorkouts: [],
        history: [],
        activeExerciseIndex: 0,
        completedExercises: new Set()
    };

    // ── Workout Stopwatch Timer ──────────────────────────────────────────────
    let workoutTimerInterval = null;
    let workoutSeconds = 0;
    let timerState = 'STOPPED'; // 'RUNNING' | 'PAUSED' | 'STOPPED'

    const woDigitalTimer = document.getElementById('woDigitalTimer');
    const woLiveDuration = document.getElementById('woLiveDuration');
    const woTimerStateText = document.getElementById('woTimerStateText');
    const timerStartBtn = document.getElementById('timerStartBtn');
    const timerPauseBtn = document.getElementById('timerPauseBtn');
    const timerResumeBtn = document.getElementById('timerResumeBtn');
    const timerResetBtn = document.getElementById('timerResetBtn');
    const woLiveHR = document.getElementById('woLiveHR');

    function formatTime(totalSeconds) {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatTimeShort(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updateTimerUI() {
        const startBtn = document.getElementById('timerStartBtn');
        const pauseBtn = document.getElementById('timerPauseBtn');
        const stateText = document.getElementById('woTimerStateText');

        if (timerState === 'RUNNING') {
            if (startBtn) {
                startBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                startBtn.title = 'Pause Session Timer';
                startBtn.classList.add('active-pause');
            }
            if (pauseBtn) pauseBtn.classList.add('active');
            if (stateText) {
                stateText.textContent = 'RUNNING';
                stateText.style.color = 'var(--accent-green)';
            }
        } else if (timerState === 'PAUSED') {
            if (startBtn) {
                startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                startBtn.title = 'Resume Session Timer';
                startBtn.classList.remove('active-pause');
            }
            if (pauseBtn) pauseBtn.classList.remove('active');
            if (stateText) {
                stateText.textContent = 'PAUSED';
                stateText.style.color = 'var(--accent-yellow)';
            }
        } else {
            if (startBtn) {
                startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
                startBtn.title = 'Start Session Timer';
                startBtn.classList.remove('active-pause');
            }
            if (pauseBtn) pauseBtn.classList.remove('active');
            if (stateText) {
                stateText.textContent = 'STOPPED';
                stateText.style.color = '#ef4444';
            }
        }
    }

    function startWorkoutTimer() {
        if (workoutTimerInterval) clearInterval(workoutTimerInterval);
        timerState = 'RUNNING';
        updateTimerUI();

        workoutTimerInterval = setInterval(() => {
            workoutSeconds++;
            const woDig = document.getElementById('woDigitalTimer');
            const woDur = document.getElementById('woLiveDuration');
            if (woDig) woDig.textContent = formatTime(workoutSeconds);
            if (woDur) woDur.textContent = formatTimeShort(workoutSeconds);

            // Subtle live heart rate simulation
            if (woLiveHR && workoutSeconds % 3 === 0) {
                const simulatedHR = 138 + Math.floor(Math.random() * 12);
                woLiveHR.textContent = simulatedHR;
            }
        }, 1000);
    }

    function pauseWorkoutTimer() {
        if (workoutTimerInterval) clearInterval(workoutTimerInterval);
        workoutTimerInterval = null;
        timerState = 'PAUSED';
        updateTimerUI();
        showToast('Workout timer paused ⏸️', 'fa-pause');
    }

    function toggleWorkoutTimer() {
        if (timerState === 'RUNNING') {
            pauseWorkoutTimer();
        } else {
            startWorkoutTimer();
            showToast(timerState === 'PAUSED' ? 'Session Timer Resumed ▶️' : 'Session Timer Started 🚀', 'fa-play');
        }
    }

    function resetWorkoutTimer(silent = false) {
        if (workoutTimerInterval) clearInterval(workoutTimerInterval);
        workoutTimerInterval = null;
        workoutSeconds = 0;
        timerState = 'STOPPED';
        const woDig = document.getElementById('woDigitalTimer');
        const woDur = document.getElementById('woLiveDuration');
        if (woDig) woDig.textContent = '00:00:00';
        if (woDur) woDur.textContent = '00:00';
        updateTimerUI();
        if (!silent) showToast('Workout timer reset to 00:00:00', 'fa-arrow-rotate-left');
    }

    if (timerStartBtn) timerStartBtn.addEventListener('click', toggleWorkoutTimer);
    if (timerResetBtn) timerResetBtn.addEventListener('click', () => resetWorkoutTimer(false));

    // ── Exercise Demo Video Database & Fallbacks ────────────────────────────
    const exerciseDemos = {
        'incline_press': {
            category: 'CHEST & DELTOIDS',
            title: 'Incline Dumbbell Bench Press',
            subtitle: 'Target upper clavicular head of pectoralis major with neutral wrist control.',
            poster: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            ytId: '0G2_WgbkH0I',
            cues: [
                'Set bench incline to 30 degrees to prevent excessive shoulder impingement.',
                'Retract and depress scapula firmly into the bench throughout the entire movement.',
                'Lower dumbbells until level with mid-chest, pause for 1s, and press in a smooth arc.'
            ],
            mistake: 'Flaring elbows at 90 degrees. Maintain a 45° to 60° angle relative to your torso.'
        },
        'overhead_press': {
            category: 'DELTOIDS & CORE',
            title: 'Standing Overhead Military Press',
            subtitle: 'Strict overhead military press building shoulder width and core stability.',
            poster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            ytId: '2yjwXTZQDDI',
            cues: [
                'Grip bar just outside shoulder width with vertical forearms at the bottom position.',
                'Squeeze glutes and brace core tightly to avoid hyperextending your lumbar spine.',
                'Press vertically in a straight path, moving your head slightly forward at lockout.'
            ],
            mistake: 'Excessive back arching. If leaning back, reduce load and tighten glutes.'
        },
        'cable_flyes': {
            category: 'CHEST ISOLATION',
            title: 'Weighted Standing Cable Chest Flyes',
            subtitle: 'Continuous tension on inner and sternal chest fibers with full peak contraction.',
            poster: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            ytId: 'taI4XduLpTk',
            cues: [
                'Keep a slight bend in elbows and maintain that exact joint angle throughout.',
                'Bring handles together in front of sternum, squeezing inner pecs for 2 seconds.',
                'Control eccentric return slowly over 3 seconds until feeling a deep pectoral stretch.'
            ],
            mistake: 'Turning flyes into presses. Keep elbows locked in slight fixed curve.'
        },
        'lateral_raises': {
            category: 'SHOULDER HYPERTROPHY',
            title: 'Seated Dumbbell Lateral Raises',
            subtitle: 'Strict lateral deltoid isolation eliminating lower back momentum.',
            poster: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            ytId: '3VcKaXpzqRo',
            cues: [
                'Lead with elbows and keep pinkies slightly higher than thumbs at apex.',
                'Raise dumbbells to shoulder height only; do not swing or shrug traps.',
                'Hold apex position for 1 second before lowering slowly.'
            ],
            mistake: 'Using heavy weight and swinging hips. Use moderate weight with strict tempo.'
        },
        'triceps_pushdown': {
            category: 'TRICEPS ISOLATION',
            title: 'Cable Rope Triceps Pushdowns',
            subtitle: 'Maximal recruitment of lateral and long tricep heads with terminal rope flare.',
            poster: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutback2013.mp4',
            ytId: '2-LAMcpzODU',
            cues: [
                'Pin elbows firmly to your sides; do not let them drift forward.',
                'Push down smoothly and spread rope ends apart at bottom for full contraction.',
                'Return slowly to 90 degrees elbow flexion without allowing weights to slam.'
            ],
            mistake: 'Letting shoulders shrug forward and elbows drift back.'
        },
        'barbell_squats': {
            category: 'QUADS & POSTERIOR CHAIN',
            title: 'Barbell Back Squats',
            subtitle: 'Fundamental compound builder for quadriceps, hamstrings, and core bracing.',
            poster: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            ytId: 'ultWZbUMPL8',
            cues: [
                'Place bar across upper traps and create a rigid shelf with your rear deltoids.',
                'Hinge at hips while breaking at knees, keeping chest proud and knees tracking toes.',
                'Descend below parallel before driving through midfoot back to the starting stance.'
            ],
            mistake: 'Knees caving inward on ascent. Push floor apart with feet.'
        },
        'romanian_deadlift': {
            category: 'HAMSTRINGS & GLUTES',
            title: 'Barbell Romanian Deadlift (RDL)',
            subtitle: 'Eccentric hamstring loading and powerful glute hinge mechanics.',
            poster: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            ytId: 'JCXUYuzwNrM',
            cues: [
                'Maintain neutral spine and soft bend in knees throughout entire hinge.',
                'Push hips backwards toward the wall behind you until deep hamstring stretch.',
                'Drive hips forward to lockout while keeping barbell against your shins.'
            ],
            mistake: 'Rounding lower back or bending knees excessively into a squat.'
        },
        'lat_pulldown': {
            category: 'BACK WIDTH & LATS',
            title: 'Wide-Grip Lat Pulldown',
            subtitle: 'Develop broad V-taper lats with full vertical humeral depression.',
            poster: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            ytId: 'CAwf7n6Luuc',
            cues: [
                'Grip bar 1.5x shoulder width and lean back slightly (10-15 degrees).',
                'Initiate pull by driving shoulder blades down and elbows toward back pockets.',
                'Touch bar to upper chest and squeeze lats before controlled 3s release.'
            ],
            mistake: 'Yanking bar using lower back momentum and swinging.'
        },
        'bicep_curls': {
            category: 'BICEPS HYPERTROPHY',
            title: 'Dumbbell Alternating Bicep Curls',
            subtitle: 'Isolated supinating bicep curl targeting short and long head peak contraction.',
            poster: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            ytId: 'in7PaeYlhrM',
            cues: [
                'Keep upper arms stationary and elbows pinned to torso throughout motion.',
                'Supinate wrist (rotate palm upward) as dumbbell passes hip level.',
                'Squeeze bicep at peak contraction for 1s before 3-second negative descent.'
            ],
            mistake: 'Swinging elbows forward to cheat weight upward.'
        },
        'kettlebell_swings': {
            category: 'FAT LOSS & CARDIO',
            title: 'Explosive Kettlebell Swings',
            subtitle: 'High-intensity metabolic conditioning & glute power production.',
            poster: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            ytId: 'YSxHifyI6s8',
            cues: [
                'Hinge at hips with flat back, hiking kettlebell between upper thighs.',
                'Snap hips forward explosively to propel kettlebell to chest level.',
                'Let weight fall naturally into next hip hinge rep.'
            ],
            mistake: 'Lifting kettlebell with arms instead of driving with hips and glutes.'
        },
        'mountain_climbers': {
            category: 'CORE & CARDIO HIIT',
            title: 'Dynamic Mountain Climbers',
            subtitle: 'Rapid high-tempo core stabilization and aerobic burn.',
            poster: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            ytId: 'nmwgirgXLYM',
            cues: [
                'Maintain rigid plank position with shoulders stacked over wrists.',
                'Drive knees alternately toward chest in rapid, controlled cadence.',
                'Keep hips level and glutes tight throughout the duration.'
            ],
            mistake: 'Piking hips upward into the air.'
        },
        'chest_dips': {
            category: 'CHEST & TRICEPS DYNAMICS',
            title: 'Bodyweight Parallel Bar Dips',
            subtitle: 'Compound lower chest and tricep overload builder.',
            poster: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            ytId: '2z8JmcrW-As',
            cues: [
                'Lean torso forward at 30° angle to emphasize pectoral recruitment.',
                'Lower body under control until upper arms are parallel to bars.',
                'Press powerfully upward to full lockout without locking elbows forcefully.'
            ],
            mistake: 'Dropping too low causing extreme anterior shoulder stress.'
        }
    };

    function getDemoKeyForExercise(name) {
        if (!name) return 'incline_press';
        const n = name.toLowerCase();
        if (n.includes('bicep') || n.includes('curl') || n.includes('hammer')) return 'bicep_curls';
        if (n.includes('dip') || n.includes('parallel') || n.includes('bar')) return 'chest_dips';
        if (n.includes('kettlebell') || n.includes('swing')) return 'kettlebell_swings';
        if (n.includes('climber') || n.includes('plank') || n.includes('ab') || n.includes('core')) return 'mountain_climbers';
        if (n.includes('incline') || n.includes('bench') || n.includes('chest press')) return 'incline_press';
        if (n.includes('overhead') || n.includes('military') || n.includes('shoulder press')) return 'overhead_press';
        if (n.includes('fly') || n.includes('flye') || n.includes('cable chest')) return 'cable_flyes';
        if (n.includes('lateral') || n.includes('side raise') || n.includes('deltoid')) return 'lateral_raises';
        if (n.includes('tricep') || n.includes('pushdown') || n.includes('skull crusher')) return 'triceps_pushdown';
        if (n.includes('squat') || n.includes('leg press') || n.includes('hack squat')) return 'barbell_squats';
        if (n.includes('deadlift') || n.includes('rdl') || n.includes('hamstring')) return 'romanian_deadlift';
        if (n.includes('lat') || n.includes('pull') || n.includes('row') || n.includes('back')) return 'lat_pulldown';
        return 'incline_press';
    }

    // ── Exercise Demo Video Section Removed ──────────────────────────────


    // ── Dynamic Workout Progress & Exertion Calculation ─────────────────────
    function updateWorkoutProgress() {
        const cards = document.querySelectorAll('.exercise-card');
        const total = cards.length || 5;
        const completedCards = document.querySelectorAll('.exercise-card.completed').length;
        const targetCals = (workoutState.todayWorkout && workoutState.todayWorkout.caloriesBurned) ? workoutState.todayWorkout.caloriesBurned : 520;
        const totalSets = (workoutState.todayWorkout && workoutState.todayWorkout.exercises)
            ? workoutState.todayWorkout.exercises.reduce((s, e) => s + (e.sets || 3), 0)
            : 18;

        const pct = total > 0 ? Math.round((completedCards / total) * 100) : 0;
        const activeCals = Math.round((completedCards / total) * targetCals);
        const completedSets = Math.min(totalSets, Math.round((completedCards / total) * totalSets));

        const woProgressPct = document.getElementById('woProgressPct');
        const woProgressBarFill = document.getElementById('woProgressBarFill');
        const woProgressSub = document.getElementById('woProgressSub');
        const woActiveCalories = document.getElementById('woActiveCalories');
        const woCalBarFill = document.getElementById('woCalBarFill');

        if (woProgressPct) woProgressPct.textContent = `${pct}%`;
        if (woProgressBarFill) woProgressBarFill.style.width = `${pct}%`;
        if (woProgressSub) {
            woProgressSub.textContent = `${completedCards} of ${total} Exercises Completed (${completedSets} of ${totalSets} Sets Done)`;
        }
        if (woActiveCalories) woActiveCalories.textContent = activeCals;
        if (woCalBarFill) woCalBarFill.style.width = `${pct}%`;
    }

    // ── Bind Event Listeners to Exercise Cards ──────────────────────────────
    function bindExerciseCardEvents(container) {
        const root = container || document;

        // Weight Steppers (+ / -)
        root.querySelectorAll('.stepper-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const targetId = btn.dataset.target;
                const targetEl = document.getElementById(targetId) || btn.parentElement.querySelector('.spec-val');
                if (!targetEl) return;

                let currentWeight = parseFloat(targetEl.textContent) || 20.0;
                if (btn.classList.contains('weight-plus')) {
                    currentWeight = +(currentWeight + 2.5).toFixed(1);
                } else if (btn.classList.contains('weight-minus')) {
                    currentWeight = Math.max(2.5, +(currentWeight - 2.5).toFixed(1));
                }
                targetEl.textContent = `${currentWeight} kg`;
                showToast(`Weight adjusted to ${currentWeight} kg`, 'fa-dumbbell');
            };
        });

        // Rest Countdown Timers
        root.querySelectorAll('.ex-rest-trigger-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const seconds = parseInt(btn.dataset.seconds) || 60;
                let remaining = seconds;
                const origHTML = btn.innerHTML;
                btn.disabled = true;
                btn.style.background = 'var(--accent-yellow)';
                btn.style.color = '#0d0f1a';

                showToast(`⏱️ Starting ${seconds}s rest interval. Deep breaths!`, 'fa-stopwatch');

                const restInt = setInterval(() => {
                    remaining--;
                    btn.innerHTML = `<i class="fa-solid fa-stopwatch"></i> Resting: ${remaining}s`;
                    if (remaining <= 0) {
                        clearInterval(restInt);
                        btn.disabled = false;
                        btn.innerHTML = origHTML;
                        btn.style.background = '';
                        btn.style.color = '';
                        showToast('🔔 Rest interval over! Time for your next set! ⚡', 'fa-bolt');
                    }
                }, 1000);
            };
        });

        // Demo Video Modal Triggers
        root.querySelectorAll('.ex-demo-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const exKey = btn.dataset.ex;
                const card = btn.closest('.exercise-card');
                const cardId = card ? (card.id || card.dataset.exId) : null;
                openVideoDemo(exKey, cardId);
            };
        });

        // Exercise Completion Toggles (Scoped by Day Index)
        root.querySelectorAll('.ex-complete-toggle-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const card = btn.closest('.exercise-card');
                if (!card) return;

                const isDone = card.classList.toggle('completed');
                card.classList.remove('in-progress');
                const statusPill = card.querySelector('.ex-status-pill');
                const exId = card.dataset.exId || card.id;
                const compKey = `${currentSelectedDayIdx}_${exId}`;

                if (isDone) {
                    btn.classList.add('completed');
                    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Completed</span>';
                    if (statusPill) {
                        statusPill.className = 'ex-status-pill done';
                        statusPill.innerHTML = '<i class="fa-solid fa-check"></i> Done';
                    }
                    workoutState.completedExercises.add(compKey);
                    showToast('Exercise Completed! Volume and calories logged 🔥', 'fa-circle-check');
                } else {
                    btn.classList.remove('completed');
                    btn.innerHTML = '<i class="fa-regular fa-circle-check"></i> <span>Mark Complete</span>';
                    if (statusPill) {
                        statusPill.className = 'ex-status-pill upcoming';
                        statusPill.textContent = 'Pending';
                    }
                    workoutState.completedExercises.delete(compKey);
                    showToast('Exercise marked as pending', 'fa-clock');
                }

                updateWorkoutProgress();
            };
        });
    }

    // ── Render Today's Workout & Exercises ──────────────────────────────────
    function renderTodayWorkout(workout) {
        if (!workout) return;

        // 1. Hero Card Headers & Badges
        const diffBadge = document.querySelector('.badge-pill-difficulty');
        if (diffBadge && workout.difficulty) {
            diffBadge.innerHTML = `<i class="fa-solid fa-gauge-high"></i> ${workout.difficulty.toUpperCase()}`;
        }

        const dateBadge = document.querySelector('.wo-hero-card .badge-pill-purple');
        if (dateBadge) {
            dateBadge.innerHTML = `<i class="fa-solid fa-calendar-day"></i> Today's Routine`;
        }

        const heroTitle = document.querySelector('.wo-hero-title');
        if (heroTitle && workout.title) heroTitle.textContent = workout.title;

        const heroDesc = document.querySelector('.wo-hero-desc');
        if (heroDesc) {
            heroDesc.textContent = workout.notes || 'Focus on progressive overload, tempo control, and biomechanical precision.';
        }

        // Muscle Pills
        const muscleContainer = document.querySelector('.wo-muscle-pills-row');
        if (muscleContainer && workout.targetMuscle) {
            const muscles = workout.targetMuscle.split(',').map(m => m.trim());
            muscleContainer.innerHTML = muscles.map((m, idx) => {
                const icons = ['fa-bullseye', 'fa-dumbbell', 'fa-fire', 'fa-bolt', 'fa-shield-halved'];
                const icon = icons[idx % icons.length];
                return `<span class="wo-muscle-pill"><i class="fa-solid ${icon}"></i> ${m}</span>`;
            }).join('');
        }

        // Coach info
        const coachBox = document.querySelector('.wo-coach-assigned-box');
        if (coachBox && workout.coachId) {
            const nameEl = coachBox.querySelector('.wo-coach-name');
            if (nameEl) nameEl.innerHTML = `Prescribed by <strong>Coach Rahul Sharma, CSCS</strong>`;
        }

        // Stat Matrix
        const statCards = document.querySelectorAll('.wo-stat-matrix .wo-hstat-card');
        if (statCards.length >= 4) {
            const v0 = statCards[0].querySelector('.wo-hstat-val');
            if (v0) v0.textContent = `${workout.durationMin || 45} Mins`;

            const v1 = statCards[1].querySelector('.wo-hstat-val');
            if (v1) v1.textContent = `${workout.caloriesBurned || 450} kcal`;

            const exercisesCount = (workout.exercises && workout.exercises.length) ? workout.exercises.length : 5;
            const v2 = statCards[2].querySelector('.wo-hstat-val');
            if (v2) v2.textContent = `${exercisesCount} Exercises`;

            const totalSets = (workout.exercises && workout.exercises.length)
                ? workout.exercises.reduce((s, e) => s + (e.sets || 3), 0)
                : 18;
            const v3 = statCards[3].querySelector('.wo-hstat-val');
            if (v3) v3.textContent = `${totalSets} Sets`;
        }

        // 2. Render Dynamic Exercise Cards
        const listEl = document.getElementById('exerciseCardsList');
        if (listEl && workout.exercises && workout.exercises.length > 0) {
            const thumbImages = [
                'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80'
            ];

            listEl.innerHTML = workout.exercises.map((ex, idx) => {
                const orderStr = String(idx + 1).padStart(2, '0');
                const demoKey = getDemoKeyForExercise(ex.exerciseName);
                const imgUrl = thumbImages[idx % thumbImages.length];
                const weight = ex.weightKg > 0 ? `${ex.weightKg} kg` : 'Bodyweight';
                const rest = ex.restSec || 60;
                const isCompleted = workout.isCompleted || workoutState.completedExercises.has(String(ex.id || idx + 1));
                const cardClass = isCompleted ? 'exercise-card completed' : (idx === 0 ? 'exercise-card in-progress' : 'exercise-card');
                const statusBadge = isCompleted
                    ? '<span class="ex-status-pill done"><i class="fa-solid fa-check"></i> Done</span>'
                    : (idx === 0
                        ? '<span class="ex-status-pill active-pill"><span class="pulse-dot"></span> In Progress</span>'
                        : '<span class="ex-status-pill upcoming">Upcoming</span>');
                const btnHTML = isCompleted
                    ? '<i class="fa-solid fa-circle-check"></i> <span>Completed</span>'
                    : '<i class="fa-regular fa-circle-check"></i> <span>Mark Complete</span>';
                const btnClass = isCompleted ? 'ex-complete-toggle-btn completed' : 'ex-complete-toggle-btn';

                return `
                <div class="${cardClass}" id="exCard${idx + 1}" data-ex-id="${ex.id || idx + 1}">
                    <div class="ex-card-thumb-wrapper">
                        <img src="${imgUrl}" alt="${ex.exerciseName}" class="ex-card-img">
                        <span class="ex-order-badge">${orderStr}</span>
                        ${statusBadge}
                    </div>

                    <div class="ex-card-content">
                        <div class="ex-card-header">
                            <div>
                                <span class="ex-target-tag">${ex.notes || workout.targetMuscle || 'Target Muscle Group'}</span>
                                <h4 class="ex-name">${ex.exerciseName}</h4>
                            </div>
                        </div>

                        <!-- Specs Grid -->
                        <div class="ex-specs-grid">
                            <div class="ex-spec-cell">
                                <span class="spec-label">Sets</span>
                                <strong class="spec-val">${ex.sets || 3} Sets</strong>
                            </div>
                            <div class="ex-spec-cell">
                                <span class="spec-label">Reps</span>
                                <strong class="spec-val">${ex.reps || 10} Reps</strong>
                            </div>
                            <div class="ex-spec-cell">
                                <span class="spec-label">Weight</span>
                                <div class="spec-weight-stepper">
                                    <button class="stepper-btn weight-minus" data-target="exWeight${idx + 1}">-</button>
                                    <strong class="spec-val" id="exWeight${idx + 1}">${weight}</strong>
                                    <button class="stepper-btn weight-plus" data-target="exWeight${idx + 1}">+</button>
                                </div>
                            </div>
                            <div class="ex-spec-cell">
                                <span class="spec-label">Rest</span>
                                <strong class="spec-val"><i class="fa-solid fa-stopwatch"></i> ${rest}s</strong>
                            </div>
                        </div>

                        <!-- Actions Row -->
                        <div class="ex-card-actions">
                            <button class="ex-rest-trigger-btn" data-seconds="${rest}"><i class="fa-solid fa-play"></i> Start ${rest}s Rest Timer</button>
                            <button class="${btnClass}" data-ex-id="${ex.id || idx + 1}">
                                ${btnHTML}
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');

            bindExerciseCardEvents(listEl);
        } else {
            bindExerciseCardEvents(document);
        }

        updateWorkoutProgress();
    }

    // ── Render Weekly Schedule ──────────────────────────────────────────────
    function renderWeeklyWorkoutSchedule(workouts) {
        const scheduleContainer = document.querySelector('.wo-schedule-list');
        if (!scheduleContainer) return;

        const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const today = new Date();
        const todayDayIndex = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

        const defaultSchedule = [
            { title: 'Chest, Triceps & Upper Deltoids Overload', duration: 55, cals: 520, rest: false },
            { title: 'Lower Body Quad Hypertrophy & Calves', duration: 60, cals: 580, rest: false },
            { title: 'Active Recovery & Yoga Joint Mobility', duration: 30, cals: 180, rest: false },
            { title: 'Upper Body Hypertrophy & Core Stability', duration: 55, cals: 520, rest: false },
            { title: 'Posterior Chain & Hamstring Power', duration: 60, cals: 610, rest: false },
            { title: 'HIIT Circuit & Explosive Sprints', duration: 40, cals: 440, rest: false },
            { title: 'Rest & Nutrition Regeneration', duration: 0, cals: 0, rest: true }
        ];

        let html = '';
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            const diff = i - todayDayIndex;
            d.setDate(today.getDate() + diff);
            const dayNum = String(d.getDate()).padStart(2, '0');
            const dayAbbr = dayNames[i];

            const item = defaultSchedule[i];
            let statusClass = 'upcoming';
            let badgeHTML = '<span class="wo-sched-badge upcoming">Upcoming</span>';

            if (item.rest) {
                statusClass = 'rest';
                badgeHTML = '<span class="wo-sched-badge rest">Rest Day 💤</span>';
            } else if (i < todayDayIndex) {
                statusClass = 'done';
                badgeHTML = '<span class="wo-sched-badge done"><i class="fa-solid fa-check"></i> Done</span>';
            } else if (i === todayDayIndex) {
                statusClass = 'today';
                badgeHTML = '<span class="wo-sched-badge today"><span class="pulse-dot"></span> In Progress</span>';
            } else if (i === todayDayIndex + 1) {
                statusClass = 'upcoming';
                badgeHTML = '<span class="wo-sched-badge upcoming">Tomorrow</span>';
            } else {
                statusClass = 'upcoming';
                badgeHTML = `<span class="wo-sched-badge upcoming">${dayAbbr}</span>`;
            }

            html += `
            <div class="wo-sched-row ${statusClass}">
                <div class="wo-sched-day">
                    <span class="day-abbr">${dayAbbr}</span>
                    <span class="day-num">${dayNum}</span>
                </div>
                <div class="wo-sched-info">
                    <strong>${item.title}</strong>
                    <small>${item.rest ? 'Full Recovery Day' : `${item.duration} mins • ${item.cals} kcal`}</small>
                </div>
                ${badgeHTML}
            </div>`;
        }

        scheduleContainer.innerHTML = html;
    }

    // ── Render Workout History Tables ───────────────────────────────────────
    function renderWorkoutHistoryTables(historyList) {
        const woTbody = document.querySelector('.wo-history-table tbody');
        const progTbody = document.getElementById('progHistoryTableBody');

        let combined = [];
        try {
            const localHist = JSON.parse(localStorage.getItem('fitpulse_workout_history') || '[]');
            combined = Array.isArray(localHist) ? [...localHist] : [];
        } catch(e){}

        if (Array.isArray(historyList)) {
            historyList.forEach(item => {
                if (!combined.some(c => c.title === item.title && c.scheduledDate === item.scheduledDate)) {
                    combined.push(item);
                }
            });
        }

        if (combined.length === 0) return;

        const rowsHTML = combined.map(item => {
            const d = item.scheduledDate ? new Date(item.scheduledDate) : new Date();
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = item.scheduledTime || '06:30 PM';
            const title = item.title || 'Power & Hypertrophy Session';
            const exCount = item.exercises ? (Array.isArray(item.exercises) ? item.exercises.length : 5) : 5;
            const meta = `${exCount} Exercises • ${item.durationMin || 45} Mins`;
            const focus = item.targetMuscle || 'Full Body';
            const duration = `${item.durationMin || 45} mins`;
            const cals = `${item.caloriesBurned || 450} kcal`;
            const isPR = (item.caloriesBurned && item.caloriesBurned > 550);
            const perfBadge = isPR
                ? '<span class="perf-badge badge-pr">🏆 PR Performed</span>'
                : '<span class="perf-badge badge-completed"><i class="fa-solid fa-check"></i> Completed</span>';

            return `
            <tr>
                <td>
                    <strong>${dateStr}</strong>
                    <small class="table-sub-text">${timeStr}</small>
                </td>
                <td>
                    <span class="table-main-title">${title}</span>
                    <small class="table-sub-text">${meta}</small>
                </td>
                <td><span class="wo-tag-pill">${focus}</span></td>
                <td><strong>${duration}</strong></td>
                <td><strong class="text-orange">${cals}</strong></td>
                <td>${perfBadge}</td>
                <td><button class="table-action-btn" title="View Session Summary" onclick="showToast('Displaying session logs for: ${title.replace(/'/g, "\\'")}', 'fa-file-lines')"><i class="fa-solid fa-eye"></i></button></td>
            </tr>`;
        }).join('');

        if (woTbody) woTbody.innerHTML = rowsHTML;
        if (progTbody) progTbody.innerHTML = rowsHTML;
    }

    // ── Render Upcoming Workout Card ────────────────────────────────────────
    function renderUpcomingWorkoutCard(workouts) {
        const upcomingBody = document.querySelector('.wo-upcoming-body');
        if (!upcomingBody) return;

        const nextWorkout = (workouts && workouts.length > 1) ? workouts[1] : null;
        if (nextWorkout) {
            const h4 = upcomingBody.querySelector('h4');
            if (h4 && nextWorkout.title) h4.textContent = nextWorkout.title;

            const p = upcomingBody.querySelector('p');
            if (p) p.textContent = nextWorkout.notes || `Target focus: ${nextWorkout.targetMuscle || 'Posterior Chain'}.`;

            const metrics = upcomingBody.querySelectorAll('.up-metric strong');
            if (metrics.length >= 2) {
                metrics[0].textContent = `${nextWorkout.durationMin || 60} Mins`;
                metrics[1].textContent = `${nextWorkout.caloriesBurned || 600} kcal`;
            }
        }
    }

    // ── Load All Workout Data from Backend API ──────────────────────────────
    async function loadWorkoutData() {
        try {
            // 1. Fetch today's workout
            const todayRes = await fetch('/api/workouts/today', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (todayRes.status === 401) {
                if (handleApiUnauthorized(todayRes)) return;
            }

            if (todayRes.ok) {
                const todayData = await todayRes.json();
                if (todayData.success && todayData.workout) {
                    workoutState.todayWorkout = todayData.workout;
                    renderTodayWorkout(todayData.workout);
                }
            }

            // 2. Fetch workout history
            const histRes = await fetch('/api/workouts/history?limit=15', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (histRes.ok) {
                const histData = await histRes.json();
                if (histData.success && Array.isArray(histData.workouts)) {
                    workoutState.history = histData.workouts;
                    renderWorkoutHistoryTables(histData.workouts);
                }
            }

            // 3. Fetch all workouts list for schedule & upcoming preview
            const allRes = await fetch('/api/workouts', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (allRes.ok) {
                const allData = await allRes.json();
                if (allData.success && Array.isArray(allData.workouts)) {
                    workoutState.allWorkouts = allData.workouts;
                    renderWeeklyWorkoutSchedule(allData.workouts);
                    renderUpcomingWorkoutCard(allData.workouts);
                }
            }
        } catch (err) {
            console.warn('Workout fetch API notice, continuing with cached/rich defaults:', err);
            bindExerciseCardEvents(document);
        }
    }

    let currentSelectedDayIdx = 3;

    function saveWorkoutSessionToHistory(durationMins, calsBurned) {
        const tbody = document.querySelector('.wo-history-table tbody');
        const today = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateStr = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
        const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const currentRoutine = (typeof WORKOUT_ROUTINES_BY_DAY !== 'undefined' && WORKOUT_ROUTINES_BY_DAY[currentSelectedDayIdx]) ? WORKOUT_ROUTINES_BY_DAY[currentSelectedDayIdx] : { title: "Upper Body Hypertrophy", exercises: [1,2,3,4,5] };

        const newRowHTML = `
            <tr>
                <td>
                    <strong>${dateStr}</strong>
                    <small class="table-sub-text">${timeStr}</small>
                </td>
                <td>
                    <span class="table-main-title">${currentRoutine.title}</span>
                    <small class="table-sub-text">${currentRoutine.exercises.length} Exercises • Completed</small>
                </td>
                <td><span class="wo-tag-pill">${currentRoutine.title.split(' ')[0]} Split</span></td>
                <td><strong>${durationMins} mins</strong></td>
                <td><strong class="text-orange">${calsBurned} kcal</strong></td>
                <td><span class="perf-badge badge-completed">100% Completed</span></td>
                <td><button type="button" class="table-action-btn" title="View Session Summary"><i class="fa-solid fa-eye"></i></button></td>
            </tr>
        `;

        if (tbody) {
            tbody.insertAdjacentHTML('afterbegin', newRowHTML);
        }
    }

    async function handleStartSession() {
        resetWorkoutTimer(); // Ensure session timer starts cleanly at 0
        startWorkoutTimer();
        const workoutId = workoutState.todayWorkout ? workoutState.todayWorkout.id : 1;

        try {
            await fetch('/api/workouts/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ workoutId: workoutId })
            });
        } catch (ignored) {}

        document.querySelector('.exercise-cards-list')?.scrollIntoView({ behavior: 'smooth' });
        showToast('🚀 Workout session started at 00:00:00! Focus on strict form & progressive overload.', 'fa-bolt');
    }

    if (woStartMainBtn) woStartMainBtn.addEventListener('click', handleStartSession);
    if (woHeaderStartBtn) woHeaderStartBtn.addEventListener('click', handleStartSession);
    document.getElementById('startWorkoutModalBtn')?.addEventListener('click', () => {
        switchView('workouts');
        handleStartSession();
    });
    document.getElementById('joinEarlySessionBtn')?.addEventListener('click', () => {
        switchView('workouts');
        handleStartSession();
    });

    async function handleCompleteSession() {
        pauseWorkoutTimer();
        const currentBurned = parseInt(document.getElementById('woActiveCalories')?.textContent, 10) || 520;
        const currentMins = Math.max(1, Math.round(workoutSeconds / 60)) || 45;

        // Dynamic Recent Workout History Update
        saveWorkoutSessionToHistory(currentMins, currentBurned);

        regProfile.totalWorkouts = (regProfile.totalWorkouts || 0) + 1;
        regProfile.totalCaloriesBurned = (regProfile.totalCaloriesBurned || 0) + currentBurned;
        regProfile.streak = (regProfile.streak || 14) + 1;

        // Mark all cards visually completed for current day
        document.querySelectorAll('.exercise-card').forEach(c => {
            c.classList.add('completed');
            c.classList.remove('in-progress');
            const b = c.querySelector('.ex-complete-toggle-btn');
            if (b) {
                b.classList.add('completed');
                b.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Completed</span>';
            }
            const p = c.querySelector('.ex-status-pill');
            if (p) {
                p.className = 'ex-status-pill done';
                p.innerHTML = '<i class="fa-solid fa-check"></i> Done';
            }
            const exId = c.dataset.exId || c.id;
            workoutState.completedExercises.add(`${currentSelectedDayIdx}_${exId}`);
        });

        updateWorkoutProgress();
        populateProfileData();
        resetWorkoutTimer(); // Clean timer reset to 0

        showToast(`🎉 Workout Saved to History! Duration: ${currentMins} mins | ${currentBurned} kcal logged! 🏆`, 'fa-trophy');
    }

    if (woFinishMainBtn) woFinishMainBtn.addEventListener('click', handleCompleteSession);
    if (finishWorkoutBtn) {
        finishWorkoutBtn.addEventListener('click', () => {
            closeLiveWorkout();
            handleCompleteSession();
        });
    }

    if (woSkipExerciseBtn) {
        woSkipExerciseBtn.addEventListener('click', () => {
            const currentActive = document.querySelector('.exercise-card.in-progress');
            if (currentActive) {
                currentActive.classList.remove('in-progress');
                const badge = currentActive.querySelector('.ex-status-pill');
                if (badge) {
                    badge.className = 'ex-status-pill upcoming';
                    badge.textContent = 'Skipped';
                }
                const nextCard = currentActive.nextElementSibling;
                if (nextCard && nextCard.classList.contains('exercise-card')) {
                    nextCard.classList.add('in-progress');
                    const nextBadge = nextCard.querySelector('.ex-status-pill');
                    if (nextBadge) {
                        nextBadge.className = 'ex-status-pill active-pill';
                        nextBadge.innerHTML = '<span class="pulse-dot"></span> In Progress';
                    }
                    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    showToast('Skipped to next exercise: ' + (nextCard.querySelector('.ex-name')?.textContent || 'Next Routine'), 'fa-forward-step');
                } else {
                    showToast('All remaining exercises reviewed!', 'fa-circle-check');
                }
            } else {
                showToast('No active exercise to skip', 'fa-info-circle');
            }
        });
    }

    // ── Quick Water Log on Workout Exertion Bar ──────────────────────────────
    const woAddWaterQuickBtn = document.getElementById('woAddWaterQuickBtn');
    if (woAddWaterQuickBtn) {
        let woWaterVal = 1.8;
        woAddWaterQuickBtn.addEventListener('click', () => {
            woWaterVal = Math.min(4.0, +(woWaterVal + 0.25).toFixed(2));
            const woLiveWater = document.getElementById('woLiveWater');
            if (woLiveWater) woLiveWater.textContent = `${woWaterVal}`;
            if (valWater) valWater.textContent = `${woWaterVal} L`;
            showToast(`💧 +250ml logged! Intra-workout hydration: ${woWaterVal} / 3.0 L`, 'fa-droplet');
        });
    }

    // ── Workout History Table Filter Buttons ─────────────────────────────────
    document.querySelectorAll('.wo-history-filters .card-tiny-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.wo-history-filters .card-tiny-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            const rows = document.querySelectorAll('.wo-history-table tbody tr');

            rows.forEach(row => {
                if (filter === 'all') {
                    row.style.display = '';
                } else if (filter === 'pr') {
                    const hasPR = row.querySelector('.badge-pr');
                    row.style.display = hasPR ? '' : 'none';
                } else if (filter === 'hypertrophy') {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes('hypertrophy') || text.includes('chest') || text.includes('quad') ? '' : 'none';
                }
            });
            showToast(`Filtered workout history by: ${btn.textContent}`, 'fa-filter');
        });
    });

    // ── Upcoming Workout Card Action Triggers ────────────────────────────────
    document.getElementById('woPreviewUpcomingBtn')?.addEventListener('click', () => {
        showToast('📋 Previewing Tomorrow: Back Squats (4x8), RDLs (4x10), Leg Press (3x12)', 'fa-eye');
    });

    document.getElementById('woRescheduleUpcomingBtn')?.addEventListener('click', () => {
        showToast('📅 Session rescheduled! Select new target date in calendar.', 'fa-calendar-days');
    });

    // ── Dynamic Weekly Workout Schedule & Routine Sync ────────────────────────
    const WORKOUT_ROUTINES_BY_DAY = [
        {
            title: "Push & Upper Body Hypertrophy",
            exercises: [
                { id: "1", name: "Incline Dumbbell Bench Press", target: "Upper Pectorals • Anterior Delts", demoKey: "incline_press", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "8 - 10", weight: "32.5 kg", rest: "90s" },
                { id: "2", name: "Standing Barbell Overhead Press", target: "Anterior & Lateral Deltoids • Core", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "8 - 10", weight: "50.0 kg", rest: "90s" },
                { id: "3", name: "Weighted Standing Cable Chest Flyes", target: "Pectoralis Major • Sternal Head", demoKey: "cable_flyes", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 - 15", weight: "18.0 kg", rest: "60s" },
                { id: "4", name: "Seated Dumbbell Lateral Raises", target: "Lateral Deltoids • Shoulder Cap", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "12 - 15", weight: "12.5 kg", rest: "45s" },
                { id: "5", name: "Cable Rope Triceps Pushdowns", target: "Triceps Lateral & Medial Heads", demoKey: "triceps_pushdown", img: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 - 15", weight: "27.5 kg", rest: "60s" }
            ]
        },
        {
            title: "Lower Body Quad & Leg Hypertrophy",
            exercises: [
                { id: "1", name: "Barbell Back Squats", target: "Quadriceps • Gluteus Maximus", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "6 - 8", weight: "100.0 kg", rest: "120s" },
                { id: "2", name: "Heavy 45° Leg Press", target: "Quads • Rectus Femoris", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "10 - 12", weight: "180.0 kg", rest: "90s" },
                { id: "3", name: "Barbell Romanian Deadlift (RDL)", target: "Hamstrings • Glutes", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "8 - 10", weight: "80.0 kg", rest: "90s" },
                { id: "4", name: "Lying Leg Hamstring Curls", target: "Biceps Femoris • Hamstring Flexion", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 - 15", weight: "45.0 kg", rest: "60s" },
                { id: "5", name: "Standing Calf Raises", target: "Gastrocnemius • Soleus", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "15 - 20", weight: "60.0 kg", rest: "45s" }
            ]
        },
        {
            title: "Active Recovery & Yoga Mobility",
            exercises: [
                { id: "1", name: "Dynamic Yoga Flow & World's Greatest Stretch", target: "Full Body Joint Mobility", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "10 Per Side", weight: "Bodyweight", rest: "30s" },
                { id: "2", name: "Foam Rolling & Quad Release", target: "Myofascial Tissue Recovery", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "60 sec Hold", weight: "Bodyweight", rest: "30s" },
                { id: "3", name: "Cat-Cow & Thoracic Spine Rotations", target: "Spinal Decompression & Core", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 Reps", weight: "Bodyweight", rest: "30s" },
                { id: "4", name: "Band Pull-Aparts & Rotator Cuff Drills", target: "Posterior Shoulder Health", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "20 Reps", weight: "Light Band", rest: "30s" },
                { id: "5", name: "Deep Glute Stretch & Hip Openers", target: "Piriformis & Hip Flexors", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "45 sec Hold", weight: "Bodyweight", rest: "30s" }
            ]
        },
        {
            title: "Upper Body Hypertrophy & Core",
            exercises: [
                { id: "1", name: "Incline Dumbbell Bench Press", target: "Upper Pectorals • Anterior Delts", demoKey: "incline_press", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "8 - 10", weight: "32.5 kg", rest: "90s" },
                { id: "2", name: "Standing Barbell Overhead Press", target: "Anterior & Lateral Deltoids • Core", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "8 - 10", weight: "50.0 kg", rest: "90s" },
                { id: "3", name: "Weighted Standing Cable Chest Flyes", target: "Pectoralis Major • Sternal Head", demoKey: "cable_flyes", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 - 15", weight: "18.0 kg", rest: "60s" },
                { id: "4", name: "Seated Dumbbell Lateral Raises", target: "Lateral Deltoids • Shoulder Cap", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "12 - 15", weight: "12.5 kg", rest: "45s" },
                { id: "5", name: "Cable Rope Triceps Pushdowns", target: "Triceps Lateral & Medial Heads", demoKey: "triceps_pushdown", img: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 - 15", weight: "27.5 kg", rest: "60s" }
            ]
        },
        {
            title: "Posterior Chain & Hamstring Power",
            exercises: [
                { id: "1", name: "Barbell Romanian Deadlift (RDL)", target: "Hamstrings • Glutes • Lower Back", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "8 - 10", weight: "90.0 kg", rest: "90s" },
                { id: "2", name: "Barbell Hip Thrusts", target: "Gluteus Maximus Lockout Power", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "10 - 12", weight: "120.0 kg", rest: "90s" },
                { id: "3", name: "Heavy Hack Squats", target: "Vastus Medialis • Tear Drop Quads", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "10 - 12", weight: "110.0 kg", rest: "90s" },
                { id: "4", name: "Bulgarian Split Squats", target: "Single-Leg Quad & Glute Balance", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "10 Per Leg", weight: "20.0 kg", rest: "60s" },
                { id: "5", name: "Seated Leg Extensions", target: "Rectus Femoris Terminal Burn", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "15 - 20", weight: "50.0 kg", rest: "45s" }
            ]
        },
        {
            title: "HIIT Circuit & Explosive Sprints",
            exercises: [
                { id: "1", name: "Kettlebell Power Swings", target: "Explosive Hip Hinge • Cardio Rate", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "20 Reps", weight: "24.0 kg", rest: "45s" },
                { id: "2", name: "Dumbbell Thrusters", target: "Full Body Compound Push", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "12 - 15", weight: "16.0 kg", rest: "45s" },
                { id: "3", name: "Burpees to Plyo Box Jump", target: "Metabolic Conditioning & Agility", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 Reps", weight: "Bodyweight", rest: "60s" },
                { id: "4", name: "Standing Cable Woodchoppers", target: "Obliques & Rotational Core", demoKey: "cable_flyes", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "15 Per Side", weight: "15.0 kg", rest: "45s" },
                { id: "5", name: "Hanging Captain's Chair Leg Raises", target: "Rectus Abdominis & Hip Flexors", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "15 Reps", weight: "Bodyweight", rest: "45s" }
            ]
        },
        {
            title: "Rest & Nutrition Regeneration",
            exercises: [
                { id: "1", name: "Light 20-Min Active Recovery Walk", target: "Low-Intensity Steady State (LISS)", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80", sets: 1, reps: "20 mins", weight: "Bodyweight", rest: "N/A" },
                { id: "2", name: "Full Body Foam Rolling & Stretch", target: "Myofascial Tissue Regeneration", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80", sets: 1, reps: "15 mins", weight: "Bodyweight", rest: "N/A" }
            ]
        }
    ];

    // ── Dynamic Goal-Based Routine Presets ────────────────────────────────────
    const FAT_LOSS_ROUTINES = [
        {
            title: "HIIT Fat Melt & Kettlebell Cardio Circuit",
            exercises: [
                { id: "1", name: "Explosive Kettlebell Power Swings", target: "Glute Hinge • High Calorie Burn", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "20 Reps", weight: "20.0 kg", rest: "45s" },
                { id: "2", name: "Dumbbell Thrusters & Overhead Press", target: "Full Body Quad & Deltoid Push", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "15 Reps", weight: "14.0 kg", rest: "45s" },
                { id: "3", name: "Burpee to Plyometric Box Jump", target: "Anaerobic Conditioning & Cardio", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "12 Reps", weight: "Bodyweight", rest: "45s" },
                { id: "4", name: "High-Knee Mountain Climbers", target: "Core Abs • High Heart Rate Zone", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "45 Secs", weight: "Bodyweight", rest: "30s" },
                { id: "5", name: "Battle Rope Slams & Waves", target: "Shoulders • Lat Fat Burn", demoKey: "triceps_pushdown", img: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "30 Secs", weight: "Heavy Rope", rest: "30s" }
            ]
        },
        {
            title: "Lower Body Conditioning & Plyo Shred",
            exercises: [
                { id: "1", name: "Jump Squats & Explosive Landings", target: "Quadriceps • Calorie MetCon", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "15 Reps", weight: "Bodyweight", rest: "45s" },
                { id: "2", name: "Walking Dumbbell Lunges", target: "Glutes • Quads • Balance", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "12 Per Leg", weight: "12.5 kg", rest: "45s" },
                { id: "3", name: "Speed Skater Lateral Bounds", target: "Abductors • Lateral Agility", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "20 Reps", weight: "Bodyweight", rest: "30s" },
                { id: "4", name: "Sled Push Sprints", target: "Leg Power • Maximum Fat Burn", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "30 Metres", weight: "60.0 kg", rest: "60s" },
                { id: "5", name: "Jumping Jacks & Speed Rope", target: "Cardio Calorie Burn", demoKey: "triceps_pushdown", img: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "2 Mins", weight: "Bodyweight", rest: "30s" }
            ]
        },
        {
            title: "Active Mobility & Dynamic Yoga Recovery",
            exercises: [
                { id: "1", name: "Dynamic Yoga Flow & World's Greatest Stretch", target: "Full Body Joint Mobility", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "10 Per Side", weight: "Bodyweight", rest: "30s" },
                { id: "2", name: "Foam Rolling & Quad Release", target: "Myofascial Tissue Recovery", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "60 sec Hold", weight: "Bodyweight", rest: "30s" },
                { id: "3", name: "Cat-Cow & Thoracic Spine Rotations", target: "Spinal Decompression & Core", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "12 Reps", weight: "Bodyweight", rest: "30s" }
            ]
        },
        {
            title: "Upper Body Cardio Shred & Core",
            exercises: [
                { id: "1", name: "Dumbbell Renegade Rows & Pushups", target: "Upper Back • Chest • Core", demoKey: "incline_press", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "10 Per Arm", weight: "12.5 kg", rest: "45s" },
                { id: "2", name: "Standing Cable Woodchoppers", target: "Obliques • Rotational Core", demoKey: "cable_flyes", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "15 Per Side", weight: "15.0 kg", rest: "45s" },
                { id: "3", name: "Hanging Leg Raises", target: "Lower Abs • Core Stability", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "15 Reps", weight: "Bodyweight", rest: "45s" },
                { id: "4", name: "Shadow Boxing & Light DB Punches", target: "Deltoid Toning • Fat Burn", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80", sets: 3, reps: "2 Mins", weight: "2.5 kg", rest: "30s" }
            ]
        },
        {
            title: "Full Body Tabata Metabolic Finisher",
            exercises: [
                { id: "1", name: "Rowing Machine Sprint Interval", target: "Full Body Aerobic Conditioning", demoKey: "romanian_deadlift", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80", sets: 5, reps: "500 Metres", weight: "Level 8", rest: "60s" },
                { id: "2", name: "Air Bike Assault Sprint", target: "V02 Max • Maximum Fat Burn", demoKey: "barbell_squats", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "30 Sec Sprint", weight: "Air Resistance", rest: "30s" }
            ]
        },
        {
            title: "Agility Ladder & Core Conditioning",
            exercises: [
                { id: "1", name: "Agility Ladder Fast Feet", target: "Footwork • Caloric Expenditure", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "60 Secs", weight: "Bodyweight", rest: "30s" },
                { id: "2", name: "Plank Hold to Pushup Taps", target: "Core & Shoulder Endurance", demoKey: "overhead_press", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=80", sets: 4, reps: "60 Secs", weight: "Bodyweight", rest: "30s" }
            ]
        },
        {
            title: "Rest & Recovery Walk",
            exercises: [
                { id: "1", name: "20-Min LISS Recovery Walk", target: "Active Recovery • Fat Oxidation", demoKey: "lateral_raises", img: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80", sets: 1, reps: "20 Mins", weight: "Bodyweight", rest: "N/A" }
            ]
        }
    ];

    function getActiveRoutinesByGoal() {
        const goal = (regProfile.fitnessGoal || localStorage.getItem('fitpulse_user_goal') || 'muscle').toLowerCase();
        if (goal.includes('fat') || goal.includes('loss') || goal.includes('weight') || goal.includes('toning')) {
            return FAT_LOSS_ROUTINES;
        }
        return WORKOUT_ROUTINES_BY_DAY;
    }

    function renderTodayExercisesForDay(dayIdx) {
        currentSelectedDayIdx = dayIdx;
        const routines = getActiveRoutinesByGoal();
        const routine = routines[dayIdx] || routines[3] || routines[0];
        const container = document.getElementById('exerciseCardsList');
        if (!container) return;

        // Update Hero Title & Badge based on selected Goal
        const heroTitle = document.querySelector('.wo-hero-title');
        const heroBadge = document.querySelector('.badge-pill-purple');
        const goalText = getGoalText(regProfile.fitnessGoal);

        if (heroTitle) heroTitle.textContent = `${routine.title} (${goalText})`;
        if (heroBadge) heroBadge.innerHTML = `<i class="fa-solid fa-bullseye"></i> ${goalText.toUpperCase()}`;

        container.innerHTML = routine.exercises.map((ex, idx) => {
            const numStr = String(idx + 1).padStart(2, '0');
            const compKey = `${dayIdx}_${ex.id}`;
            const isCompleted = workoutState.completedExercises.has(compKey);
            const statusPill = isCompleted
                ? '<span class="ex-status-pill done"><i class="fa-solid fa-check"></i> Done</span>'
                : (idx === 0 ? '<span class="ex-status-pill active-pill"><span class="pulse-dot"></span> In Progress</span>' : '<span class="ex-status-pill upcoming">Upcoming</span>');

            return `
                <div class="exercise-card ${isCompleted ? 'completed' : (idx === 0 ? 'in-progress' : '')}" id="exCard${ex.id}" data-ex-id="${ex.id}">
                    <div class="ex-card-thumb-wrapper">
                        <img src="${ex.img}" alt="${ex.name}" class="ex-card-img">
                        <span class="ex-order-badge">${numStr}</span>
                        ${statusPill}
                    </div>

                    <div class="ex-card-content">
                        <div class="ex-card-header">
                            <div>
                                <span class="ex-target-tag">${ex.target}</span>
                                <h4 class="ex-name">${ex.name}</h4>
                            </div>
                        </div>

                        <div class="ex-specs-grid">
                            <div class="ex-spec-cell">
                                <span class="spec-label">Sets</span>
                                <strong class="spec-val">${ex.sets} Sets</strong>
                            </div>
                            <div class="ex-spec-cell">
                                <span class="spec-label">Reps</span>
                                <strong class="spec-val">${ex.reps} Reps</strong>
                            </div>
                            <div class="ex-spec-cell">
                                <span class="spec-label">Weight</span>
                                <div class="spec-weight-stepper">
                                    <button type="button" class="stepper-btn weight-minus" data-target="exWeight${ex.id}">-</button>
                                    <strong class="spec-val" id="exWeight${ex.id}">${ex.weight}</strong>
                                    <button type="button" class="stepper-btn weight-plus" data-target="exWeight${ex.id}">+</button>
                                </div>
                            </div>
                            <div class="ex-spec-cell">
                                <span class="spec-label">Rest</span>
                                <strong class="spec-val"><i class="fa-solid fa-stopwatch"></i> ${ex.rest}</strong>
                            </div>
                        </div>

                        <div class="ex-card-actions">
                            <button type="button" class="ex-rest-trigger-btn" data-seconds="${parseInt(ex.rest) || 60}">
                                <i class="fa-solid fa-play"></i> Start ${ex.rest} Rest Timer
                            </button>
                            <button type="button" class="ex-complete-toggle-btn ${isCompleted ? 'completed' : ''}" data-ex-id="${ex.id}">
                                <i class="${isCompleted ? 'fa-solid' : 'fa-regular'} fa-circle-check"></i>
                                <span>${isCompleted ? 'Completed' : 'Mark Complete'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        bindExerciseCardEvents(container);
        updateWorkoutProgress();
    }

    function initWeeklyScheduleInteractions() {
        const rows = document.querySelectorAll('.wo-sched-row');
        rows.forEach((row, idx) => {
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => {
                rows.forEach(r => r.style.borderColor = '');
                row.style.borderColor = 'var(--primary-purple)';
                renderTodayExercisesForDay(idx);
                const title = WORKOUT_ROUTINES_BY_DAY[idx] ? WORKOUT_ROUTINES_BY_DAY[idx].title : 'Workout Routine';
                showToast(`Loaded routine for selected day: ${title}`, 'fa-dumbbell');
            });
        });
    }

    function updateWeeklyWorkoutScheduleDates() {
        const rows = document.querySelectorAll('.wo-sched-row');
        if (!rows || rows.length === 0) return;

        const today = new Date();
        const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
        const diffToMon = (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1);
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMon);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        rows.forEach((row, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            const dayNumEl = row.querySelector('.day-num');
            const badgeEl = row.querySelector('.wo-sched-badge');

            if (dayNumEl) dayNumEl.textContent = String(d.getDate()).padStart(2, '0');

            const isToday = d.toDateString() === today.toDateString();
            const isPast = d < today && !isToday;

            row.classList.remove('today', 'done', 'upcoming', 'rest');

            if (i === 6) { // Sunday rest day
                row.classList.add('rest');
                if (badgeEl) {
                    badgeEl.className = 'wo-sched-badge rest';
                    badgeEl.innerHTML = 'Rest Day 💤';
                }
            } else if (isToday) {
                row.classList.add('today');
                if (badgeEl) {
                    badgeEl.className = 'wo-sched-badge today';
                    badgeEl.innerHTML = '<span class="pulse-dot"></span> Today (' + d.getDate() + ' ' + monthNames[d.getMonth()] + ')';
                }
                // Automatically render today's exercise routine
                renderTodayExercisesForDay(i);
            } else if (isPast) {
                row.classList.add('done');
                if (badgeEl) {
                    badgeEl.className = 'wo-sched-badge done';
                    badgeEl.innerHTML = '<i class="fa-solid fa-check"></i> Done';
                }
            } else {
                row.classList.add('upcoming');
                if (badgeEl) {
                    badgeEl.className = 'wo-sched-badge upcoming';
                    badgeEl.innerHTML = d.getDate() + ' ' + monthNames[d.getMonth()];
                }
            }
        });
        initWeeklyScheduleInteractions();
        resetWorkoutTimer(true); // Cleanly set SESSION TIMER to 00:00:00 on page load
        renderWorkoutHistoryTables(workoutState.history); // Render saved workout history
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateWeeklyWorkoutScheduleDates);
    } else {
        updateWeeklyWorkoutScheduleDates();
    }

    // Coach View Action Triggers
    document.getElementById('coachHeroViewPlansBtn')?.addEventListener('click', () => {
        switchView('workouts');
        showToast('Viewing Coach-Assigned Workout Routines', 'fa-dumbbell');
    });

    // -------------------------------------------------------------------------
    // 3D REALISTIC BIOMETRIC MUSCLE ANALYZER & SCANNER CONTROLLER
    // -------------------------------------------------------------------------
    let is3DTiltEnabled = true;
    let currentBodySide = 'front';

    // Global view switcher for Front / Back 3D Flip
    window.switchBodyView = function(side) {
        currentBodySide = side;
        const flipInner = document.getElementById('bodyFlipInner');
        const btnFront = document.getElementById('btnViewFront');
        const btnBack = document.getElementById('btnViewBack');
        const viewLabel = document.getElementById('hudViewLabel');

        if (side === 'back') {
            if (flipInner) flipInner.classList.add('flipped');
            if (btnFront) { btnFront.style.background = 'transparent'; btnFront.style.color = 'var(--text-muted)'; }
            if (btnBack) { btnBack.style.background = '#8b5cf6'; btnBack.style.color = '#fff'; }
            if (viewLabel) viewLabel.innerHTML = '<span style="color:#a855f7;">POSTERIOR 3D</span>';
        } else {
            if (flipInner) flipInner.classList.remove('flipped');
            if (btnBack) { btnBack.style.background = 'transparent'; btnBack.style.color = 'var(--text-muted)'; }
            if (btnFront) { btnFront.style.background = '#8b5cf6'; btnFront.style.color = '#fff'; }
            if (viewLabel) viewLabel.innerHTML = '<span style="color:#38bdf8;">ANTERIOR 3D</span>';
        }
    };

    // Toggle 3D Tilt Physics
    window.toggle3DTilt = function() {
        is3DTiltEnabled = !is3DTiltEnabled;
        const btn = document.getElementById('btnViewTilt');
        if (btn) {
            btn.style.color = is3DTiltEnabled ? '#a855f7' : 'var(--text-muted)';
        }
        const inner = document.getElementById('bodyFlipInner');
        if (inner && !is3DTiltEnabled) {
            inner.style.transform = currentBodySide === 'back' ? 'rotateY(180deg)' : 'none';
        }
        showToast(is3DTiltEnabled ? '3D Hologram Tilt Active' : '3D Hologram Tilt Paused', 'fa-cube');
    };

    // Holographic 3D Mouse Parallax Tilt Physics on Hover
    const scannerViewport = document.getElementById('scannerViewport');
    if (scannerViewport) {
        scannerViewport.addEventListener('mousemove', function(e) {
            if (!is3DTiltEnabled) return;
            const flipInner = document.getElementById('bodyFlipInner');
            if (!flipInner) return;

            const rect = scannerViewport.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Subtle holographic tilt angles (-12deg to +12deg)
            const rotateY = ((x - centerX) / centerX) * 14;
            const rotateX = -((y - centerY) / centerY) * 12;

            if (currentBodySide === 'back') {
                flipInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${180 + rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            } else {
                flipInner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            }
        });

        scannerViewport.addEventListener('mouseleave', function() {
            const flipInner = document.getElementById('bodyFlipInner');
            if (!flipInner) return;
            flipInner.style.transform = currentBodySide === 'back' ? 'rotateY(180deg)' : 'none';
        });
    }

    // Direct clickable muscle zones on the 3D model
    document.querySelectorAll('.muscle-zone').forEach(zone => {
        zone.addEventListener('click', function(e) {
            e.stopPropagation();
            const muscleName = this.dataset.muscle || 'Target Muscle';
            highlightMuscleGroup(this.id, muscleName, '100% EXERTION', 'DIRECT ANATOMICAL SELECTION');
            showToast(`Scanned: ${muscleName}`, 'fa-crosshairs');
        });
    });

    // Master function to trigger high-precision muscle highlight
    function highlightMuscleGroup(zoneId, titleText, intensityStr, subtitleText, preferBack = false) {
        // Reset all active zones
        document.querySelectorAll('.muscle-zone').forEach(z => {
            z.classList.remove('active');
        });

        // Activate targeted zone
        const targetZone = document.getElementById(zoneId);
        if (targetZone) {
            targetZone.classList.add('active');
        }

        // Auto flip 3D body if needed
        if (preferBack && currentBodySide !== 'back') {
            switchBodyView('back');
        } else if (!preferBack && currentBodySide === 'back') {
            switchBodyView('front');
        }

        // Update HUD Callout Box
        const textEl = document.getElementById('activeMuscleText');
        const subEl = document.getElementById('activeMuscleSub');
        const targetMode = document.getElementById('hudTargetMode');
        const intensityVal = document.getElementById('hudIntensityVal');

        if (textEl) textEl.innerHTML = `<span style="color:#f43f5e; font-weight:700;"><i class="fa-solid fa-crosshairs"></i> ${titleText}</span>`;
        if (subEl) subEl.innerHTML = subtitleText || 'High-Precision 3D Biometric Muscle Activation';
        if (targetMode) targetMode.innerHTML = '<span style="color:#ef4444;">ACTIVE SCAN</span>';
        if (intensityVal) intensityVal.innerText = intensityStr || '95% EXERTION';
    }

    // Global Exercise Card Click Listener for Automatic 3D Model Activation
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.exercise-card');
        if (!card) return;

        const targetTag = card.querySelector('.ex-target-tag');
        const exNameEl = card.querySelector('.ex-name');
        const exName = exNameEl ? exNameEl.textContent.trim() : 'Selected Exercise';
        const targetText = targetTag ? targetTag.textContent.toLowerCase() : '';

        let matched = false;

        // 1. Chest / Pectorals
        if (targetText.includes('pectoral') || targetText.includes('chest') || targetText.includes('bench press') || targetText.includes('cable fly')) {
            highlightMuscleGroup('mz-chest', 'Chest • Pectoralis Major & Sternal Head', '94% HYPERTROPHY', `${exName} — Prime mover for horizontal pushing power`, false);
            matched = true;
        }
        // 2. Shoulders / Deltoids
        else if (targetText.includes('delt') || targetText.includes('shoulder') || targetText.includes('overhead press') || targetText.includes('lateral raise')) {
            highlightMuscleGroup('mz-deltoids', 'Deltoids • Anterior & Lateral Heads', '96% PEAK LOAD', `${exName} — Shoulder cap width & overhead pressing drive`, false);
            // Also secondary activate core
            document.getElementById('mz-core')?.classList.add('active');
            matched = true;
        }
        // 3. Core / Abdominals
        else if (targetText.includes('core') || targetText.includes('abdom') || targetText.includes('spine') || targetText.includes('oblique')) {
            highlightMuscleGroup('mz-core', 'Core • Rectus Abdominis & Transverse Core', '88% STABILIZATION', `${exName} — Trunk stabilization & intra-abdominal pressure`, false);
            matched = true;
        }
        // 4. Arms / Biceps / Triceps
        else if (targetText.includes('arm') || targetText.includes('bicep') || targetText.includes('tricep') || targetText.includes('pushdown') || targetText.includes('curl')) {
            highlightMuscleGroup('mz-arms', 'Arms • Triceps Brachii & Biceps Flexors', '92% ISOLATION', `${exName} — Elbow extension & peak contraction load`, false);
            matched = true;
        }
        // 5. Back / Lats / Trapezius (Auto Flip to Back View)
        else if (targetText.includes('lat') || targetText.includes('back') || targetText.includes('dorsi') || targetText.includes('pulldown') || targetText.includes('row')) {
            highlightMuscleGroup('mz-lats', 'Back • Latissimus Dorsi & Upper Back Wings', '95% CONTRACTION', `${exName} — Scapular retraction & vertical pulling width`, true);
            matched = true;
        }
        // 6. Hamstrings & Glutes (Auto Flip to Back View)
        else if (targetText.includes('hamstring') || targetText.includes('glute') || targetText.includes('rdl') || targetText.includes('deadlift') || targetText.includes('thrust')) {
            highlightMuscleGroup('mz-hamstrings', 'Posterior Chain • Hamstrings & Gluteus Maximus', '98% PEAK FORCE', `${exName} — Powerful hip extension & posterior hamstring stretch`, true);
            document.getElementById('mz-glutes')?.classList.add('active');
            matched = true;
        }
        // 7. Quads / Thighs / Squats
        else if (targetText.includes('quad') || targetText.includes('squat') || targetText.includes('leg press') || targetText.includes('femoris') || targetText.includes('extension')) {
            highlightMuscleGroup('mz-legs', 'Quadriceps • Rectus Femoris & Vastus Medialis', '97% QUAD DRIVE', `${exName} — Knee extension & leg drive power`, false);
            matched = true;
        }
        // 8. Calves
        else if (targetText.includes('calf') || targetText.includes('gastrocnemius') || targetText.includes('soleus')) {
            highlightMuscleGroup('mz-calves', 'Calves • Gastrocnemius & Plantar Flexors', '90% ENDURANCE', `${exName} — Ankle extension & explosive calf push`, false);
            matched = true;
        }
        // 9. Full Body / Mobility / Stretches
        else if (targetText.includes('full body') || targetText.includes('mobility') || targetText.includes('stretch') || targetText.includes('yoga') || targetText.includes('tissue')) {
            highlightMuscleGroup('mz-fullbody', 'Kinetic Chain • Full Body Joint Mobility', '75% ACTIVE RECOVERY', `${exName} — Myofascial release & neuromuscular balance`, false);
            matched = true;
        }

        if (matched) {
            // Smoothly scroll the 3D card slightly into view if on mobile/smaller screens
            const cardEl = document.getElementById('woMuscleCard');
            if (cardEl && window.innerWidth < 992) {
                cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });


