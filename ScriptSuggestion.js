document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");
    const returnInputsBtn = document.getElementById("returnInputsBtn");
    const inputFormPanel = document.getElementById("inputFormPanel");
    const inputSummaryView = document.getElementById("inputSummaryView");
    const itemsHistoryList = document.getElementById("itemsHistoryList");

    // Form Inputs
    const prodName = document.getElementById("prodName");
    const prodPrice = document.getElementById("prodPrice");
    const prodIngredients = document.getElementById("prodIngredients");
    const prodLabor = document.getElementById("prodLabor");

    // Summary View Elements
    const sumItemName = document.getElementById("sumItemName");
    const sumPrice = document.getElementById("sumPrice");
    const sumIngredients = document.getElementById("sumIngredients");
    const sumLabor = document.getElementById("sumLabor");

    // UI Outputs
    const valTotalCost = document.getElementById("valTotalCost");
    const valNetProfit = document.getElementById("valNetProfit");
    const valMargin = document.getElementById("valMargin");
    const valBadge = document.getElementById("valBadge");

    const pricingCard = document.getElementById("pricingCard");
    const pricingTitle = document.getElementById("pricingTitle");
    const valRecommendedPrice = document.getElementById("valRecommendedPrice");
    const pricingSubtext = document.getElementById("pricingSubtext");
    const valAdviceText = document.getElementById("valAdviceText");
    const narrativeBlock = document.getElementById("narrativeBlock");

    const currentUser = localStorage.getItem("currentUser") || "guest";
    const historyStorageKey = `testedItems_${currentUser.toLowerCase()}`;
    const userStorageKey = `records_${currentUser.toLowerCase()}`;

    const expenseKeys = [
        "gas", "electricity", "water", "rent", "phoneWifi", "cellphone",
        "website", "trash", "accountedFees", "tax", "salary", "repair",
        "supplies", "merchantFees", "other"
    ];

    renderTestedItemsList();

    function calculateItemMetrics(currentPrice, ingredients, labor) {
        const records = JSON.parse(localStorage.getItem(userStorageKey)) || [];
        let allocatedOverhead = 0;

        if (records.length > 0) {
            let grandTotalOverhead = 0;
            let activeRecordCount = 0;

            records.forEach(match => {
                const entries = match.entries || [];
                let monthOverhead = 0;
                entries.forEach(e => {
                    if (e.bills) {
                        expenseKeys.forEach(key => {
                            monthOverhead += Number(e.bills[key] || 0);
                        });
                    }
                });
                if (monthOverhead > 0) {
                    grandTotalOverhead += monthOverhead;
                    activeRecordCount++;
                }
            });

            if (activeRecordCount > 0) {
                const averageMonthlyOverhead = grandTotalOverhead / activeRecordCount;
                allocatedOverhead = averageMonthlyOverhead / 1000;
            }
        }

        const directCost = ingredients + labor;
        const totalTrueCost = directCost + allocatedOverhead;
        const netProfit = currentPrice - totalTrueCost;
        const currentMargin = currentPrice > 0 ? (netProfit / currentPrice) * 100 : 0;

        const idealTargetMargin = 35;
        let recommendedCustomerPrice = totalTrueCost / (1 - (idealTargetMargin / 100));

        let badgeClass = "badge-solid";
        let statusLabel = "Solid Performance";
        let borderHighlight = "#2563eb";

        if (netProfit <= 0) {
            badgeClass = "badge-unviable";
            statusLabel = "Unviable Item";
            borderHighlight = "#dc2626";
        } else if (currentMargin < 20) {
            badgeClass = "badge-weak";
            statusLabel = "Weak Margin";
            borderHighlight = "#d97706";
        } else if (currentMargin >= 40) {
            badgeClass = "badge-elite";
            statusLabel = "Elite Margin";
            borderHighlight = "#16a34a";
        }

        return {
            totalTrueCost, netProfit, currentMargin, recommendedCustomerPrice,
            badgeClass, statusLabel, borderHighlight, allocatedOverhead, directCost
        };
    }

    function executeAnalysis() {
        const name = prodName.value.trim() || "Selected Menu Item";
        const currentPrice = parseFloat(prodPrice.value) || 0;
        const ingredients = parseFloat(prodIngredients.value) || 0;
        const labor = parseFloat(prodLabor.value) || 0;

        if (currentPrice <= 0) {
            alert("Please enter a valid current selling price.");
            return;
        }

        const metrics = calculateItemMetrics(currentPrice, ingredients, labor);

        valTotalCost.textContent = `$${metrics.totalTrueCost.toFixed(2)}`;
        valNetProfit.textContent = `$${metrics.netProfit.toFixed(2)}`;
        valMargin.textContent = `${metrics.currentMargin.toFixed(1)}%`;

        pricingCard.style.borderColor = metrics.borderHighlight;
        narrativeBlock.style.borderLeftColor = metrics.borderHighlight;

        pricingTitle.textContent = "Pricing Assessment Status";
        valRecommendedPrice.textContent = metrics.netProfit > 0 ? "Keep Current Price" : `$${metrics.recommendedCustomerPrice.toFixed(2)}`;
        pricingSubtext.textContent = `Direct Input Costs: $${metrics.directCost.toFixed(2)} | Calculated Overhead allocation: $${metrics.allocatedOverhead.toFixed(2)}`;

        valAdviceText.innerHTML = `<strong>Data Tracking Analysis for ${name}:</strong><br>
        Your manual ingredient and labor inputs are $${metrics.directCost.toFixed(2)}. The tracking engine added $${metrics.allocatedOverhead.toFixed(2)} to account for shared backend operational bills.
        This brings your total true expense weight to <strong>$${metrics.totalTrueCost.toFixed(2)}</strong>, leaving a clear net profit return of <strong>$${metrics.netProfit.toFixed(2)}</strong> per transaction (${metrics.currentMargin.toFixed(1)}% profit margin).`;

        valBadge.textContent = metrics.statusLabel;
        valBadge.className = `list-badge ${metrics.badgeClass}`;

        sumItemName.textContent = name;
        sumPrice.textContent = `$${currentPrice.toFixed(2)}`;
        sumIngredients.textContent = `$${ingredients.toFixed(2)}`;
        sumLabor.textContent = `$${labor.toFixed(2)}`;

        inputFormPanel.style.display = "none";
        inputSummaryView.style.display = "flex";

        saveTestedItem(name, currentPrice, ingredients, labor);
    }

    submitBtn.addEventListener("click", executeAnalysis);

    // CLEARING DATA ON BACK/CLEAR BUTTON PRESS
    returnInputsBtn.addEventListener("click", () => {
        inputSummaryView.style.display = "none";
        inputFormPanel.style.display = "flex";

        // Reset top form variables
        prodName.value = "";
        prodPrice.value = "";
        prodIngredients.value = "";
        prodLabor.value = "";

        // Reset bottom output fields cleanly back to N/A/empty states
        valTotalCost.textContent = "--";
        valNetProfit.textContent = "--";
        valMargin.textContent = "--";
        valBadge.textContent = "Awaiting Data";
        valBadge.className = "list-badge";
        valBadge.style.backgroundColor = "#64748b";

        valRecommendedPrice.textContent = "--";
        pricingTitle.textContent = "Recommended Pricing Guidance";
        pricingSubtext.textContent = "";

        pricingCard.style.borderColor = "#e2e8f0";
        narrativeBlock.style.borderLeftColor = "#e2e8f0";
        valAdviceText.innerHTML = "Please execute an analysis request or select a saved item above to generate metrics summary breakdown panels.";
    });

    function saveTestedItem(name, rawPrice, rawIng, rawLab) {
        let items = JSON.parse(localStorage.getItem(historyStorageKey)) || [];
        const itemIndex = items.findIndex(item => item.name.toLowerCase() === name.toLowerCase());

        const itemPayload = {
            name,
            rawPrice: Number(rawPrice) || 0,
            rawIngredients: Number(rawIng) || 0,
            rawLabor: Number(rawLab) || 0
        };

        if (itemIndex > -1) {
            items[itemIndex] = itemPayload;
        } else {
            items.push(itemPayload);
        }

        localStorage.setItem(historyStorageKey, JSON.stringify(items));
        renderTestedItemsList();
    }

    function renderTestedItemsList() {
        itemsHistoryList.innerHTML = "";
        let items = JSON.parse(localStorage.getItem(historyStorageKey)) || [];

        if (items.length === 0) {
            itemsHistoryList.innerHTML = `<li style="color: #64748b; font-style: italic; text-align: center; background: none; border: none; cursor: default; padding: 24px 0;">No items tested yet</li>`;
            return;
        }

        items.forEach(item => {
            const metrics = calculateItemMetrics(item.rawPrice, item.rawIngredients, item.rawLabor);
            const li = document.createElement("li");
            li.setAttribute("data-name", item.name);
            li.setAttribute("data-price", item.rawPrice || 0);
            li.setAttribute("data-ingredients", item.rawIngredients || 0);
            li.setAttribute("data-labor", item.rawLabor || 0);

            const isUnviable = metrics.statusLabel === "Unviable Item" || metrics.currentMargin <= 0;
            const marginColor = isUnviable ? "#dc2626" : "#475569";

            li.innerHTML = `
                <div class="list-row-top">
                    <strong style="font-size: 14px; color: #0f172a;">${item.name}</strong>
                    <span class="list-badge ${metrics.badgeClass}">${metrics.statusLabel}</span>
                </div>
                <div class="list-row-bottom" style="margin-top: 6px;">
                    <span style="font-size: 12px; font-weight: 700; color: ${marginColor};">
                        Margin: ${metrics.currentMargin.toFixed(1)}%
                    </span>
                    <span style="font-size: 12px; font-weight: 700; color: #2563eb;">
                        Price: $${item.rawPrice.toFixed(2)}
                    </span>
                </div>
            `;

            li.addEventListener("click", function() {
                prodName.value = this.getAttribute("data-name");
                prodPrice.value = this.getAttribute("data-price");
                prodIngredients.value = this.getAttribute("data-ingredients");
                prodLabor.value = this.getAttribute("data-labor");
                executeAnalysis();
            });

            itemsHistoryList.appendChild(li);
        });
    }
});