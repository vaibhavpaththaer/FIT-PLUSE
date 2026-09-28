// FitPulse — Coach Chat, Messages & 1-on-1 Booking

    // =========================================================================
    // 12. MESSAGES & COACH 1-ON-1 COMMUNICATION SYSTEM
    // =========================================================================
    let activeContactType = 'coach'; // 'coach' | 'bot' | 'nutrition'
    let currentCoach = {
        id: 1,
        fullName: 'Rahul Sharma',
        specialties: 'Weight Loss & Muscle Gain',
        experienceYears: 8,
        rating: 5.0,
        reviewCount: 142,
        activeClients: 35,
        bio: '"My coaching philosophy is rooted in evidence-based exercise physiology: progressive overload, biomechanically sound movement execution, and structured strength periodization. Together we keep our athletes on a 90% workout consistency streak!"',
        profileImageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&auto=format&fit=crop&q=80'
    };

    let chatConversationData = [
        { id: 1, sender: 'coach', senderName: 'Coach Rahul', text: 'Hello! Great job today.', time: '10:45 AM' },
        { id: 2, sender: 'user', senderName: 'You', text: 'Thank you coach.', time: '10:46 AM' },
        { id: 3, sender: 'coach', senderName: 'Coach Rahul', text: 'Tomorrow increase cardio by 10 min.', time: '10:48 AM' }
    ];

    let botConversationData = [
        { id: 101, sender: 'coach', senderName: 'FitPulse AI', text: 'Hello! I am your 24/7 FitPulse AI Assistant. How can I assist your fitness goals today?', time: '09:30 AM' },
        { id: 102, sender: 'user', senderName: 'You', text: 'Workout logged! 460 kcal burned today.', time: '09:31 AM' },
        { id: 103, sender: 'coach', senderName: 'FitPulse AI', text: 'Outstanding effort! That brings your weekly total to 1,840 kcal. Stay hydrated!', time: '09:31 AM' }
    ];

    let nutritionConversationData = [
        { id: 201, sender: 'coach', senderName: 'Nutrition Team', text: 'Welcome to Precision Nutrition Support. Your high-protein diet plan is active.', time: 'Yesterday' },
        { id: 202, sender: 'coach', senderName: 'Nutrition Team', text: 'Remember to hit at least 180g of protein and 3.0L of water daily.', time: 'Yesterday' }
    ];

    function formatCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    function populateCoachProfileUI() {
        if (!currentCoach) return;
        const coachFirstName = currentCoach.fullName ? currentCoach.fullName.split(' ')[0] : 'Rahul';

        // 1. Coach View Hero Section
        const heroName = document.querySelector('#coachView .coach-hero-name');
        if (heroName) heroName.innerHTML = `${currentCoach.fullName} <i class="fa-solid fa-circle-check text-purple" title="Verified Master Coach"></i>`;

        const viewMainHeading = document.querySelector('#coachView .profile-main-heading');
        if (viewMainHeading) viewMainHeading.innerHTML = `<i class="fa-solid fa-user-ninja icon-accent"></i> Coach ${currentCoach.fullName}`;

        const viewSubHeading = document.querySelector('#coachView .profile-sub-heading');
        if (viewSubHeading) viewSubHeading.textContent = `${currentCoach.experienceYears} Years Experience • ${currentCoach.specialties} • Lead CSCS Performance Mentor`;

        const heroTitle = document.querySelector('#coachView .coach-hero-title');
        if (heroTitle) heroTitle.textContent = `NSCA-CSCS • Lead Hypertrophy & Athletic Strength Coach • ${currentCoach.specialties}`;

        const heroScoreNum = document.querySelector('#coachView .ch-score-num');
        if (heroScoreNum) heroScoreNum.textContent = `${Number(currentCoach.rating).toFixed(1)} / 5.0`;

        const heroReviews = document.querySelector('#coachView .ch-score-reviews');
        if (heroReviews) heroReviews.textContent = `${currentCoach.reviewCount} Reviews`;

        const heroBio = document.querySelector('#coachView .coach-hero-bio');
        if (heroBio && currentCoach.bio) heroBio.textContent = currentCoach.bio;

        const expPill = document.querySelector('#coachView .coach-exp-badge-pill');
        if (expPill) expPill.innerHTML = `<i class="fa-solid fa-award text-yellow"></i> ${currentCoach.experienceYears} Years Elite Coaching`;

        const heroImg = document.querySelector('#coachView .coach-hero-img');
        if (heroImg && currentCoach.profileImageUrl) heroImg.src = currentCoach.profileImageUrl;

        const heroChatSpan = document.querySelector('#coachHeroChatBtn span');
        if (heroChatSpan) heroChatSpan.textContent = `Chat with ${coachFirstName}`;

        // Update coach stats banner
        const statExpVal = document.querySelector('#coachView .cs-stat-item:nth-child(1) .cs-stat-val');
        if (statExpVal) statExpVal.textContent = `${currentCoach.experienceYears} Years`;

        const statSpecVal = document.querySelector('#coachView .cs-stat-item:nth-child(2) .cs-stat-val');
        if (statSpecVal) statSpecVal.textContent = currentCoach.specialties;

        // 2. Messages View Header & Sidebar Sync (if coach contact active)
        if (activeContactType === 'coach') {
            updateChatHeaderUI();
        }

        const msgContactName = document.querySelector('.msg-contact-item[data-contact="coach"] .msg-contact-name');
        if (msgContactName) msgContactName.textContent = `Coach ${currentCoach.fullName}`;

        const msgContactAvatar = document.querySelector('.msg-contact-item[data-contact="coach"] .msg-contact-avatar');
        if (msgContactAvatar && currentCoach.profileImageUrl) msgContactAvatar.src = currentCoach.profileImageUrl;
    }

    function updateChatHeaderUI() {
        const msgHeaderName = document.querySelector('.msg-chat-header-name');
        const msgHeaderStatus = document.querySelector('.msg-chat-header-status');
        const msgHeaderAvatar = document.querySelector('.msg-chat-header-avatar');
        const msgHeaderAvatarWrap = document.querySelector('.msg-chat-coach-profile .msg-contact-avatar-wrap');

        if (activeContactType === 'coach') {
            if (msgHeaderName) msgHeaderName.textContent = `Coach ${currentCoach.fullName || 'Rahul Sharma'}`;
            if (msgHeaderStatus) msgHeaderStatus.innerHTML = `<span class="pulse-dot green"></span> Online • Head Performance Coach (${currentCoach.experienceYears || 8} Yrs Exp)`;
            if (msgHeaderAvatar && currentCoach.profileImageUrl) {
                msgHeaderAvatar.src = currentCoach.profileImageUrl;
                msgHeaderAvatar.style.display = 'block';
            }
            if (msgHeaderAvatarWrap) {
                const botAvatar = msgHeaderAvatarWrap.querySelector('.msg-bot-avatar');
                if (botAvatar) botAvatar.remove();
            }
        } else if (activeContactType === 'bot') {
            if (msgHeaderName) msgHeaderName.textContent = 'FitPulse AI Assistant';
            if (msgHeaderStatus) msgHeaderStatus.innerHTML = '<span class="pulse-dot bot"></span> Online • 24/7 Intelligent Health Bot';
            if (msgHeaderAvatar) msgHeaderAvatar.style.display = 'none';
            if (msgHeaderAvatarWrap && !msgHeaderAvatarWrap.querySelector('.msg-bot-avatar')) {
                const botDiv = document.createElement('div');
                botDiv.className = 'msg-bot-avatar';
                botDiv.innerHTML = '<i class="fa-solid fa-robot"></i>';
                msgHeaderAvatarWrap.prepend(botDiv);
            }
        } else if (activeContactType === 'nutrition') {
            if (msgHeaderName) msgHeaderName.textContent = 'Nutrition Support Team';
            if (msgHeaderStatus) msgHeaderStatus.innerHTML = '<span class="pulse-dot green"></span> Online • Precision Macros & Supplementation Desk';
            if (msgHeaderAvatar) msgHeaderAvatar.style.display = 'none';
            if (msgHeaderAvatarWrap && !msgHeaderAvatarWrap.querySelector('.msg-bot-avatar')) {
                const nutDiv = document.createElement('div');
                nutDiv.className = 'msg-bot-avatar nutrition';
                nutDiv.innerHTML = '<i class="fa-solid fa-apple-whole"></i>';
                msgHeaderAvatarWrap.prepend(nutDiv);
            }
        }
    }

    async function loadCoachData() {
        try {
            const res = await fetch('/api/coach', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401) {
                if (handleApiUnauthorized(res)) return;
            }

            if (!res.ok) return;
            const data = await res.json();
            if (!data || !data.success) return;

            if (data.assignedCoach) {
                currentCoach = {
                    id: data.assignedCoach.id || currentCoach.id,
                    fullName: data.assignedCoach.fullName || currentCoach.fullName,
                    specialties: data.assignedCoach.specialties || currentCoach.specialties,
                    experienceYears: data.assignedCoach.experienceYears || currentCoach.experienceYears,
                    rating: data.assignedCoach.rating || currentCoach.rating,
                    reviewCount: data.assignedCoach.reviewCount || currentCoach.reviewCount,
                    activeClients: data.assignedCoach.activeClients || currentCoach.activeClients,
                    bio: data.assignedCoach.bio || currentCoach.bio,
                    profileImageUrl: data.assignedCoach.profileImageUrl || currentCoach.profileImageUrl
                };
                populateCoachProfileUI();
            }

            if (typeof data.unreadMessages === 'number') {
                const b1 = document.getElementById('messagesBadgeCount');
                const b2 = document.getElementById('msgCoachUnreadBadge');
                if (data.unreadMessages > 0) {
                    if (b1) { b1.textContent = data.unreadMessages; b1.style.display = 'inline-flex'; }
                    if (b2) { b2.textContent = data.unreadMessages; b2.style.display = 'inline-flex'; }
                } else {
                    if (b1) b1.style.display = 'none';
                    if (b2) b2.style.display = 'none';
                }
            }
        } catch (err) {
            console.warn('Coach fetch API notice:', err);
        }
    }

    async function loadMessagesData(isSilentPoll = false) {
        const currentRole = regProfile.role || sessionStorage.getItem('fitpulse_user_role') || 'user';
        if (currentRole === 'coach') {
            await loadCoachMessagesForClient(isSilentPoll);
            return;
        }

        if (activeContactType !== 'coach') {
            renderAllChatMessages();
            return;
        }

        try {
            const res = await fetch('/api/coach/messages', {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (res.status === 401) {
                if (!isSilentPoll && handleApiUnauthorized(res)) return;
            }

            if (!res.ok) return;
            const data = await res.json();
            if (!data || !data.success || !Array.isArray(data.messages)) return;

            // Check if messages changed before re-rendering to prevent UI jitter
            const newCount = data.messages.length;
            const oldCount = chatConversationData.length;
            const latestNewId = newCount > 0 ? data.messages[newCount - 1].id : 0;
            const latestOldId = oldCount > 0 ? chatConversationData[oldCount - 1].id : 0;

            if (isSilentPoll && newCount === oldCount && latestNewId === latestOldId) {
                return; // Nothing changed
            }

            chatConversationData.length = 0;
            const coachName = data.coachName || currentCoach.fullName || 'Coach';

            data.messages.forEach(m => {
                const sType = m.senderType || 'user';
                const sName = m.senderName || (sType === 'coach' ? coachName : (regProfile.name || 'You'));
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

            // Clear unread badge since conversation is active
            const b1 = document.getElementById('messagesBadgeCount');
            const b2 = document.getElementById('msgCoachUnreadBadge');
            if (b1) b1.style.display = 'none';
            if (b2) b2.style.display = 'none';

        } catch (err) {
            if (!isSilentPoll) {
                console.warn('Messages fetch API notice:', err);
            }
        }
    }

    function renderAllChatMessages() {
        let activeData = chatConversationData;
        let senderTagCoach = 'Coach';
        if (activeContactType === 'bot') {
            activeData = botConversationData;
            senderTagCoach = 'FitPulse AI';
        } else if (activeContactType === 'nutrition') {
            activeData = nutritionConversationData;
            senderTagCoach = 'Nutrition Team';
        }

        // 1. Render in Messages View
        const messagesBody = document.getElementById('messagesChatBody');
        if (messagesBody) {
            let html = `
                <div class="msg-date-divider">
                    <span>Today, Aug 7</span>
                </div>
            `;
            activeData.forEach(msg => {
                if (msg.sender === 'coach') {
                    html += `
                        <div class="msg-bubble-row coach">
                            <div class="msg-sender-label">${msg.senderName || senderTagCoach}</div>
                            <div class="msg-bubble-content">
                                <p>${msg.text}</p>
                                <div class="msg-meta-row">
                                    <span class="msg-time">${msg.time}</span>
                                    <i class="fa-solid fa-check-double text-purple"></i>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="msg-bubble-row user">
                            <div class="msg-sender-label">You</div>
                            <div class="msg-bubble-content">
                                <p>${msg.text}</p>
                                <div class="msg-meta-row">
                                    <span class="msg-time">${msg.time}</span>
                                    <i class="fa-solid fa-check-double"></i>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
            messagesBody.innerHTML = html;
            messagesBody.scrollTop = messagesBody.scrollHeight;
        }

        // 2. Render in Chat Modal
        const modalContainer = document.getElementById('chatMessagesContainer');
        if (modalContainer) {
            let mHtml = '';
            chatConversationData.forEach(msg => {
                if (msg.sender === 'coach') {
                    mHtml += `
                        <div class="chat-bubble coach">
                            <div class="chat-sender-tag" style="font-size: 0.7rem; font-weight: 700; color: var(--primary-purple); margin-bottom: 2px;">${msg.senderName || 'Coach'}</div>
                            <p>${msg.text}</p>
                            <small>${msg.time}</small>
                        </div>
                    `;
                } else {
                    mHtml += `
                        <div class="chat-bubble user">
                            <div class="chat-sender-tag" style="font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.85); margin-bottom: 2px;">You</div>
                            <p>${msg.text}</p>
                            <small>${msg.time}</small>
                        </div>
                    `;
                }
            });
            modalContainer.innerHTML = mHtml;
            modalContainer.scrollTop = modalContainer.scrollHeight;
        }

        // 3. Update preview snippet in contacts sidebar
        const lastMsg = activeData[activeData.length - 1];
        if (activeContactType === 'coach') {
            const previewEl = document.getElementById('msgCoachPreviewSnippet');
            if (previewEl && lastMsg) {
                previewEl.textContent = lastMsg.text;
            }
        }
    }

    async function sendChatMessage(text) {
        if (!text || !text.trim()) return;
        const userMsgText = text.trim();
        const userDisplayName = (typeof regProfile !== 'undefined' && regProfile.name) ? regProfile.name : 'You';
        const userFirstName = userDisplayName.split(' ')[0] || 'Alex';
        const timeNow = formatCurrentTime();

        if (activeContactType === 'bot') {
            botConversationData.push({
                id: Date.now(),
                sender: 'user',
                senderName: userDisplayName,
                text: userMsgText,
                time: timeNow
            });
            renderAllChatMessages();

            setTimeout(() => {
                const lower = userMsgText.toLowerCase();
                let botReply = `FitPulse AI recorded: "${userMsgText}". Keep hitting your daily wellness targets!`;
                if (lower.includes('calorie') || lower.includes('food') || lower.includes('macro')) {
                    botReply = `Based on your biometrics, your daily target is 2,600 kcal with 180g protein, 280g carbs, and 70g fats.`;
                } else if (lower.includes('water') || lower.includes('hydration')) {
                    botReply = `You've logged 2.4L out of 3.0L water today (80% complete). Drink one more glass to stay optimal!`;
                } else if (lower.includes('workout') || lower.includes('exercise')) {
                    botReply = `Your next scheduled routine is Upper Body Hypertrophy & Core. Stay consistent!`;
                }
                botConversationData.push({
                    id: Date.now() + 1,
                    sender: 'coach',
                    senderName: 'FitPulse AI',
                    text: botReply,
                    time: formatCurrentTime()
                });
                renderAllChatMessages();
                showToast('🤖 AI Assistant responded', 'fa-robot');
            }, 600);
            return;
        }

        if (activeContactType === 'nutrition') {
            nutritionConversationData.push({
                id: Date.now(),
                sender: 'user',
                senderName: userDisplayName,
                text: userMsgText,
                time: timeNow
            });
            renderAllChatMessages();

            setTimeout(() => {
                nutritionConversationData.push({
                    id: Date.now() + 1,
                    sender: 'coach',
                    senderName: 'Nutrition Team',
                    text: `Thanks for the update, ${userFirstName}! We've logged your nutrition inquiry and calibrated your macro pacing.`,
                    time: formatCurrentTime()
                });
                renderAllChatMessages();
                showToast('🥗 Nutrition Team updated', 'fa-apple-whole');
            }, 600);
            return;
        }

        const currentRole = regProfile.role || sessionStorage.getItem('fitpulse_user_role') || 'user';
        if (currentRole === 'coach') {
            if (!activeCoachClientId) {
                showToast('Please select a client to message.', 'fa-triangle-exclamation');
                return;
            }
            chatConversationData.push({
                id: Date.now(),
                sender: 'coach',
                senderName: 'You',
                text: userMsgText,
                time: timeNow
            });
            renderAllChatMessages();

            try {
                const res = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        messageText: userMsgText,
                        userId: activeCoachClientId
                    })
                });
                if (!res.ok) throw new Error('Network error sending message');
                const data = await res.json();
                if (data && data.success) {
                    loadCoachMessagesForClient(true);
                }
            } catch (err) {
                console.error('Error sending coach message:', err);
                showToast('Failed to send message.', 'fa-triangle-exclamation');
            }
            return;
        }

        // Push optimistically to UI for Athlete Coach conversation
        chatConversationData.push({
            id: Date.now(),
            sender: 'user',
            senderName: userDisplayName,
            text: userMsgText,
            time: timeNow
        });
        renderAllChatMessages();

        try {
            const res = await fetch('/api/coach/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    messageText: userMsgText,
                    coachId: currentCoach.id
                })
            });

            if (res.status === 401) {
                if (handleApiUnauthorized(res)) return;
            }

            if (!res.ok) throw new Error('Network error sending message');
            const data = await res.json();

            if (data && data.success) {
                if (data.coachReply) {
                    let replyTime = timeNow;
                    if (data.coachReply.sentAt) {
                        try {
                            const d = new Date(data.coachReply.sentAt);
                            if (!isNaN(d.getTime())) {
                                let hours = d.getHours();
                                let minutes = d.getMinutes();
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                hours = hours % 12 || 12;
                                minutes = minutes < 10 ? '0' + minutes : minutes;
                                replyTime = `${hours}:${minutes} ${ampm}`;
                            }
                        } catch (e) {}
                    }

                    setTimeout(() => {
                        chatConversationData.push({
                            id: data.coachReply.id || (Date.now() + 1),
                            sender: 'coach',
                            senderName: data.coachReply.senderName || currentCoach.fullName || 'Coach Rahul',
                            text: data.coachReply.messageText,
                            time: replyTime
                        });
                        renderAllChatMessages();
                        showToast(`💬 New message from ${currentCoach.fullName || 'Coach Rahul'}`, 'fa-comment-dots');
                    }, 450);
                }
            } else {
                throw new Error(data.message || 'Server error');
            }
        } catch (err) {
            console.warn('Live API send notice, applying local fallback:', err);
            // Local fallback simulation if server is unreachable
            setTimeout(() => {
                const curW = (typeof progressState !== 'undefined' && progressState.currentWeight) ? progressState.currentWeight : 72.0;
                const lower = userMsgText.toLowerCase();
                
                let reply = `Great initiative, ${userFirstName}! Keep that 90% workout consistency locked in. Let's make sure we hit our weekly volume target!`;

                if (lower.includes('cardio') || lower.includes('run') || lower.includes('10 min') || lower.includes('treadmill')) {
                    reply = `Awesome! An extra 10 minutes of steady-state Zone 2 cardio will boost your mitochondrial density and keep fat oxidation high. Keep up the great pace, ${userFirstName}!`;
                } else if (lower.includes('got it') || lower.includes('thank') || lower.includes('ok') || lower.includes('sure')) {
                    reply = `You're doing fantastic! Rest up well tonight and make sure to hit your hydration target before tomorrow's session.`;
                } else if (lower.includes('strength') || lower.includes('lifting') || lower.includes('dumbbell') || lower.includes('bench') || lower.includes('squat')) {
                    reply = `For strength tomorrow, we have Progressive Overload on the compound lifts. Keep your RPE at 8 and maintain tight brace through the core!`;
                } else if (lower.includes('weight') || lower.includes('scale') || lower.includes('kg') || lower.includes('fat')) {
                    reply = `Logged and noted! Maintaining around ${curW} kg while building lean muscle density is the gold standard for body recomposition.`;
                } else if (lower.includes('form') || lower.includes('check') || lower.includes('technique')) {
                    reply = `Absolutely! You can book a 1-on-1 Biomechanics & Form Check session with me through the Booking tab, or send your lifting video right here.`;
                } else if (lower.includes('diet') || lower.includes('macro') || lower.includes('protein') || lower.includes('meal')) {
                    reply = `Ensure you hit ~180g protein today and check your dedicated Diet Plan view for full macro breakdowns!`;
                }

                chatConversationData.push({
                    id: Date.now() + 1,
                    sender: 'coach',
                    senderName: currentCoach.fullName || 'Coach Rahul',
                    text: reply,
                    time: formatCurrentTime()
                });

                renderAllChatMessages();
                showToast(`💬 New message from ${currentCoach.fullName || 'Coach Rahul'}`, 'fa-comment-dots');
            }, 750);
        }
    }

    // Dynamic Coach Chat Messaging (Modal Form)
    if (chatSendForm) {
        chatSendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = chatInputMessage.value.trim();
            if (!msg) return;
            chatInputMessage.value = '';
            sendChatMessage(msg);
        });
    }

    // Dynamic Main Messages View Send Form
    const messagesMainSendForm = document.getElementById('messagesMainSendForm');
    const messagesMainInput = document.getElementById('messagesMainInput');
    if (messagesMainSendForm) {
        messagesMainSendForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!messagesMainInput) return;
            const msg = messagesMainInput.value.trim();
            if (!msg) return;
            messagesMainInput.value = '';
            sendChatMessage(msg);
        });
    }

    // Quick Reply Chips
    document.querySelectorAll('.quick-chip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const msg = e.currentTarget.getAttribute('data-msg');
            if (msg) {
                sendChatMessage(msg);
            }
        });
    });

    // Messages View Navigation and Controls
    document.getElementById('crumbMessagesToDashboard')?.addEventListener('click', () => switchView('dashboard'));
    document.getElementById('msgViewCoachProfileBtn')?.addEventListener('click', () => switchView('coach'));

    // Mark All Read
    document.getElementById('msgMarkAllReadBtn')?.addEventListener('click', () => {
        const b1 = document.getElementById('messagesBadgeCount');
        const b2 = document.getElementById('msgCoachUnreadBadge');
        if (b1) b1.style.display = 'none';
        if (b2) b2.style.display = 'none';
        try {
            fetch('/api/coach/read', { method: 'POST', headers: { 'Accept': 'application/json' } }).catch(() => {});
        } catch (e) {}
        showToast('All messages marked as read', 'fa-check-double');
    });

    // Audio & Video Call Action Buttons
    const triggerVideoCall = () => {
        showToast(`📹 Initiating HD Video Session with Coach ${currentCoach ? currentCoach.fullName : 'Rahul Sharma'}...`, 'fa-video');
    };
    const triggerAudioCall = () => {
        showToast(`📞 Calling Coach ${currentCoach ? currentCoach.fullName : 'Rahul Sharma'} via FitPulse Audio Link...`, 'fa-phone');
    };
    document.getElementById('msgStartVideoCallBtn')?.addEventListener('click', triggerVideoCall);
    document.getElementById('msgVideoCallBtn')?.addEventListener('click', triggerVideoCall);
    document.getElementById('msgAudioCallBtn')?.addEventListener('click', triggerAudioCall);

    // Emoji Picker Button - Cycles popular fitness emojis into input box
    const fitnessEmojis = ['💪', '🏃‍♂️', '🔥', '🥗', '⚡', '🎯', '💯', '👏'];
    let emojiIndex = 0;
    document.getElementById('msgEmojiPickerBtn')?.addEventListener('click', () => {
        if (messagesMainInput) {
            messagesMainInput.value += ' ' + fitnessEmojis[emojiIndex];
            messagesMainInput.focus();
            emojiIndex = (emojiIndex + 1) % fitnessEmojis.length;
        }
    });

    // File Attachment Demo Button
    document.getElementById('msgAttachFileBtn')?.addEventListener('click', () => {
        showToast('📎 Video/Photo upload attached to message thread', 'fa-paperclip');
    });

    // Clear Chat
    document.getElementById('msgClearChatBtn')?.addEventListener('click', async () => {
        const contactName = activeContactType === 'coach' ? (currentCoach ? currentCoach.fullName : 'Coach Rahul') : (activeContactType === 'bot' ? 'FitPulse AI' : 'Nutrition Support');
        if (confirm(`Clear chat history with ${contactName}?`)) {
            if (activeContactType === 'coach') {
                try {
                    await fetch('/api/coach/messages/clear', { method: 'POST', headers: { 'Accept': 'application/json' } });
                } catch (e) {}
                chatConversationData.length = 0;
                chatConversationData.push({
                    id: 1,
                    sender: 'coach',
                    senderName: currentCoach ? currentCoach.fullName : 'Coach Rahul',
                    text: 'Hello! Conversation reset. How can I help you today?',
                    time: formatCurrentTime()
                });
            } else if (activeContactType === 'bot') {
                botConversationData.length = 0;
                botConversationData.push({
                    id: 101,
                    sender: 'coach',
                    senderName: 'FitPulse AI',
                    text: 'Hello! How can I assist your fitness goals today?',
                    time: formatCurrentTime()
                });
            } else {
                nutritionConversationData.length = 0;
                nutritionConversationData.push({
                    id: 201,
                    sender: 'coach',
                    senderName: 'Nutrition Team',
                    text: 'Nutrition conversation reset. Feel free to ask any dietary questions!',
                    time: formatCurrentTime()
                });
            }
            renderAllChatMessages();
            showToast('Chat history reset', 'fa-trash-can');
        }
    });

    // Contact Switching in Sidebar
    document.querySelectorAll('.msg-contact-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.msg-contact-item').forEach(c => c.classList.remove('active'));
            const clickedItem = e.currentTarget;
            clickedItem.classList.add('active');
            activeContactType = clickedItem.getAttribute('data-contact') || 'coach';
            
            updateChatHeaderUI();

            if (activeContactType === 'coach') {
                loadMessagesData();
            } else {
                renderAllChatMessages();
            }
        });
    });

    // Contact Search Filter
    const msgContactSearch = document.getElementById('msgContactSearch');
    if (msgContactSearch) {
        msgContactSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.msg-contact-item').forEach(item => {
                const name = item.querySelector('.msg-contact-name')?.textContent.toLowerCase() || '';
                const preview = item.querySelector('.msg-contact-preview')?.textContent.toLowerCase() || '';
                if (name.includes(query) || preview.includes(query)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // Filter Buttons in Contacts Sidebar
    document.querySelectorAll('.msg-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.msg-filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const filter = e.currentTarget.getAttribute('data-filter');
            document.querySelectorAll('.msg-contact-item').forEach(item => {
                const type = item.getAttribute('data-contact');
                const hasUnread = item.querySelector('.msg-unread-badge') && item.querySelector('.msg-unread-badge').style.display !== 'none';
                if (filter === 'all') {
                    item.style.display = 'flex';
                } else if (filter === 'coaches') {
                    item.style.display = (type === 'coach') ? 'flex' : 'none';
                } else if (filter === 'unread') {
                    item.style.display = hasUnread ? 'flex' : 'none';
                }
            });
        });
    });

    // Background Auto-Polling Sync (Every 5 seconds)
    setInterval(() => {
        if (typeof authLoggedIn !== 'undefined' && authLoggedIn && !document.hidden) {
            loadMessagesData(true);
        }
    }, 5000);

    // Render initial messages on load
    renderAllChatMessages();

    // Quick Add Water Button (Dashboard)
    const addWaterQuickBtn = document.getElementById('addWaterQuickBtn');
    if (addWaterQuickBtn) {
        let currentWater = 2.4;
        addWaterQuickBtn.addEventListener('click', () => {
            currentWater = Math.min(4.0, +(currentWater + 0.25).toFixed(2));
            if (valWater) valWater.textContent = `${currentWater}`;
            if (statProfWater) statProfWater.textContent = `${currentWater} L`;
            const woLiveWater = document.getElementById('woLiveWater');
            if (woLiveWater) woLiveWater.textContent = `${currentWater}`;
            showToast(`💧 Added 250ml water! Total: ${currentWater} L / 3.0 L`, 'fa-droplet');
        });
    }

    // Sync device button
    document.getElementById('syncWearableBtn')?.addEventListener('click', () => {
        showToast('Wearable heart rate & step counter synced!', 'fa-arrows-rotate');
    });

    // =========================================================================
    // 13. PREMIUM WORKOUT CENTER & LIVE TRACKER SUITE
    // =========================================================================
    // Breadcrumbs & Navigation
    const crumbWoToDashboard = document.getElementById('crumbWoToDashboard');
    const woBackToDashBtn = document.getElementById('woBackToDashBtn');
    if (crumbWoToDashboard) crumbWoToDashboard.addEventListener('click', () => switchView('dashboard'));
    if (woBackToDashBtn) woBackToDashBtn.addEventListener('click', () => switchView('dashboard'));

    // Coach Chat Openers on Workout View
    document.getElementById('woChatCoachHeaderBtn')?.addEventListener('click', openCoachChat);
    document.getElementById('woChatCoachDrawerBtn')?.addEventListener('click', openCoachChat);
    document.getElementById('woAskCoachBtn')?.addEventListener('click', openCoachChat);

