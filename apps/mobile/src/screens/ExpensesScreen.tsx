import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { expenseControllerFindAll } from '../api/generated/endpoints/expense/expense';
import type { ExpenseResponseDto } from '../api/generated/model';
import { GlassScreenLayout } from "../components/layout/GlassScreenLayout";
import { Card } from "../components/design-system/Card";
import { Button } from "../components/design-system/Button";

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<ExpenseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await expenseControllerFindAll();

      setExpenses(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassScreenLayout>
        <View style={styles.centered}>
          <Card glass style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </Card>
        </View>
      </GlassScreenLayout>
    );
  }

  return (
    <GlassScreenLayout>
      <Card glass style={styles.headerCard}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="wallet-outline" size={32} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>Total Expenses</Text>
            <Text style={styles.headerValue}>
              ${expenses.reduce((sum, exp) => sum + (exp.transaction?.value || 0), 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </Card>

      {error ? (
        <View style={styles.centered}>
          <Card glass style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ff6b6b" />
            <Text style={styles.error}>{error}</Text>
            <Button title="Retry" onPress={fetchExpenses} variant="glass" />
          </Card>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          renderItem={({ item }) => (
            <Card glass style={styles.item}>
              <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemText}>
                    {`${item.category.name} in ${item.store.name}` || "Expense"}
                  </Text>
                  <Text style={styles.itemDate}>
                    {new Date(item.transaction?.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.itemAmount}>-${item.transaction.value}</Text>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Card glass style={styles.emptyCard}>
              <MaterialCommunityIcons name="inbox" size={48} color="rgba(255, 255, 255, 0.5)" />
              <Text style={styles.emptyText}>No expenses found</Text>
            </Card>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </GlassScreenLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingCard: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  errorCard: {
    padding: 32,
    alignItems: "center",
  },
  error: {
    color: "#ff6b6b",
    fontSize: 16,
    marginVertical: 16,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  item: {
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ff6b6b",
  },
  emptyCard: {
    padding: 48,
    alignItems: "center",
    marginTop: 32,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
  },
});
