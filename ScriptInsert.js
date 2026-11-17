
document.addEventListener("DOMContentLoaded", () => {

    let mode = null;
    let step = 0;

    let cash = 0;
    let credit = 0;
    let tips = 0;

    let day = null;
    let month = "";
    let year = null;

    let expenseValues = {};

    const expenseFields = [
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

    const modeSelect = document.getElementById("modeSelect");
    const modeGroup = document.getElementById("modeGroup");
    const input = document.getElementById("inputField");
    const daySelect = document.getElementById("daySelect");
    const monthSelect = document.getElementById("monthSelect");
    const yearInput = document.getElementById("yearInput");
    const label = document.getElementById("questionLabel");
    const submit = document.getElementById("submitBtn");

    const confirmBox = document.getElementById("confirmBox");
    const confirmText = document.getElementById("confirmText");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    const stepDisplay = document.getElementById("stepDisplay");

    const cashInput = document.getElementById("cashInput");
    const creditInput = document.getElementById("creditInput");
    const tipsInput = document.getElementById("tipsInput");

    const cashGroup = document.getElementById("cashGroup");
    const creditGroup = document.getElementById("creditGroup");
    const tipsGroup = document.getElementById("tipsGroup");

    const dayLabel = document.getElementById("dayLabel");
    const monthLabel = document.getElementById("monthLabel");
    const yearLabel = document.getElementById("yearLabel");

    for (let i = 1; i <= 31; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    function hideInputs() {
        input.style.display = "none";
        daySelect.style.display = "none";
        monthSelect.style.display = "none";
        yearInput.style.display = "none";

        cashGroup.style.display = "none";
        creditGroup.style.display = "none";
        tipsGroup.style.display = "none";

        dayLabel.style.display = "none";
        monthLabel.style.display = "none";
        yearLabel.style.display = "none";
    }

    function renderStep() {
        hideInputs();

        if (mode === "earnings") {
            const steps = [
                "Cash",
                "Credit",
                "Tips",
                "Day",
                "Month",
                "Year"
            ];

            stepDisplay.textContent = `Step ${step + 1} of 6`;
            label.textContent = steps[step];

            if (step === 0) {
                cashGroup.style.display = "block";
                cashInput.value = cash;
            } else if (step === 1) {
                creditGroup.style.display = "block";
                creditInput.value = credit;
            } else if (step === 2) {
                tipsGroup.style.display = "block";
                tipsInput.value = tips;
            } else if (step === 3) {
                dayLabel.style.display = "block";
                daySelect.style.display = "block";
                daySelect.value = day || "";
            } else if (step === 4) {
                monthLabel.style.display = "block";
                monthSelect.style.display = "block";
                monthSelect.value = month;
            } else if (step === 5) {
                yearLabel.style.display = "block";
                yearInput.style.display = "block";
                yearInput.value = year || "";
            }

        } else {
            const totalSteps = expenseFields.length + 2;

            stepDisplay.textContent = `Step ${step + 1} of ${totalSteps}`;

            if (step < expenseFields.length) {
                const key = expenseFields[step];

                label.textContent = expenseLabels[key];
                input.style.display = "block";
                input.value = expenseValues[key] ?? "";

            } else if (step === expenseFields.length) {
                label.textContent = "Month";
                monthLabel.style.display = "block";
                monthSelect.style.display = "block";
                monthSelect.value = month;

            } else {
                label.textContent = "Year";
                yearLabel.style.display = "block";
                yearInput.style.display = "block";
                yearInput.value = year || "";
            }
        }
    }

    function showConfirmation() {
        let summary = "";

        summary += `Category: ${mode === "earnings" ? "Daily Income" : "Monthly Expenses"}\n`;
        summary += `Month: ${month}\n`;
        summary += `Year: ${year}\n\n`;

        if (mode === "earnings") {
            const total = cash + credit + tips;

            summary += `Date: ${month} ${day}, ${year}\n`;
            summary += `Cash: $${cash.toFixed(2)}\n`;
            summary += `Credit: $${credit.toFixed(2)}\n`;
            summary += `Tips: $${tips.toFixed(2)}\n`;
            summary += "----------------------\n";
            summary += `Total Daily Earnings: $${total.toFixed(2)}`;

        } else {
            let total = 0;

            expenseFields.forEach(key => {
                const amount = Number(expenseValues[key] || 0);
                total += amount;
                summary += `${expenseLabels[key]}: $${amount.toFixed(2)}\n`;
            });

            summary += "----------------------\n";
            summary += `Total Expenses: $${total.toFixed(2)}`;
        }

        confirmText.textContent = summary;

        document.querySelector(".insert-container").style.display = "none";
        confirmBox.style.display = "block";
    }

    function validAmount(value) {
        return value.trim() !== "" &&
            Number.isFinite(Number(value)) &&
            Number(value) >= 0;
    }

    submit.addEventListener("click", () => {

        if (!mode) {
            mode = modeSelect.value;

            if (!mode) {
                alert("Please choose a category.");
                return;
            }

            modeGroup.style.display = "none";
            step = 0;
            renderStep();
            return;
        }

        if (mode === "earnings") {

            if (step === 0) {
                if (!validAmount(cashInput.value)) {
                    alert("Enter a valid cash amount.");
                    return;
                }
                cash = Number(cashInput.value);

            } else if (step === 1) {
                if (!validAmount(creditInput.value)) {
                    alert("Enter a valid credit amount.");
                    return;
                }
                credit = Number(creditInput.value);

            } else if (step === 2) {
                if (!validAmount(tipsInput.value)) {
                    alert("Enter a valid tips amount.");
                    return;
                }
                tips = Number(tipsInput.value);

            } else if (step === 3) {
                day = Number(daySelect.value);

                if (!day) {
                    alert("Please choose a day.");
                    return;
                }

            } else if (step === 4) {
                month = monthSelect.value;

                if (!month) {
                    alert("Please choose a month.");
                    return;
                }

            } else if (step === 5) {
                year = Number(yearInput.value);

                if (!Number.isInteger(year) || year < 1900 || year > 9999) {
                    alert("Enter a valid year.");
                    return;
                }
            }

            step++;

            if (step < 6) {
                renderStep();
            } else {
                showConfirmation();
            }

        } else {

            if (step < expenseFields.length) {
                const key = expenseFields[step];

                if (!validAmount(input.value)) {
                    alert("Enter a valid expense amount.");
                    return;
                }

                expenseValues[key] = Number(input.value);

            } else if (step === expenseFields.length) {
                month = monthSelect.value;

                if (!month) {
                    alert("Please choose a month.");
                    return;
                }

            } else {
                year = Number(yearInput.value);

                if (!Number.isInteger(year) || year < 1900 || year > 9999) {
                    alert("Enter a valid year.");
                    return;
                }
            }

            step++;

            if (step < expenseFields.length + 2) {
                renderStep();
            } else {
                showConfirmation();
            }
        }
    });

    confirmYes.addEventListener("click", () => {

        const activeUser = (localStorage.getItem("currentUser") || "guest").toLowerCase();
        const userStorageKey = `records_${activeUser}`;

        let records = JSON.parse(localStorage.getItem(userStorageKey)) || [];

        let index = records.findIndex(
            r => r.month === month && Number(r.year) === Number(year)
        );

        const totalEarnings = cash + credit + tips;

        let totalBills = 0;

        expenseFields.forEach(key => {
            totalBills += Number(expenseValues[key] || 0);
        });

        const entry = {
            mode: mode,
            earnings: mode === "earnings" ? totalEarnings : null,
            cash: mode === "earnings" ? cash : null,
            credit: mode === "earnings" ? credit : null,
            tips: mode === "earnings" ? tips : null,
            bills: mode === "expenses" ? { ...expenseValues } : null,
            day: mode === "earnings" ? day : null
        };

        if (index !== -1) {
            records[index].totalCost = Number(records[index].totalCost || 0);

            if (!Array.isArray(records[index].entries)) {
                records[index].entries = [];
            }

            if (mode === "earnings") {
                records[index].totalCost += totalEarnings;
            } else {
                records[index].totalCost -= totalBills;
            }

            records[index].entries.push(entry);

        } else {
            records.push({
                month: month,
                year: Number(year),
                totalCost: mode === "earnings" ? totalEarnings : -totalBills,
                entries: [entry]
            });
        }

        localStorage.setItem(userStorageKey, JSON.stringify(records));
        localStorage.setItem("records", JSON.stringify(records));

        alert("Record saved successfully!");

        resetAll();
    });

    confirmNo.addEventListener("click", () => {
        confirmBox.style.display = "none";
        document.querySelector(".insert-container").style.display = "block";

        step--;

        renderStep();
    });

    function resetAll() {
        mode = null;
        step = 0;

        cash = 0;
        credit = 0;
        tips = 0;

        day = null;
        month = "";
        year = null;

        expenseValues = {};

        cashInput.value = "";
        creditInput.value = "";
        tipsInput.value = "";
        input.value = "";

        daySelect.value = "";
        monthSelect.value = "";
        yearInput.value = "";

        hideInputs();

        modeSelect.value = "";
        modeGroup.style.display = "block";

        label.textContent = "Choose Category";
        stepDisplay.textContent = "Step 1: Choose a category";

        document.querySelector(".insert-container").style.display = "block";
        confirmBox.style.display = "none";
    }

    hideInputs();
});
