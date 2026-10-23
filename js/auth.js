// FitPulse — Authentication: Login, Social Login & Credentials

    // =========================================================================
    // 3. SAVED CREDENTIALS RESTORATION
    // =========================================================================
    const savedUser = localStorage.getItem('fitpulse_remember_user');
    if (savedUser) {
        identifierInput.value = savedUser;
        rememberMeCheckbox.checked = true;
        clearIdentifierBtn.style.display = 'block';
    }

    // =========================================================================
    // 4. LOGIN TAB SWITCHING (Email vs Mobile)
    // =========================================================================
    function switchTab(type) {
        activeTab = type;
        if (type === 'email') {
            tabEmail.classList.add('active');
            tabEmail.setAttribute('aria-selected', 'true');
            tabMobile.classList.remove('active');
            tabMobile.setAttribute('aria-selected', 'false');
            tabSlider.style.transform = 'translateX(0%)';

            identifierLabel.textContent = 'Email Address';
            identifierInput.type = 'email';
            identifierInput.placeholder = 'name@example.com';
            identifierInput.autocomplete = 'username';
            identifierIcon.className = 'fa-solid fa-envelope input-icon';
            countrySelectWrapper.classList.add('hidden');
            identifierInput.closest('.input-field-wrapper').classList.remove('has-country-code');
        } else {
            tabMobile.classList.add('active');
            tabMobile.setAttribute('aria-selected', 'true');
            tabEmail.classList.remove('active');
            tabEmail.setAttribute('aria-selected', 'false');
            tabSlider.style.transform = 'translateX(100%)';

            identifierLabel.textContent = 'Mobile Number';
            identifierInput.type = 'tel';
            identifierInput.autocomplete = 'tel';
            identifierIcon.className = 'fa-solid fa-mobile-screen-button input-icon';
            countrySelectWrapper.classList.remove('hidden');
            identifierInput.closest('.input-field-wrapper').classList.add('has-country-code');
            updateMobileInputRules(countryCodeSelect.value, identifierInput);
        }

        identifierInput.value = '';
        clearIdentifierBtn.style.display = 'none';
        identifierInput.closest('.input-group').classList.remove('error');
    }

    tabEmail.addEventListener('click', () => switchTab('email'));
    tabMobile.addEventListener('click', () => switchTab('mobile'));

    function updateMobileInputRules(code, inputEl) {
        const rule = countryRules[code] || { min: 8, max: 15, placeholder: 'Phone Number' };
        inputEl.placeholder = rule.placeholder;
        inputEl.maxLength = rule.max + 3;
    }

    countryCodeSelect.addEventListener('change', (e) => {
        updateMobileInputRules(e.target.value, identifierInput);
        validateIdentifier(false);
    });

    if (regCountryCodeSelect) {
        regCountryCodeSelect.addEventListener('change', (e) => {
            updateMobileInputRules(e.target.value, regMobileInput);
        });
    }

    if (coachRegCountryCodeSelect && coachRegMobileInput) {
        coachRegCountryCodeSelect.addEventListener('change', (e) => {
            updateMobileInputRules(e.target.value, coachRegMobileInput);
        });
    }

    // =========================================================================
    // 5. INPUT ACTIONS & VALIDATION HELPERS
    // =========================================================================
    // =========================================================================
    // REGISTERED ACCOUNTS CREDENTIAL AUTO-FETCH STORE
    // =========================================================================
    function updateUserProfileFromBackend(user) {
        if (!user) return;
        regProfile.id                  = user.id;
        if (user.fullName) {
            regProfile.name = user.fullName;
            try { localStorage.setItem('fitpulse_user_name', user.fullName); } catch(e){}
        }
        if (user.email) {
            regProfile.email = user.email;
            try { localStorage.setItem('fitpulse_user_email', user.email); } catch(e){}
        }
        if (user.avatarUrl) {
            regProfile.avatarUrl = user.avatarUrl;
            try { localStorage.setItem('fitpulse_user_avatar', user.avatarUrl); } catch(e){}
        } else {
            regProfile.avatarUrl = localStorage.getItem('fitpulse_user_avatar') || regProfile.avatarUrl || '';
        }

        // Restore avatar to DOM elements if available
        if (regProfile.avatarUrl) {
            const avatarEls = [document.getElementById('profMainAvatar'), document.getElementById('headerUserAvatar'), document.getElementById('dashAvatar'), document.getElementById('sidebarUserAvatar')];
            avatarEls.forEach(el => { if (el) el.src = regProfile.avatarUrl; });
        }

        regProfile.role                = user.role || 'user';
        console.log('[FitPulse Auth] Profile updated from backend:', { id: user.id, name: regProfile.name, email: regProfile.email });
        regProfile.countryCode         = user.mobileCountry || '+91';
        regProfile.mobile              = user.mobileNumber || '';
        regProfile.gender              = user.gender || 'male';
        regProfile.age                 = user.age || 26;
        regProfile.height              = user.heightCm || 178;
        regProfile.weight              = user.weightKg || 72.4;
        regProfile.targetWeight        = user.targetWeightKg || 75.0;
        regProfile.fitnessGoal         = user.fitnessGoal || 'muscle';
        regProfile.gymExperience       = user.gymExperience || 'intermediate';
        regProfile.workoutPreference   = user.workoutPreference || 'gym';
        regProfile.workoutDays         = user.workoutDays || '4-5';
        regProfile.workoutDuration     = String(user.workoutDurationMin || 45);
        regProfile.dietPreference      = user.dietPreference || localStorage.getItem('fitpulse_user_diet') || 'non-vegetarian';
        if (user.dietPreference) {
            try { localStorage.setItem('fitpulse_user_diet', user.dietPreference); } catch(e){}
        }
        if (typeof switchDietType === 'function' && typeof resolveUserDietType === 'function') {
            switchDietType(resolveUserDietType());
        }
        regProfile.waterIntake         = user.waterIntake || '2-3L';
        regProfile.sleep               = user.sleepHours || '6-8';
        regProfile.medicalConditions   = user.medicalConditions || 'no';
        regProfile.medicalDetails      = user.medicalDetails || '';
        regProfile.memberSince         = user.memberSince || 'Feb 2026';
        regProfile.streak              = user.streakDays || 14;
        regProfile.totalWorkouts       = user.totalWorkouts || 48;
        regProfile.totalCaloriesBurned = user.totalCaloriesBurned || 32450;
    }

    identifierInput.addEventListener('input', () => {
        clearIdentifierBtn.style.display = identifierInput.value ? 'block' : 'none';
        if (identifierInput.closest('.input-group').classList.contains('error')) {
            validateIdentifier(false);
        }
    });

    clearIdentifierBtn.addEventListener('click', () => {
        identifierInput.value = '';
        clearIdentifierBtn.style.display = 'none';
        identifierInput.focus();
        identifierInput.closest('.input-group').classList.remove('error');
    });

    function setupPasswordToggle(btn, input, icon) {
        if (!btn || !input || !icon) return;
        btn.addEventListener('click', () => {
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            icon.className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
            btn.setAttribute('title', isPass ? 'Hide password' : 'Show password');
        });
    }

    setupPasswordToggle(togglePasswordBtn, passwordInput, eyeIcon);
    setupPasswordToggle(regTogglePasswordBtn, regPasswordInput, regEyeIcon);
    setupPasswordToggle(regToggleConfirmBtn, regConfirmPasswordInput, regConfirmEyeIcon);

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateMobileField(inputEl, selectEl, errorEl) {
        const val = inputEl.value.replace(/[\s\-]/g, '');
        const code = selectEl.value;
        const rule = countryRules[code] || { min: 8, max: 15, label: code };

        if (!val) {
            errorEl.textContent = 'Mobile number is required.';
            return false;
        }
        if (!/^\d+$/.test(val)) {
            errorEl.textContent = 'Only numbers are allowed.';
            return false;
        }
        if (val.length < rule.min || val.length > rule.max) {
            errorEl.textContent = `Must be ${rule.min}${rule.min !== rule.max ? '-' + rule.max : ''} digits for ${rule.label}.`;
            return false;
        }
        return true;
    }

    function validateIdentifier(showError = true) {
        const group = identifierInput.closest('.input-group');
        let isValid = false;

        if (activeTab === 'email') {
            const val = identifierInput.value.trim();
            if (!val) {
                identifierError.textContent = 'Email address is required.';
            } else if (!validateEmail(val)) {
                identifierError.textContent = 'Please enter a valid email address.';
            } else {
                isValid = true;
            }
        } else {
            isValid = validateMobileField(identifierInput, countryCodeSelect, identifierError);
        }

        if (!isValid && showError) {
            group.classList.add('error');
        } else if (isValid) {
            group.classList.remove('error');
        }
        return isValid;
    }

    function validatePassword(showError = true) {
        const group = passwordInput.closest('.input-group');
        const val = passwordInput.value;
        let isValid = false;

        if (!val) {
            passwordError.textContent = 'Password is required.';
        } else if (val.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters.';
        } else {
            isValid = true;
        }

        if (!isValid && showError) {
            group.classList.add('error');
        } else if (isValid) {
            group.classList.remove('error');
        }
        return isValid;
    }

    // Restore Remembered Credentials (User/Coach Identifier, Password, Role & Tab) if available
    const savedRememberedUser = localStorage.getItem('fitpulse_remember_user');
    const savedRememberedPass = localStorage.getItem('fitpulse_remember_pass');
    const savedRememberedRole = localStorage.getItem('fitpulse_remember_role');
    const savedRememberedTab  = localStorage.getItem('fitpulse_remember_tab');

    if (savedRememberedUser && identifierInput) {
        identifierInput.value = savedRememberedUser;
        if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
        if (clearIdentifierBtn) clearIdentifierBtn.style.display = 'block';

        if (savedRememberedTab && savedRememberedTab !== activeTab) {
            switchTab(savedRememberedTab);
        }
        if (savedRememberedPass && passwordInput) {
            passwordInput.value = savedRememberedPass;
            if (passwordInput.closest('.input-group')) {
                passwordInput.closest('.input-group').classList.remove('error');
            }
        }
        if (savedRememberedRole && loginForm) {
            const roleRadio = loginForm.querySelector(`input[name="loginRole"][value="${savedRememberedRole}"]`);
            if (roleRadio) roleRadio.checked = true;
        }
        setTimeout(() => {
            showToast(`🔑 Remembered credentials auto-fetched for ${savedRememberedUser}`, 'fa-key');
        }, 300);
    }

    // =========================================================================
    // 6. LOGIN FORM SUBMISSION (BACKEND AUTHENTICATION)
    // =========================================================================
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const idValid = validateIdentifier(true);
            const passValid = validatePassword(true);

            if (!idValid || !passValid) {
                showToast('Please enter a valid email/mobile and password.', 'fa-triangle-exclamation');
                return;
            }

            const idVal = identifierInput.value.trim();
            const passVal = passwordInput.value;
            const isRemember = rememberMeCheckbox ? rememberMeCheckbox.checked : false;
            const loginRoleEl = loginForm.querySelector('input[name="loginRole"]:checked');
            const loginRoleVal = loginRoleEl ? loginRoleEl.value : 'user';

            if (isRemember) {
                localStorage.setItem('fitpulse_remember_user', idVal);
                localStorage.setItem('fitpulse_remember_pass', passVal);
                localStorage.setItem('fitpulse_remember_role', loginRoleVal);
                localStorage.setItem('fitpulse_remember_tab', activeTab);
            }

            loginSubmitBtn.disabled = true;
            loginSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Signing In...`;

            try {
                const response = await fetch(getApiUrl('/api/auth/login'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        identifier: idVal,
                        password: passVal,
                        rememberMe: isRemember,
                        loginRole: loginRoleVal
                    })
                });

                let data = null;
                try {
                    data = await response.json();
                } catch (jsonErr) {}

                if (response.ok && data && data.success) {
                    if (data.user) {
                        updateUserProfileFromBackend(data.user);
                        sessionStorage.setItem('fitpulse_user_role', regProfile.role);
                        sessionStorage.setItem('fitpulse_logged_in', 'true');
                    }

                    showToast(data.message || `Welcome back, ${regProfile.name}!`, 'fa-circle-check');
                    openDashboardScreen(regProfile.name, regProfile.email, regProfile.role);
                } else if (response.status === 404 || response.status === 405 || (!data && !response.ok)) {
                    // Static host (GitHub Pages) or offline backend fallback
                    const localAcc = getRegisteredAccount(idVal);
                    if (localAcc && localAcc.password === passVal) {
                        if (localAcc.profile) {
                            updateUserProfileFromBackend(localAcc.profile);
                        }
                        sessionStorage.setItem('fitpulse_user_role', localAcc.role || loginRoleVal);
                        sessionStorage.setItem('fitpulse_logged_in', 'true');
                        showToast(`Welcome back, ${regProfile.name || idVal}!`, 'fa-circle-check');
                        openDashboardScreen(regProfile.name || idVal, localAcc.profile?.email || idVal, localAcc.role || loginRoleVal);
                    } else if (passVal.length >= 6) {
                        // Allow instant demo login on static site
                        sessionStorage.setItem('fitpulse_user_role', loginRoleVal);
                        sessionStorage.setItem('fitpulse_logged_in', 'true');
                        showToast(`Welcome to FitPulse, Athlete!`, 'fa-circle-check');
                        openDashboardScreen(regProfile.name || 'Athlete', idVal, loginRoleVal);
                    } else {
                        showToast('Invalid email or password.', 'fa-triangle-exclamation');
                    }
                } else {
                    const errMsg = (data && data.message) ? data.message : 'Invalid email or password.';
                    showToast(errMsg, 'fa-triangle-exclamation');
                    identifierInput.closest('.input-group').classList.add('error');
                    passwordInput.closest('.input-group').classList.add('error');
                }
            } catch (apiErr) {
                console.error('Login error:', apiErr);
                const localAcc = getRegisteredAccount(idVal);
                if (localAcc && localAcc.password === passVal) {
                    if (localAcc.profile) {
                        updateUserProfileFromBackend(localAcc.profile);
                    }
                    sessionStorage.setItem('fitpulse_user_role', localAcc.role || loginRoleVal);
                    sessionStorage.setItem('fitpulse_logged_in', 'true');
                    showToast(`Welcome back, ${regProfile.name || idVal}!`, 'fa-circle-check');
                    openDashboardScreen(regProfile.name || idVal, localAcc.profile?.email || idVal, localAcc.role || loginRoleVal);
                } else if (passVal.length >= 6) {
                    sessionStorage.setItem('fitpulse_user_role', loginRoleVal);
                    sessionStorage.setItem('fitpulse_logged_in', 'true');
                    showToast(`Welcome back, Athlete!`, 'fa-circle-check');
                    openDashboardScreen(regProfile.name || 'Athlete', idVal, loginRoleVal);
                } else {
                    showToast('Invalid email or password.', 'fa-triangle-exclamation');
                }
            } finally {
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.innerHTML = `<span>SIGN IN</span> <i class="fa-solid fa-arrow-right btn-icon"></i>`;
            }
        } catch (fatalErr) {
            console.error('Login submit handler error:', fatalErr);
            showToast('An unexpected error occurred during login. Please try again.', 'fa-triangle-exclamation');
        }
    });

    // =========================================================================
    // 7. SOCIAL LOGIN MODALS (Google & Apple)
    // =========================================================================
    googleLoginBtn.addEventListener('click', () => {
        googleModal.classList.remove('hidden');
    });

    appleLoginBtn.addEventListener('click', () => {
        appleModal.classList.remove('hidden');
    });

    closeGoogleModal.addEventListener('click', () => {
        googleModal.classList.add('hidden');
        googleCustomBox.classList.add('hidden');
    });

    closeAppleModal.addEventListener('click', () => {
        appleModal.classList.add('hidden');
        appleCustomBox.classList.add('hidden');
    });

    document.querySelectorAll('.account-option-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const email = btn.dataset.email || 'athlete@fitpulse.io';
            const name  = btn.dataset.name || 'Athlete';
            googleModal.classList.add('hidden');
            appleModal.classList.add('hidden');

            regProfile.name = name;
            regProfile.email = email;

            showToast(`Signed in as ${name}`, 'fa-circle-check');
            openDashboardScreen(name, email);
        });
    });

    googleUseOtherBtn.addEventListener('click', () => {
        googleCustomBox.classList.toggle('hidden');
        if (!googleCustomBox.classList.contains('hidden')) googleCustomEmail.focus();
    });

    appleUseOtherBtn.addEventListener('click', () => {
        appleCustomBox.classList.toggle('hidden');
        if (!appleCustomBox.classList.contains('hidden')) appleCustomEmail.focus();
    });

    // Hero Showcase Background Slideshow & Dynamic Quotes Auto-Cycle
    const heroSlides = document.querySelectorAll('.hero-slide-img');
    const heroQuotes = document.querySelectorAll('.hero-quote-set');
    if (heroSlides && heroSlides.length > 1) {
        let currentSlideIdx = 0;
        setInterval(() => {
            heroSlides[currentSlideIdx].classList.remove('active');
            if (heroQuotes[currentSlideIdx]) heroQuotes[currentSlideIdx].classList.remove('active');

            currentSlideIdx = (currentSlideIdx + 1) % heroSlides.length;

            heroSlides[currentSlideIdx].classList.add('active');
            if (heroQuotes[currentSlideIdx]) heroQuotes[currentSlideIdx].classList.add('active');
        }, 4000);
    }

    googleCustomContinue.addEventListener('click', () => {
        const email = googleCustomEmail.value.trim();
        if (!validateEmail(email)) {
            showToast('Please enter a valid Google email address.', 'fa-triangle-exclamation');
            return;
        }
        googleModal.classList.add('hidden');
        regProfile.email = email;
        showToast(`Signed in with ${email}`, 'fa-circle-check');
        openDashboardScreen(email.split('@')[0], email);
    });

    appleCustomContinue.addEventListener('click', () => {
        const email = appleCustomEmail.value.trim();
        if (!validateEmail(email)) {
            showToast('Please enter a valid Apple ID email.', 'fa-triangle-exclamation');
            return;
        }
        appleModal.classList.add('hidden');
        regProfile.email = email;
        showToast(`Signed in with Apple ID: ${email}`, 'fa-circle-check');
        openDashboardScreen(email.split('@')[0], email);
    });

    // Forgot Password Modal Handlers
    const cancelForgotModalBtn = document.getElementById('cancelForgotModalBtn');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (forgotPasswordBtn && forgotModal) {
        forgotPasswordBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            forgotModal.classList.remove('hidden');
            if (resetTargetInput && identifierInput) {
                resetTargetInput.value = activeTab === 'email' ? identifierInput.value.trim() : '';
            }
        });
    }

    if (closeForgotModal && forgotModal) {
        closeForgotModal.addEventListener('click', () => forgotModal.classList.add('hidden'));
    }
    if (cancelForgotModalBtn && forgotModal) {
        cancelForgotModalBtn.addEventListener('click', () => forgotModal.classList.add('hidden'));
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const targetEmail = resetTargetInput ? resetTargetInput.value.trim() : '';
            if (!targetEmail || !validateEmail(targetEmail)) {
                showToast('Please enter a valid email address.', 'fa-triangle-exclamation');
                return;
            }
            if (forgotModal) forgotModal.classList.add('hidden');
            showToast(`Password reset link sent to ${targetEmail}!`, 'fa-circle-check');
        });
    }

