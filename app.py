"""
Personal Finance Manager - Main Application
"""
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
from database import Database

app = Flask(__name__)
CORS(app)
db = Database()


@app.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')


@app.route('/api/transactions', methods=['GET', 'POST'])
def transactions():
    """Handle transaction operations"""
    if request.method == 'GET':
        # Get all transactions
        transactions = db.get_transactions()
        return jsonify(transactions)
    
    elif request.method == 'POST':
        # Add new transaction
        data = request.json
        transaction_id = db.add_transaction(
            transaction_type=data['type'],
            amount=float(data['amount']),
            category=data['category'],
            description=data.get('description', ''),
            date=data.get('date', datetime.now().strftime('%Y-%m-%d'))
        )
        return jsonify({'id': transaction_id, 'message': 'Transaction added successfully'})


@app.route('/api/transactions/<int:transaction_id>', methods=['PUT', 'DELETE'])
def mutate_transaction(transaction_id):
    if request.method == 'PUT':
        data = request.json or {}
        db.update_transaction(
            transaction_id,
            amount=float(data['amount']),
            category=data['category'],
            description=data.get('description', ''),
            date=data.get('date', datetime.now().strftime('%Y-%m-%d'))
        )
        return jsonify({'message': 'Transaction updated'})
    db.delete_transaction(transaction_id)
    return jsonify({'message': 'Transaction deleted successfully'})


@app.route('/api/summary')
def summary():
    """Get financial summary"""
    summary_data = db.get_summary()
    return jsonify(summary_data)


@app.route('/api/goals', methods=['GET', 'POST'])
def savings_goals():
    """Handle savings goal operations"""
    if request.method == 'GET':
        goals = db.get_savings_goals()
        return jsonify(goals)
    
    elif request.method == 'POST':
        data = request.json
        goal_id = db.add_savings_goal(
            name=data['name'],
            target_amount=float(data['target_amount']),
            current_amount=float(data.get('current_amount', 0)),
            deadline=data.get('deadline', '')
        )
        return jsonify({'id': goal_id, 'message': 'Goal added successfully'})


@app.route('/api/goals/<int:goal_id>', methods=['PUT', 'DELETE'])
def update_goal(goal_id):
    """Update or delete a savings goal"""
    if request.method == 'PUT':
        data = request.json
        db.update_savings_goal(goal_id, float(data['current_amount']))
        return jsonify({'message': 'Goal updated successfully'})
    
    elif request.method == 'DELETE':
        db.delete_savings_goal(goal_id)
        return jsonify({'message': 'Goal deleted successfully'})


@app.route('/api/analytics/spending-by-category')
def spending_by_category():
    """Get spending breakdown by category"""
    data = db.get_spending_by_category()
    return jsonify(data)


@app.route('/api/analytics/monthly-trend')
def monthly_trend():
    """Get monthly income and expense trends"""
    months = request.args.get('months', 6, type=int)
    data = db.get_monthly_trend(months)
    return jsonify(data)


@app.route('/api/analytics/insights')
def get_insights():
    """Get personalized financial insights and recommendations"""
    currency = request.args.get('currency', 'PKR')
    insights = []
    summary = db.get_summary()
    spending = db.get_spending_by_category()
    
    # Calculate savings rate
    if summary['income'] > 0:
        savings_rate = (summary['balance'] / summary['income']) * 100
        if savings_rate < 20:
            insights.append({
                'type': 'warning',
                'title': 'Low Savings Rate',
                'message': f'Your savings rate is {savings_rate:.1f}%. Try to aim for at least 20% of your income.',
                'tip': 'Review your discretionary spending and look for areas to cut back.'
            })
        else:
            insights.append({
                'type': 'success',
                'title': 'Great Savings Rate!',
                'message': f'Your savings rate of {savings_rate:.1f}% is excellent!',
                'tip': 'Keep up the good work and consider increasing your savings goals.'
            })
    
    # Analyze spending categories
    if spending:
        sorted_spending = sorted(spending, key=lambda x: x['amount'], reverse=True)
        if len(sorted_spending) > 0:
            top_category = sorted_spending[0]
            insights.append({
                'type': 'info',
                'title': 'Top Spending Category',
                'message': f'You spend the most on {top_category["category"]}: {currency} {top_category["amount"]:.2f}',
                'tip': 'Review if this spending aligns with your priorities and budget.'
            })
    
    # Check for recent spending spike
    recent_expenses = db.get_recent_expenses(7)
    if recent_expenses > summary['expenses'] * 0.3:
        insights.append({
            'type': 'warning',
            'title': 'High Recent Spending',
            'message': f'You\'ve spent {currency} {recent_expenses:.2f} in the last 7 days.',
            'tip': 'Consider reviewing recent purchases and planning ahead to avoid overspending.'
        })
    
    return jsonify(insights)


@app.route('/api/budget', methods=['GET', 'POST'])
def budget():
    """Handle budget operations"""
    if request.method == 'GET':
        budgets = db.get_budgets()
        return jsonify(budgets)
    
    elif request.method == 'POST':
        data = request.json
        budget_id = db.set_budget(
            category=data['category'],
            amount=float(data['amount']),
            period=data.get('period', 'monthly')
        )
        return jsonify({'id': budget_id, 'message': 'Budget set successfully'})


@app.route('/api/profile', methods=['GET', 'PUT'])
def profile():
    if request.method == 'GET':
        return jsonify(db.get_profile())
    data = request.json or {}
    return jsonify(db.save_profile(data))


@app.route('/api/backup', methods=['GET', 'PUT'])
def backup():
    if request.method == 'GET':
        return jsonify(db.export_backup())
    payload = request.json or {}
    try:
        restored = db.restore_backup(payload)
        return jsonify({'message': 'Backup restored', 'backup': restored})
    except ValueError as err:
        return jsonify({'error': str(err)}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
