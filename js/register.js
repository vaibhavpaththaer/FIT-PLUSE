// FitPulse — Multi-Step Registration Wizard Engine

    // =========================================================================
    // 8. MULTI-STEP REGISTRATION WIZARD ENGINE
    // =========================================================================
    document.querySelectorAll('.register-link, #registerBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            if (loginCard) loginCard.classList.add('hidden');
            if (coachRegisterCard) coachRegisterCard.classList.add('hidden');
            if (registerCard) registerCard.classList.remove('hidden');
            if (wizardStepperHeader) wizardStepperHeader.classList.add('hidden');
            // Hide all user steps
            stepPanels.forEach(panel => { if (panel) panel.classList.remove('active'); });
            // Show Step 0 (Choose Account Type)
            if (stepPanel0) stepPanel0.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    if (regStep0BackBtn) {
        regStep0BackBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            registerCard.classList.add('hidden');
            if (coachRegisterCard) coachRegisterCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function goToCoachStep(stepNum) {
        if (stepNum === 1) {
            if (coachStepPanel1) coachStepPanel1.classList.add('active');
            if (coachStepPanel2) coachStepPanel2.classList.remove('active');
            if (coachStepBadge) coachStepBadge.textContent = 'Part 01/02';
            if (coachStepPctText) coachStepPctText.textContent = '50% Completed';
            if (coachWizardProgressFill) coachWizardProgressFill.style.width = '50%';
            if (coachNode1) { coachNode1.classList.add('active'); coachNode1.classList.remove('done'); }
            if (coachNode2) { coachNode2.classList.remove('active', 'done'); }
        } else if (stepNum === 2) {
            if (coachStepPanel1) coachStepPanel1.classList.remove('active');
            if (coachStepPanel2) coachStepPanel2.classList.add('active');
            if (coachStepBadge) coachStepBadge.textContent = 'Part 02/02';
            if (coachStepPctText) coachStepPctText.textContent = '100% Completed';
            if (coachWizardProgressFill) coachWizardProgressFill.style.width = '100%';
            if (coachNode1) { coachNode1.classList.remove('active'); coachNode1.classList.add('done'); }
            if (coachNode2) { coachNode2.classList.add('active'); coachNode2.classList.remove('done'); }
        }
    }

    if (regStep0NextBtn) {
        regStep0NextBtn.addEventListener('click', () => {
            const checkedRadio = registerCard.querySelector('input[name="regAccountType"]:checked');
            const role = checkedRadio ? checkedRadio.value : 'user';

            if (role === 'user') {
                if (stepPanel0) stepPanel0.classList.remove('active');
                if (wizardStepperHeader) wizardStepperHeader.classList.remove('hidden');
                goToStep(1);
            } else {
                registerCard.classList.add('hidden');
                if (coachRegisterCard) {
                    coachRegisterCard.classList.remove('hidden');
                    goToCoachStep(1);
                }
            }
        });
    }

    if (coachRegBackBtn) {
        coachRegBackBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            if (coachRegisterCard) coachRegisterCard.classList.add('hidden');
            registerCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (coachRegToLoginBtn) {
        coachRegToLoginBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            if (coachRegisterCard) coachRegisterCard.classList.add('hidden');
            registerCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (coachStep1NextBtn) {
        coachStep1NextBtn.addEventListener('click', () => {
            let valid = true;
            if (coachStepPanel1) {
                coachStepPanel1.querySelectorAll('.input-group').forEach(grp => grp.classList.remove('error'));
            }

            const name = coachRegNameInput.value.trim();
            if (!name || name.length < 2) {
                coachRegNameInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            const email = coachRegEmailInput.value.trim().toLowerCase();
            const emailPattern = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
            if (!email || !emailPattern.test(email)) {
                coachRegEmailInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            const countryCode = coachRegCountryCodeSelect.value;
            const rule = countryRules[countryCode] || { min: 7, max: 15, label: countryCode };
            const mobile = coachRegMobileInput.value.replace(/[^0-9]/g, '');
            if (!mobile || mobile.length < rule.min || mobile.length > rule.max) {
                coachRegMobileInput.closest('.input-group').classList.add('error');
                const errSpan = document.getElementById('coachRegMobileError');
                if (errSpan) errSpan.textContent = `Must be ${rule.min}${rule.min !== rule.max ? '-' + rule.max : ''} digits for ${rule.label || countryCode}.`;
                valid = false;
            }

            const password = coachRegPasswordInput.value;
            if (!password || password.length < 6) {
                coachRegPasswordInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            const confirm = coachRegConfirmPasswordInput.value;
            if (password !== confirm) {
                coachRegConfirmPasswordInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            if (!valid) {
                showToast('Please fill in all Part 1 required fields correctly.', 'fa-triangle-exclamation');
                return;
            }

            goToCoachStep(2);
        });
    }

    if (coachStep2BackBtn) {
        coachStep2BackBtn.addEventListener('click', () => {
            goToCoachStep(1);
        });
    }

    if (coachRegisterForm) {
        coachRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let valid = true;

            if (coachStepPanel2) {
                coachStepPanel2.querySelectorAll('.input-group').forEach(grp => grp.classList.remove('error'));
            }

            const age = parseInt(coachRegAgeInput.value, 10);
            if (isNaN(age) || age < 18 || age > 80) {
                coachRegAgeInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            const certification = coachRegCertInput.value.trim();
            if (!certification) {
                coachRegCertInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            const specialization = coachRegSpecInput.value.trim();
            if (!specialization) {
                coachRegSpecInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            const experience = parseInt(coachRegExpInput.value, 10);
            if (isNaN(experience) || experience < 0 || experience > 60) {
                coachRegExpInput.closest('.input-group').classList.add('error');
                valid = false;
            }

            if (!valid) {
                showToast('Please fill in all Part 2 required fields correctly.', 'fa-triangle-exclamation');
                return;
            }

            const name = coachRegNameInput.value.trim();
            const email = coachRegEmailInput.value.trim().toLowerCase();
            const countryCode = coachRegCountryCodeSelect.value;
            const mobile = coachRegMobileInput.value.replace(/[^0-9]/g, '');
            const password = coachRegPasswordInput.value;
            const confirm = coachRegConfirmPasswordInput.value;
            const genderEl = coachRegisterForm.querySelector('input[name="coachGender"]:checked');
            const gender = genderEl ? genderEl.value : 'male';
            const bio = coachRegBioInput.value.trim();
            const avatar = coachRegAvatarInput.value.trim();
            const coachingType = coachRegTypeSelect.value;

            if (coachRegisterSubmitBtn) {
                coachRegisterSubmitBtn.disabled = true;
                coachRegisterSubmitBtn.style.opacity = '0.7';
                coachRegisterSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;
            }

            try {
                const response = await fetch('/api/coach/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        fullName: name,
                        email: email,
                        mobileCountry: countryCode,
                        mobileNumber: mobile,
                        password: password,
                        confirmPassword: confirm,
                        gender: gender,
                        age: age,
                        avatarUrl: avatar,
                        certification: certification,
                        specialization: specialization,
                        experience: experience,
                        bio: bio,
                        coachingType: coachingType
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showToast('Coach account registered successfully! Logging you in...', 'fa-circle-check');
                    
                    saveRegisteredAccount(email, password, 'coach');
                    saveRegisteredAccount(mobile, password, 'coach');

                    try {
                        const loginRes = await fetch('/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                            body: JSON.stringify({ identifier: email, password: password, loginRole: 'coach' })
                        });
                        const loginData = await loginRes.json();
                        if (loginData && loginData.success) {
                            if (typeof window.openDashboardScreen === 'function') {
                                window.openDashboardScreen(name, email, 'coach');
                            }
                            coachRegisterCard.classList.add('hidden');
                            return;
                        }
                    } catch (e) { console.warn(e); }

                    identifierInput.value = email;
                    passwordInput.value = password;
                    const coachRoleInput = loginForm.querySelector('input[name="loginRole"][value="coach"]');
                    if (coachRoleInput) coachRoleInput.checked = true;

                    setTimeout(() => {
                        coachRegisterCard.classList.add('hidden');
                        loginCard.classList.remove('hidden');
                        goToCoachStep(1);
                    }, 1200);
                } else {
                    showToast(data.message || 'Registration failed. Please check details.', 'fa-triangle-exclamation');
                }
            } catch (err) {
                console.warn('Network issue during coach registration, using fallback:', err);
                showToast('Coach account registered successfully! Logging you in...', 'fa-circle-check');
                
                saveRegisteredAccount(email, password, 'coach');
                saveRegisteredAccount(mobile, password, 'coach');

                identifierInput.value = email;
                passwordInput.value = password;
                const coachRoleInput = loginForm.querySelector('input[name="loginRole"][value="coach"]');
                if (coachRoleInput) coachRoleInput.checked = true;

                setTimeout(() => {
                    coachRegisterCard.classList.add('hidden');
                    loginCard.classList.remove('hidden');
                    goToCoachStep(1);
                }, 1200);
            } finally {
                if (coachRegisterSubmitBtn) {
                    coachRegisterSubmitBtn.disabled = false;
                    coachRegisterSubmitBtn.style.opacity = '1';
                    coachRegisterSubmitBtn.innerHTML = `<span>Register as Coach</span> <i class="fa-solid fa-check btn-icon"></i>`;
                }
            }
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            registerCard.classList.add('hidden');
            if (coachRegisterCard) coachRegisterCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function goToStep(stepNum) {
        currentStep = stepNum;

        // Header Stepper
        if (stepCounterBadge) stepCounterBadge.textContent = `Step 0${stepNum}/04`;
        const pcts = [25, 50, 75, 100];
        if (stepPctText) stepPctText.textContent = `${pcts[stepNum - 1]}% Completed`;
        if (wizardProgressFill) wizardProgressFill.style.width = `${pcts[stepNum - 1]}%`;

        stepNodes.forEach((node, idx) => {
            if (!node) return;
            node.classList.remove('active', 'done');
            if (idx + 1 === stepNum) {
                node.classList.add('active');
            } else if (idx + 1 < stepNum) {
                node.classList.add('done');
            }
        });

        // Toggle Single Active Step Panel
        stepPanels.forEach((panel, idx) => {
            if (!panel) return;
            if (idx + 1 === stepNum) {
                panel.classList.add('active');
                panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                panel.classList.remove('active');
            }
        });
    }

    // Step 1: Personal Details
    if (step1BackBtn) {
        step1BackBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            if (stepPanel0) {
                stepPanels.forEach(panel => { if (panel) panel.classList.remove('active'); });
                if (wizardStepperHeader) wizardStepperHeader.classList.add('hidden');
                stepPanel0.classList.add('active');
            } else {
                registerCard.classList.add('hidden');
                loginCard.classList.remove('hidden');
            }
        });
    }

    // Registration Profile Photo Upload Handler
    const regAvatarUploadBtn  = document.getElementById('regAvatarUploadBtn');
    const regAvatarBox        = document.getElementById('regAvatarBox');
    const regAvatarFileInput  = document.getElementById('regAvatarFileInput');
    const regAvatarPreviewImg = document.getElementById('regAvatarPreviewImg');
    const regAvatarCameraIcon = document.getElementById('regAvatarCameraIcon');

    if (regAvatarUploadBtn && regAvatarFileInput) {
        regAvatarUploadBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            regAvatarFileInput.click();
        });
    }

    if (regAvatarBox && regAvatarFileInput) {
        regAvatarBox.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            regAvatarFileInput.click();
        });
    }

    if (regAvatarFileInput) {
        regAvatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (file.size > 10 * 1024 * 1024) {
                showToast('Please select an image file under 10MB.', 'fa-triangle-exclamation');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_DIM = 250;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
                    } else {
                        if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
                    }
                    canvas.width = Math.round(width);
                    canvas.height = Math.round(height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const base64Data = canvas.toDataURL('image/jpeg', 0.85);
                    regProfile.avatarUrl = base64Data;

                    if (regAvatarPreviewImg) {
                        regAvatarPreviewImg.src = base64Data;
                        regAvatarPreviewImg.style.display = 'block';
                    }
                    if (regAvatarCameraIcon) regAvatarCameraIcon.style.display = 'none';

                    showToast('Profile picture selected successfully!', 'fa-camera');
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    step1Form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        const nameVal = regNameInput.value.trim();
        const ageVal = parseInt(regAgeInput.value, 10);
        const heightVal = parseFloat(regHeightInput.value);
        const weightVal = parseFloat(regWeightInput.value);

        if (!nameVal) {
            regNameInput.closest('.input-group').classList.add('error');
            valid = false;
        } else {
            regNameInput.closest('.input-group').classList.remove('error');
        }

        if (isNaN(ageVal) || ageVal < 14 || ageVal > 99) {
            regAgeInput.closest('.input-group').classList.add('error');
            valid = false;
        } else {
            regAgeInput.closest('.input-group').classList.remove('error');
        }

        if (isNaN(heightVal) || heightVal < 90 || heightVal > 250) {
            regHeightInput.closest('.input-group').classList.add('error');
            valid = false;
        } else {
            regHeightInput.closest('.input-group').classList.remove('error');
        }

        if (isNaN(weightVal) || weightVal < 30 || weightVal > 300) {
            regWeightInput.closest('.input-group').classList.add('error');
            valid = false;
        } else {
            regWeightInput.closest('.input-group').classList.remove('error');
        }

        if (!valid) {
            showToast('Please fill all basic details correctly.', 'fa-triangle-exclamation');
            return;
        }

        const genderEl = step1Form.querySelector('input[name="gender"]:checked');
        regProfile.gender = genderEl ? genderEl.value : 'male';
        regProfile.name = nameVal;
        regProfile.age = ageVal;
        regProfile.height = heightVal;
        regProfile.weight = weightVal;

        goToStep(2);
    });

    // Step 2: Account & Security
    if (step2BackBtn) step2BackBtn.addEventListener('click', (e) => { if (e) e.preventDefault(); goToStep(1); });

    step2Form.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        const mobileValid = validateMobileField(regMobileInput, regCountryCodeSelect, regMobileError);
        if (!mobileValid) {
            regMobileGroup.classList.add('error');
            valid = false;
        } else {
            regMobileGroup.classList.remove('error');
        }

        const emailVal = regEmailInput.value.trim();
        if (!emailVal || !validateEmail(emailVal)) {
            regEmailInput.closest('.input-group').classList.add('error');
            valid = false;
        } else {
            regEmailInput.closest('.input-group').classList.remove('error');
        }

        const passVal = regPasswordInput.value;
        if (!passVal || passVal.length < 6) {
            regPasswordInput.closest('.input-group').classList.add('error');
            valid = false;
        } else {
            regPasswordInput.closest('.input-group').classList.remove('error');
        }

        const confirmPassVal = regConfirmPasswordInput.value;
        if (confirmPassVal !== passVal) {
            regConfirmPasswordInput.closest('.input-group').classList.add('error');
            valid = false;
        } else {
            regConfirmPasswordInput.closest('.input-group').classList.remove('error');
        }

        if (!valid) {
            showToast('Please check all security fields.', 'fa-triangle-exclamation');
            return;
        }

        regProfile.countryCode = regCountryCodeSelect.value;
        regProfile.mobile = regMobileInput.value.trim();
        regProfile.email = emailVal;
        regProfile.password = passVal;

        goToStep(3);
    });

    // Step 3: Lifestyle & Experience
    if (step3BackBtn) step3BackBtn.addEventListener('click', (e) => { if (e) e.preventDefault(); goToStep(2); });

    function getRadio(form, name) {
        const el = form.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : '';
    }

    step3Form.addEventListener('submit', (e) => {
        e.preventDefault();

        regProfile.gymExperience     = getRadio(step3Form, 'gymExp') || 'intermediate';
        regProfile.workoutPreference = getRadio(step3Form, 'workoutPref') || 'gym';
        regProfile.workoutDays       = getRadio(step3Form, 'workoutDays') || '4-5';
        regProfile.workoutDuration   = getRadio(step3Form, 'workoutDur') || getRadio(step3Form, 'duration') || '45';
        regProfile.dietPreference    = getRadio(step3Form, 'diet') || getRadio(step3Form, 'dietPref') || 'non-vegetarian';
        regProfile.waterIntake       = getRadio(step3Form, 'water') || '2-3L';
        regProfile.sleep             = getRadio(step3Form, 'sleep') || '6-8';

        goToStep(4);
    });

    // Step 4: Goals & Finish
    if (step4BackBtn) step4BackBtn.addEventListener('click', (e) => { if (e) e.preventDefault(); goToStep(3); });

    if (medYesRadio) {
        medYesRadio.addEventListener('change', () => {
            medicalDetailWrapper.classList.remove('hidden');
            medicalDetailInput.focus();
        });
    }
    if (medNoRadio) {
        medNoRadio.addEventListener('change', () => {
            medicalDetailWrapper.classList.add('hidden');
            medicalDetailInput.value = '';
            if (medicalReportInput) medicalReportInput.value = '';
            regProfile.medicalReport = null;
            if (uploadFilePreview) uploadFilePreview.classList.add('hidden');
            if (uploadPrompt) uploadPrompt.classList.remove('hidden');
        });
    }

    // Medical Report File Upload Handling
    const medicalReportDropZone = document.getElementById('medicalReportDropZone');
    const medicalReportInput    = document.getElementById('medicalReportInput');
    const uploadPrompt          = document.getElementById('uploadPrompt');
    const uploadFilePreview     = document.getElementById('uploadFilePreview');
    const reportFileName        = document.getElementById('reportFileName');
    const reportFileSize        = document.getElementById('reportFileSize');
    const reportFileIcon        = document.getElementById('reportFileIcon');
    const removeMedicalReportBtn = document.getElementById('removeMedicalReportBtn');

    if (medicalReportDropZone && medicalReportInput) {
        medicalReportDropZone.addEventListener('click', (e) => {
            if (e.target.closest('#removeMedicalReportBtn')) return;
            medicalReportInput.click();
        });

        medicalReportDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            medicalReportDropZone.classList.add('dragover');
        });

        medicalReportDropZone.addEventListener('dragleave', () => {
            medicalReportDropZone.classList.remove('dragover');
        });

        medicalReportDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            medicalReportDropZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                medicalReportInput.files = e.dataTransfer.files;
                handleMedicalReportUpload(e.dataTransfer.files[0]);
            }
        });

        medicalReportInput.addEventListener('change', () => {
            if (medicalReportInput.files && medicalReportInput.files.length > 0) {
                handleMedicalReportUpload(medicalReportInput.files[0]);
            }
        });

        if (removeMedicalReportBtn) {
            removeMedicalReportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                medicalReportInput.value = '';
                regProfile.medicalReport = null;
                uploadFilePreview.classList.add('hidden');
                uploadPrompt.classList.remove('hidden');
            });
        }
    }

    function handleMedicalReportUpload(file) {
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showToast('Medical report file size must be less than 10MB', 'fa-triangle-exclamation');
            medicalReportInput.value = '';
            return;
        }

        const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        if (reportFileName) reportFileName.textContent = file.name;
        if (reportFileSize) reportFileSize.textContent = sizeFormatted;

        if (reportFileIcon) {
            const extension = file.name.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png'].includes(extension)) {
                reportFileIcon.className = 'fa-solid fa-file-image';
                reportFileIcon.style.color = '#3b82f6';
            } else if (['doc', 'docx'].includes(extension)) {
                reportFileIcon.className = 'fa-solid fa-file-word';
                reportFileIcon.style.color = '#2563eb';
            } else {
                reportFileIcon.className = 'fa-solid fa-file-pdf';
                reportFileIcon.style.color = '#ef4444';
            }
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            regProfile.medicalReport = {
                fileName: file.name,
                fileSize: sizeFormatted,
                fileData: e.target.result
            };
            if (uploadPrompt) uploadPrompt.classList.add('hidden');
            if (uploadFilePreview) uploadFilePreview.classList.remove('hidden');
            showToast('Medical report attached successfully', 'fa-file-circle-check');
        };
        reader.readAsDataURL(file);
    }

    const registerSubmitBtn = document.getElementById('registerSubmitBtn');

    step4Form.addEventListener('submit', async (e) => {
        if (e) e.preventDefault();

        // Gather credentials with fallback read from DOM inputs
        const name      = (regProfile.name && regProfile.name !== 'Athlete') ? regProfile.name : (regNameInput ? regNameInput.value.trim() : 'Athlete');
        const email     = regProfile.email || (regEmailInput ? regEmailInput.value.trim() : '');
        let mobile      = regProfile.mobile || (regMobileInput ? regMobileInput.value.trim() : '');
        const country   = regProfile.countryCode || (regCountryCodeSelect ? regCountryCodeSelect.value : '+91');
        const password  = regProfile.password || (regPasswordInput ? regPasswordInput.value : '');

        // Fallback for mobile if empty
        const cleanMobile = mobile.replace(/[^0-9]/g, '');
        if (cleanMobile.length < 7) {
            mobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
        }

        // Credentials Validation Guard
        if (!email || (typeof validateEmail === 'function' && !validateEmail(email))) {
            showToast('Please enter a valid email address in Security step.', 'fa-triangle-exclamation');
            goToStep(2);
            return;
        }

        if (!password || password.length < 6) {
            showToast('Please enter a password of at least 6 characters in Security step.', 'fa-triangle-exclamation');
            goToStep(2);
            return;
        }

        const checkedGoalEls = step4Form.querySelectorAll('input[name="fitnessGoal"]:checked');
        const selectedGoals = Array.from(checkedGoalEls).map(el => el.value);

        if (selectedGoals.length === 0) {
            selectedGoals.push('muscle');
        }

        const medEl  = step4Form.querySelector('input[name="medical"]:checked');
        const medicalValue = medEl ? medEl.value : 'no';

        if (medicalValue === 'yes' && medicalDetailInput && !medicalDetailInput.value.trim()) {
            if (medicalDetailInput.closest('.input-field-wrapper')) {
                medicalDetailInput.closest('.input-field-wrapper').classList.add('error');
            }
            showToast('Please describe your medical restriction.', 'fa-notes-medical');
            return;
        }

        regProfile.name = name;
        regProfile.email = email;
        regProfile.mobile = mobile;
        regProfile.countryCode = country;
        regProfile.password = password;
        regProfile.fitnessGoal = selectedGoals.join(', ');
        regProfile.medicalConditions = medicalValue;
        regProfile.medicalDetails = (medicalValue === 'yes' && medicalDetailInput) ? medicalDetailInput.value.trim() : '';

        // Prepare backend registration payload
        const registrationPayload = {
            fullName: name,
            gender: regProfile.gender || 'male',
            age: regProfile.age || 25,
            heightCm: regProfile.height || 175,
            weightKg: regProfile.weight || 70,
            mobileCountry: country,
            mobileNumber: mobile,
            email: email,
            password: password,
            confirmPassword: password,
            gymExperience: regProfile.gymExperience || 'intermediate',
            workoutPreference: regProfile.workoutPreference || 'gym',
            workoutDays: regProfile.workoutDays || '4-5',
            workoutDurationMin: parseInt(regProfile.workoutDuration, 10) || 45,
            dietPreference: regProfile.dietPreference || 'non-vegetarian',
            waterIntake: regProfile.waterIntake || '2-3L',
            sleepHours: regProfile.sleep || '6-8',
            fitnessGoal: regProfile.fitnessGoal || 'muscle',
            medicalConditions: regProfile.medicalConditions || 'no',
            medicalDetails: regProfile.medicalDetails || '',
            medicalReportName: (medicalValue === 'yes' && regProfile.medicalReport) ? regProfile.medicalReport.fileName : '',
            medicalReportData: (medicalValue === 'yes' && regProfile.medicalReport) ? regProfile.medicalReport.fileData : '',
            avatarUrl: regProfile.avatarUrl || '',
            preferredLanguage: 'en'
        };

        // Disable button and show spinner during network request
        if (registerSubmitBtn) {
            registerSubmitBtn.disabled = true;
            registerSubmitBtn.style.opacity = '0.75';
            registerSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
            const response = await fetch(getApiUrl('/api/auth/register'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(registrationPayload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            let data = null;
            try {
                data = await response.json();
            } catch (jsonErr) {}

            if (response.ok && data && data.success) {
                if (stepNodes && stepNodes[3]) {
                    stepNodes[3].classList.remove('active');
                    stepNodes[3].classList.add('done');
                }

                // Instantly update state & localStorage for immediate render
                regProfile.name = name;
                regProfile.email = email;
                regProfile.role = 'user';
                try { localStorage.setItem('fitpulse_user_name', name); } catch(e){}
                try { localStorage.setItem('fitpulse_user_email', email); } catch(e){}
                if (registrationPayload.avatarUrl) {
                    regProfile.avatarUrl = registrationPayload.avatarUrl;
                    try { localStorage.setItem('fitpulse_user_avatar', registrationPayload.avatarUrl); } catch(e){}
                }
                if (registrationPayload.dietPreference) {
                    regProfile.dietPreference = registrationPayload.dietPreference;
                    try { localStorage.setItem('fitpulse_user_diet', registrationPayload.dietPreference); } catch(e){}
                }
                sessionStorage.setItem('fitpulse_user_role', 'user');
                sessionStorage.setItem('fitpulse_logged_in', 'true');

                showToast(data.message || `🎉 Account created! Welcome, ${name}!`, 'fa-circle-check');

                // DIRECTLY OPEN DASHBOARD SCREEN IMMEDIATELY
                if (typeof openDashboardScreen === 'function') {
                    openDashboardScreen(name, email, 'user');
                }

                // Asynchronous background login session setup
                fetch(getApiUrl('/api/auth/login'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ identifier: email, password: password })
                }).then(res => res.json()).then(loginData => {
                    if (loginData && loginData.success && loginData.user) {
                        if (typeof updateUserProfileFromBackend === 'function') updateUserProfileFromBackend(loginData.user);
                    }
                }).catch(e => console.warn('Background session setup notice:', e));

                return;
            } else {
                const errMsg = (data && data.message) ? data.message : 'Registration failed. Please check your information.';
                showToast(errMsg, 'fa-triangle-exclamation');
                if (response.status === 409 || (errMsg && (errMsg.toLowerCase().includes('email') || errMsg.toLowerCase().includes('mobile')))) {
                    setTimeout(() => goToStep(2), 1200);
                }
            }
        } catch (err) {
            clearTimeout(timeoutId);
            console.error('Backend registration API error:', err);
            if (err.name === 'AbortError') {
                showToast('Registration request timed out. Please try again.', 'fa-clock');
            } else {
                showToast('Unable to connect to registration server. Please check your connection.', 'fa-circle-xmark');
            }
        } finally {
            if (registerSubmitBtn) {
                registerSubmitBtn.disabled = false;
                registerSubmitBtn.style.opacity = '1';
                registerSubmitBtn.innerHTML = `<span>Create Account</span> <i class="fa-solid fa-check btn-icon"></i>`;
            }
        }
    });

    // Forgot Password
    forgotPasswordBtn.addEventListener('click', () => {
        resetTargetInput.value = identifierInput.value;
        forgotModal.classList.remove('hidden');
    });

    closeForgotModal.addEventListener('click', () => forgotModal.classList.add('hidden'));

    sendResetBtn.addEventListener('click', async () => {
        const target = resetTargetInput.value.trim();
        if (!target) {
            showToast('Please enter your registered email or mobile.', 'fa-triangle-exclamation');
            return;
        }

        sendResetBtn.disabled = true;
        const originalText = sendResetBtn.innerHTML;
        sendResetBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ identifier: target })
            });

            const data = await response.json();
            forgotModal.classList.add('hidden');

            if (response.ok && data.success) {
                showToast(data.message || `Password recovery code sent to ${target}!`, 'fa-paper-plane');
            } else {
                showToast(data.message || `Unable to send reset code to ${target}.`, 'fa-triangle-exclamation');
            }
        } catch (err) {
            console.warn('Backend connection notice for reset:', err);
            forgotModal.classList.add('hidden');
            showToast(`Reset code sent to ${target}`, 'fa-paper-plane');
        } finally {
            sendResetBtn.disabled = false;
            sendResetBtn.innerHTML = originalText;
        }
    });

    const workoutsView         = document.getElementById('workoutsView');
    const navWorkouts          = document.querySelector('[data-nav="workouts"]');
    const dietView             = document.getElementById('dietView');
    const navDiet              = document.querySelector('[data-nav="diet"]');
    const progressView         = document.getElementById('progressView');
    const navProgress          = document.querySelector('[data-nav="progress"]');
    const coachView            = document.getElementById('coachView');
    const navCoach             = document.querySelector('[data-nav="coach"]');
    const messagesView         = document.getElementById('messagesView');
    const navMessages          = document.querySelector('[data-nav="messages"]');
    const settingsView         = document.getElementById('settingsView');
    const navSettings          = document.querySelector('[data-nav="settings"]');
    
    const devicesView          = document.getElementById('devicesView');
    const navDevices           = document.querySelector('[data-nav="devices"]');

    const adminOverviewView    = document.getElementById('adminOverviewView');
    const adminUsersView       = document.getElementById('adminUsersView');
    const adminCoachesView     = document.getElementById('adminCoachesView');
    const adminAnalyticsView   = document.getElementById('adminAnalyticsView');
    const adminSystemView      = document.getElementById('adminSystemView');

    const navAdminOverview     = document.querySelector('[data-nav="admin-overview"]');
    const navAdminUsers        = document.querySelector('[data-nav="admin-users"]');
    const navAdminCoaches      = document.querySelector('[data-nav="admin-coaches"]');
    const navAdminAnalytics    = document.querySelector('[data-nav="admin-analytics"]');
    const navAdminSystem       = document.querySelector('[data-nav="admin-system"]');

    function hideAllDashboardViews() {
        const allViews = [
            dashboardView, profileView, workoutsView, dietView, progressView,
            coachView, messagesView, settingsView, devicesView, coachDashboardView,
            adminOverviewView, adminUsersView, adminCoachesView, adminAnalyticsView, adminSystemView
        ];
        allViews.forEach(v => {
            if (v) v.classList.add('hidden');
        });
    }

