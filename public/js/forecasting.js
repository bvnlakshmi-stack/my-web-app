let currentChart = null;
let currentDomain = 'finance';
let currentTimeframe = '1Y';

// Baseline fallback data
let financeData = {
  currentSavings: 15420,
  monthlySavings: 820,
  targetGoal: 25000,
  projected1Y: 24800,
  growthPercentage: 61,
  trajectory6M: [15420, 16240, 17065, 17895, 18730, 19570],
  trajectory1Y: [15420, 16240, 17065, 17895, 18730, 19570, 20415, 21265, 22120, 22980, 23845, 24800],
  trajectory3Y: [15420, 19570, 24800, 31200, 38500, 46900]
};

let studyData = {
  weeklyHours: [2, 3.5, 4, 3, 5, 2.5, 4.5],
  focusScore: 78,
  examReadiness: '85%',
  taskCompletion: '92%',
  peakFocusWindow: '9:00 AM - 11:00 AM',
  burnoutRisk: 'Low (18%)'
};

let habitData = {
  overallRetentionRate: 84,
  habits: [
    { name: 'Exercise', score: 92 },
    { name: 'Sleep', score: 58 },
    { name: 'Reading', score: 86 },
    { name: 'Meal Prep', score: 48 }
  ]
};

// Initialize
async function initForecasting() {
  await fetchPredictions();
  renderChart();
}

// Fetch live prediction data from backend
async function fetchPredictions() {
  try {
    const resFin = await fetch('/api/predict/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSavings: 15420, monthlySavings: 820 })
    });
    const finRes = await resFin.json();
    if (finRes.success) financeData = finRes;

    const resStudy = await fetch('/api/predict/study');
    const stRes = await resStudy.json();
    if (stRes.success) studyData = stRes;

    const resHabits = await fetch('/api/predict/habits');
    const hbRes = await resHabits.json();
    if (hbRes.success) habitData = hbRes;

    // Update KPI Header Cards
    document.getElementById('kpiProjected1Y').textContent = `₹${(financeData.projected1Y || 24800).toLocaleString()}`;
    document.getElementById('kpiExamReadiness').textContent = studyData.examReadiness || '85%';
    document.getElementById('kpiHabitSurvival').textContent = `${habitData.overallRetentionRate || 84}%`;

  } catch (err) {
    console.log('Using baseline intelligent fallbacks:', err);
  }
}

// Switch domain tabs
function switchDomain(domain) {
  currentDomain = domain;
  
  // Update button active state
  document.getElementById('tabFinance').classList.toggle('active', domain === 'finance');
  document.getElementById('tabStudy').classList.toggle('active', domain === 'study');
  document.getElementById('tabHabits').classList.toggle('active', domain === 'habits');

  // Toggle controls visibility
  const timeControls = document.getElementById('timeframeControls');
  const simControls = document.getElementById('simulatorControls');
  const studyBox = document.getElementById('studyDetailsBox');

  if (domain === 'finance') {
    timeControls.style.display = 'flex';
    simControls.style.display = 'block';
    studyBox.style.display = 'none';
  } else if (domain === 'study') {
    timeControls.style.display = 'none';
    simControls.style.display = 'none';
    studyBox.style.display = 'block';
  } else {
    timeControls.style.display = 'none';
    simControls.style.display = 'none';
    studyBox.style.display = 'none';
  }

  renderChart();
}

// Change timeframe (6M, 1Y, 3Y)
function changeTimeframe(tf, btn) {
  currentTimeframe = tf;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderChart();
}

// Interactive Simulation Slider
function updateSimulation(val) {
  document.getElementById('simSliderVal').textContent = `₹${val} / mo`;
  const currentBase = 15420;
  const simulated1Y = Math.round(currentBase + (parseFloat(val) * 12 * 1.03));
  
  document.getElementById('statSimulated').textContent = `₹${simulated1Y.toLocaleString()}`;
  document.getElementById('kpiProjected1Y').textContent = `₹${simulated1Y.toLocaleString()}`;
  
  // Recalculate trajectory
  const step = (simulated1Y - currentBase) / 12;
  financeData.trajectory1Y = Array.from({ length: 12 }, (_, i) => Math.round(currentBase + step * (i + 1)));

  if (currentDomain === 'finance') {
    renderChart();
  }
}

// Render dynamic Chart.js
function renderChart() {
  const ctx = document.getElementById('predictChart').getContext('2d');
  if (currentChart) currentChart.destroy();

  if (currentDomain === 'finance') {
    let labels, dataPoints;
    if (currentTimeframe === '6M') {
      labels = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
      dataPoints = financeData.trajectory6M || [15420, 16240, 17065, 17895, 18730, 19570];
    } else if (currentTimeframe === '1Y') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      dataPoints = financeData.trajectory1Y || [15420, 16240, 17065, 17895, 18730, 19570, 20415, 21265, 22120, 22980, 23845, 24800];
    } else {
      labels = ['Year 0', '6 Months', 'Year 1', 'Year 1.5', 'Year 2', 'Year 3'];
      dataPoints = financeData.trajectory3Y || [15420, 19570, 24800, 31200, 38500, 46900];
    }

    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Projected Wealth Trajectory (₹)',
          data: dataPoints,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#064e3b',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });

  } else if (currentDomain === 'study') {
    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Study Hours Logged',
          data: studyData.weeklyHours || [2, 3.5, 4, 3, 5, 2.5, 4.5],
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }, {
          label: 'Target Retention Curve',
          data: [3, 3, 3.5, 3.5, 4, 3, 3],
          type: 'line',
          borderColor: '#8b5cf6',
          borderWidth: 2,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
      }
    });

  } else {
    // Habit Retention Radar
    currentChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Exercise', 'Sleep Hygiene', 'Daily Reading', 'Clean Nutrition', 'Deep Work Focus'],
        datasets: [{
          label: 'Habit Consistency Score',
          data: [92, 58, 86, 48, 82],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          pointBackgroundColor: '#064e3b',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: '#e2e8f0' },
            grid: { color: '#e2e8f0' },
            suggestedMin: 30,
            suggestedMax: 100,
            ticks: { font: { size: 9 }, stepSize: 20 }
          }
        }
      }
    });
  }
}

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', async function(e) {
  e.preventDefault();
  await fetch('/auth/logout');
  window.location.href = '/login.html';
});

initForecasting();