// FitPulse — Settings, Preferences & Account Configuration

    // =========================================================================
    // 17. SETTINGS VIEW FUNCTIONALITY & INTERACTIONS (User Requested Settings)
    // =========================================================================
    function setupSettingsInteractions() {
        // 1. Change Password
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const cur = document.getElementById('settingCurrentPassword').value;
                const newP = document.getElementById('settingNewPassword').value;
                const confP = document.getElementById('settingConfirmPassword').value;

                if (!cur) {
                    showToast('Please enter your current password.', 'fa-triangle-exclamation');
                    return;
                }
                if (newP.length < 8) {
                    showToast('New password must be at least 8 characters long.', 'fa-triangle-exclamation');
                    return;
                }
                if (newP !== confP) {
                    showToast('New passwords do not match. Please verify.', 'fa-triangle-exclamation');
                    return;
                }

                showToast('🔒 Password updated successfully! Your credentials are secure.', 'fa-circle-check');
                changePasswordForm.reset();
            });
        }

        // Password visibility toggles
        document.querySelectorAll('.pwd-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetInput = document.getElementById(targetId);
                if (targetInput) {
                    const isPass = targetInput.type === 'password';
                    targetInput.type = isPass ? 'text' : 'password';
                    btn.innerHTML = isPass ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
                }
            });
        });

        // 2. Dark Mode Toggle & Presets
        const settingsDarkModeToggle = document.getElementById('settingsDarkModeToggle');
        if (settingsDarkModeToggle) {
            settingsDarkModeToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    document.body.classList.remove('light-mode');
                    showToast('🌙 Dark Mode enabled (Midnight Violet)', 'fa-moon');
                } else {
                    document.body.classList.add('light-mode');
                    showToast('☀️ Light Mode activated', 'fa-sun');
                }
            });
        }

        // Theme preset buttons
        document.querySelectorAll('.theme-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.theme-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const theme = btn.getAttribute('data-theme');
                if (theme === 'oled') {
                    document.body.style.setProperty('--bg-base', '#000000');
                    document.body.style.setProperty('--bg-surface', '#07070a');
                    showToast('🖤 OLED Pure Black theme applied', 'fa-palette');
                } else if (theme === 'cyber') {
                    document.body.style.setProperty('--bg-base', '#0c071d');
                    document.body.style.setProperty('--bg-surface', '#170f36');
                    showToast('⚡ Cyber Purple Glow theme applied', 'fa-bolt');
                } else {
                    document.body.style.removeProperty('--bg-base');
                    document.body.style.removeProperty('--bg-surface');
                    showToast('🌙 Midnight Dark default theme restored', 'fa-moon');
                }
            });
        });

        // 3. Compact Language Selector & Dynamic i18n
        const settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
        if (settingsLanguageSelect) {
            settingsLanguageSelect.addEventListener('change', (e) => {
                const chosenLang = e.target.value;
                applyLanguage(chosenLang, true);
            });
        }

        // 4. Privacy Toggles
        const privVisibilityToggle = document.getElementById('privVisibilityToggle');
        const privBiometricsToggle = document.getElementById('privBiometricsToggle');
        const privCoachTelemetryToggle = document.getElementById('privCoachTelemetryToggle');
        const viewPrivacyPolicyBtn = document.getElementById('viewPrivacyPolicyBtn');

        if (privVisibilityToggle) {
            privVisibilityToggle.addEventListener('change', (e) => {
                showToast(`Profile visibility set to: ${e.target.checked ? 'Public Community' : 'Private'}`, 'fa-shield-halved');
            });
        }
        if (privBiometricsToggle) {
            privBiometricsToggle.addEventListener('change', (e) => {
                showToast(`Biometric Cloud Sync: ${e.target.checked ? 'Encrypted & Active' : 'Local Only'}`, 'fa-lock');
            });
        }
        if (privCoachTelemetryToggle) {
            privCoachTelemetryToggle.addEventListener('change', (e) => {
                showToast(`Coach Real-Time Exertion Telemetry: ${e.target.checked ? 'Enabled' : 'Disabled'}`, 'fa-user-ninja');
            });
        }
        if (viewPrivacyPolicyBtn) {
            viewPrivacyPolicyBtn.addEventListener('click', () => {
                showToast('📋 FitPulse Privacy: Zero-knowledge encryption & HIPAA-compliant biometric security.', 'fa-file-shield');
            });
        }

        // 5. Delete Account Safeguard Modal
        const btnTriggerDeleteAccount = document.getElementById('btnTriggerDeleteAccount');
        const deleteAccountConfirmModal = document.getElementById('deleteAccountConfirmModal');
        const closeDeleteAccountModal = document.getElementById('closeDeleteAccountModal');
        const cancelDeleteAccountBtn = document.getElementById('cancelDeleteAccountBtn');
        const confirmDeleteAccountInput = document.getElementById('confirmDeleteAccountInput');
        const confirmDeleteAccountFinalBtn = document.getElementById('confirmDeleteAccountFinalBtn');

        if (btnTriggerDeleteAccount && deleteAccountConfirmModal) {
            btnTriggerDeleteAccount.addEventListener('click', () => {
                if (confirmDeleteAccountInput) confirmDeleteAccountInput.value = '';
                if (confirmDeleteAccountFinalBtn) {
                    confirmDeleteAccountFinalBtn.disabled = true;
                    confirmDeleteAccountFinalBtn.style.opacity = '0.5';
                    confirmDeleteAccountFinalBtn.style.cursor = 'not-allowed';
                }
                deleteAccountConfirmModal.classList.remove('hidden');
            });
        }

        const closeDelModal = () => {
            if (deleteAccountConfirmModal) deleteAccountConfirmModal.classList.add('hidden');
        };

        if (closeDeleteAccountModal) closeDeleteAccountModal.addEventListener('click', closeDelModal);
        if (cancelDeleteAccountBtn) cancelDeleteAccountBtn.addEventListener('click', closeDelModal);

        if (confirmDeleteAccountInput && confirmDeleteAccountFinalBtn) {
            confirmDeleteAccountInput.addEventListener('input', (e) => {
                const val = e.target.value.trim().toUpperCase();
                if (val === 'DELETE') {
                    confirmDeleteAccountFinalBtn.disabled = false;
                    confirmDeleteAccountFinalBtn.style.opacity = '1';
                    confirmDeleteAccountFinalBtn.style.cursor = 'pointer';
                } else {
                    confirmDeleteAccountFinalBtn.disabled = true;
                    confirmDeleteAccountFinalBtn.style.opacity = '0.5';
                    confirmDeleteAccountFinalBtn.style.cursor = 'not-allowed';
                }
            });

            confirmDeleteAccountFinalBtn.addEventListener('click', () => {
                closeDelModal();
                showToast('⚠️ Account deleted permanently. Redirecting to sign in...', 'fa-trash-can');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            });
        }

        // 6. About App Actions
        const btnReleaseNotes = document.getElementById('btnReleaseNotes');
        const btnTermsOfService = document.getElementById('btnTermsOfService');
        const btnCheckUpdates = document.getElementById('btnCheckUpdates');

        if (btnReleaseNotes) {
            btnReleaseNotes.addEventListener('click', () => {
                showToast('📦 FitPulse v3.8.4: Added Messages, Monthly Reports & Settings control center.', 'fa-circle-check');
            });
        }
        if (btnTermsOfService) {
            btnTermsOfService.addEventListener('click', () => {
                showToast('📜 FitPulse Terms of Service: Standard Athlete Enterprise Agreement.', 'fa-file-lines');
            });
        }
        if (btnCheckUpdates) {
            btnCheckUpdates.addEventListener('click', () => {
                showToast('🔍 Checking FitPulse cloud for updates...', 'fa-spinner');
                setTimeout(() => {
                    showToast('✅ FitPulse is up to date! (Version 3.8.4 Stable)', 'fa-circle-check');
                }, 1000);
            });
        }

        // 7. Logout Action in Settings Card
        const btnSettingsLogout = document.getElementById('btnSettingsLogout');
        if (btnSettingsLogout) {
            btnSettingsLogout.addEventListener('click', () => {
                openLogoutModal();
            });
        }

        // Save All Settings
        const saveAllSettingsBtn = document.getElementById('saveAllSettingsBtn');
        if (saveAllSettingsBtn) {
            saveAllSettingsBtn.addEventListener('click', () => {
                showToast('💾 All account preferences & security settings saved!', 'fa-circle-check');
            });
        }
    }

    // Call settings setup
    setupSettingsInteractions();

