import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, FAB, TextInput, Button, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../services/api';
import { colors } from '../theme';
import { formatCurrency, EXPENSE_CATEGORIES } from '../utils/constants';

export default function BudgetScreen() {
  const [budgets, setBudgets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const loadBudgets = async () => {
    try {
      const data = await apiService.getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  };

  const handleSetBudget = async () => {
    if (!category || !amount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await apiService.setBudget({
        category,
        amount: parseFloat(amount),
      });
      setModalVisible(false);
      resetForm();
      loadBudgets();
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Failed to set budget');
    }
  };

  const resetForm = () => {
    setCategory('');
    setAmount('');
  };

  const getBudgetStatus = (percentage) => {
    if (percentage >= 100) return 'over';
    if (percentage >= 80) return 'high';
    if (percentage >= 60) return 'medium';
    return 'low';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'over':
      case 'high':
        return colors.danger;
      case 'medium':
        return colors.warning;
      default:
        return colors.success;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {budgets.length > 0 ? (
          budgets.map((budget, index) => {
            const status = getBudgetStatus(budget.percentage);
            const statusColor = getStatusColor(status);

            return (
              <Card key={index} style={styles.budgetCard}>
                <Card.Content>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.category}>{budget.category}</Text>
                    <Text style={[styles.percentage, { color: statusColor }]}>
                      {budget.percentage.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.amountRow}>
                    <Text style={styles.spentText}>
                      Spent: {formatCurrency(budget.spent)}
                    </Text>
                    <Text style={styles.budgetText}>
                      Budget: {formatCurrency(budget.amount)}
                    </Text>
                  </View>

                  <ProgressBar
                    progress={Math.min(budget.percentage / 100, 1)}
                    color={statusColor}
                    style={styles.progressBar}
                  />

                  <View style={styles.remainingContainer}>
                    {budget.remaining >= 0 ? (
                      <View style={styles.remainingRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={colors.success}
                        />
                        <Text style={[styles.remainingText, { color: colors.success }]}>
                          {formatCurrency(budget.remaining)} remaining
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.remainingRow}>
                        <Ionicons
                          name="alert-circle"
                          size={18}
                          color={colors.danger}
                        />
                        <Text style={[styles.remainingText, { color: colors.danger }]}>
                          Over budget by {formatCurrency(Math.abs(budget.remaining))}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Ionicons
                name="wallet-outline"
                size={48}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>
                No budgets set. Create budgets to track your spending!
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        color="white"
      />

      {/* Set Budget Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Monthly Budget</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(itemValue) => setCategory(itemValue)}
                  >
                    <Picker.Item label="Select category..." value="" />
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <Picker.Item key={cat} label={cat} value={cat} />
                    ))}
                  </Picker>
                </View>
              </View>

              <TextInput
                label="Monthly Budget Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="currency-usd" />}
              />

              <Button
                mode="contained"
                onPress={handleSetBudget}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
              >
                Set Budget
              </Button>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  budgetCard: {
    margin: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spentText: {
    fontSize: 14,
    color: colors.text,
  },
  budgetText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  remainingContainer: {
    marginTop: 4,
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    margin: 16,
    borderRadius: 12,
  },
  emptyIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalForm: {
    padding: 20,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});
