
document.addEventListener("DOMContentLoaded", () => {

    const submitBtn = document.getElementById("submitBtn");
    const returnInputsBtn = document.getElementById("returnInputsBtn");
    const inputFormPanel = document.getElementById("inputFormPanel");
    const inputSummaryView = document.getElementById("inputSummaryView");
    const itemsHistoryList = document.getElementById("itemsHistoryList");

    const prodName = document.getElementById("prodName");
    const prodPrice = document.getElementById("prodPrice");
    const prodIngredients = document.getElementById("prodIngredients");
    const prodLabor = document.getElementById("prodLabor");

    const sumItemName = document.getElementById("sumItemName");
    const sumPrice = document.getElementById("sumPrice");
    const sumIngredients = document.getElementById("sumIngredients");
    const sumLabor = document.getElementById("sumLabor");

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

    const currentUser = (localStorage.getItem("currentUser") || "guest").toLowerCase();

    const historyStorageKey = `testedItems_${currentUser}`;
    const TARGET_MARGIN = 35;

    function readSavedItems() {
        try {
            const saved = JSON.parse(localStorage.getItem(historyStorageKey) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            console.error("Could not read saved items:", error);
            return [];
        }
    }

    function formatMoney(value) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(value);
    }

    function getNumber(input, label, allowZero) {

        const rawValue = input.value.trim();

        if (rawValue === "") {
            alert(`Please enter ${label}.`);
            input.focus();
            return null;
        }

        const value = Number(rawValue);

        if (
            !Number.isFinite(value) ||
            value < 0 ||
            (!allowZero && value === 0)
        ) {
            alert(`Please enter a valid ${label}.`);
            input.focus();
            return null;
        }

        return value;
    }

    function calculateItemMetrics(currentPrice, ingredients, labor) {

        const totalCost = ingredients + labor;

        const profit = currentPrice - totalCost;

        const margin = (profit / currentPrice) * 100;

        const recommendedPrice = totalCost / (1 - TARGET_MARGIN / 100);

        let badgeClass = "badge-solid";
        let statusLabel = "On Target";
        let borderHighlight = "#2563eb";

        if (profit <= 0) {

            badgeClass = "badge-unviable";
            statusLabel = "Losing Money";
            borderHighlight = "#dc2626";

        } else if (margin < 20) {

            badgeClass = "badge-weak";
            statusLabel = "Weak Margin";
            borderHighlight = "#d97706";

        } else if (margin < TARGET_MARGIN) {

            badgeClass = "badge-improve";
            statusLabel = "Needs Improvement";
            borderHighlight = "#64748b";

        } else if (margin >= 40) {

            badgeClass = "badge-elite";
            statusLabel = "Strong Margin";
            borderHighlight = "#16a34a";
        }

        return {
            totalCost,
            profit,
            margin,
            recommendedPrice,
            badgeClass,
            statusLabel,
            borderHighlight
        };
    }

    function executeAnalysis() {

        const name = prodName.value.trim() || "Selected Menu Item";

        const currentPrice = getNumber(
            prodPrice,
            "a selling price greater than $0",
            false
        );

        if (currentPrice === null) return;

        const ingredients = getNumber(
            prodIngredients,
            "an ingredient cost (zero is allowed)",
            true
        );

        if (ingredients === null) return;

        const labor = getNumber(
            prodLabor,
            "a labor cost (zero is allowed)",
            true
        );

        if (labor === null) return;

        const metrics = calculateItemMetrics(
            currentPrice,
            ingredients,
            labor
        );

        valTotalCost.textContent = formatMoney(metrics.totalCost);

        valNetProfit.textContent = formatMoney(metrics.profit);

        valMargin.textContent = `${metrics.margin.toFixed(1)}%`;

        pricingCard.style.borderColor = metrics.borderHighlight;

        narrativeBlock.style.borderLeftColor = metrics.borderHighlight;

        pricingTitle.textContent = `Price for a ${TARGET_MARGIN}% Profit Margin`;

        if (metrics.margin >= TARGET_MARGIN) {

            valRecommendedPrice.textContent = `Keep ${formatMoney(currentPrice)}`;

            pricingSubtext.textContent =
                `Your current margin is ${metrics.margin.toFixed(1)}%, which meets the ${TARGET_MARGIN}% target before overhead.`;

        } else {

            valRecommendedPrice.textContent = formatMoney(metrics.recommendedPrice);

            pricingSubtext.textContent =
                `Estimated selling price needed to reach a ${TARGET_MARGIN}% margin before overhead.`;
        }

        valBadge.textContent = metrics.statusLabel;

        valBadge.className = `list-badge ${metrics.badgeClass}`;

        sumItemName.textContent = name;

        sumPrice.textContent = formatMoney(currentPrice);

        sumIngredients.textContent = formatMoney(ingredients);

        sumLabor.textContent = formatMoney(labor);

        valAdviceText.textContent = buildAdviceText(
            name,
            metrics,
            currentPrice
        );

        inputFormPanel.style.display = "none";

        inputSummaryView.style.display = "flex";

        saveTestedItem(
            name,
            currentPrice,
            ingredients,
            labor
        );
    }

    function buildAdviceText(name, metrics, currentPrice) {

        let advice = `${name}: your ingredient cost is ${formatMoney(metrics.totalCost - getCurrentLabor())} and your labor cost is ${formatMoney(getCurrentLabor())}. `;

        advice += `Your combined direct cost is ${formatMoney(metrics.totalCost)} per item. `;

        advice += `At your current selling price of ${formatMoney(currentPrice)}, your estimated profit before overhead is ${formatMoney(metrics.profit)} per item. `;

        advice += `Your profit margin before overhead is ${metrics.margin.toFixed(1)}%. `;

        if (metrics.margin >= TARGET_MARGIN) {

            advice += `Your current price meets the ${TARGET_MARGIN}% target based on ingredient and labor costs.`;

        } else {

            advice += `To reach a ${TARGET_MARGIN}% profit margin before overhead, the estimated selling price is ${formatMoney(metrics.recommendedPrice)}.`;
        }

        advice += " ";

        advice += "Important: this calculation does not include rent, utilities, taxes, supplies, or other shared business expenses. Actual profit after all expenses will be lower. The suggested price is a starting point, not a guarantee of sales.";

        return advice;
    }

    function getCurrentLabor() {
        return Number(prodLabor.value) || 0;
    }

    function saveTestedItem(name, rawPrice, rawIngredients, rawLabor) {

        const items = readSavedItems();

        const itemIndex = items.findIndex(item =>
            item &&
            typeof item.name === "string" &&
            item.name.toLowerCase() === name.toLowerCase()
        );

        const itemPayload = {
            name,
            rawPrice,
            rawIngredients,
            rawLabor
        };

        if (itemIndex >= 0) {

            items[itemIndex] = itemPayload;

        } else {

            items.push(itemPayload);
        }

        try {

            localStorage.setItem(
                historyStorageKey,
                JSON.stringify(items)
            );

        } catch (error) {

            console.error("Could not save tested item:", error);

            alert("The analysis worked, but this item could not be saved.");
        }

        renderTestedItemsList();
    }

    function renderTestedItemsList() {

        itemsHistoryList.replaceChildren();

        const items = readSavedItems();

        if (items.length === 0) {

            const emptyItem = document.createElement("li");

            emptyItem.textContent = "No items tested yet";

            emptyItem.style.cssText =
                "color:#64748b;font-style:italic;text-align:center;background:none;border:none;cursor:default;padding:24px 0;";

            itemsHistoryList.appendChild(emptyItem);

            return;
        }

        items.forEach(item => {

            if (!item || typeof item.name !== "string") return;

            const price = Number(item.rawPrice);
            const ingredients = Number(item.rawIngredients);
            const labor = Number(item.rawLabor);

            if (
                !Number.isFinite(price) ||
                price <= 0 ||
                !Number.isFinite(ingredients) ||
                ingredients < 0 ||
                !Number.isFinite(labor) ||
                labor < 0
            ) {
                return;
            }

            const metrics = calculateItemMetrics(
                price,
                ingredients,
                labor
            );

            const li = document.createElement("li");

            const top = document.createElement("div");
            top.className = "list-row-top";

            const itemName = document.createElement("strong");

            itemName.style.cssText =
                "font-size:14px;color:#0f172a;";

            itemName.textContent = item.name;

            const badge = document.createElement("span");

            badge.className = `list-badge ${metrics.badgeClass}`;

            badge.textContent = metrics.statusLabel;

            top.append(itemName, badge);

            const bottom = document.createElement("div");

            bottom.className = "list-row-bottom";

            bottom.style.marginTop = "6px";

            const margin = document.createElement("span");

            margin.style.cssText =
                "font-size:12px;font-weight:700;color:#475569;";

            margin.textContent = `Margin: ${metrics.margin.toFixed(1)}%`;

            const itemPrice = document.createElement("span");

            itemPrice.style.cssText =
                "font-size:12px;font-weight:700;color:#2563eb;";

            itemPrice.textContent = `Price: ${formatMoney(price)}`;

            bottom.append(margin, itemPrice);

            li.append(top, bottom);

            li.addEventListener("click", () => {

                prodName.value = item.name;

                prodPrice.value = price;

                prodIngredients.value = ingredients;

                prodLabor.value = labor;

                inputSummaryView.style.display = "none";

                inputFormPanel.style.display = "flex";

                executeAnalysis();
            });

            itemsHistoryList.appendChild(li);
        });
    }

    function resetAnalysisView() {

        inputSummaryView.style.display = "none";

        inputFormPanel.style.display = "flex";

        prodName.value = "";
        prodPrice.value = "";
        prodIngredients.value = "";
        prodLabor.value = "";

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

        valAdviceText.textContent =
            "Enter an item's costs and selling price to generate a pricing assessment.";
    }

    submitBtn.addEventListener("click", executeAnalysis);

    returnInputsBtn.addEventListener("click", resetAnalysisView);

    renderTestedItemsList();

});
