document.addEventListener("DOMContentLoaded", () => {

    let mode = null;
    let amount, day, month, year;

    // Expense variables array tracking order
    const expenseFields = [
        "gas", "electricity", "water", "rent", "phoneWifi", "cellphone",
        "website", "trash", "accountedFees", "tax", "salary", "repair",
        "supplies", "merchantFees", "other"
    ];

    // Label map for UI display
    const expenseLabels = {
        gas: "Gas", electricity: "Electricity", water: "Water", rent: "Rent",
        phoneWifi: "Phone+Wifi", cellphone: "Cellphone", website: "Website",
        trash: "Trash", accountedFees: "Accounted Fees", tax: "Tax",
        salary: "Salary for Workers", repair: "Repair", supplies: "Supplies",
        merchantFees: "Merchant Fees", other: "Other"
    };

    let expenseValues = {};
    let step = 0;

    const modeSelect = document.getElementById("modeSelect");
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

    submit.addEventListener("click", () => {

        if (!mode) {
            mode = modeSelect.value;
            if (!mode) return;

            modeSelect.style.display = "none";
            step = 0;

            if (mode === "earnings") {
                label.textContent = "Daily Wage Amount";
                showEarnings();
            } else {
                label.textContent = expenseLabels[expenseFields[0]];
                showBills();
            }
            return;
        }

        if (mode === "earnings") {
            if (step === 0) {
                amount = parseFloat(input.value);
                if (isNaN(amount)) return;
                input.value = "";
            } else if (step === 1) {
                day = Number(daySelect.value);
                if (!day) return;
            } else if (step === 2) {
                month = monthSelect.value;
                if (!month) return;
            } else if (step === 3) {
                year = parseInt(yearInput.value);
                if (isNaN(year)) return;
            }

            step++;

            if (step < 4) {
                updateEarningsUI();
                return;
            }
        }
        else { // EXPENSE MODE
            if (step < expenseFields.length) {
                let currentField = expenseFields[step];
                let val = parseFloat(input.value);
                if (isNaN(val)) return;
                expenseValues[currentField] = val;
                input.value = "";
            } else if (step === expenseFields.length) {
                month = monthSelect.value;
                if (!month) return;
            } else if (step === expenseFields.length + 1) {
                year = parseInt(yearInput.value);
                if (isNaN(year)) return;
            }

            step++;

            if (step < expenseFields.length + 2) {
                updateBillsUI();
                return;
            }
        }

        // CONFIRM SCREEN CALCULATIONS
        let totalBills = 0;
        if (mode === "expenses") {
            for (let key in expenseValues) {
                totalBills += expenseValues[key];
            }
        }

        let summary = `Mode: ${mode}\nMonth: ${month}\nYear: ${year}\n`;
        if (mode === "earnings") {
            summary += `Earnings: ${amount}`;
        } else {
            for (let key in expenseValues) {
                summary += `${expenseLabels[key]}: ${expenseValues[key]}\n`;
            }
        }

        confirmText.textContent = summary;
        input.style.display = "none";
        daySelect.style.display = "none";
        monthSelect.style.display = "none";
        yearInput.style.display = "none";
        confirmBox.style.display = "block";
    });

    confirmYes.addEventListener("click", () => {
        let totalBills = 0;
        if (mode === "expenses") {
            for (let key in expenseValues) {
                totalBills += expenseValues[key];
            }
        }

        // Fetch User-Isolated Profile Records Cache
        const activeUser = (localStorage.getItem("currentUser") || "guest").toLowerCase();
        const userStorageKey = `records_${activeUser}`;

        let records = JSON.parse(localStorage.getItem(userStorageKey)) || [];
        let index = records.findIndex(r => r.month === month && Number(r.year) === Number(year));

        let entry = {
            mode,
            earnings: mode === "earnings" ? amount : null,
            bills: mode === "expenses" ? { ...expenseValues } : null,
            day: mode === "earnings" ? day : null
        };

        if (index !== -1) {
            if (mode === "earnings") {
                records[index].totalCost += amount;
            } else {
                records[index].totalCost -= totalBills;
            }
            records[index].entries.push(entry);
        } else {
            records.push({
                month,
                year: Number(year),
                totalCost: mode === "earnings" ? amount : -totalBills,
                entries: [entry]
            });
        }

        // Double Write Sync Strategy (Saves into isolated slot and global working cache)
        localStorage.setItem(userStorageKey, JSON.stringify(records));
        localStorage.setItem("records", JSON.stringify(records));

        alert("Saved Successfully!");
        resetAll();
    });

    confirmNo.addEventListener("click", () => {
        confirmBox.style.display = "none";
        if (mode === "earnings") updateEarningsUI();
        else updateBillsUI();
    });

    function showEarnings() {
        input.style.display = "inline";
        daySelect.style.display = "none";
        monthSelect.style.display = "none";
        yearInput.style.display = "none";
    }

    function updateEarningsUI() {
        input.style.display = "none";
        daySelect.style.display = "none";
        monthSelect.style.display = "none";
        yearInput.style.display = "none";

        if (step === 1) daySelect.style.display = "inline";
        else if (step === 2) monthSelect.style.display = "inline";
        else if (step === 3) yearInput.style.display = "inline";

        label.textContent = ["Amount", "Day", "Month", "Year"][step];
    }

    function showBills() {
        input.style.display = "inline";
        daySelect.style.display = "none";
        monthSelect.style.display = "none";
        yearInput.style.display = "none";
    }

    function updateBillsUI() {
        input.style.display = "inline";
        monthSelect.style.display = "none";
        yearInput.style.display = "none";

        if (step < expenseFields.length) {
            label.textContent = expenseLabels[expenseFields[step]];
        } else if (step === expenseFields.length) {
            input.style.display = "none";
            monthSelect.style.display = "inline";
            label.textContent = "Month";
        } else if (step === expenseFields.length + 1) {
            input.style.display = "none";
            yearInput.style.display = "inline";
            label.textContent = "Year";
        }
    }

    function resetAll() {
        mode = null;
        step = 0;
        expenseValues = {};
        modeSelect.style.display = "inline";
        input.value = "";
        daySelect.value = "";
        monthSelect.value = "";
        yearInput.value = "";
        input.style.display = "none";
        daySelect.style.display = "none";
        monthSelect.style.display = "none";
        yearInput.style.display = "none";
        confirmBox.style.display = "none";
        label.textContent = "Select Type";
    }
});