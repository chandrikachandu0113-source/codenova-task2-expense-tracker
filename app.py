
from datetime import date
from flask import Flask, jsonify, render_template, request
from database import get_connection, initialize_database

app = Flask(__name__)

# Allowed transaction categories
CATEGORIES = {
    "income": ["Salary", "Business", "Freelance", "Investment", "Other"],
    "expense": [
        "Food", "Transport", "Shopping", "Bills",
        "Education", "Health", "Entertainment", "Other"
    ]
}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    with get_connection() as connection:
        rows = connection.execute("""
            SELECT id, transaction_type, amount, category,
                   transaction_date, description
            FROM transactions
            ORDER BY transaction_date DESC, id DESC
        """).fetchall()

    return jsonify([dict(row) for row in rows])


@app.route("/api/transactions", methods=["POST"])
def add_transaction():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send valid JSON data."}), 400

    transaction_type = data.get("transaction_type")
    amount = data.get("amount")
    category = data.get("category")
    transaction_date = data.get("transaction_date")
    description = data.get("description", "")

    if transaction_type not in CATEGORIES:
        return jsonify({"error": "Type must be income or expense."}), 400

    if isinstance(amount, bool) or not isinstance(amount, (int, float)):
        return jsonify({"error": "Amount must be a number."}), 400

    if amount <= 0 or amount != amount or amount == float("inf"):
        return jsonify({"error": "Amount must be a positive, finite number."}), 400

    if amount == float("-inf"):
        return jsonify({"error": "Amount must be a positive, finite number."}), 400

    if not isinstance(category, str) or category not in CATEGORIES[transaction_type]:
        return jsonify({"error": "Choose a valid category for this transaction type."}), 400

    if not isinstance(transaction_date, str):
        return jsonify({"error": "A valid transaction date is required."}), 400

    
    try:
        parsed_date = date.fromisoformat(transaction_date)

        if parsed_date.isoformat() != transaction_date:
            raise ValueError

        if parsed_date > date.today():
            return jsonify({
                "error": "Transaction date cannot be in the future."
            }), 400

    except ValueError:
        return jsonify({
            "error": "Enter a valid date in YYYY-MM-DD format."
        }), 400


    if not isinstance(description, str):
        return jsonify({"error": "Description must be text."}), 400

    description = description.strip()

    if len(description) > 200:
        return jsonify({"error": "Description must be 200 characters or fewer."}), 400

    with get_connection() as connection:
        cursor = connection.execute("""
            INSERT INTO transactions
                (transaction_type, amount, category,
                 transaction_date, description)
            VALUES (?, ?, ?, ?, ?)
        """, (
            transaction_type,
            amount,
            category,
            transaction_date,
            description
        ))

        transaction_id = cursor.lastrowid

        row = connection.execute("""
            SELECT id, transaction_type, amount, category,
                   transaction_date, description
            FROM transactions
            WHERE id = ?
        """, (transaction_id,)).fetchone()

    return jsonify(dict(row)), 201


@app.route("/api/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM transactions WHERE id = ?",
            (transaction_id,)
        )

    if cursor.rowcount == 0:
        return jsonify({"error": "Transaction not found."}), 404

    return jsonify({"message": "Transaction deleted successfully."})


@app.route("/api/summary", methods=["GET"])
def get_summary():
    with get_connection() as connection:
        result = connection.execute("""
            SELECT
                COALESCE(SUM(
                    CASE WHEN transaction_type = 'income'
                    THEN amount ELSE 0 END
                ), 0) AS total_income,
                COALESCE(SUM(
                    CASE WHEN transaction_type = 'expense'
                    THEN amount ELSE 0 END
                ), 0) AS total_expenses
            FROM transactions
        """).fetchone()

    total_income = result["total_income"]
    total_expenses = result["total_expenses"]

    return jsonify({
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net_savings": round(total_income - total_expenses, 2)
    })


if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)
