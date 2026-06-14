// State Manager Tracking Active Mode
let isLoginMode = true;

// Shared keys schema based on your search script requirements
const appExpenseKeys = [
    "gas", "electricity", "water", "rent", "phoneWifi", "cellphone",
    "website", "trash", "accountedFees", "tax", "salary", "repair",
    "supplies", "merchantFees", "other"
];

/**
 * Toggles the screen state dynamically between Login and Account Creation modes
 */
function toggleAuthMode() {
    isLoginMode = !isLoginMode;

    const titleEl = document.getElementById("viewHeading") || document.getElementById("authTitle");
    const submitBtnEl = document.getElementById("actionBtn") || document.getElementById("authSubmitBtn");
    const toggleTextEl = document.getElementById("switchContextText") || document.getElementById("toggleText");
    const toggleBtnEl = document.getElementById("uiToggleBtn") || document.getElementById("toggleAuthModeBtn");
    const confirmWrapper = document.getElementById("confirmPasswordWrapper");
    const confirmField = document.getElementById("confirmPasswordField");

    if (isLoginMode) {
        if(titleEl) titleEl.textContent = "Welcome Back";
        if(submitBtnEl) submitBtnEl.textContent = "Login";
        if(toggleTextEl) toggleTextEl.textContent = "Don't have an account?";
        if(toggleBtnEl) toggleBtnEl.textContent = "Create Account";
        if(confirmWrapper) confirmWrapper.style.display = "none";
        if(confirmField) confirmField.required = false;
    } else {
        if(titleEl) titleEl.textContent = "Create Account";
        if(submitBtnEl) submitBtnEl.textContent = "Sign Up";
        if(toggleTextEl) toggleTextEl.textContent = "Already registered?";
        if(toggleBtnEl) toggleBtnEl.textContent = "Login Screen";
        if(confirmWrapper) confirmWrapper.style.display = "flex";
        if(confirmField) confirmField.required = true;
    }
}

/**
 * Handles account creation and login processing
 */
function handleAuthSubmit(event) {
    event.preventDefault();

    const usernameRaw = (document.getElementById("usernameField") || document.getElementById("authUsername")).value.trim();
    const usernameInput = usernameRaw.toLowerCase();
    const passwordInput = (document.getElementById("passwordField") || document.getElementById("authPassword")).value;
    const confirmField = document.getElementById("confirmPasswordField");

    if (!usernameInput || !passwordInput) {
        alert("Please enter a valid username and password.");
        return;
    }

    // Pull current system users profile cache or create one
    let users = JSON.parse(localStorage.getItem("appUsers")) || [];

    if (!isLoginMode) {
        // --- CREATE ACCOUNT ACTIONS ---
        if (confirmField && passwordInput !== confirmField.value) {
            alert("Passwords do not match!");
            return;
        }

        const userExists = users.some(user => user.username === usernameInput);

        if (userExists) {
            alert("This username is already taken!");
            return;
        }

        // Add new user profile reference
        users.push({ username: usernameInput, password: passwordInput });
        localStorage.setItem("appUsers", JSON.stringify(users));

        // Format initialization: structure independent tracking slots exclusively for this user profile instance
        const userStorageKey = `records_${usernameInput}`;
        let currentRecords = JSON.parse(localStorage.getItem(userStorageKey)) || [];

        if (currentRecords.length === 0) {
            let initialBlankRecord = {
                month: "January",
                year: new Date().getFullYear(),
                totalCost: 0,
                entries: [{ bills: {} }]
            };

            appExpenseKeys.forEach(key => {
                initialBlankRecord.entries[0].bills[key] = 0;
            });

            currentRecords.push(initialBlankRecord);
            localStorage.setItem(userStorageKey, JSON.stringify(currentRecords));
        }

        alert("Account created successfully! Shifting view to login.");
        toggleAuthMode();

    } else {
        // --- LOGIN ACTIONS ---
        const matchedUser = users.find(user => user.username === usernameInput && user.password === passwordInput);

        if (!matchedUser) {
            alert("Invalid username or password mismatch.");
            return;
        }

        // Lock Active Session Context
        localStorage.setItem("currentUser", usernameRaw);

        const userStorageKey = `records_${usernameInput}`;
        let currentRecords = JSON.parse(localStorage.getItem(userStorageKey)) || [];

        if (currentRecords.length === 0) {
            let cleanRecord = [{
                month: "January",
                year: new Date().getFullYear(),
                totalCost: 0,
                entries: [{ bills: {} }]
            }];
            appExpenseKeys.forEach(key => cleanRecord[0].entries[0].bills[key] = 0);

            localStorage.setItem(userStorageKey, JSON.stringify(cleanRecord));
            localStorage.setItem("records", JSON.stringify(cleanRecord));
        } else {
            // Unpack unique array variables into active runtime cache
            localStorage.setItem("records", JSON.stringify(currentRecords));
        }

        alert(`Access Authorized. Welcome back, ${usernameRaw}!`);
        window.location.href = "website.html";
    }
}

// Global scope attachment wrappers to maintain connectivity to form submit elements
document.addEventListener("DOMContentLoaded", () => {
    const formElement = document.getElementById("portalAuthForm");
    if(formElement) formElement.addEventListener("submit", handleAuthSubmit);

    const toggleBtnElement = document.getElementById("uiToggleBtn") || document.getElementById("toggleAuthModeBtn");
    if(toggleBtnElement) toggleBtnElement.addEventListener("click", toggleAuthMode);
});