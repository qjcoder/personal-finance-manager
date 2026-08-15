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
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../services/api';
import { colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/constants';

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');

  const loadGoals = async () => {
    try {
      const data = await apiService.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  const handleAddGoal = async () => {
    if (!goalName || !targetAmount) {
      alert('Please fill in goal name and target amount');
      return;
    }

    try {
      await apiService.addGoal({
        name: goalName,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        deadline,
      });
      setModalVisible(false);
      resetForm();
      loadGoals();
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal');
    }
  };

  const handleUpdateGoal = async (goalId, newAmount) => {
    try {
      await apiService.updateGoal(goalId, parseFloat(newAmount));
      loadGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await apiService.deleteGoal(goalId);
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const resetForm = () => {
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal.id} style={styles.goalCard}>
              <Card.Content>
                <View style={styles.goalHeader}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    {goal.deadline && (
                      <Text style={styles.deadline}>
                        Due: {formatDate(goal.deadline)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteGoal(goal.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.amountText}>
                    {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                  </Text>
                  <Text style={styles.percentageText}>
                    {goal.progress.toFixed(1)}%
                  </Text>
                </View>

                <ProgressBar
                  progress={Math.min(goal.progress / 100, 1)}
                  color={goal.progress >= 100 ? colors.success : colors.primary}
                  style={styles.progressBar}
                />

                <View style={styles.updateSection}>
                  <TextInput
                    placeholder="Add amount"
                    keyboardType="decimal-pad"
                    mode="outlined"
                    dense
                    style={styles.updateInput}
                    onSubmitEditing={(e) =>
                      handleUpdateGoal(
                        goal.id,
                        goal.current_amount + parseFloat(e.nativeEvent.text || 0)
                      )
                    }
                  />
                </View>

                {goal.progress >= 100 && (
                  <View style={styles.completedBanner}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={styles.completedText}>Goal Achieved! 🎉</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Ionicons
                name="trophy-outline"
                size={48}
                color={colors.textSecondary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>
                No savings goals yet. Set your first goal to start saving!
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

      {/* Add Goal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Savings Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                label="Goal Name"
                value={goalName}
                onChangeText={setGoalName}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Emergency Fund"
              />

              <TextInput
                label="Target Amount"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="currency-usd" />}
              />

              <TextInput
                label="Current Amount (Optional)"
                value={currentAmount}
                onChangeText={setCurrentAmount}
                keyboardType="decimal-pad"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="currency-usd" />}
              />

              <TextInput
                label="Deadline (Optional)"
                value={deadline}
                onChangeText={setDeadline}
                mode="outlined"
                style={styles.input}
                placeholder="YYYY-MM-DD"
                left={<TextInput.Icon icon="calendar" />}
              />

              <Button
                mode="contained"
                onPress={handleAddGoal}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
              >
                Create Goal
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
  goalCard: {
    margin: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  deadline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 14,
    color: colors.text,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  updateSection: {
    marginTop: 8,
  },
  updateInput: {
    fontSize: 14,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  completedText: {
    marginLeft: 8,
    color: colors.success,
    fontWeight: '600',
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
    maxHeight: '80%',
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
