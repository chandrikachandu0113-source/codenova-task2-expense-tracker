
const form = document.getElementById("transactionForm");
const typeInput = document.getElementById("transactionType");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("transactionDate");
const descriptionInput = document.getElementById("description");
const message = document.getElementById("formMessage");
const saveButton = document.getElementById("saveButton");

const categoryOptions = {
    income: ["Salary", "Business", "Freelance", "Investment", "Other"],
    expense: [
        "Food", "Transport", "Shopping", "Bills",
        "Education", "Health", "Entertainment", "Other"
    ]
};

const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
});

dateInput.value = new Date().toLocaleDateString("en-CA");

function updateCategories() {
    categoryInput.replaceChildren();

    for (const category of categoryOptions[typeInput.value]) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryInput.appendChild(option);
    }
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = isError ? "error-message" : "success-message";
}

async function loadSummary() {
    const response = await fetch("/api/summary");
    if (!response.ok) throw new Error("Could not load the summary.");

    const summary = await response.json();

    document.getElementById("totalIncome").textContent =
        money.format(summary.total_income);
    document.getElementById("totalExpenses").textContent =
        money.format(summary.total_expenses);
    document.getElementById("netSavings").textContent =
        money.format(summary.net_savings);
}

async function loadTransactions() {
    const response = await fetch("/api/transactions");
    if (!response.ok) throw new Error("Could not load transactions.");

    const transactions = await response.json();
    const list = document.getElementById("transactionList");
    list.replaceChildren();

    document.getElementById("transactionCount").textContent =
        `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`;

    if (transactions.length === 0) {
        const row = list.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.className = "empty-state";
        cell.textContent = "No transactions yet. Add your first one above.";
        return;
    }

    for (const transaction of transactions) {
        const row = list.insertRow();

        const values = [
            transaction.transaction_date,
            transaction.transaction_type,
            transaction.category,
            transaction.description || "—",
            `${transaction.transaction_type === "income" ? "+" : "−"}${money.format(transaction.amount)}`
        ];

        values.forEach((value, index) => {
            const cell = row.insertCell();

            if (index === 1) {
                const badge = document.createElement("span");
                badge.className = `badge badge-${transaction.transaction_type}`;
                badge.textContent = value;
                cell.appendChild(badge);
            } else {
                cell.textContent = value;
            }
        });

        const actionCell = row.insertCell();
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteTransaction(transaction.id));
        actionCell.appendChild(deleteButton);
    }
}

async function refreshDashboard() {
    try {
        await Promise.all([loadSummary(), loadTransactions()]);
    } catch (error) {
        showMessage(error.message, true);
    }
}

typeInput.addEventListener("change", updateCategories);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const amount = Number(amountInput.value);
    const selectedDate = dateInput.value;

    // Client-side validation. The server independently validates every field.
    if (!Number.isFinite(amount) || amount <= 0) {
        showMessage("Enter an amount greater than zero.", true);
        return;
    }

    if (!selectedDate || selectedDate > new Date().toLocaleDateString("en-CA")) {
        showMessage("Choose a valid date that is not in the future.", true);
        return;
    }

    const payload = {
        transaction_type: typeInput.value,
        amount,
        category: categoryInput.value,
        transaction_date: selectedDate,
        description: descriptionInput.value.trim()
    };

    saveButton.disabled = true;

    try {
        const response = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not save transaction.");
        }

        form.reset();
        typeInput.value = "expense";
        updateCategories();
        dateInput.value = new Date().toLocaleDateString("en-CA");

        showMessage("Transaction saved successfully!");
        await refreshDashboard();
    } catch (error) {
        showMessage(error.message, true);
    } finally {
        saveButton.disabled = false;
    }
});

async function deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
        const response = await fetch(`/api/transactions/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not delete transaction.");
        }

        showMessage("Transaction deleted.");
        await refreshDashboard();
    } catch (error) {
        showMessage(error.message, true);
    }
}

updateCategories();
refreshDashboard();
