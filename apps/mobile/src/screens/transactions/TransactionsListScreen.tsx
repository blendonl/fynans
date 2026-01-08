import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { EmptyState, Card } from "../../components/design-system";
import { SearchBar, SearchFilter } from "../../components/analytics";
import { TransactionCard, FilterSheet } from "../../components/transactions";
import { useAppTheme } from "../../theme";
import { useTransactions } from "../../hooks/useTransactions";
import { useFilters } from "../../hooks/useFilters";
import { useFamily } from "../../context/FamilyContext";

interface FamilyMemberData {
  id: string;
  name: string;
  familyId: string;
  familyName: string;
}

export default function TransactionsListScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { families, fetchFamilyWithMembers } = useFamily();
  const {
    filters,
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
  } = useTransactions(filters, families);

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [searchFilter, setSearchFilter] = useState<SearchFilter | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>([]);

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

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const filteredTransactions = useMemo(() => {
    let result = filterTransactions(transactions);

    if (searchFilter) {
      result = result.filter((t) => {
        switch (searchFilter.type) {
          case 'expenseCategory':
            return t.category.id === searchFilter.id;
          case 'itemCategory':
            return false;
          case 'itemName':
            return t.items?.some((item) => item.name === searchFilter.name);
          case 'family':
            return searchFilter.id === 'PERSONAL'
              ? t.scope === 'PERSONAL'
              : t.familyId === searchFilter.id;
          case 'member':
            return t.transaction.user.id === searchFilter.id;
          default:
            return true;
        }
      });
    }

    return result;
  }, [transactions, filterTransactions, searchFilter]);

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

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const netAmount = stats.totalIncome - stats.totalExpenses;
  const isPositiveNet = netAmount >= 0;

  const renderStatsCard = () => (
    <Card style={styles.statsCard} elevation={2}>
      <View style={styles.statsContent}>
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconContainer,
              {
                backgroundColor: isPositiveNet
                  ? theme.custom.colors.income + "15"
                  : theme.custom.colors.expense + "15",
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isPositiveNet ? "trending-up" : "trending-down"}
              size={18}
              color={
                isPositiveNet
                  ? theme.custom.colors.income
                  : theme.custom.colors.expense
              }
            />
          </View>
          <Text
            style={[
              styles.statLabel,
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            Net
          </Text>
          <Text
            style={[
              styles.statValue,
              theme.custom.typography.h5,
              {
                color: isPositiveNet
                  ? theme.custom.colors.income
                  : theme.custom.colors.expense,
              },
            ]}
          >
            {isPositiveNet ? "+" : "−"}
            {formatCurrency(Math.abs(netAmount))}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: theme.custom.colors.income + "15" },
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-down"
              size={18}
              color={theme.custom.colors.income}
            />
          </View>
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
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View
            style={[
              styles.statIconContainer,
              { backgroundColor: theme.custom.colors.expense + "15" },
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-up"
              size={18}
              color={theme.custom.colors.expense}
            />
          </View>
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
      </View>
    </Card>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View
        style={[
          styles.skeletonStatsCard,
          { backgroundColor: theme.custom.colors.surface },
        ]}
      >
        <View style={styles.skeletonStatsContent}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonStatItem}>
              <View
                style={[
                  styles.skeletonCircle,
                  { backgroundColor: theme.custom.colors.border },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: theme.custom.colors.border, width: 40 },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: theme.custom.colors.border, width: 60 },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.skeletonCard,
            { backgroundColor: theme.custom.colors.surface },
          ]}
        >
          <View style={styles.skeletonCardContent}>
            <View
              style={[
                styles.skeletonIcon,
                { backgroundColor: theme.custom.colors.border },
              ]}
            />
            <View style={styles.skeletonInfo}>
              <View
                style={[
                  styles.skeletonLine,
                  {
                    backgroundColor: theme.custom.colors.border,
                    width: "60%",
                  },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  {
                    backgroundColor: theme.custom.colors.border,
                    width: "40%",
                    marginTop: 6,
                  },
                ]}
              />
            </View>
            <View style={styles.skeletonRight}>
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: theme.custom.colors.border, width: 50 },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  {
                    backgroundColor: theme.custom.colors.border,
                    width: 40,
                    marginTop: 6,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const handleClearAll = () => {
    clearFilters();
    setSearchFilter(null);
  };

  const renderFilterChips = () => {
    const activeFilterCount = getActiveFilterCount();
    const hasSearchFilter = searchFilter !== null;
    const totalFilters = activeFilterCount + (hasSearchFilter ? 1 : 0);

    if (totalFilters === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <Chip icon="close" onPress={handleClearAll} style={styles.filterChip}>
          Clear All ({totalFilters})
        </Chip>
      </View>
    );
  };

  const renderSectionHeader = (monthLabel: string, total: number) => (
    <View
      style={[
        styles.sectionHeader,
        { backgroundColor: theme.colors.background },
      ]}
    >
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
        onPress={() =>
          navigation.navigate("TransactionDetail", { transaction: item })
        }
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.skeletonSearchBar,
              { backgroundColor: theme.custom.colors.surface },
            ]}
          />
        </View>
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <SearchBar
          expenseCategories={searchData.expenseCategories}
          itemCategories={searchData.itemCategories}
          itemNames={searchData.itemNames}
          families={searchData.families}
          members={searchData.members}
          onFilterSelect={setSearchFilter}
          selectedFilter={searchFilter}
          placeholder="Search categories, items, families..."
        />
        {renderFilterChips()}
      </View>

      {transactions.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No Transactions Yet"
          description="Start by adding your first expense or income"
          actionLabel="Add Transaction"
          onAction={() => navigation.navigate("AddTransaction")}
        />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No Results Found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          onAction={handleClearAll}
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
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 11,
  },
  statValue: {
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {},
  sectionTotal: {},
  listContent: {
    paddingBottom: 100,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
  },
  skeletonSearchBar: {
    height: 48,
    borderRadius: 24,
  },
  skeletonStatsCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  skeletonStatsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  skeletonStatItem: {
    alignItems: "center",
  },
  skeletonCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginBottom: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  skeletonCard: {
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  skeletonCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  skeletonIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    marginRight: 12,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonRight: {
    alignItems: "flex-end",
  },
});
