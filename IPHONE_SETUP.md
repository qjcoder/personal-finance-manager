# 📱 Run on iPhone with Expo Go - Step by Step

## What You Need
- ✅ iPhone with Expo Go installed
- ✅ Computer (Mac/Windows/Linux)
- ✅ Both on the same WiFi network

---

## Step 1: Get Your Computer's IP Address

### On Mac:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
Look for something like: `inet 192.168.1.100`

### On Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter

### On Linux:
```bash
hostname -I
```

**Write down this IP address!** Example: `192.168.1.100`

---

## Step 2: Clone & Setup (On Computer)

```bash
# Clone the repository
git clone https://github.com/qjcoder/personal-finance-manager.git
cd personal-finance-manager

# Install backend dependencies
pip install -r requirements.txt

# Initialize database with sample data
python init_db.py

# Start the backend
python app.py
```

✅ Backend should now be running at `http://localhost:5000`

---

## Step 3: Update API URL (On Computer)

Open this file: `mobile-app/src/services/api.js`

Change line 6 from:
```javascript
const DEFAULT_API_URL = 'http://localhost:5000/api';
```

To (use YOUR computer's IP):
```javascript
const DEFAULT_API_URL = 'http://192.168.1.100:5000/api';
```

**Replace `192.168.1.100` with your actual IP from Step 1!**

---

## Step 4: Install Mobile App Dependencies (On Computer)

```bash
# Navigate to mobile app folder
cd mobile-app

# Install Node.js dependencies
npm install

# Start Expo development server
npm start
```

You'll see a QR code in the terminal! 📱

---

## Step 5: Open on iPhone

1. **Open Expo Go** app on your iPhone
2. **Tap "Scan QR code"**
3. **Point camera at the QR code** in your computer's terminal
4. **Wait for app to load** (may take 30-60 seconds first time)

✅ The app should open on your iPhone!

---

## Troubleshooting

### "Unable to connect to backend"

**Problem**: App can't reach the Flask API

**Fix**:
1. Check both devices on same WiFi
2. Verify API URL in `mobile-app/src/services/api.js` has correct IP
3. Test backend is accessible:
   - On computer, open browser: `http://localhost:5000`
   - Should see "Not Found" (that's OK, backend is running)
4. Check firewall isn't blocking port 5000
5. Try restarting both backend and Expo

### "Something went wrong" in Expo Go

**Fix**:
1. In terminal, press `r` to reload
2. Or shake your iPhone and tap "Reload"
3. Clear cache: `expo start -c`

### Can't scan QR code

**Fix**:
1. In Expo Go, tap "Enter URL manually"
2. Type the URL shown in terminal (like `exp://192.168.1.100:8081`)

### Backend not starting

**Fix**:
```bash
# Make sure port 5000 is free
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Then restart:
python app.py
```

---

## Quick Test

Once app loads on iPhone:

1. **Dashboard** should show sample data
2. **Tap Transactions** → See sample transactions
3. **Tap "+" button** → Add a new transaction
4. **Tap Goals** → See savings goals
5. **Pull down** on any screen to refresh

---

## Important Notes

### Network Requirements
- ✅ iPhone and computer MUST be on same WiFi
- ✅ Some public/corporate WiFi blocks device-to-device communication
- ✅ If not working, try a personal hotspot

### Development Mode
- This is **development mode** - for testing only
- App reloads when you save code changes
- Shake iPhone to access developer menu
- In developer menu you can:
  - Reload the app
  - Enable performance monitor
  - Toggle element inspector

### Sample Data
The app comes with sample data:
- 3 months of income
- 50+ random expense transactions
- 3 savings goals
- 4 budgets

Feel free to delete and add your real data!

---

## Next Steps

### Test the Features:
1. ✅ View dashboard with insights
2. ✅ Add income/expense transactions
3. ✅ Create a savings goal
4. ✅ Set a budget
5. ✅ View analytics with charts

### Customize:
- Change colors in `src/theme.js`
- Add/remove categories in `src/utils/constants.js`
- Modify screens in `src/screens/`

### Deploy for Real:
When ready for production, you can:
- Build standalone iOS app with Expo
- Submit to App Store
- Use a real backend URL (not localhost)

---

## Commands Reference

### Start Everything:
```bash
# Terminal 1 - Backend
cd personal-finance-manager
python app.py

# Terminal 2 - Mobile App
cd personal-finance-manager/mobile-app
npm start
```

### Restart Everything:
```bash
# Stop both terminals (Ctrl+C)
# Then start again

# Or clear cache and restart mobile app:
expo start -c
```

---

## You're All Set! 🎉

Your iPhone should now be running the Personal Finance Manager app!

**Repository**: https://github.com/qjcoder/personal-finance-manager

**Questions?** Check the main README or mobile-app README for more details.

---

**Happy budgeting!** 💰📱
