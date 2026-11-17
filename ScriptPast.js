
document.addEventListener("DOMContentLoaded", () => {

    const expenseKeys = [
        "gas", "electricity", "water", "rent", "phoneWifi", "cellphone",
        "website", "trash", "accountedFees", "tax", "salary", "repair",
        "supplies", "merchantFees", "other"
    ];

    const expenseLabels = {
        gas: "Gas",
        electricity: "Electricity",
        water: "Water",
        rent: "Rent",
        phoneWifi: "Phone & Wifi",
        cellphone: "Cellphone",
        website: "Website",
        trash: "Trash",
        accountedFees: "Accounted Fees",
        tax: "Tax",
        salary: "Staff Salary",
        repair: "Repairs",
        supplies: "Supplies",
        merchantFees: "Merchant Fees",
        other: "Other"
    };

    const yearSelect = document.getElementById("yearSelect");
    const monthSelect = document.getElementById("monthSelect");
    const searchBtn = document.getElementById("searchBtn");

    const currentYear = new Date().getFullYear();

    for (let year = 2024; year <= currentYear + 5; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    function money(value) {
        return "$" + Number(value || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function display(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function resetDisplay() {
        expenseKeys.forEach(key => {
            display(`${key}Display`, money(0));
        });

        display("totalExpensesDisplay", money(0));

        display("earningsSummary", money(0));
        display("expensesSummary", money(0));
        display("balanceSummary", money(0));

        display("cashTotal", money(0));
        display("creditTotal", money(0));
        display("tipsTotal", money(0));
        display("dailyEarningsTotal", money(0));

        display("summaryCash", money(0));
        display("summaryCredit", money(0));
        display("summaryTips", money(0));
        display("summaryEarnings", money(0));
        display("summaryExpenses", money(0));
        display("finalBalance", money(0));

        document.getElementById("earningsTableBody").innerHTML = `
            <tr>
                <td colspan="5" class="empty-message">No income records found.</td>
            </tr>
        `;
    }

    function showNoData(message) {
        resetDisplay();
        display("monthYearDisplay", message);
    }

    function searchRecords() {
        const month = monthSelect.value;
        const year = Number(yearSelect.value);

        if (!month || !year) {
            alert("Please select both a month and a year.");
            return;
        }

        const activeUser = (localStorage.getItem("currentUser") || "guest").toLowerCase();
        const userStorageKey = `records_${activeUser}`;

        const records = JSON.parse(localStorage.getItem(userStorageKey)) || [];

        const match = records.find(record =>
            record.month === month && Number(record.year) === year
        );

        if (!match) {
            showNoData(`No records found for ${month} ${year}`);
            return;
        }

        display("monthYearDisplay", `${match.month} ${match.year}`);

        const expenseTotals = {};
        expenseKeys.forEach(key => {
            expenseTotals[key] = 0;
        });

        let totalExpenses = 0;

        let cashTotal = 0;
        let creditTotal = 0;
        let tipsTotal = 0;

        const dailyRecords = {};

        const entries = Array.isArray(match.entries) ? match.entries : [];

        entries.forEach(entry => {

            if (entry.mode === "expenses" && entry.bills) {

                expenseKeys.forEach(key => {
                    const amount = Number(entry.bills[key] || 0);

                    expenseTotals[key] += amount;
                    totalExpenses += amount;
                });

            } else if (entry.mode === "earnings") {

                let cashAmount;
                let creditAmount;
                let tipsAmount;

                // Older records stored only one earnings amount.
                // Display those historical amounts under Cash.
                if (entry.cash !== null && entry.cash !== undefined) {
                    cashAmount = Number(entry.cash || 0);
                    creditAmount = Number(entry.credit || 0);
                    tipsAmount = Number(entry.tips || 0);
                } else {
                    cashAmount = Number(entry.earnings || 0);
                    creditAmount = 0;
                    tipsAmount = 0;
                }

                const entryDay = Number(entry.day);

                if (!entryDay) return;

                if (!dailyRecords[entryDay]) {
                    dailyRecords[entryDay] = {
                        cash: 0,
                        credit: 0,
                        tips: 0
                    };
                }

                dailyRecords[entryDay].cash += cashAmount;
                dailyRecords[entryDay].credit += creditAmount;
                dailyRecords[entryDay].tips += tipsAmount;

                cashTotal += cashAmount;
                creditTotal += creditAmount;
                tipsTotal += tipsAmount;
            }
        });

        const totalEarnings = cashTotal + creditTotal + tipsTotal;
        const monthlyBalance = totalEarnings - totalExpenses;

        // Display expense totals by category.
        expenseKeys.forEach(key => {
            display(`${key}Display`, money(expenseTotals[key]));
        });

        display("totalExpensesDisplay", money(totalExpenses));

        // Display daily earnings spreadsheet.
        const tableBody = document.getElementById("earningsTableBody");
        tableBody.innerHTML = "";

        const days = Object.keys(dailyRecords)
            .map(Number)
            .sort((a, b) => a - b);

        if (days.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">No income records found.</td>
                </tr>
            `;
        } else {
            days.forEach(day => {
                const record = dailyRecords[day];

                const dailyTotal = record.cash + record.credit + record.tips;

                const row = document.createElement("tr");

                const values = [
                    `${month.slice(0, 3)} ${day}`,
                    money(record.cash),
                    money(record.credit),
                    money(record.tips),
                    money(dailyTotal)
                ];

                values.forEach(value => {
                    const cell = document.createElement("td");
                    cell.textContent = value;
                    row.appendChild(cell);
                });

                tableBody.appendChild(row);
            });
        }

        // Display spreadsheet totals.
        display("cashTotal", money(cashTotal));
        display("creditTotal", money(creditTotal));
        display("tipsTotal", money(tipsTotal));
        display("dailyEarningsTotal", money(totalEarnings));

        // Display top summary cards.
        display("earningsSummary", money(totalEarnings));
        display("expensesSummary", money(totalExpenses));
        display("balanceSummary", money(monthlyBalance));

        // Display monthly summary.
        display("summaryCash", money(cashTotal));
        display("summaryCredit", money(creditTotal));
        display("summaryTips", money(tipsTotal));
        display("summaryEarnings", money(totalEarnings));
        display("summaryExpenses", money(totalExpenses));
        display("finalBalance", money(monthlyBalance));

        const balanceElement = document.getElementById("finalBalance");
        const summaryBalanceElement = document.getElementById("balanceSummary");

        balanceElement.classList.remove("positive", "negative");
        summaryBalanceElement.classList.remove("positive", "negative");

        if (monthlyBalance >= 0) {
            balanceElement.classList.add("positive");
            summaryBalanceElement.classList.add("positive");
        } else {
            balanceElement.classList.add("negative");
            summaryBalanceElement.classList.add("negative");
        }
    }

    searchBtn.addEventListener("click", searchRecords);

});
