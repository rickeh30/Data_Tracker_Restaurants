let revExpChartInstance = null;
let profitChartInstance = null;
let pieChartInstance = null;

const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const expenseKeys = [
    "gas", "electricity", "water", "rent", "phoneWifi", "cellphone",
    "website", "trash", "accountedFees", "tax", "salary", "repair",
    "supplies", "merchantFees", "insurance", "other"
];

const expenseLabels = [
    "Gas", "Electricity", "Water", "Rent", "Phone+Wifi", "Cellphone",
    "Website", "Trash", "Accounted Fees", "Tax", "Salary", "Repair",
    "Supplies", "Merchant Fees", "Insurance", "Other"
];

const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144',
    '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'
];

function parseMonthToIndex(monthValue) {
    if (!monthValue) return -1;
    const s = String(monthValue).trim();
    return monthsFull.findIndex(m => m.toLowerCase() === s.toLowerCase());
}

function initChartDashboard() {
    const activeUser = (localStorage.getItem("currentUser") || "guest").toLowerCase();
    const userStorageKey = `records_${activeUser}`;

    const records = JSON.parse(localStorage.getItem(userStorageKey)) || [];
    const yearSelect = document.getElementById("yearSelect");
    const operationalYears = new Set();

    records.forEach(r => { if (r.year) operationalYears.add(Number(r.year)); });
    if (operationalYears.size === 0) operationalYears.add(new Date().getFullYear());

    const sortedYears = Array.from(operationalYears).sort((a, b) => b - a);

    yearSelect.innerHTML = "";
    sortedYears.forEach(year => {
        const opt = document.createElement("option");
        opt.value = year;
        opt.textContent = `${year} ▼`;
        yearSelect.appendChild(opt);
    });

    yearSelect.addEventListener("change", (e) => {
        processDashboardMetrics(e.target.value, records);
    });

    processDashboardMetrics(sortedYears[0], records);
}

function processDashboardMetrics(targetYear, financialRecords) {
    let monthlyEarnings = new Array(12).fill(0);
    let monthlyExpenses = new Array(12).fill(0);
    let monthlyProfit = new Array(12).fill(0);

    let categoryTotals = {};
    expenseKeys.forEach(key => categoryTotals[key] = 0);

    let totalYearlyRevenue = 0;
    let totalYearlyExpenses = 0;
    let activeMonthsCount = 0;

    financialRecords.forEach(record => {
        if (Number(record.year) !== Number(targetYear)) return;
        const mIdx = parseMonthToIndex(record.month);
        if (mIdx === -1) return;

        let monthlyRecExpenses = 0;
        let monthlyRecEarnings = 0;

        const innerEntries = record.entries || [];
        for (let e of innerEntries) {
            if (e.bills) {
                expenseKeys.forEach(key => {
                    let val = Number(e.bills[key] || 0);
                    monthlyRecExpenses += val;
                    categoryTotals[key] += val;
                });
            }
            if (e.earnings !== undefined) {
                monthlyRecEarnings += Number(e.earnings || 0);
            }
        }

        monthlyEarnings[mIdx] += monthlyRecEarnings;
        monthlyExpenses[mIdx] += monthlyRecExpenses;

        if (monthlyRecEarnings > 0 || monthlyRecExpenses > 0) {
            activeMonthsCount++;
        }

        monthlyProfit[mIdx] += (monthlyRecEarnings - monthlyRecExpenses);
        totalYearlyRevenue += monthlyRecEarnings;
        totalYearlyExpenses += monthlyRecExpenses;
    });

    let totalYearlyProfit = totalYearlyRevenue - totalYearlyExpenses;
    let profitMargin = totalYearlyRevenue > 0 ? ((totalYearlyProfit / totalYearlyRevenue) * 100).toFixed(1) : 0;

    // --- TRACK RUN RATE FORECASTS ---
    let predictedNextMonthExpenses = 0;
    let predictedNextMonthProfit = 0;
    if (activeMonthsCount > 0) {
        predictedNextMonthExpenses = totalYearlyExpenses / activeMonthsCount;
        predictedNextMonthProfit = totalYearlyProfit / activeMonthsCount;
    }

    // Populate Sidebar elements
    document.getElementById("summaryRevenue").textContent = `$${totalYearlyRevenue.toLocaleString()}`;
    document.getElementById("summaryExpenses").textContent = `$${totalYearlyExpenses.toLocaleString()}`;

    const profitEl = document.getElementById("summaryProfit");
    if(profitEl) {
        profitEl.textContent = `$${totalYearlyProfit.toLocaleString()}`;
        profitEl.className = totalYearlyProfit >= 0 ? "value text-success" : "value text-danger";
    }

    document.getElementById("summaryMargin").textContent = `${profitMargin}%`;
    document.getElementById("predictExpenses").textContent = `$${Math.round(predictedNextMonthExpenses).toLocaleString()}`;

    const predictProfitEl = document.getElementById("predictProfit");
    if (predictProfitEl) {
        predictProfitEl.textContent = `$${Math.round(predictedNextMonthProfit).toLocaleString()}`;
        predictProfitEl.className = predictedNextMonthProfit >= 0 ? "value text-success" : "value text-danger";
    }

    renderVisualCharts(monthlyEarnings, monthlyExpenses, monthlyProfit, categoryTotals, predictedNextMonthProfit);
}

