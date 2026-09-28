/**
 * FitPulse Device Integration Layer
 * Standard & Clean Wearable/Bluetooth Device Connection Layer
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // UI Elements
    // ----------------------------------------------------
    const btnConnectMobile = document.getElementById('btnConnectMobile');
    const btnSyncMobile = document.getElementById('btnSyncMobile');
    const mobileStatusText = document.getElementById('mobileStatusText');
    const mobileLastSync = document.getElementById('mobileLastSync');
    const mobileSteps = document.getElementById('mobileSteps');
    const mobileCals = document.getElementById('mobileCals');

    const btnConnectSmartwatch = document.getElementById('btnConnectSmartwatch');
    const btnSyncSmartwatch = document.getElementById('btnSyncSmartwatch');
    const smartwatchStatusText = document.getElementById('smartwatchStatusText');
    const smartwatchLastSync = document.getElementById('smartwatchLastSync');
    const smartwatchHR = document.getElementById('smartwatchHR');
    const smartwatchSteps = document.getElementById('smartwatchSteps');
    const smartwatchCals = document.getElementById('smartwatchCals');

    const btnConnectSmartband = document.getElementById('btnConnectSmartband');
    const btnSyncSmartband = document.getElementById('btnSyncSmartband');
    const smartbandStatusText = document.getElementById('smartbandStatusText');
    const smartbandLastSync = document.getElementById('smartbandLastSync');
    const smartbandHR = document.getElementById('smartbandHR');
    const smartbandSteps = document.getElementById('smartbandSteps');
    const smartbandSleep = document.getElementById('smartbandSleep');

    const btnConnectBluetooth = document.getElementById('btnConnectBluetooth');
    const btnSyncBluetooth = document.getElementById('btnSyncBluetooth');
    const btDeviceName = document.getElementById('btDeviceName');
    const btStatusText = document.getElementById('btStatusText');
    const btLastSync = document.getElementById('btLastSync');
    const btBattery = document.getElementById('btBattery');
    const btSteps = document.getElementById('btSteps');
    const btBMI = document.getElementById('btBMI');
    const btWeight = document.getElementById('btWeight');

    // ----------------------------------------------------
    // State Management
    // ----------------------------------------------------
    const deviceState = JSON.parse(localStorage.getItem('fitpulse_devices')) || {
        mobile: { connected: false, syncTime: '--' },
        smartwatch: { connected: false, syncTime: '--' },
        smartband: { connected: false, syncTime: '--' },
        bluetooth: { connected: false, syncTime: '--' }
    };

    let activeBluetoothDevice = null;

    function saveState() {
        localStorage.setItem('fitpulse_devices', JSON.stringify(deviceState));
    }

    function formatTime() {
        const now = new Date();
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        const hours = now.getHours() % 12 || 12;
        const mins = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${mins} ${ampm}`;
    }

    function getUserBiometrics() {
        let weight = 72.0;
        let height = 175;
        try {
            const profile = JSON.parse(localStorage.getItem('fitpulse_registration_profile'));
            if (profile) {
                if (profile.weight) weight = parseFloat(profile.weight) || 72.0;
                if (profile.height) height = parseFloat(profile.height) || 175;
            }
        } catch (e) {}
        const hM = height / 100;
        const bmi = (weight / (hM * hM)).toFixed(1);
        return { weight, height, bmi };
    }

    function updateStatusUI(statusTextEl, status, btnConnectEl, btnSyncEl, connectText) {
        if (!statusTextEl || !btnConnectEl) return;
        
        if (status === 'connected') {
            statusTextEl.innerHTML = `<span style="font-size:1rem; color:#22c55e;">●</span> Connected`;
            btnConnectEl.textContent = `Disconnect`;
            btnConnectEl.style.borderColor = 'rgba(239,68,68,0.5)';
            btnConnectEl.style.color = '#ef4444';
            if (btnSyncEl) btnSyncEl.disabled = false;
        } else if (status === 'syncing') {
            statusTextEl.innerHTML = `<span style="font-size:1rem; color:#f59e0b;">⟳</span> Connecting...`;
            btnConnectEl.textContent = `Connecting...`;
            if (btnSyncEl) btnSyncEl.disabled = true;
        } else {
            statusTextEl.innerHTML = `<span style="font-size:1rem; color:var(--text-muted);">○</span> Not Connected`;
            btnConnectEl.textContent = connectText;
            btnConnectEl.style.borderColor = '';
            btnConnectEl.style.color = '';
            if (btnSyncEl) btnSyncEl.disabled = true;
        }

        updateMiniBadge();
        syncBiometricsToDashboard();
    }

    function updateMiniBadge() {
        const miniBadge = document.getElementById('connectedDeviceMiniBadge');
        const miniBadgeTitle = document.getElementById('miniBadgeTitle');
        const miniBadgeIcon = document.getElementById('miniBadgeIcon');
        
        if (!miniBadge) return;

        let connectedDevices = [];
        if (deviceState.mobile && deviceState.mobile.connected) {
            connectedDevices.push({name: 'Mobile Device', icon: '<i class="fa-solid fa-mobile-screen"></i>'});
        }
        if (deviceState.smartwatch && deviceState.smartwatch.connected) {
            connectedDevices.push({name: 'Smartwatch', icon: '<i class="fa-solid fa-clock"></i>'});
        }
        if (deviceState.smartband && deviceState.smartband.connected) {
            connectedDevices.push({name: 'Smart Band', icon: '<i class="fa-solid fa-ring"></i>'});
        }
        if (deviceState.bluetooth && deviceState.bluetooth.connected) {
            const btName = (activeBluetoothDevice && activeBluetoothDevice.name) || deviceState.bluetooth.name || 'Bluetooth Device';
            connectedDevices.push({name: btName, icon: '<i class="fa-brands fa-bluetooth-b"></i>'});
        }

        if (connectedDevices.length > 0) {
            miniBadge.classList.remove('hidden');
            if (connectedDevices.length === 1) {
                if (miniBadgeTitle) miniBadgeTitle.textContent = connectedDevices[0].name + ' Connected';
                if (miniBadgeIcon) miniBadgeIcon.innerHTML = connectedDevices[0].icon;
            } else {
                if (miniBadgeTitle) miniBadgeTitle.textContent = connectedDevices.length + ' Devices Connected';
                if (miniBadgeIcon) miniBadgeIcon.innerHTML = '<i class="fa-solid fa-link"></i>';
            }
        } else {
            miniBadge.classList.add('hidden');
        }
    }

    function syncBiometricsToDashboard() {
        const bio = getUserBiometrics();
        
        const isAnyConnected = 
            (deviceState.mobile && deviceState.mobile.connected) ||
            (deviceState.smartwatch && deviceState.smartwatch.connected) ||
            (deviceState.smartband && deviceState.smartband.connected) ||
            (deviceState.bluetooth && deviceState.bluetooth.connected);

        if (isAnyConnected) {
            const dashSteps = document.getElementById('valSteps');
            const dashHR = document.getElementById('valHeartRate');
            const userStepsCount = document.getElementById('userStepsCount');
            const liveHRDisplay = document.getElementById('liveHRDisplay');

            if (dashSteps) dashSteps.textContent = '8,450';
            if (userStepsCount) userStepsCount.textContent = '8,450';
            if (dashHR) dashHR.textContent = '72';
            if (liveHRDisplay) liveHRDisplay.textContent = '72 BPM';

            const progValWeight = document.getElementById('progValWeight');
            const progValBMI = document.getElementById('progValBMI');
            const valWeight = document.getElementById('valWeight');
            const valBMI = document.getElementById('valBMI');
            const pccCurrentWeightVal = document.getElementById('pccCurrentWeightVal');
            const wtCurrentPill = document.getElementById('wtCurrentPill');

            if (progValWeight) progValWeight.textContent = bio.weight.toFixed(1);
            if (pccCurrentWeightVal) pccCurrentWeightVal.textContent = bio.weight.toFixed(1);
            if (valWeight) valWeight.textContent = bio.weight.toFixed(1);
            if (wtCurrentPill) wtCurrentPill.textContent = `${bio.weight.toFixed(1)} kg`;

            if (progValBMI) progValBMI.textContent = bio.bmi;
            if (valBMI) valBMI.textContent = bio.bmi;
        }
    }

    // ----------------------------------------------------
    // 1. Mobile Device
    // ----------------------------------------------------
    function initMobile() {
        if (deviceState.mobile && deviceState.mobile.connected) {
            updateStatusUI(mobileStatusText, 'connected', btnConnectMobile, btnSyncMobile, 'Connect');
            if (mobileLastSync) mobileLastSync.textContent = deviceState.mobile.syncTime || '--';
            if (mobileSteps) mobileSteps.textContent = '8,450';
            if (mobileCals) mobileCals.textContent = '210';
        }
    }

    if (btnConnectMobile) {
        btnConnectMobile.addEventListener('click', () => {
            if (deviceState.mobile && deviceState.mobile.connected) {
                deviceState.mobile.connected = false;
                saveState();
                updateStatusUI(mobileStatusText, 'disconnected', btnConnectMobile, btnSyncMobile, 'Connect');
                if (mobileSteps) mobileSteps.textContent = '--';
                if (mobileCals) mobileCals.textContent = '--';
            } else {
                updateStatusUI(mobileStatusText, 'syncing', btnConnectMobile, btnSyncMobile, 'Connect');
                setTimeout(() => {
                    deviceState.mobile.connected = true;
                    deviceState.mobile.syncTime = formatTime();
                    saveState();
                    updateStatusUI(mobileStatusText, 'connected', btnConnectMobile, btnSyncMobile, 'Connect');
                    if (mobileLastSync) mobileLastSync.textContent = deviceState.mobile.syncTime;
                    if (mobileSteps) mobileSteps.textContent = '8,450';
                    if (mobileCals) mobileCals.textContent = '210';
                }, 1000);
            }
        });
    }

    if (btnSyncMobile) {
        btnSyncMobile.addEventListener('click', () => {
            updateStatusUI(mobileStatusText, 'syncing', btnConnectMobile, btnSyncMobile, 'Connect');
            setTimeout(() => {
                deviceState.mobile.syncTime = formatTime();
                saveState();
                updateStatusUI(mobileStatusText, 'connected', btnConnectMobile, btnSyncMobile, 'Connect');
                if (mobileLastSync) mobileLastSync.textContent = deviceState.mobile.syncTime;
            }, 600);
        });
    }

    // ----------------------------------------------------
    // 2. Smartwatch
    // ----------------------------------------------------
    function initSmartwatch() {
        if (deviceState.smartwatch && deviceState.smartwatch.connected) {
            updateStatusUI(smartwatchStatusText, 'connected', btnConnectSmartwatch, btnSyncSmartwatch, 'Connect');
            if (smartwatchLastSync) smartwatchLastSync.textContent = deviceState.smartwatch.syncTime || '--';
            if (smartwatchHR) smartwatchHR.textContent = '72';
            if (smartwatchSteps) smartwatchSteps.textContent = '8,450';
            if (smartwatchCals) smartwatchCals.textContent = '340';
        }
    }

    if (btnConnectSmartwatch) {
        btnConnectSmartwatch.addEventListener('click', () => {
            if (deviceState.smartwatch && deviceState.smartwatch.connected) {
                deviceState.smartwatch.connected = false;
                saveState();
                updateStatusUI(smartwatchStatusText, 'disconnected', btnConnectSmartwatch, btnSyncSmartwatch, 'Connect');
                if (smartwatchHR) smartwatchHR.textContent = '--';
                if (smartwatchSteps) smartwatchSteps.textContent = '--';
                if (smartwatchCals) smartwatchCals.textContent = '--';
            } else {
                updateStatusUI(smartwatchStatusText, 'syncing', btnConnectSmartwatch, btnSyncSmartwatch, 'Connect');
                setTimeout(() => {
                    deviceState.smartwatch.connected = true;
                    deviceState.smartwatch.syncTime = formatTime();
                    saveState();
                    updateStatusUI(smartwatchStatusText, 'connected', btnConnectSmartwatch, btnSyncSmartwatch, 'Connect');
                    if (smartwatchLastSync) smartwatchLastSync.textContent = deviceState.smartwatch.syncTime;
                    if (smartwatchHR) smartwatchHR.textContent = '72';
                    if (smartwatchSteps) smartwatchSteps.textContent = '8,450';
                    if (smartwatchCals) smartwatchCals.textContent = '340';
                }, 1000);
            }
        });
    }

    if (btnSyncSmartwatch) {
        btnSyncSmartwatch.addEventListener('click', () => {
            updateStatusUI(smartwatchStatusText, 'syncing', btnConnectSmartwatch, btnSyncSmartwatch, 'Connect');
            setTimeout(() => {
                deviceState.smartwatch.syncTime = formatTime();
                saveState();
                updateStatusUI(smartwatchStatusText, 'connected', btnConnectSmartwatch, btnSyncSmartwatch, 'Connect');
                if (smartwatchLastSync) smartwatchLastSync.textContent = deviceState.smartwatch.syncTime;
            }, 600);
        });
    }

    // ----------------------------------------------------
    // 3. Smart Band
    // ----------------------------------------------------
    function initSmartband() {
        if (deviceState.smartband && deviceState.smartband.connected) {
            updateStatusUI(smartbandStatusText, 'connected', btnConnectSmartband, btnSyncSmartband, 'Connect');
            if (smartbandLastSync) smartbandLastSync.textContent = deviceState.smartband.syncTime || '--';
            if (smartbandHR) smartbandHR.textContent = '68';
            if (smartbandSteps) smartbandSteps.textContent = '8,450';
            if (smartbandSleep) smartbandSleep.textContent = '7.2';
        }
    }

    if (btnConnectSmartband) {
        btnConnectSmartband.addEventListener('click', () => {
            if (deviceState.smartband && deviceState.smartband.connected) {
                deviceState.smartband.connected = false;
                saveState();
                updateStatusUI(smartbandStatusText, 'disconnected', btnConnectSmartband, btnSyncSmartband, 'Connect');
                if (smartbandHR) smartbandHR.textContent = '--';
                if (smartbandSteps) smartbandSteps.textContent = '--';
                if (smartbandSleep) smartbandSleep.textContent = '--';
            } else {
                updateStatusUI(smartbandStatusText, 'syncing', btnConnectSmartband, btnSyncSmartband, 'Connect');
                setTimeout(() => {
                    deviceState.smartband.connected = true;
                    deviceState.smartband.syncTime = formatTime();
                    saveState();
                    updateStatusUI(smartbandStatusText, 'connected', btnConnectSmartband, btnSyncSmartband, 'Connect');
                    if (smartbandLastSync) smartbandLastSync.textContent = deviceState.smartband.syncTime;
                    if (smartbandHR) smartbandHR.textContent = '68';
                    if (smartbandSteps) smartbandSteps.textContent = '8,450';
                    if (smartbandSleep) smartbandSleep.textContent = '7.2';
                }, 1000);
            }
        });
    }

    if (btnSyncSmartband) {
        btnSyncSmartband.addEventListener('click', () => {
            updateStatusUI(smartbandStatusText, 'syncing', btnConnectSmartband, btnSyncSmartband, 'Connect');
            setTimeout(() => {
                deviceState.smartband.syncTime = formatTime();
                saveState();
                updateStatusUI(smartbandStatusText, 'connected', btnConnectSmartband, btnSyncSmartband, 'Connect');
                if (smartbandLastSync) smartbandLastSync.textContent = deviceState.smartband.syncTime;
            }, 600);
        });
    }

    // ----------------------------------------------------
    // 4. Bluetooth BLE (Scan & Pair Device)
    // ----------------------------------------------------
    function initBluetooth() {
        const bio = getUserBiometrics();
        if (deviceState.bluetooth && deviceState.bluetooth.connected) {
            updateStatusUI(btStatusText, 'connected', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');
            if (btDeviceName) btDeviceName.textContent = deviceState.bluetooth.name || 'Mobile Bluetooth Device';
            if (btLastSync) btLastSync.textContent = deviceState.bluetooth.syncTime || '--';
            if (btBattery) btBattery.textContent = '94%';
            if (btSteps) btSteps.textContent = '8,450';
            if (btBMI) btBMI.textContent = bio.bmi;
            if (btWeight) btWeight.textContent = bio.weight.toFixed(1);
        }
    }

    if (btnConnectBluetooth) {
        btnConnectBluetooth.addEventListener('click', async () => {
            const bio = getUserBiometrics();
            if (deviceState.bluetooth && deviceState.bluetooth.connected) {
                if (activeBluetoothDevice && activeBluetoothDevice.gatt.connected) {
                    activeBluetoothDevice.gatt.disconnect();
                }
                deviceState.bluetooth.connected = false;
                saveState();
                activeBluetoothDevice = null;
                updateStatusUI(btStatusText, 'disconnected', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');
                if (btDeviceName) btDeviceName.textContent = 'Bluetooth Device';
                if (btBattery) btBattery.textContent = '--';
                if (btSteps) btSteps.textContent = '--';
                if (btBMI) btBMI.textContent = '--';
                if (btWeight) btWeight.textContent = '--';
                return;
            }

            updateStatusUI(btStatusText, 'syncing', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');

            // 1. If Web Bluetooth available, trigger standard scan dialog
            if (navigator.bluetooth) {
                try {
                    const device = await navigator.bluetooth.requestDevice({
                        acceptAllDevices: true,
                        optionalServices: ['battery_service', 'heart_rate', '0x181D']
                    });

                    activeBluetoothDevice = device;
                    device.addEventListener('gattserverdisconnected', onBluetoothDisconnected);

                    const server = await device.gatt.connect();
                    const devName = device.name || 'Mobile Bluetooth Device';
                    if (btDeviceName) btDeviceName.textContent = devName;

                    deviceState.bluetooth.connected = true;
                    deviceState.bluetooth.name = devName;
                    deviceState.bluetooth.syncTime = formatTime();
                    saveState();

                    updateStatusUI(btStatusText, 'connected', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');
                    if (btLastSync) btLastSync.textContent = deviceState.bluetooth.syncTime;
                    if (btBattery) btBattery.textContent = '94%';
                    if (btSteps) btSteps.textContent = '8,450';
                    if (btBMI) btBMI.textContent = bio.bmi;
                    if (btWeight) btWeight.textContent = bio.weight.toFixed(1);
                    return;

                } catch (error) {
                    // Fallback to simple connect if scan cancelled or not paired
                }
            }

            // 2. Normal Connect mode
            setTimeout(() => {
                deviceState.bluetooth.connected = true;
                deviceState.bluetooth.name = 'Mobile Bluetooth Device';
                deviceState.bluetooth.syncTime = formatTime();
                saveState();

                if (btDeviceName) btDeviceName.textContent = deviceState.bluetooth.name;
                if (btLastSync) btLastSync.textContent = deviceState.bluetooth.syncTime;
                if (btBattery) btBattery.textContent = '94%';
                if (btSteps) btSteps.textContent = '8,450';
                if (btBMI) btBMI.textContent = bio.bmi;
                if (btWeight) btWeight.textContent = bio.weight.toFixed(1);

                updateStatusUI(btStatusText, 'connected', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');
            }, 800);
        });
    }

    if (btnSyncBluetooth) {
        btnSyncBluetooth.addEventListener('click', () => {
            updateStatusUI(btStatusText, 'syncing', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');
            setTimeout(() => {
                deviceState.bluetooth.syncTime = formatTime();
                saveState();
                updateStatusUI(btStatusText, 'connected', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');
                if (btLastSync) btLastSync.textContent = deviceState.bluetooth.syncTime;
            }, 600);
        });
    }

    function onBluetoothDisconnected() {
        activeBluetoothDevice = null;
        if (deviceState.bluetooth) deviceState.bluetooth.connected = false;
        saveState();
        updateStatusUI(btStatusText, 'disconnected', btnConnectBluetooth, btnSyncBluetooth, 'Scan / Connect');
        if (btDeviceName) btDeviceName.textContent = 'Bluetooth Device';
        if (btBattery) btBattery.textContent = '--';
        if (btSteps) btSteps.textContent = '--';
        if (btBMI) btBMI.textContent = '--';
        if (btWeight) btWeight.textContent = '--';
    }

    // Init state on load
    initMobile();
    initSmartwatch();
    initSmartband();
    initBluetooth();
});
