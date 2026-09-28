// FitPulse — Interactive Chart.js Analytics Suite

    // =========================================================================
    // 10. INTERACTIVE CHART.JS SUITE (DASHBOARD & PROFILE)
    // =========================================================================
    const dashboardChartDatasets = {
        workouts: {
            type: 'bar',
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Workout Volume (Mins)',
                data: [45, 60, 50, 75, 45, 90, 30],
                backgroundColor: 'rgba(139, 92, 246, 0.75)',
                borderColor: '#8b5cf6',
                borderWidth: 1.5,
                borderRadius: 8,
                hoverBackgroundColor: '#a78bfa'
            }]
        },
        calories: {
            type: 'line',
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Calories Burned (kcal)',
                data: [1950, 2300, 2100, 2650, 1840, 2800, 1750],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.38,
                pointRadius: 4,
                pointBackgroundColor: '#f59e0b'
            }]
        },
        weight: {
            type: 'line',
            labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8'],
            datasets: [{
                label: 'Body Weight (kg)',
                data: [74.8, 74.2, 73.9, 73.5, 73.1, 72.8, 72.5, 72.4],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#10b981'
            }]
        },
        bodyFat: {
            type: 'line',
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Body Fat %',
                    data: [15.2, 14.9, 14.7, 14.5, 14.4, 14.3, 14.2],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#f59e0b'
                },
                {
                    label: 'Muscle Mass (kg)',
                    data: [57.8, 58.0, 58.1, 58.3, 58.4, 58.5, 58.6],
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.15)',
                    borderWidth: 2.5,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#ec4899'
                }
            ]
        },
        waterSteps: {
            type: 'bar',
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Step Count (x100)',
                data: [82, 104, 96, 115, 84, 130, 75],
                backgroundColor: 'rgba(6, 182, 212, 0.75)',
                borderRadius: 6,
                borderColor: '#06b6d4'
            }]
        }
    };

    let currentTimeRange = '7d';

    function initOrUpdateChart() {
        const ctx = document.getElementById('mainFitnessChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const dataConfig = dashboardChartDatasets[currentChartType] || dashboardChartDatasets['workouts'];
        if (fitnessChartInstance) fitnessChartInstance.destroy();

        // Apply time range slice to dataset labels & data if needed
        let labels = [...dataConfig.labels];
        let datasets = dataConfig.datasets.map(ds => ({ ...ds, data: [...ds.data] }));

        if (currentTimeRange === '7d' && labels.length > 7) {
            labels = labels.slice(-7);
            datasets.forEach(ds => ds.data = ds.data.slice(-7));
        } else if (currentTimeRange === '30d' && labels.length > 30) {
            labels = labels.slice(-30);
            datasets.forEach(ds => ds.data = ds.data.slice(-30));
        }

        fitnessChartInstance = new Chart(ctx, {
            type: dataConfig.type,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#141628',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(139, 92, 246, 0.4)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { size: 11 } }
                    }
                }
            }
        });
    }

    // Dashboard Chart Tab Buttons
    document.querySelectorAll('.chart-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chart-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentChartType = btn.dataset.chart;
            initOrUpdateChart();
        });
    });

    // Time Range Filter Buttons
    document.querySelectorAll('.time-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTimeRange = btn.dataset.range;
            initOrUpdateChart();
            showToast(`Filter applied: ${btn.textContent}`, 'fa-filter');
        });
    });

    // ── Profile Charts Suite ────────────────────────────────────────────────
    const profileChartDatasets = {
        'prof-weight': {
            type: 'line',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
            datasets: [
                {
                    label: 'Actual Weight (kg)',
                    data: [75.2, 74.8, 74.3, 73.9, 73.4, 73.0, 72.6, 72.4],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 5,
                    pointBackgroundColor: '#8b5cf6'
                },
                {
                    label: 'Target Goal (kg)',
                    data: [75.0, 75.0, 75.0, 75.0, 75.0, 75.0, 75.0, 75.0],
                    borderColor: 'rgba(236, 72, 153, 0.65)',
                    borderDash: [6, 6],
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        'prof-bmi': {
            type: 'line',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
            datasets: [{
                label: 'BMI Trend (kg/m²)',
                data: [23.7, 23.6, 23.4, 23.3, 23.1, 23.0, 22.9, 22.8],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#10b981'
            }]
        },
        'prof-workouts': {
            type: 'bar',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
            datasets: [{
                label: 'Completed Workouts',
                data: [4, 5, 4, 6, 5, 5, 6, 5],
                backgroundColor: 'rgba(245, 158, 11, 0.75)',
                borderColor: '#f59e0b',
                borderWidth: 1.5,
                borderRadius: 8
            }]
        },
        'prof-calories': {
            type: 'line',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
            datasets: [{
                label: 'Active Calories Burned (kcal)',
                data: [14200, 15600, 14900, 16800, 15900, 17200, 17800, 18100],
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.12)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: '#ec4899'
            }]
        },
        'prof-water': {
            type: 'bar',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
            datasets: [{
                label: 'Avg Daily Hydration (Liters)',
                data: [2.2, 2.5, 2.7, 2.8, 3.0, 2.9, 3.1, 3.0],
                backgroundColor: 'rgba(6, 182, 212, 0.75)',
                borderColor: '#06b6d4',
                borderWidth: 1.5,
                borderRadius: 6
            }]
        }
    };

    function initOrUpdateProfileChart() {
        const ctx = document.getElementById('profileProgressChart');
        if (!ctx || typeof Chart === 'undefined') return;

        const dataConfig = profileChartDatasets[currentProfileChartType];
        if (profileChartInstance) profileChartInstance.destroy();

        profileChartInstance = new Chart(ctx, {
            type: dataConfig.type,
            data: {
                labels: dataConfig.labels,
                datasets: dataConfig.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#141628',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: 'rgba(139, 92, 246, 0.4)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b', font: { size: 11 } }
                    }
                }
            }
        });
    }

    // Profile Chart Tab Buttons
    document.querySelectorAll('.prof-chart-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.prof-chart-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentProfileChartType = btn.dataset.profChart;
            initOrUpdateProfileChart();
        });
    });

