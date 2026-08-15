# Setup Guide - Personal Finance Manager

## Step-by-Step Instructions

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `personal-finance-manager`
   - **Description**: "A web app to track expenses, manage savings goals, and improve financial health"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### 2. Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit: Personal Finance Manager application"

# Add the GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/personal-finance-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Install and Run Locally

```bash
# Install Python dependencies
pip install -r requirements.txt

# Initialize database with sample data
python init_db.py

# Run the application
python app.py
```

Then open your browser and go to: `http://localhost:5000`

### 4. Start Using the App

1. **Add Your First Transaction**
   - Click "Add Income" or "Add Expense"
   - Fill in the amount, category, and description
   - Save it

2. **Set Savings Goals**
   - Go to "Savings Goals" tab
   - Click "New Goal"
   - Set your target amount and deadline
   - Track your progress

3. **Create Budgets**
   - Navigate to "Budget" tab
   - Set monthly limits for different categories
   - Monitor your spending

4. **Review Analytics**
   - Check "Analytics" tab for visual insights
   - See spending patterns by category
   - Track monthly trends

## Tips for Maximum Savings

### 1. The 50/30/20 Rule
- **50%** of income → Needs (rent, food, utilities)
- **30%** of income → Wants (entertainment, dining out)
- **20%** of income → Savings & debt repayment

### 2. Track Every Expense
- Record every transaction, no matter how small
- Small purchases add up quickly
- Use the app daily for best results

### 3. Review Monthly
- Check your spending patterns each month
- Identify areas where you're overspending
- Adjust budgets accordingly

### 4. Automate Savings
- Set up automatic transfers to savings
- Pay yourself first (save before spending)
- Use the goals feature to stay motivated

### 5. Reduce Recurring Costs
- Review subscriptions (cancel unused ones)
- Shop around for better insurance rates
- Negotiate bills (internet, phone, etc.)

### 6. Use the Insights
- Check the dashboard insights regularly
- Act on the recommendations
- Adjust spending based on feedback

## Customization Ideas

### Add More Features
- **Receipt upload**: Attach images to transactions
- **Multiple accounts**: Track different bank accounts
- **Recurring transactions**: Auto-add monthly bills
- **Export data**: Download CSV reports
- **Mobile app**: Create a companion mobile version

### Enhance Analytics
- **Comparison charts**: Compare this month vs last month
- **Spending predictions**: Forecast future expenses
- **Category trends**: See how spending changes over time
- **Net worth tracking**: Include assets and liabilities

### Improve UI
- **Dark mode**: Add theme toggle
- **Custom categories**: Let users create categories
- **Currency support**: Multiple currency options
- **Notifications**: Alert when over budget

## Deployment Options

### Option 1: Heroku (Free Tier)
```bash
# Install Heroku CLI, then:
heroku create your-finance-app
git push heroku main
```

### Option 2: PythonAnywhere
- Upload your code
- Set up virtual environment
- Configure WSGI file
- Your app is live!

### Option 3: Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## Troubleshooting

### Database Errors
- Delete `finance.db` and run `python init_db.py` again

### Port Already in Use
- Change port in `app.py`: `app.run(port=5001)`

### Module Not Found
- Ensure you're in the virtual environment
- Run `pip install -r requirements.txt` again

## Support

- Star the repository if you find it helpful! ⭐
- Report issues on GitHub
- Contribute improvements via pull requests

## License

MIT License - Free to use and modify!