function renderVisualCharts(earnings, expenses, profits, categoryTotals, predictedValue) {
    const ctxRevExp = document.getElementById('revExpChart').getContext('2d');
    const ctxProfit = document.getElementById('profitChart').getContext('2d');
    const ctxPie = document.getElementById('expensePieChart').getContext('2d');
    const listContainer = document.getElementById('expenseValueList');

    if (revExpChartInstance) revExpChartInstance.destroy();
    if (profitChartInstance) profitChartInstance.destroy();
    if (pieChartInstance) pieChartInstance.destroy();

    // 1. Revenue vs Expenses Timeline Bar Chart
    revExpChartInstance = new Chart(ctxRevExp, {
        type: 'bar',
        data: {
            labels: monthsFull,
            datasets: [
                { label: 'Revenue', data: earnings, backgroundColor: '#6366f1' },
                { label: 'Expenses', data: expenses, backgroundColor: '#f43f5e' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Net Profit Bar Chart with Appended Forecast Column
    const profitLabelsWithForecast = [...monthsFull, "Forecast"];
    const profitDataWithForecast = [...profits, predictedValue];
    const backgroundColorsWithForecast = profits.map(v => v >= 0 ? '#22c55e' : '#dc2626');
    backgroundColorsWithForecast.push('#6366f1'); // Highlights target forecast point in Indigo

    profitChartInstance = new Chart(ctxProfit, {
        type: 'bar',
        data: {
            labels: profitLabelsWithForecast,
            datasets: [{
                label: 'Net Profit ($)',
                data: profitDataWithForecast,
                backgroundColor: backgroundColorsWithForecast
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. Expense Breakdown Pie Chart
    const pieData = expenseKeys.map(key => categoryTotals[key]);

    pieChartInstance = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: expenseLabels,
            datasets: [{
                data: pieData,
                backgroundColor: chartColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    // 4. Generate Sidebar Breakdown List
    if(listContainer) {
        listContainer.innerHTML = "";
        expenseKeys.forEach((key, idx) => {
            const amount = categoryTotals[key];
            const row = document.createElement("div");
            row.className = "breakdown-row";
            row.innerHTML = `
                <div class="breakdown-label">
                    <span class="color-dot" style="background-color: ${chartColors[idx]};"></span>
                    <span>${expenseLabels[idx]}</span>
                </div>
                <div class="breakdown-amt">$${amount.toLocaleString()}</div>
            `;
            listContainer.appendChild(row);
        });
    }
}

document.addEventListener("DOMContentLoaded", initChartDashboard);