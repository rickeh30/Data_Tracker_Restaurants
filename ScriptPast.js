document.getElementById("searchBtn").addEventListener("click", () => {

    // Target isolated key array structure
    const activeUser = (localStorage.getItem("currentUser") || "guest").toLowerCase();
    const userStorageKey = `records_${activeUser}`;

    const records = JSON.parse(localStorage.getItem(userStorageKey)) || [];
    const month = document.getElementById("monthSelect").value;
    const year = Number(document.getElementById("yearSelect").value);

    const match = records.find(r => r.month === month && Number(r.year) === year);

    const display = (id, value) => {
        let el = document.getElementById(id);
        if(el) el.textContent = value;
    };

    const expenseKeys = [
        "gas", "electricity", "water", "rent", "phoneWifi", "cellphone",
        "website", "trash", "accountedFees", "tax", "salary", "repair",
        "supplies", "merchantFees", "other"
    ];

    if (!match) {
        document.getElementById("monthYearDisplay").textContent = "No data found";
        expenseKeys.forEach(key => display(`${key}Display`, 0));
        display("totalDisplay", 0);
        return;
    }

    document.getElementById("monthYearDisplay").textContent = `${match.month} ${match.year}`;

    // Initialize all totals to 0
    let totals = {};
    expenseKeys.forEach(key => totals[key] = 0);

    let total = match.totalCost ?? 0;
    const entries = match.entries || [];

    for (let e of entries) {
        if (e.bills) {
            expenseKeys.forEach(key => {
                totals[key] += Number(e.bills[key] || 0);
            });
        }
    }

    // Push calculations to Document elements
    expenseKeys.forEach(key => {
        display(`${key}Display`, totals[key]);
    });

    display("totalDisplay", total);
});