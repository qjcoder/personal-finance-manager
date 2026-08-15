# Personal Finance Manager - Mobile App 📱

A beautiful, modern mobile application for iOS and Android built with React Native and Expo. Track your expenses, manage savings goals, and gain financial insights on the go!

## Features

- 📊 **Dashboard**: Overview of income, expenses, and balance with real-time insights
- 💸 **Transactions**: Add, view, and manage income and expenses
- 🎯 **Savings Goals**: Set goals and track progress with visual indicators
- 💰 **Budget Tracking**: Set monthly budgets and monitor spending
- 📈 **Analytics**: Beautiful charts showing spending patterns and trends
- 🔄 **Real-time Sync**: Connects to Flask backend API
- 🎨 **Modern UI**: Clean, intuitive interface with Material Design
- 📱 **Cross-Platform**: Single codebase for iOS and Android

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI Components**: React Native Paper (Material Design)
- **Charts**: React Native Chart Kit
- **API**: Axios for HTTP requests
- **State**: React Hooks
- **Storage**: AsyncStorage for local preferences

## Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing)
- Backend API running (see main project README)

## Installation

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure API URL

The app defaults to `http://localhost:5000/api`. To change this:

- Edit `src/services/api.js`
- Change `DEFAULT_API_URL` to your backend URL
- For testing on physical device, use your computer's local IP:
  ```javascript
  const DEFAULT_API_URL = 'http://192.168.1.XXX:5000/api';
  ```

### 3. Start the Development Server

```bash
npm start
# or
expo start
```

### 4. Run on Device/Emulator

**Option 1: Physical Device**
- Install "Expo Go" from App Store (iOS) or Play Store (Android)
- Scan the QR code shown in terminal

**Option 2: iOS Simulator** (Mac only)
```bash
npm run ios
```

**Option 3: Android Emulator**
```bash
npm run android
```

## Project Structure

```
mobile-app/
├── App.js                          # Main app entry with navigation
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.js     # Main dashboard
│   │   ├── TransactionsScreen.js  # Transaction management
│   │   ├── GoalsScreen.js         # Savings goals
│   │   ├── BudgetScreen.js        # Budget tracking
│   │   └── AnalyticsScreen.js     # Charts and analytics
│   ├── services/
│   │   └── api.js                 # API service layer
│   ├── utils/
│   │   └── constants.js           # Constants and helpers
│   └── theme.js                   # App theme configuration
└── assets/                         # Images and icons
```

## Backend Setup

Make sure the Flask backend is running:

```bash
# In the main project directory
python app.py
```

The backend should be accessible at `http://localhost:5000`

## Building for Production

### iOS (requires Mac and Apple Developer Account)

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

### Web Version

```bash
npm run web
```

## Features by Screen

### 📊 Dashboard
- Summary cards showing total income, expenses, and balance
- Monthly statistics
- Financial insights and recommendations
- Quick action buttons

### 💸 Transactions
- List all transactions with categories
- Add new income or expenses
- Delete transactions
- Pull to refresh

### 🎯 Goals
- Create savings goals with target amounts
- Track progress with progress bars
- Update goal amounts
- Visual goal completion status

### 💰 Budget
- Set monthly budgets per category
- View spending progress
- Color-coded budget status
- Overspending alerts

### 📈 Analytics
- Pie chart of spending by category
- Line chart of monthly trends
- Statistics overview
- Visual insights

## Customization

### Change Theme Colors

Edit `src/theme.js`:

```javascript
export const colors = {
  primary: '#4f46e5',    // Your brand color
  success: '#10b981',
  danger: '#ef4444',
  // ... more colors
};
```

### Add New Categories

Edit `src/utils/constants.js`:

```javascript
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Your Custom Category',
  // ... more categories
];
```

## Troubleshooting

### Cannot Connect to Backend

**Problem**: App can't reach the API

**Solutions**:
1. Make sure backend is running: `python app.py`
2. Check the API URL in `src/services/api.js`
3. On physical device, use your computer's IP address instead of `localhost`
4. Ensure phone and computer are on the same WiFi network
5. Check firewall settings

### Expo Go Issues

**Problem**: App won't load in Expo Go

**Solutions**:
1. Clear Expo cache: `expo start -c`
2. Restart the metro bundler
3. Update Expo Go app to latest version
4. Try running on different device/emulator

### Charts Not Showing

**Problem**: Analytics charts are blank

**Solutions**:
1. Ensure you have transaction data
2. Check API is returning data correctly
3. Try refreshing the screen (pull down)

## API Endpoints Used

- `GET /api/summary` - Financial summary
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Add transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/goals` - List goals
- `POST /api/goals` - Add goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/budget` - List budgets
- `POST /api/budget` - Set budget
- `GET /api/analytics/spending-by-category` - Spending breakdown
- `GET /api/analytics/monthly-trend` - Monthly trends
- `GET /api/analytics/insights` - Financial insights

## Performance Tips

1. **Lazy Loading**: Screens load data only when focused
2. **Pull to Refresh**: Manual refresh to save battery
3. **Optimized Re-renders**: Uses React.memo and useCallback
4. **Image Optimization**: Use appropriate image sizes
5. **API Caching**: Consider adding AsyncStorage cache

## Future Enhancements

- [ ] Offline mode with local database
- [ ] Biometric authentication
- [ ] Push notifications for budget alerts
- [ ] Receipt photo uploads
- [ ] Export data to CSV
- [ ] Dark mode
- [ ] Multiple currency support
- [ ] Recurring transactions
- [ ] Split expenses with friends

## Publishing

### To App Store (iOS)

1. Create Apple Developer Account ($99/year)
2. Build with `expo build:ios`
3. Upload to App Store Connect
4. Submit for review

### To Play Store (Android)

1. Create Google Play Developer Account ($25 one-time)
2. Build with `expo build:android`
3. Upload to Play Console
4. Submit for review

## Support

For issues or questions:
- Check the main project README
- Review Expo documentation: https://docs.expo.dev
- React Native Paper docs: https://reactnativepaper.com

## License

MIT License - Same as the main project

---

**Built with ❤️ using React Native and Expo**

Start managing your finances on the go! 📱💰
