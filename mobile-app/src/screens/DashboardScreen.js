import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../services/api';
import { colors } from '../theme';
import { formatCurrency } from '../utils/constants';

export default function DashboardScreen({ navigation }) {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, insightsData] = await Promise.all([
        apiService.getSummary(),
        apiService.getInsights(),
      ]);
      setSummary(summaryData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.info;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card style={[styles.summaryCard, styles.incomeCard]}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.gradientCard}
            >
              <Ionicons name="trending-up" size={32} color="white" />
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(summary?.income || 0)}
              </Text>
              <Text style={styles.summarySubtext}>
                This Month: {formatCurrency(summary?.month_income || 0)}
              </Text>
            </LinearGradient>
          </Card>

          <Card style={[styles.summaryCard, styles.expenseCard]}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              style={styles.gradientCard}
            >
              <Ionicons name="trending-down" size={32} color="white" />
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(summary?.expenses || 0)}
              </Text>
              <Text style={styles.summarySubtext}>
                This Month: {formatCurrency(summary?.month_expenses || 0)}
              </Text>
            </LinearGradient>
          </Card>

          <Card style={[styles.summaryCard, styles.balanceCard]}>
            <LinearGradient
              colors={['#4f46e5', '#4338ca']}
              style={styles.gradientCard}
            >
              <Ionicons name="wallet" size={32} color="white" />
              <Text style={styles.summaryLabel}>Current Balance</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrency(summary?.balance || 0)}
              </Text>
              <Text style={styles.summarySubtext}>
                This Month: {formatCurrency(summary?.month_balance || 0)}
              </Text>
            </LinearGradient>
          </Card>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Financial Insights</Text>
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <Card key={index} style={styles.insightCard}>
                <Card.Content>
                  <View style={styles.insightHeader}>
                    <Ionicons
                      name={getInsightIcon(insight.type)}
                      size={24}
                      color={getInsightColor(insight.type)}
                    />
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                  </View>
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                  <Text style={styles.insightTip}>💡 {insight.tip}</Text>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.insightCard}>
              <Card.Content>
                <Text style={styles.emptyText}>
                  No insights yet. Add more transactions to see personalized
                  recommendations.
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => navigation.navigate('Transactions')}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.actionButtonText}>Add Income</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.danger }]}
              onPress={() => navigation.navigate('Transactions')}
            >
              <Ionicons name="remove-circle" size={24} color="white" />
              <Text style={styles.actionButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  gradientCard: {
    padding: 20,
    borderRadius: 16,
  },
  summaryLabel: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.9,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summarySubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.text,
  },
  insightCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: colors.text,
  },
  insightMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  insightTip: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
