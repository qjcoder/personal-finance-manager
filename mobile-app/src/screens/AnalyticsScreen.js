import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../services/api';
import { colors } from '../theme';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const [spendingData, setSpendingData] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [spending, trend] = await Promise.all([
        apiService.getSpendingByCategory(),
        apiService.getMonthlyTrend(6),
      ]);
      setSpendingData(spending);
      setTrendData(trend);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const chartColors = [
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#06b6d4',
    '#84cc16',
  ];

  const pieChartData = spendingData.slice(0, 10).map((item, index) => ({
    name: item.category,
    amount: item.amount,
    color: chartColors[index % chartColors.length],
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading analytics...</Text>
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
        {/* Spending by Category */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Spending by Category</Text>
            {pieChartData.length > 0 ? (
              <>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                <View style={styles.legendContainer}>
                  {pieChartData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.legendText}>
                        {item.name}: ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>
                No spending data available yet. Start adding expenses to see your
                spending breakdown!
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Monthly Trend */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Monthly Trend (Last 6 Months)</Text>
            {trendData && trendData.labels.length > 0 ? (
              <>
                <LineChart
                  data={{
                    labels: trendData.labels.map((label) =>
                      label.substring(5)
                    ),
                    datasets: [
                      {
                        data: trendData.income,
                        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                        strokeWidth: 2,
                      },
                      {
                        data: trendData.expenses,
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                        strokeWidth: 2,
                      },
                    ],
                    legend: ['Income', 'Expenses'],
                  }}
                  width={screenWidth - 64}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: colors.border,
                    },
                  }}
                  bezier
                  style={styles.chart}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                />
                <View style={styles.trendLegend}>
                  <View style={styles.trendLegendItem}>
                    <View
                      style={[
                        styles.trendLegendColor,
                        { backgroundColor: colors.success },
                      ]}
                    />
                    <Text style={styles.legendText}>Income</Text>
                  </View>
                  <View style={styles.trendLegendItem}>
                    <View
                      style={[
                        styles.trendLegendColor,
                        { backgroundColor: colors.danger },
                      ]}
                    />
                    <Text style={styles.legendText}>Expenses</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>
                No trend data available yet. Add more transactions over time to see
                your financial trends!
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Summary Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Statistics</Text>
            {spendingData.length > 0 && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Categories</Text>
                  <Text style={styles.statValue}>{spendingData.length}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Transactions</Text>
                  <Text style={styles.statValue}>
                    {spendingData.reduce((sum, item) => sum + item.count, 0)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average per Category</Text>
                  <Text style={styles.statValue}>
                    $
                    {(
                      spendingData.reduce((sum, item) => sum + item.amount, 0) /
                      spendingData.length
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
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
  card: {
    margin: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.text,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: colors.text,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  trendLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendLegendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    paddingVertical: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
