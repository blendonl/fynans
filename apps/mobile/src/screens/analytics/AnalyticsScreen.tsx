import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedButtons, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../theme';
import { useTransactions } from '../../hooks/useTransactions';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFamily } from '../../context/FamilyContext';
import {
  CircularProgress,
  SearchBar,
  TopPurchasesCard,
  ComparisonCard,
  SearchFilter,
} from '../../components/analytics';
import { EmptyState } from '../../components/design-system';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FamilyMemberData {
  id: string;
  name: string;
  familyId: string;
  familyName: string;
}

type TimePeriod = '7days' | '30days' | '90days' | 'custom';

const PERIOD_STORAGE_KEY = '@analytics_period';
const CUSTOM_DATES_STORAGE_KEY = '@analytics_custom_dates';

export default function AnalyticsScreen() {
  const { theme } = useAppTheme();
  const { families, fetchFamilyWithMembers } = useFamily();
  const { transactions, loading, error, refreshing, refresh, retry } = useTransactions();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30days');
  const [searchFilter, setSearchFilter] = useState<SearchFilter | null>(null);
  const [customStartDate, setCustomStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [showDateModal, setShowDateModal] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>([]);

  useEffect(() => {
    const loadSavedPeriod = async () => {
      try {
        const [savedPeriod, savedDates] = await Promise.all([
          AsyncStorage.getItem(PERIOD_STORAGE_KEY),
          AsyncStorage.getItem(CUSTOM_DATES_STORAGE_KEY),
        ]);
        if (savedPeriod) {
          setTimePeriod(savedPeriod as TimePeriod);
        }
        if (savedDates) {
          try {
            const { start, end } = JSON.parse(savedDates);
            setCustomStartDate(new Date(start));
            setCustomEndDate(new Date(end));
          } catch (error) {
            console.error('Failed to parse saved dates:', error);
          }
        }
      } catch {}
    };
    loadSavedPeriod();
  }, []);

  useEffect(() => {
    const fetchAllMembers = async () => {
      const allMembers: FamilyMemberData[] = [];
      for (const family of families) {
        try {
          const familyWithMembers = await fetchFamilyWithMembers(family.id);
          familyWithMembers.members.forEach((member) => {
            const fullName = [member.user.firstName, member.user.lastName]
              .filter((n) => n && n.trim())
              .join(' ');
            const name = fullName || member.user.email;
            allMembers.push({
              id: member.userId,
              name,
              familyId: family.id,
              familyName: family.name,
            });
          });
        } catch {}
      }
      setFamilyMembers(allMembers);
    };

    if (families.length > 0) {
      fetchAllMembers();
    }
  }, [families, fetchFamilyWithMembers]);

  const handlePeriodChange = async (period: TimePeriod) => {
    setTimePeriod(period);
    try {
      await AsyncStorage.setItem(PERIOD_STORAGE_KEY, period);
    } catch {}
    if (period === 'custom') {
      setShowDateModal(true);
    }
  };

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      if (datePickerMode === 'start') {
        setCustomStartDate(selectedDate);
      } else {
        setCustomEndDate(selectedDate);
      }
    }
  };

  const saveCustomDates = async () => {
    try {
      await AsyncStorage.setItem(
        CUSTOM_DATES_STORAGE_KEY,
        JSON.stringify({ start: customStartDate.toISOString(), end: customEndDate.toISOString() })
      );
    } catch {}
    setShowDateModal(false);
  };

  const openDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const searchData = useMemo(() => {
    const expenseCategoryMap = new Map<string, { id: string; name: string }>();
    const itemNameMap = new Map<string, { id: string; name: string }>();

    transactions.forEach((t) => {
      if (!expenseCategoryMap.has(t.category.id)) {
        expenseCategoryMap.set(t.category.id, {
          id: t.category.id,
          name: t.category.name,
        });
      }

      t.items?.forEach((item) => {
        if (!itemNameMap.has(item.name)) {
          itemNameMap.set(item.name, {
            id: item.name,
            name: item.name,
          });
        }
      });
    });

    return {
      expenseCategories: Array.from(expenseCategoryMap.values()),
      itemCategories: [],
      itemNames: Array.from(itemNameMap.values()),
      families: families.map((f) => ({ id: f.id, name: f.name })),
      members: familyMembers,
    };
  }, [transactions, families, familyMembers]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timePeriod) {
      case '7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        break;
      case 'custom':
        startDate = customStartDate;
        endDate = customEndDate;
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    return transactions.filter((t) => {
      if (!t.transaction.createdAt) return false;
      const transactionDate = new Date(t.transaction.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions, timePeriod, customStartDate, customEndDate]);

  const analytics = useAnalytics(transactions, filteredTransactions, searchFilter);

  const periodLabel = useMemo(() => {
    switch (timePeriod) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      case 'custom':
        return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
      default:
        return 'Period';
    }
  }, [timePeriod, customStartDate, customEndDate]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="alert-circle"
          title="Error Loading Analytics"
          description={error}
          actionLabel="Retry"
          onAction={retry}
        />
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="chart-line"
          title="No Data Available"
          description="Start adding transactions to see your analytics"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >


        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            expenseCategories={searchData.expenseCategories}
            itemCategories={searchData.itemCategories}
            itemNames={searchData.itemNames}
            families={searchData.families}
            members={searchData.members}
            onFilterSelect={setSearchFilter}
            selectedFilter={searchFilter}
          />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <SegmentedButtons
            value={timePeriod}
            onValueChange={(value) => handlePeriodChange(value as TimePeriod)}
            buttons={[
              { value: '7days', label: '7 Days' },
              { value: '30days', label: '30 Days' },
              { value: '90days', label: '90 Days' },
              { value: 'custom', label: 'Custom' },
            ]}
            style={{ backgroundColor: theme.colors.surface }}
            theme={{
              colors: {
                secondaryContainer: theme.colors.primary,
                onSecondaryContainer: theme.colors.onPrimary,
                outline: theme.custom.colors.border,
              },
            }}
          />
        </View>

        {/* Custom Date Range Modal */}
        <Modal
          visible={showDateModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.modalTitle, theme.custom.typography.h5, { color: theme.custom.colors.text }]}>
                Select Date Range
              </Text>

              <View style={styles.dateRow}>
                <Text style={[theme.custom.typography.body, { color: theme.custom.colors.textSecondary }]}>
                  From:
                </Text>
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => openDatePicker('start')}
                >
                  <MaterialCommunityIcons name="calendar" size={18} color={theme.colors.primary} />
                  <Text style={[theme.custom.typography.body, { color: theme.colors.primary }]}>
                    {formatDate(customStartDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateRow}>
                <Text style={[theme.custom.typography.body, { color: theme.custom.colors.textSecondary }]}>
                  To:
                </Text>
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => openDatePicker('end')}
                >
                  <MaterialCommunityIcons name="calendar" size={18} color={theme.colors.primary} />
                  <Text style={[theme.custom.typography.body, { color: theme.colors.primary }]}>
                    {formatDate(customEndDate)}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={datePickerMode === 'start' ? customStartDate : customEndDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={datePickerMode === 'start' ? customEndDate : new Date()}
                  minimumDate={datePickerMode === 'end' ? customStartDate : undefined}
                />
              )}

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowDateModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={saveCustomDates}
                  style={styles.modalButton}
                >
                  Apply
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Period Info */}
        <View style={styles.periodInfo}>
          <Text
            style={[
              styles.periodLabel,
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            Showing data for {periodLabel}
            {searchFilter && ` filtered by ${searchFilter.name}`}
          </Text>
        </View>

        {/* Comparison Cards */}
        <View style={styles.comparisonGrid}>
          <ComparisonCard
            title="Total Expenses"
            currentValue={analytics.totalExpenses}
            previousValue={analytics.previousPeriodExpenses}
            icon="arrow-down-circle"
            color={theme.custom.colors.error}
            subtitle={`${analytics.expenseCount} transactions`}
            invertColors={true}
          />
          <ComparisonCard
            title="Total Income"
            currentValue={analytics.totalIncome}
            previousValue={analytics.previousPeriodIncome}
            icon="arrow-up-circle"
            color={theme.custom.colors.success}
            subtitle={`${analytics.incomeCount} transactions`}
          />
        </View>

        <View style={styles.comparisonGrid}>
          <ComparisonCard
            title="Net Balance"
            currentValue={analytics.net}
            previousValue={analytics.previousPeriodIncome - analytics.previousPeriodExpenses}
            icon="cash"
            color={analytics.net >= 0 ? theme.custom.colors.success : theme.custom.colors.error}
          />
          <ComparisonCard
            title="Avg Expense"
            currentValue={analytics.avgExpense}
            previousValue={
              analytics.previousPeriodExpenses > 0 && filteredTransactions.filter(t => t.type === 'expense').length > 0
                ? analytics.previousPeriodExpenses / Math.max(1, transactions.filter(t => {
                  if (!t.transaction.createdAt || t.type !== 'expense') return false;
                  const now = new Date();
                  const startDate = new Date();
                  switch (timePeriod) {
                    case '7days': startDate.setDate(now.getDate() - 14); break;
                    case '30days': startDate.setDate(now.getDate() - 60); break;
                    case '90days': startDate.setDate(now.getDate() - 180); break;
                  }
                  const endDate = new Date();
                  switch (timePeriod) {
                    case '7days': endDate.setDate(now.getDate() - 7); break;
                    case '30days': endDate.setDate(now.getDate() - 30); break;
                    case '90days': endDate.setDate(now.getDate() - 90); break;
                  }
                  const date = new Date(t.transaction.createdAt);
                  return date >= startDate && date < endDate;
                }).length)
                : 0
            }
            icon="calculator"
            color={theme.colors.primary}
            invertColors={true}
          />
        </View>

        {/* Spending Health */}
        <View style={styles.healthSection}>
          <CircularProgress
            percentage={analytics.spendingHealthPercentage}
            title="Spending Health"
            subtitle={
              analytics.totalIncome > 0
                ? `${analytics.spendingHealthPercentage.toFixed(0)}% of income`
                : 'No income data'
            }
          />
          <View style={styles.heroInsight}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={16}
              color={theme.custom.colors.textSecondary}
            />
            <Text
              style={[
                styles.insightText,
                theme.custom.typography.caption,
                { color: theme.custom.colors.textSecondary },
              ]}
            >
              {analytics.spendingHealthPercentage <= 50
                ? 'Great job! You\'re spending wisely'
                : analytics.spendingHealthPercentage <= 75
                  ? 'Good balance between spending and saving'
                  : analytics.spendingHealthPercentage <= 100
                    ? 'Consider reducing expenses'
                    : 'Warning: Spending exceeds income'}
            </Text>
          </View>
        </View>

        {/* Top Purchases */}
        {analytics.topPurchases.length > 0 && (
          <TopPurchasesCard items={analytics.topPurchases} initialMaxItems={5} />
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {},
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  periodSelector: {
    padding: 16,
  },
  periodInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  periodLabel: {
    textAlign: 'center',
  },
  comparisonGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  healthSection: {
    margin: 16,
    padding: 24,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  heroInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  insightText: {
    flex: 1,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    minWidth: 100,
  },
});
