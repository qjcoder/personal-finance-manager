"""
Database operations for Personal Finance Manager
"""
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any


class Database:
    def __init__(self, db_name='finance.db'):
        self.db_name = db_name
        self.init_db()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Savings goals table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS savings_goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                target_amount REAL NOT NULL,
                current_amount REAL DEFAULT 0,
                deadline TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Budget table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS budgets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL UNIQUE,
                amount REAL NOT NULL,
                period TEXT DEFAULT 'monthly',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_transaction(self, transaction_type: str, amount: float, category: str, 
                       description: str = '', date: str = None) -> int:
        """Add a new transaction"""
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO transactions (type, amount, category, description, date)
            VALUES (?, ?, ?, ?, ?)
        ''', (transaction_type, amount, category, description, date))
        
        transaction_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return transaction_id
    
    def get_transactions(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all transactions"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM transactions 
            ORDER BY date DESC, created_at DESC 
            LIMIT ?
        ''', (limit,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def delete_transaction(self, transaction_id: int):
        """Delete a transaction"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
        conn.commit()
        conn.close()
    
    def get_summary(self) -> Dict[str, float]:
        """Get financial summary"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Total income
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE type = 'income'")
        income = cursor.fetchone()[0] or 0
        
        # Total expenses
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE type = 'expense'")
        expenses = cursor.fetchone()[0] or 0
        
        # Balance
        balance = income - expenses
        
        # This month's transactions
        current_month = datetime.now().strftime('%Y-%m')
        cursor.execute("""
            SELECT SUM(amount) FROM transactions 
            WHERE type = 'income' AND date LIKE ?
        """, (f'{current_month}%',))
        month_income = cursor.fetchone()[0] or 0
        
        cursor.execute("""
            SELECT SUM(amount) FROM transactions 
            WHERE type = 'expense' AND date LIKE ?
        """, (f'{current_month}%',))
        month_expenses = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return {
            'income': income,
            'expenses': expenses,
            'balance': balance,
            'month_income': month_income,
            'month_expenses': month_expenses,
            'month_balance': month_income - month_expenses
        }
    
    def add_savings_goal(self, name: str, target_amount: float, 
                        current_amount: float = 0, deadline: str = '') -> int:
        """Add a new savings goal"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO savings_goals (name, target_amount, current_amount, deadline)
            VALUES (?, ?, ?, ?)
        ''', (name, target_amount, current_amount, deadline))
        
        goal_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return goal_id
    
    def get_savings_goals(self) -> List[Dict[str, Any]]:
        """Get all savings goals"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM savings_goals ORDER BY created_at DESC')
        
        rows = cursor.fetchall()
        conn.close()
        
        goals = []
        for row in rows:
            goal = dict(row)
            goal['progress'] = (goal['current_amount'] / goal['target_amount'] * 100) if goal['target_amount'] > 0 else 0
            goals.append(goal)
        
        return goals
    
    def update_savings_goal(self, goal_id: int, current_amount: float):
        """Update savings goal progress"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE savings_goals 
            SET current_amount = ? 
            WHERE id = ?
        ''', (current_amount, goal_id))
        conn.commit()
        conn.close()
    
    def delete_savings_goal(self, goal_id: int):
        """Delete a savings goal"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM savings_goals WHERE id = ?', (goal_id,))
        conn.commit()
        conn.close()
    
    def get_spending_by_category(self) -> List[Dict[str, Any]]:
        """Get spending breakdown by category"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT category, SUM(amount) as amount, COUNT(*) as count
            FROM transactions 
            WHERE type = 'expense'
            GROUP BY category
            ORDER BY amount DESC
        ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_monthly_trend(self, months: int = 6) -> Dict[str, List]:
        """Get monthly income and expense trends"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get data for last N months
        start_date = (datetime.now() - timedelta(days=months*30)).strftime('%Y-%m-%d')
        
        cursor.execute('''
            SELECT 
                strftime('%Y-%m', date) as month,
                type,
                SUM(amount) as total
            FROM transactions
            WHERE date >= ?
            GROUP BY month, type
            ORDER BY month
        ''', (start_date,))
        
        rows = cursor.fetchall()
        conn.close()
        
        # Organize data by month
        months_data = {}
        for row in rows:
            month = row['month']
            if month not in months_data:
                months_data[month] = {'income': 0, 'expenses': 0}
            
            months_data[month][row['type']] = row['total']
        
        # Format for charts
        labels = sorted(months_data.keys())
        income_data = [months_data[m]['income'] for m in labels]
        expense_data = [months_data[m]['expenses'] for m in labels]
        
        return {
            'labels': labels,
            'income': income_data,
            'expenses': expense_data
        }
    
    def get_recent_expenses(self, days: int = 7) -> float:
        """Get total expenses for recent days"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        cursor.execute('''
            SELECT SUM(amount) FROM transactions 
            WHERE type = 'expense' AND date >= ?
        ''', (start_date,))
        
        result = cursor.fetchone()[0] or 0
        conn.close()
        return result
    
    def set_budget(self, category: str, amount: float, period: str = 'monthly') -> int:
        """Set budget for a category"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO budgets (category, amount, period)
            VALUES (?, ?, ?)
        ''', (category, amount, period))
        
        budget_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return budget_id
    
    def get_budgets(self) -> List[Dict[str, Any]]:
        """Get all budgets with spending"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get current month
        current_month = datetime.now().strftime('%Y-%m')
        
        cursor.execute('SELECT * FROM budgets')
        budgets = [dict(row) for row in cursor.fetchall()]
        
        # Add spending for each budget
        for budget in budgets:
            cursor.execute('''
                SELECT SUM(amount) FROM transactions 
                WHERE type = 'expense' 
                AND category = ? 
                AND date LIKE ?
            ''', (budget['category'], f'{current_month}%'))
            
            spent = cursor.fetchone()[0] or 0
            budget['spent'] = spent
            budget['remaining'] = budget['amount'] - spent
            budget['percentage'] = (spent / budget['amount'] * 100) if budget['amount'] > 0 else 0
        
        conn.close()
        return budgets
