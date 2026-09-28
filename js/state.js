// FitPulse — Global State, Config & DOM References
// Auto-extracted from script.js

    // =========================================================================
    // 1. DATA STATE & CONFIGURATION
    // =========================================================================
    const countryRules = {
        '+91':  { iso: 'IN', min: 10, max: 10, placeholder: '98765 43210',  label: 'India (+91)' },
        '+44':  { iso: 'UK', min: 10, max: 11, placeholder: '7911 123456',  label: 'UK (+44)' },
        '+1':   { iso: 'US', min: 10, max: 10, placeholder: '202 555 0199',  label: 'US (+1)' },
        '+61':  { iso: 'AU', min: 9,  max: 10, placeholder: '412 345 678',   label: 'Australia (+61)' },
        '+971': { iso: 'AE', min: 9,  max: 9,  placeholder: '50 123 4567',   label: 'UAE (+971)' },
        '+65':  { iso: 'SG', min: 8,  max: 8,  placeholder: '8123 4567',     label: 'Singapore (+65)' },
        '+49':  { iso: 'DE', min: 10, max: 11, placeholder: '151 12345678', label: 'Germany (+49)' },
        '+81':  { iso: 'JP', min: 10, max: 11, placeholder: '90 1234 5678', label: 'Japan (+81)' }
    };

    let activeTab = 'email'; // 'email' | 'mobile'
    let currentStep = 1;
    let fitnessChartInstance = null;
    let profileChartInstance = null;
    let currentChartType = 'workouts';
    let currentProfileChartType = 'prof-weight';
    let activeDashboardView = 'dashboard'; // 'dashboard' | 'profile'

    // Smart API Endpoint Resolver (Resolves localhost:8080 origin for file:// and cross-port setups)
    function getApiUrl(endpoint) {
        if (!endpoint) return '';
        if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
        if (window.location.protocol === 'file:' || !window.location.host || (window.location.port && window.location.port !== '8080')) {
            return 'http://localhost:8080' + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
        }
        return endpoint;
    }

    // Global fetch interceptor to guarantee backend connection and centralized error handling
    const originalFetch = window.fetch;
    window.fetch = async function() {
        let url = arguments[0];
        const options = arguments[1] || {};
        const method = (options.method || 'GET').toUpperCase();
        
        if (typeof url === 'string' && url.startsWith('/api/')) {
            url = getApiUrl(url);
            arguments[0] = url;
        }

        console.log('API REQUEST:', method, url);

        try {
            const response = await originalFetch.apply(this, arguments);
            console.log('API RESPONSE:', response.status, url);
            
            // Do not override response object so existing code can process it, 
            // but we can log errors here if we wanted to clone it.
            // Existing UI relies on .ok and parsing JSON themselves.
            return response;
        } catch (error) {
            console.error('API ERROR:', error);
            const isNetwork = error instanceof TypeError && error.message.toLowerCase().includes('fetch');
            if (isNetwork) {
                // The frontend generic error handler in auth.js expects TypeError with fetch message.
                // But the user requested to change the message to 'Cannot reach backend server.'
                // We will throw a new Error to override the generic one.
                throw new Error('Cannot reach backend server.');
            }
            throw error;
        }
    };

    // In-memory user profile store
    const regProfile = {
        name: localStorage.getItem('fitpulse_user_name') || 'Athlete',
        avatarUrl: localStorage.getItem('fitpulse_user_avatar') || '',
        gender: 'male',
        age: 26,
        height: 178,
        weight: 72.4,
        countryCode: '+91',
        mobile: '',
        email: localStorage.getItem('fitpulse_user_email') || '',
        password: '',
        gymExperience: 'intermediate',
        workoutPreference: 'gym',
        workoutDays: '4-5',
        workoutDuration: '45',
        dietPreference: 'non-vegetarian',
        waterIntake: '2-3L',
        sleep: '6-8',
        fitnessGoal: 'muscle',
        targetWeight: 75.0,
        medicalConditions: 'no',
        medicalDetails: '',
        memberSince: 'Feb 2026',
        streak: 14,
        totalWorkouts: 48,
        totalCaloriesBurned: 32450
    };

    // Goal Display Mapping
    const goalLabels = {
        'muscle': 'Muscle Gain & Hypertrophy',
        'weight_loss': 'Fat Loss & Conditioning',
        'weight-loss': 'Fat Loss & Conditioning',
        'strength': 'Raw Strength & Powerlifting',
        'endurance': 'Cardio & Stamina Endurance',
        'mobility': 'Flexibility & Mobility',
        'flexibility': 'Flexibility & Mobility',
        'general_health': 'General Health & Fitness',
        'general': 'General Health & Fitness',
        'athletic': 'Athletic Speed & Agility',
        'posture': 'Posture & Core Stability',
        'weight_gain': 'Weight Gain & Lean Mass',
        'mindfulness': 'Stress Relief & Recovery'
    };

    function getGoalText(goalStr) {
        if (!goalStr) return 'Muscle Gain & Hypertrophy';
        const goals = String(goalStr).split(',').map(g => g.trim());
        const labels = goals.map(g => goalLabels[g] || g.replace(/_/g, ' '));
        return labels.join(' + ');
    }

    // =========================================================================
    // 2. DOM ELEMENT REFERENCES
    // =========================================================================
    // Shell & Screen Containers
    const authWrapper          = document.getElementById('authWrapper');
    const loginCard            = document.getElementById('loginCard');
    const registerCard         = document.getElementById('registerCard');
    const dashboardScreen      = document.getElementById('dashboardScreen');
    const dashboardView        = document.getElementById('dashboardView');
    const profileView          = document.getElementById('profileView');

    // Login Form Elements
    const loginForm            = document.getElementById('loginForm');
    const tabEmail             = document.getElementById('tabEmail');
    const tabMobile            = document.getElementById('tabMobile');
    const tabSlider            = document.getElementById('tabSlider');
    const identifierLabel      = document.getElementById('identifierLabel');
    const identifierInput      = document.getElementById('identifierInput');
    const identifierIcon       = document.getElementById('identifierIcon');
    const countrySelectWrapper = document.getElementById('countrySelectWrapper');
    const countryCodeSelect    = document.getElementById('countryCodeSelect');
    const clearIdentifierBtn   = document.getElementById('clearIdentifierBtn');
    const identifierError      = document.getElementById('identifierError');
    const passwordInput        = document.getElementById('passwordInput');
    const togglePasswordBtn    = document.getElementById('togglePasswordBtn');
    const eyeIcon              = document.getElementById('eyeIcon');
    const passwordError        = document.getElementById('passwordError');
    const rememberMeCheckbox   = document.getElementById('rememberMeCheckbox');
    const forgotPasswordBtn    = document.getElementById('forgotPasswordBtn');
    const loginSubmitBtn       = document.getElementById('loginSubmitBtn');
    const registerBtn          = document.getElementById('registerBtn');

    // Social Login Modals
    const googleLoginBtn       = document.getElementById('googleLoginBtn');
    const appleLoginBtn        = document.getElementById('appleLoginBtn');
    const googleModal          = document.getElementById('googleModal');
    const appleModal           = document.getElementById('appleModal');
    const closeGoogleModal     = document.getElementById('closeGoogleModal');
    const closeAppleModal      = document.getElementById('closeAppleModal');
    const googleUseOtherBtn    = document.getElementById('googleUseOtherBtn');
    const appleUseOtherBtn     = document.getElementById('appleUseOtherBtn');
    const googleCustomBox      = document.getElementById('googleCustomBox');
    const appleCustomBox       = document.getElementById('appleCustomBox');
    const googleCustomEmail    = document.getElementById('googleCustomEmail');
    const appleCustomEmail     = document.getElementById('appleCustomEmail');
    const googleCustomContinue = document.getElementById('googleCustomContinueBtn');
    const appleCustomContinue  = document.getElementById('appleCustomContinueBtn');

    // Forgot Password Modal
    const forgotModal          = document.getElementById('forgotModal');
    const closeForgotModal     = document.getElementById('closeForgotModal');
    const resetTargetInput     = document.getElementById('resetTargetInput');
    const sendResetBtn         = document.getElementById('sendResetBtn');

    // Multi-Step Registration Header & Panels
    const stepCounterBadge     = document.getElementById('stepCounterBadge');
    const stepPctText          = document.getElementById('stepPctText');
    const wizardProgressFill   = document.getElementById('wizardProgressFill');
    const stepNodes            = [
        document.getElementById('node1'),
        document.getElementById('node2'),
        document.getElementById('node3'),
        document.getElementById('node4')
    ];
    const stepPanels           = [
        document.getElementById('stepPanel1'),
        document.getElementById('stepPanel2'),
        document.getElementById('stepPanel3'),
        document.getElementById('stepPanel4')
    ];

    // Registration Forms
    const step1Form            = document.getElementById('step1Form');
    const regNameInput         = document.getElementById('regNameInput');
    const regAgeInput          = document.getElementById('regAgeInput');
    const regHeightInput       = document.getElementById('regHeightInput');
    const regWeightInput       = document.getElementById('regWeightInput');
    const step1BackBtn         = document.getElementById('step1BackBtn');

    const step2Form            = document.getElementById('step2Form');
    const regMobileGroup       = document.getElementById('regMobileGroup');
    const regCountryCodeSelect = document.getElementById('regCountryCodeSelect');
    const regMobileInput       = document.getElementById('regMobileInput');
    const regMobileError       = document.getElementById('regMobileError');
    const regEmailInput        = document.getElementById('regEmailInput');
    const regEmailError        = document.getElementById('regEmailError');
    const regPasswordInput     = document.getElementById('regPasswordInput');
    const regPasswordError     = document.getElementById('regPasswordError');
    const regConfirmPasswordInput = document.getElementById('regConfirmPasswordInput');
    const regConfirmPasswordError = document.getElementById('regConfirmPasswordError');
    const regTogglePasswordBtn = document.getElementById('regTogglePasswordBtn');
    const regEyeIcon           = document.getElementById('regEyeIcon');
    const regToggleConfirmBtn  = document.getElementById('regToggleConfirmBtn');
    const regConfirmEyeIcon    = document.getElementById('regConfirmEyeIcon');
    const step2BackBtn         = document.getElementById('step2BackBtn');

    const step3Form            = document.getElementById('step3Form');
    const step3BackBtn         = document.getElementById('step3BackBtn');
    const step4Form            = document.getElementById('step4Form');
    const step4BackBtn         = document.getElementById('step4BackBtn');
    const medYesRadio          = document.getElementById('medYes');
    const medNoRadio           = document.getElementById('medNo');
    const medicalDetailWrapper = document.getElementById('medicalDetailWrapper');
    const medicalDetailInput   = document.getElementById('medicalDetailInput');
    const backToLoginBtn       = document.getElementById('backToLoginBtn');

    // Step 0 and Coach Registration elements
    const wizardStepperHeader  = document.getElementById('wizardStepperHeader');
    const stepPanel0           = document.getElementById('stepPanel0');
    const regStep0BackBtn      = document.getElementById('regStep0BackBtn');
    const regStep0NextBtn      = document.getElementById('regStep0NextBtn');

    const coachRegisterCard    = document.getElementById('coachRegisterCard');
    const coachRegisterForm    = document.getElementById('coachRegisterForm');
    const coachRegBackBtn      = document.getElementById('coachRegBackBtn');
    const coachRegToLoginBtn   = document.getElementById('coachRegToLoginBtn');
    const coachStepPanel1      = document.getElementById('coachStepPanel1');
    const coachStepPanel2      = document.getElementById('coachStepPanel2');
    const coachStep1NextBtn    = document.getElementById('coachStep1NextBtn');
    const coachStep2BackBtn    = document.getElementById('coachStep2BackBtn');
    const coachStepBadge       = document.getElementById('coachStepBadge');
    const coachStepPctText     = document.getElementById('coachStepPctText');
    const coachWizardProgressFill = document.getElementById('coachWizardProgressFill');
    const coachNode1           = document.getElementById('coachNode1');
    const coachNode2           = document.getElementById('coachNode2');

    const coachRegNameInput         = document.getElementById('coachRegNameInput');
    const coachRegEmailInput        = document.getElementById('coachRegEmailInput');
    const coachRegCountryCodeSelect = document.getElementById('coachRegCountryCodeSelect');
    const coachRegMobileInput       = document.getElementById('coachRegMobileInput');
    const coachRegPasswordInput     = document.getElementById('coachRegPasswordInput');
    const coachRegConfirmPasswordInput = document.getElementById('coachRegConfirmPasswordInput');
    const coachRegAgeInput          = document.getElementById('coachRegAgeInput');
    const coachRegAvatarInput       = document.getElementById('coachRegAvatarInput');
    const coachRegCertInput         = document.getElementById('coachRegCertInput');
    const coachRegSpecInput         = document.getElementById('coachRegSpecInput');
    const coachRegExpInput          = document.getElementById('coachRegExpInput');
    const coachRegBioInput          = document.getElementById('coachRegBioInput');
    const coachRegTypeSelect        = document.getElementById('coachRegTypeSelect');
    const coachRegisterSubmitBtn    = document.getElementById('coachRegisterSubmitBtn');
    // Coach Dashboard and prescription elements
    const coachDashboardView   = document.getElementById('coachDashboardView');
    const navCoachDashboard    = document.getElementById('navCoachDashboard');
    const coachWorkoutModal    = document.getElementById('coachWorkoutModal');
    const closeCoachWorkoutModal = document.getElementById('closeCoachWorkoutModal');
    const coachWorkoutForm     = document.getElementById('coachWorkoutForm');
    const coachWorkoutClientId = document.getElementById('coachWorkoutClientId');
    const coachWorkoutClientName = document.getElementById('coachWorkoutClientName');
    const cancelCoachWorkoutBtn = document.getElementById('cancelCoachWorkoutBtn');
    
    const coachDietModal       = document.getElementById('coachDietModal');
    const closeCoachDietModal  = document.getElementById('closeCoachDietModal');
    const coachDietForm        = document.getElementById('coachDietForm');
    const coachDietClientId    = document.getElementById('coachDietClientId');
    const coachDietClientName  = document.getElementById('coachDietClientName');
    const cancelCoachDietBtn   = document.getElementById('cancelCoachDietBtn');


    // Dashboard Shell & Navigation Elements
    const dashSidebar          = document.getElementById('dashSidebar');
    const sidebarToggleBtn     = document.getElementById('sidebarToggleBtn');
    const sidebarBackdrop      = document.getElementById('sidebarBackdrop');
    const sidebarCollapseTrigger = document.getElementById('sidebarCollapseTrigger');
    const logoutBtn            = document.getElementById('logoutBtn');
    const sidebarLogoutBtn     = document.getElementById('sidebarLogoutBtn');
    const notifBellBtn         = document.getElementById('notifBellBtn');
    const notifQuickDropdown   = document.getElementById('notifQuickDropdown');
    const markAllReadBtn       = document.getElementById('markAllReadBtn');
    const notifBadgeDot        = document.getElementById('notifBadgeDot');
    const dashSearchInput      = document.getElementById('dashSearchInput');

    // Sidebar View Navigation Buttons
    const navDashboard         = document.getElementById('navDashboard');
    const navProfile           = document.getElementById('navProfile');
    const headerUserProfile    = document.getElementById('headerUserProfile') || document.getElementById('headerProfileTrigger');
    const headerBrandLogo      = document.getElementById('headerBrandLogo');
    const crumbToDashboard     = document.getElementById('crumbToDashboard');
    const profileBackToDashBtn = document.getElementById('profileBackToDashBtn');

    // Dynamic Dashboard Stats
    const dashUserEmail        = document.getElementById('dashUserEmail');
    const dashUserName         = document.getElementById('dashUserName');
    const valWeight            = document.getElementById('valWeight');
    const valHeight            = document.getElementById('valHeight');
    const valBMI               = document.getElementById('valBMI');
    const valWater             = document.getElementById('valWater');

    // Profile View Elements
    const profHeaderName       = document.getElementById('profHeaderName');
    const profHeaderEmail      = document.getElementById('profHeaderEmail');
    const profGoalBadgeText    = document.getElementById('profGoalBadgeText');
    const profMemberSinceTag   = document.getElementById('profMemberSinceTag');
    const profAvatarImg        = document.getElementById('profAvatarImg');
    const profAvatarUpload     = document.getElementById('profAvatarUpload');
    const profAvatarChangeBtn  = document.getElementById('profAvatarChangeBtn');

    const profInfoName         = document.getElementById('profInfoName');
    const profInfoEmail        = document.getElementById('profInfoEmail');
    const profInfoPhone        = document.getElementById('profInfoPhone') || document.getElementById('profInfoMobile');
    const profInfoMobile       = document.getElementById('profInfoMobile') || document.getElementById('profInfoPhone');
    const profInfoGender       = document.getElementById('profInfoGender');
    const profInfoAge          = document.getElementById('profInfoAge');
    const profInfoHeight       = document.getElementById('profInfoHeight');
    const profInfoWeight       = document.getElementById('profInfoWeight');
    const profInfoBMI          = document.getElementById('profInfoBMI');
    const profInfoGoal         = document.getElementById('profInfoGoal');
    const profInfoCreated      = document.getElementById('profInfoCreated');
    const profInfoMedical      = document.getElementById('profInfoMedical');

    // Immediate Synchronous State & UI Restore on Script Execution
    (function restoreImmediateUserState() {
        const cachedName = localStorage.getItem('fitpulse_user_name');
        const cachedEmail = localStorage.getItem('fitpulse_user_email');
        if (cachedName) {
            regProfile.name = cachedName;
            if (dashUserName) dashUserName.textContent = cachedName;
            if (dashUserEmail) dashUserEmail.textContent = cachedName.split(' ')[0] || cachedName;
            if (profHeaderName) profHeaderName.textContent = cachedName;
            if (profInfoName) profInfoName.textContent = cachedName;
        }
        if (cachedEmail) {
            regProfile.email = cachedEmail;
            if (profHeaderEmail) profHeaderEmail.textContent = cachedEmail;
            if (profInfoEmail) profInfoEmail.textContent = cachedEmail;
        }
    })();

    const statProfWeight       = document.getElementById('statProfWeight');
    const statProfBMI          = document.getElementById('statProfBMI');
    const statProfCalories     = document.getElementById('statProfCalories') || document.getElementById('statProfDailyCal');
    const statProfDailyCal     = document.getElementById('statProfDailyCal') || document.getElementById('statProfCalories');
    const statProfWater        = document.getElementById('statProfWater');
    const statProfStreak       = document.getElementById('statProfStreak');
    const statProfTotalWorkouts= document.getElementById('statProfTotalWorkouts');
    const statProfTotalCals    = document.getElementById('statProfTotalCals') || document.getElementById('statProfTotalBurned');
    const statProfTotalBurned  = document.getElementById('statProfTotalBurned') || document.getElementById('statProfTotalCals');

    const fsiGoalTitle         = document.getElementById('fsiGoalTitle') || document.getElementById('profSummaryGoal');
    const profSummaryGoal      = document.getElementById('profSummaryGoal') || document.getElementById('fsiGoalTitle');
    const fsiTargetWeight      = document.getElementById('fsiTargetWeight') || document.getElementById('profSummaryTargetWeight');
    const profSummaryTargetWeight = document.getElementById('profSummaryTargetWeight') || document.getElementById('fsiTargetWeight');
    const fsiRemainingWeight   = document.getElementById('fsiRemainingWeight') || document.getElementById('profSummaryRemainingWeight');
    const profSummaryRemainingWeight = document.getElementById('profSummaryRemainingWeight') || document.getElementById('fsiRemainingWeight');
    const fsiWeeklyTarget      = document.getElementById('fsiWeeklyTarget') || document.getElementById('profSummaryTargetWorkouts');
    const profSummaryTargetWorkouts = document.getElementById('profSummaryTargetWorkouts') || document.getElementById('fsiWeeklyTarget');
    const fsiWeeklyCompleted   = document.getElementById('fsiWeeklyCompleted') || document.getElementById('profSummaryCompletedWorkouts');
    const profSummaryCompletedWorkouts = document.getElementById('profSummaryCompletedWorkouts') || document.getElementById('fsiWeeklyCompleted');
    const fsiProgressBarFill   = document.getElementById('fsiProgressBarFill') || document.getElementById('profSummaryProgressFill');
    const profSummaryProgressFill = document.getElementById('profSummaryProgressFill') || document.getElementById('fsiProgressBarFill');
    const fsiProgressPct       = document.getElementById('fsiProgressPct') || document.getElementById('profSummaryProgressText');
    const profSummaryProgressText = document.getElementById('profSummaryProgressText') || document.getElementById('fsiProgressPct');

    // Profile Actions & Modals
    const profActionEdit       = document.getElementById('profActionEdit');
    const profActionUpdateWeight = document.getElementById('profActionUpdateWeight');
    const profActionDownload   = document.getElementById('profActionDownload');
    const profActionSettings   = document.getElementById('profActionSettings');
    const profActionLogout     = document.getElementById('profActionLogout');

    const editProfileModal     = document.getElementById('editProfileModal');
    const editProfileForm      = document.getElementById('editProfileForm');
    const closeEditProfileModal= document.getElementById('closeEditProfileModal');
    const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');

    const editName             = document.getElementById('editNameInput') || document.getElementById('editName');
    const editEmail            = document.getElementById('editEmail') || document.getElementById('editEmailInput');
    const editMobile           = document.getElementById('editMobileInput') || document.getElementById('editMobile');
    const editAge              = document.getElementById('editAge') || document.getElementById('editAgeInput');
    const editGender           = document.getElementById('editGender') || document.getElementById('editGenderInput');
    const editHeight           = document.getElementById('editHeightInput') || document.getElementById('editHeight');
    const editWeight           = document.getElementById('editWeightInput') || document.getElementById('editWeight');
    const editFitnessGoal      = document.getElementById('editGoalSelect') || document.getElementById('editFitnessGoal');

    const quickWeightModal     = document.getElementById('quickWeightModal');
    const quickWeightForm      = document.getElementById('quickWeightForm');
    const closeQuickWeightModal= document.getElementById('closeWeightModal') || document.getElementById('closeQuickWeightModal');
    const cancelQuickWeightBtn = document.getElementById('cancelQuickWeightBtn');
    const quickWeightInput     = document.getElementById('quickWeightInput');
    const saveQuickWeightBtn   = document.getElementById('saveQuickWeightBtn');

    // Toast Container
    const toastContainer       = document.getElementById('toastContainer');

    function showToast(message, iconClass = 'fa-info-circle') {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 250);
        }, 3200);
    }

