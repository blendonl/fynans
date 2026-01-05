import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Chip } from 'react-native-paper';
import { SearchBar, EmptyState, Card } from '../../components/design-system';
import { TransactionCard, FilterSheet } from '../../components/transactions';
import FamilySwitcher from '../../components/family/FamilySwitcher';
import { useAppTheme } from '../../theme';
import { useTransactions } from '../../hooks/useTransactions';
import { useFilters } from '../../hooks/useFilters';

export default function TransactionsListScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const {
    filters,
    searchQuery,
    setSearchQuery,
    applyFilters,
    clearFilters,
    filterTransactions,
    getActiveFilterCount,
  } = useFilters();

  const {
    transactions,
    loading,
    error,
    refreshing,
    refresh,
    groupByMonth,
    getStats,
    retry,
  } = useTransactions(filters);

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions);
  }, [transactions, filters, searchQuery]);

  const groupedTransactions = useMemo(() => {
    return groupByMonth(filteredTransactions);
  }, [filteredTransactions]);

  const stats = useMemo(() => {
    return getStats(filteredTransactions);
  }, [filteredTransactions]);

  const categories = useMemo(() => {
    const categoryMap = new Map();
    transactions.forEach((t) => {
      if (!categoryMap.has(t.category.id)) {
        categoryMap.set(t.category.id, t.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard} elevation={2}>
      <View style={styles.statsContent}>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            Total
          </Text>
          <Text
            style={[
              styles.statValue,
              theme.custom.typography.h4,
              { color: theme.custom.colors.text },
            ]}
          >
            {formatCurrency(Math.abs(stats.totalExpenses - stats.totalIncome))}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            Expenses
          </Text>
          <Text
            style={[
              styles.statValue,
              theme.custom.typography.h5,
              { color: theme.custom.colors.expense },
            ]}
          >
            {formatCurrency(stats.totalExpenses)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            Income
          </Text>
          <Text
            style={[
              styles.statValue,
              theme.custom.typography.h5,
              { color: theme.custom.colors.income },
            ]}
          >
            {formatCurrency(stats.totalIncome)}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderFilterChips = () => {
    const activeFilterCount = getActiveFilterCount();
    if (activeFilterCount === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <Chip
          icon="close"
          onPress={clearFilters}
          style={styles.filterChip}
        >
          Clear All ({activeFilterCount})
        </Chip>
      </View>
    );
  };

  const renderSectionHeader = (monthLabel: string, total: number) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Text
        style={[
          styles.sectionTitle,
          theme.custom.typography.h5,
          { color: theme.custom.colors.text },
        ]}
      >
        {monthLabel}
      </Text>
      <Text
        style={[
          styles.sectionTotal,
          theme.custom.typography.bodyMedium,
          { color: theme.custom.colors.textSecondary },
        ]}
      >
        {formatCurrency(total)}
      </Text>
    </View>
  );

  const renderItem = ({ item }: any) => {
    if (item.isHeader) {
      return renderSectionHeader(item.monthLabel, item.total);
    }
    return (
      <TransactionCard
        transaction={item}
        onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
      />
    );
  };

  const flatListData = useMemo(() => {
    const data: any[] = [];
    groupedTransactions.forEach((group) => {
      data.push({
        id: `header-${group.key}`,
        isHeader: true,
        monthLabel: group.monthLabel,
        total: group.total,
      });
      group.transactions.forEach((transaction) => {
        data.push(transaction);
      });
    });
    return data;
  }, [groupedTransactions]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="⚠️"
          title="Error Loading Transactions"
          description={error}
          actionLabel="Retry"
          onAction={retry}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <FamilySwitcher style={styles.familySwitcher} compact />
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
          onFilterPress={() => setFilterSheetVisible(true)}
          style={styles.searchBar}
        />
        {renderFilterChips()}
      </View>

      {transactions.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No Transactions Yet"
          description="Start by adding your first expense or income"
          actionLabel="Add Transaction"
          onAction={() => navigation.navigate('AddTransaction')}
        />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Results Found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          {renderStatsCard()}
          <FlatList
            data={flatListData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <FilterSheet
        visible={filterSheetVisible}
        filters={filters}
        categories={categories}
        onClose={() => setFilterSheetVisible(false)}
        onApply={applyFilters}
        onClear={clearFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  familySwitcher: {
    marginBottom: 12,
  },
  searchBar: {
    marginBottom: 8,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {},
  sectionTotal: {},
  listContent: {
    paddingBottom: 16,
  },
});
