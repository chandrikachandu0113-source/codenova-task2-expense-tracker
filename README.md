# CodeNova Task 2 — Expense Tracker

A beginner-friendly full-stack Expense Tracker built using Python, Flask, SQLite, HTML, CSS, and JavaScript.

## Features

- Add income and expense transactions.
- Organize transactions by category.
- View total income, total expenses, and net savings.
- Browse transaction history.
- Delete transactions.
- Validate transaction data on both the frontend and backend.
- Reject zero, negative, non-finite, invalid-date, and future-date amounts or dates as appropriate.
- Store transactions persistently in SQLite.
- Responsive dashboard for desktop and mobile screens.

## Technology Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** Python and Flask REST API
- **Database:** SQLite
- **Tools:** Visual Studio Code, PowerShell, Git

## Project Structure

```text
CodeNova_Task2_Expense_Tracker/
├── app.py
├── database.py
├── requirements.txt
├── expenses.db
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## Setup and Run

### 1. Install Python

Install Python 3.12 or a compatible Python version.

### 2. Open the project folder

Open this folder in VS Code and open a PowerShell terminal.

### 3. Create a virtual environment

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 5. Initialize the database

```powershell
python database.py
```

The application creates the SQLite database and transaction table if they do not already exist. Keep your existing `expenses.db` file when you want to preserve existing transactions.

### 6. Start the application

```powershell
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## API Contract

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/transactions` | Retrieve saved transactions |
| POST | `/api/transactions` | Create a transaction |
| DELETE | `/api/transactions/<id>` | Delete a transaction |
| GET | `/api/summary` | Retrieve income, expenses, and net savings |

### Example transaction request

```json
{
  "transaction_type": "expense",
  "amount": 250,
  "category": "Food",
  "transaction_date": "2026-10-26",
  "description": "Lunch"
}
```

### Summary calculation

- **Total Income:** Sum of all income transactions.
- **Total Expenses:** Sum of all expense transactions.
- **Net Savings:** Total income minus total expenses.

Invalid requests return an HTTP 400 response with an error message. A successful transaction creation returns the saved transaction.

## Database Model

The SQLite `transactions` table stores:

| Field | Description |
|---|---|
| `id` | Auto-incrementing primary key |
| `transaction_type` | `income` or `expense` |
| `amount` | Positive transaction amount |
| `category` | Transaction category |
| `transaction_date` | Transaction date in `YYYY-MM-DD` format |
| `description` | Optional description |
| `created_at` | Record creation timestamp |

The database enforces valid transaction types and positive amounts. The backend performs additional validation for amounts, categories, dates, and descriptions.

## Validation and Testing

The following tests have been performed:

- Added an expense through the dashboard.
- Verified transaction retrieval through the REST API.
- Verified that a zero amount is rejected with HTTP 400.
- Verified that a future transaction date is rejected with HTTP 400.
- Verified the summary totals against the saved transaction.
- Restarted the Flask server and confirmed the saved transaction remained available.

## Current Test Example

With one saved Food expense of ₹250:

- Total Income: ₹0
- Total Expenses: ₹250
- Net Savings: −₹250

## Screenshots

Add screenshots of the running dashboard and transaction history before submitting the repository.

## Author

Created as part of the CodeNova Full Stack Development Internship — Batch 01.
