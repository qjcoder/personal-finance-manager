# Personal Finance Manager 💰

A comprehensive web application to track your expenses, manage savings goals, and gain insights into your spending habits.

## Features

- 📊 **Expense Tracking**: Log and categorize all your expenses
- 💵 **Income Management**: Track multiple income sources
- 🎯 **Savings Goals**: Set and monitor progress toward savings targets
- 📈 **Analytics**: Visualize spending patterns with charts and reports
- 💡 **Smart Insights**: Get recommendations on how to save more
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/personal-finance-manager.git
cd personal-finance-manager
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database:
```bash
python init_db.py
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

### Adding Transactions

1. Click "Add Transaction" button
2. Select type (Income or Expense)
3. Enter amount, category, and description
4. Save the transaction

### Setting Savings Goals

1. Go to "Savings Goals" tab
2. Click "New Goal"
3. Enter goal name, target amount, and deadline
4. Track your progress over time

### Viewing Analytics

1. Navigate to "Analytics" tab
2. View spending by category
3. See monthly trends
4. Get personalized saving tips

## Project Structure

```
personal-finance-manager/
├── app.py                 # Main Flask application
├── init_db.py            # Database initialization script
├── requirements.txt      # Python dependencies
├── database.py           # Database models and operations
├── static/
│   ├── css/
│   │   └── style.css    # Application styles
│   └── js/
│       └── app.js       # Frontend JavaScript
└── templates/
    └── index.html       # Main HTML template
```

## Tips for Saving More Money

1. **Track Everything**: Record every transaction, no matter how small
2. **Set Realistic Goals**: Start with achievable savings targets
3. **Review Monthly**: Check your spending patterns each month
4. **Categorize Wisely**: Use categories to identify spending leaks
5. **Automate Savings**: Set aside a fixed amount each month
6. **Follow the 50/30/20 Rule**: 50% needs, 30% wants, 20% savings

## Technologies Used

- **Backend**: Python Flask
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Charts**: Chart.js

## Contributing

Feel free to fork this project and submit pull requests with improvements!

## License

MIT License - feel free to use this for personal or commercial projects.

## Support

If you find this helpful, consider starring the repository! ⭐
