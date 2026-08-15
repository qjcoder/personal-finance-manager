import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Dashboard') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Transactions') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'Goals') {
                iconName = focused ? 'trophy' : 'trophy-outline';
              } else if (route.name === 'Budget') {
                iconName = focused ? 'wallet' : 'wallet-outline';
              } else if (route.name === 'Analytics') {
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4f46e5',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#4f46e5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Transactions" component={TransactionsScreen} />
          <Tab.Screen name="Goals" component={GoalsScreen} />
          <Tab.Screen name="Budget" component={BudgetScreen} />
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
