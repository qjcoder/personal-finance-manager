"""
Database initialization script with sample data
"""
from database import Database
from datetime import datetime, timedelta
import random

def init_with_sample_data():
    """Initialize database with sample data for demonstration"""
    db = Database()
    print("✓ Database initialized")
    
    # Sample categories
    expense_categories = [
        'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
        'Bills & Utilities', 'Healthcare', 'Education', 'Housing',
        'Personal Care', 'Other'
    ]
    
    income_categories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
    
    # Add sample transactions for the last 3 months
    print("\nAdding sample transactions...")
    
    # Add income
    for i in range(3):
        date = (datetime.now() - timedelta(days=30*i)).strftime('%Y-%m-%d')
        db.add_transaction('income', 5000, 'Salary', 'Monthly salary', date)
    
    # Add random expenses
    for i in range(50):
        days_ago = random.randint(0, 90)
        date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
        category = random.choice(expense_categories)
        amount = round(random.uniform(10, 500), 2)
        
        descriptions = {
            'Food & Dining': ['Grocery shopping', 'Restaurant', 'Coffee shop', 'Fast food'],
            'Transportation': ['Gas', 'Public transit', 'Uber', 'Car maintenance'],
            'Shopping': ['Clothing', 'Electronics', 'Books', 'Home items'],
            'Entertainment': ['Movie tickets', 'Streaming service', 'Concert', 'Games'],
            'Bills & Utilities': ['Electric bill', 'Water bill', 'Internet', 'Phone bill'],
            'Healthcare': ['Doctor visit', 'Pharmacy', 'Health insurance', 'Gym'],
            'Education': ['Course fee', 'Books', 'Online class', 'Workshop'],
            'Housing': ['Rent', 'Home repair', 'Furniture', 'Decoration'],
        }
        
        desc = random.choice(descriptions.get(category, ['Miscellaneous expense']))
        db.add_transaction('expense', amount, category, desc, date)
    
    print("✓ Sample transactions added")
    
    # Add sample savings goals
    print("\nAdding sample savings goals...")
    
    db.add_savings_goal('Emergency Fund', 10000, 3500, '2026-12-31')
    db.add_savings_goal('Vacation', 3000, 1200, '2026-09-01')
    db.add_savings_goal('New Laptop', 2000, 800, '2026-11-30')
    
    print("✓ Sample savings goals added")
    
    # Add sample budgets
    print("\nAdding sample budgets...")
    
    db.set_budget('Food & Dining', 600, 'monthly')
    db.set_budget('Transportation', 300, 'monthly')
    db.set_budget('Entertainment', 200, 'monthly')
    db.set_budget('Shopping', 400, 'monthly')
    
    print("✓ Sample budgets added")
    
    print("\n" + "="*50)
    print("Database setup complete!")
    print("="*50)
    
    # Show summary
    summary = db.get_summary()
    print("\nYour Financial Summary:")
    print(f"  Total Income:    ${summary['income']:,.2f}")
    print(f"  Total Expenses:  ${summary['expenses']:,.2f}")
    print(f"  Current Balance: ${summary['balance']:,.2f}")
    print(f"\nThis Month:")
    print(f"  Income:   ${summary['month_income']:,.2f}")
    print(f"  Expenses: ${summary['month_expenses']:,.2f}")
    print(f"  Balance:  ${summary['month_balance']:,.2f}")
    print("\nRun 'python app.py' to start the application!")

if __name__ == '__main__':
    init_with_sample_data()
