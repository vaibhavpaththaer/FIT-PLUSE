// FitPulse — Internationalization (i18n) & Multi-Language Engine

    // =========================================================================
    // 15. COMPREHENSIVE MULTI-LANGUAGE TRANSLATION (i18n) ENGINE
    // =========================================================================
    const FITPULSE_TRANSLATIONS = window.FITPULSE_TRANSLATIONS || {};

    function applyLanguage(langCode, notify = false) {
        if (!FITPULSE_TRANSLATIONS[langCode]) {
            langCode = 'en';
        }
        const t = FITPULSE_TRANSLATIONS[langCode] || FITPULSE_TRANSLATIONS.en || {};
        localStorage.setItem('fitpulse_language', langCode);
        document.documentElement.lang = langCode;

        // Synchronize select dropdown in settings
        const settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
        if (settingsLanguageSelect) {
            settingsLanguageSelect.value = langCode;
        }

        // 1. Generic data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                const labelSpan = el.querySelector('span:not(.nav-active-pill):not(.nav-badge-pill):not(.nav-badge-count):not(.pulse-dot)');
                if (labelSpan) {
                    labelSpan.textContent = t[key];
                } else if (el.children.length === 0) {
                    el.textContent = t[key];
                } else {
                    Array.from(el.childNodes).forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                            node.textContent = ' ' + t[key];
                        }
                    });
                }
            }
        });

        // 2. data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.placeholder = t[key];
        });

        // 3. Navigation items
        const navMap = [
            { sel: '#navDashboard .nav-label', key: 'nav_dashboard' },
            { sel: '#navProfile .nav-label', key: 'nav_profile' },
            { sel: '#navWorkouts .nav-label', key: 'nav_workouts' },
            { sel: '#navDiet .nav-label', key: 'nav_diet' },
            { sel: '#navProgress .nav-label', key: 'nav_progress' },
            { sel: '#navCoach .nav-label', key: 'nav_coach' },
            { sel: '#navMessages .nav-label', key: 'nav_messages' },
            { sel: '#navReports .nav-label', key: 'nav_reports' },
            { sel: '#navSettings .nav-label', key: 'nav_settings' },
            { sel: '#sidebarLogoutBtn .logout-label', key: 'nav_sign_out' },
            { sel: '#sidebarCollapseTrigger .collapse-label', key: 'nav_collapse' },
            { sel: '#logoutBtn .logout-text', key: 'hdr_logout' },
            { sel: '#markAllReadBtn span', key: 'hdr_mark_read' }
        ];
        navMap.forEach(({ sel, key }) => {
            const node = document.querySelector(sel);
            if (node && t[key]) node.textContent = t[key];
        });

        // Sidebar group titles
        const groupTitles = document.querySelectorAll('.sidebar-nav-group .nav-group-title');
        if (groupTitles[0] && t.nav_main_menu) groupTitles[0].textContent = t.nav_main_menu;
        if (groupTitles[1] && t.nav_comm_logs) groupTitles[1].textContent = t.nav_comm_logs;

        // Search placeholder
        const searchInp = document.getElementById('dashSearchInput');
        if (searchInp && t.hdr_search_placeholder) searchInp.placeholder = t.hdr_search_placeholder;

        // Quick action buttons
        const qaMap = [
            { sel: '#qaStartWorkout span', key: 'qa_start_workout' },
            { sel: '#qaViewDiet span', key: 'qa_view_diet' },
            { sel: '#qaChatCoach span', key: 'qa_chat_coach' },
            { sel: '#qaUpdateProgress span', key: 'qa_update_progress' },
            { sel: '#qaBookSession span', key: 'qa_book_session' },
            { sel: '#qaDownloadReport span', key: 'qa_download_report' }
        ];
        qaMap.forEach(({ sel, key }) => {
            const node = document.querySelector(sel);
            if (node && t[key]) node.textContent = t[key];
        });

        // Health Summary Metric Labels
        const metricLabels = [
            { sel: '.health-summary-grid .metric-card:nth-child(1) .metric-label', key: 'stat_current_weight' },
            { sel: '.health-summary-grid .metric-card:nth-child(2) .metric-label', key: 'stat_height' },
            { sel: '.health-summary-grid .metric-card:nth-child(3) .metric-label', key: 'stat_bmi' },
            { sel: '.health-summary-grid .metric-card:nth-child(4) .metric-label', key: 'stat_body_fat' },
            { sel: '.health-summary-grid .metric-card:nth-child(5) .metric-label', key: 'stat_muscle_mass' },
            { sel: '.health-summary-grid .metric-card:nth-child(6) .metric-label', key: 'stat_calories_burned' },
            { sel: '.health-summary-grid .metric-card:nth-child(7) .metric-label', key: 'stat_water_intake' },
            { sel: '.health-summary-grid .metric-card:nth-child(8) .metric-label', key: 'stat_step_count' },
            { sel: '.health-summary-grid .metric-card:nth-child(9) .metric-label', key: 'stat_heart_rate' },
            { sel: '.health-summary-grid .metric-card:nth-child(10) .metric-label', key: 'stat_sleep' },
            { sel: '.health-summary-grid .metric-card:nth-child(11) .metric-label', key: 'stat_calories_remaining' }
        ];
        metricLabels.forEach(({ sel, key }) => {
            const node = document.querySelector(sel);
            if (node && t[key]) node.textContent = t[key];
        });

        const syncBtn = document.getElementById('syncWearableBtn');
        if (syncBtn && t.btn_sync_device) syncBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> ${t.btn_sync_device}`;

        // Monthly report section
        const mrTitle = document.querySelector('#monthlyReportSection .dash-card-title');
        if (mrTitle && t.monthly_report_title) {
            mrTitle.innerHTML = `<i class="fa-solid fa-file-invoice-dollar icon-purple"></i> ${t.monthly_report_title}`;
        }
        const mrBadge = document.querySelector('#monthlyReportSection .card-category-badge');
        if (mrBadge && t.monthly_report_badge) mrBadge.textContent = t.monthly_report_badge;
        const mrDesc = document.querySelector('#monthlyReportSection .dash-card-subtitle');
        if (mrDesc && t.monthly_report_desc) mrDesc.textContent = t.monthly_report_desc;

        const mrTiles = document.querySelectorAll('#monthlyReportSection .report-kpi-tile');
        if (mrTiles.length >= 4) {
            const l0 = mrTiles[0].querySelector('.rk-label');
            if (l0 && t.monthly_weight_lost) l0.textContent = t.monthly_weight_lost;
            const l1 = mrTiles[1].querySelector('.rk-label');
            if (l1 && t.monthly_calories_burned) l1.textContent = t.monthly_calories_burned;
            const l2 = mrTiles[2].querySelector('.rk-label');
            if (l2 && t.monthly_workouts_completed) l2.textContent = t.monthly_workouts_completed;
            const l3 = mrTiles[3].querySelector('.rk-label');
            if (l3 && t.monthly_attendance) l3.textContent = t.monthly_attendance;
        }
        const mrPdfBtn = document.querySelector('#btnDownloadMonthlyReport span');
        if (mrPdfBtn && t.monthly_download_pdf) mrPdfBtn.textContent = t.monthly_download_pdf;

        // Messages View
        const msgHeaderTitle = document.querySelector('#messagesView .chat-header h3');
        if (msgHeaderTitle && t.msg_header_title) msgHeaderTitle.textContent = t.msg_header_title;
        const msgStatus = document.querySelector('#messagesView .coach-status');
        if (msgStatus && t.msg_coach_status) msgStatus.textContent = t.msg_coach_status;
        const msgInput = document.getElementById('chatMessageInput');
        if (msgInput && t.msg_input_placeholder) msgInput.placeholder = t.msg_input_placeholder;
        const msgSendBtn = document.querySelector('#btnSendChatMessage span');
        if (msgSendBtn && t.btn_send) msgSendBtn.textContent = t.btn_send;

        // Settings View
        const stMainTitle = document.querySelector('.settings-hero-banner .settings-banner-text h2');
        if (stMainTitle && t.settings_title) stMainTitle.textContent = t.settings_title;
        const stMainSubtitle = document.querySelector('.settings-hero-banner .settings-banner-text p');
        if (stMainSubtitle && t.settings_subtitle) stMainSubtitle.textContent = t.settings_subtitle;

        // Settings cards titles & descriptions
        const cardMap = [
            { cardId: 'settingItemPassword', titleKey: 'st_change_pass', descKey: 'st_change_pass_desc' },
            { cardId: 'settingItemDarkMode', titleKey: 'st_dark_mode', descKey: 'st_dark_mode_desc' },
            { cardId: 'settingItemLanguage', titleKey: 'st_language', descKey: 'st_language_desc' },
            { cardId: 'settingItemPrivacy', titleKey: 'st_privacy', descKey: 'st_privacy_desc' },
            { cardId: 'settingItemDeleteAccount', titleKey: 'st_delete_acc', descKey: 'st_delete_acc_desc' },
            { cardId: 'settingItemAbout', titleKey: 'st_about', descKey: 'st_about_desc' },
            { cardId: 'settingItemLogout', titleKey: 'st_logout', descKey: 'st_logout_desc' }
        ];
        cardMap.forEach(({ cardId, titleKey, descKey }) => {
            const card = document.getElementById(cardId);
            if (card) {
                const titleNode = card.querySelector('.settings-title');
                if (titleNode && t[titleKey]) titleNode.textContent = t[titleKey];
                const descNode = card.querySelector('.settings-desc');
                if (descNode && t[descKey]) descNode.textContent = t[descKey];
            }
        });

        // Settings action buttons
        const btnPassSpan = document.querySelector('#btnChangePasswordSubmit span');
        if (btnPassSpan && t.btn_update_pass) btnPassSpan.textContent = t.btn_update_pass;
        const btnLangSpan = document.querySelector('#applyLanguageBtn span');
        if (btnLangSpan && t.btn_apply_lang) btnLangSpan.textContent = t.btn_apply_lang;
        const btnDelSpan = document.querySelector('#btnTriggerDeleteAccount span');
        if (btnDelSpan && t.btn_delete_acc) btnDelSpan.textContent = t.btn_delete_acc;
        const btnUpdSpan = document.querySelector('#btnCheckUpdates');
        if (btnUpdSpan && t.btn_check_updates) btnUpdSpan.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> ${t.btn_check_updates}`;
        const btnLogoutCardSpan = document.querySelector('#btnSettingsLogout span');
        if (btnLogoutCardSpan && t.st_logout) btnLogoutCardSpan.textContent = t.st_logout;
        const btnSaveAllSpan = document.querySelector('#saveAllSettingsBtn');
        if (btnSaveAllSpan && t.btn_save_all_settings) btnSaveAllSpan.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>${t.btn_save_all_settings}</span>`;

        // Modals
        const logoutModTitle = document.getElementById('logoutModalTitle');
        if (logoutModTitle && t.modal_logout_title) logoutModTitle.textContent = t.modal_logout_title;
        const logoutModDesc = document.getElementById('logoutModalDesc');
        if (logoutModDesc && t.modal_logout_desc) logoutModDesc.textContent = t.modal_logout_desc;
        const stayLoggedInSpan = document.querySelector('#cancelLogoutModalBtn span');
        if (stayLoggedInSpan && t.stay_logged_in) stayLoggedInSpan.textContent = t.stay_logged_in;
        const confirmLogoutSpan = document.querySelector('#confirmLogoutFinalBtn span');
        if (confirmLogoutSpan && t.btn_confirm_logout) confirmLogoutSpan.textContent = t.btn_confirm_logout;

        // Sync language select dropdown
        const selectElem = document.getElementById('settingsLanguageSelect');
        if (selectElem) selectElem.value = langCode;

        // Toast feedback if user explicitly clicked Apply
        if (notify) {
            showToast(t.lang_applied_toast || `Language changed to ${langCode}`, 'fa-globe');
        }
    }

    // Initialize saved language or default to English
    const savedInitialLang = localStorage.getItem('fitpulse_language') || 'en';
    applyLanguage(savedInitialLang, false);

    // Auto-restore session and fetch authenticated dashboard data on page load
    const isUserAuth = sessionStorage.getItem('fitpulse_auth_token') || localStorage.getItem('fitpulse_logged_in');
    const storedRole = sessionStorage.getItem('fitpulse_user_role') || 'user';
    if (isUserAuth) {
        if (authWrapper) authWrapper.classList.add('hidden');
        if (dashboardScreen) dashboardScreen.classList.remove('hidden');

        if (storedRole === 'admin') {
            const adminNavGroup = document.getElementById('adminNavGroup');
            if (adminNavGroup) adminNavGroup.classList.remove('hidden');
            loadAdminDashboardData();
            switchView('admin-overview');
        } else {
            loadDashboardData();
            loadWorkoutData();
            loadDietData();
            loadProgressData();
            loadCoachData();
            loadMessagesData();
        }
    }

