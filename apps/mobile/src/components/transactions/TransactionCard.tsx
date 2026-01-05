import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "../design-system";
import { useAppTheme } from "../../theme";
import { Transaction } from "../../features/transactions/types";
import { useAuth } from "../../context/AuthContext";

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const { theme } = useAppTheme();
  const { user: currentUser } = useAuth();
  const isExpense = transaction.type === "expense";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getTitle = () => {
    if (isExpense && transaction.store) {
      return `${transaction.category.name} at ${transaction.store.name} `;
    }
    return transaction.category.name;
  };

  const getSubtitle = () => {
    const parts: string[] = [];

    const isCurrentUser = currentUser?.id === transaction.transaction.user.id;
    const userName = isCurrentUser
      ? "(you)"
      : `${transaction.transaction.user.firstName} ${transaction.transaction.user.lastName}`.trim() ||
        "Unknown";
    parts.push(userName);

    if (isExpense && transaction.items && transaction.items.length > 0) {
      const itemCount = transaction.items.length;
      parts.push(`${itemCount} item${itemCount > 1 ? "s" : ""}`);
    } else if (transaction.store?.location) {
      parts.push(transaction.store.location);
    }

    return parts.join(" • ");
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <Card style={styles.card} elevation={2}>
        {transaction.scope === "FAMILY" && (
          <View style={styles.scopeBadge}>
            <MaterialCommunityIcons
              name="account-group"
              size={12}
              color="#4CAF50"
            />
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isExpense
                    ? theme.custom.colors.expense + "20"
                    : theme.custom.colors.income + "20",
                },
              ]}
            >
              <Text
                style={[
                  styles.iconText,
                  {
                    color: isExpense
                      ? theme.custom.colors.expense
                      : theme.custom.colors.income,
                  },
                ]}
              >
                {isExpense ? "−" : "+"}
              </Text>
            </View>
            <View style={styles.info}>
              <Text
                style={[
                  styles.title,
                  theme.custom.typography.bodyMedium,
                  { color: theme.custom.colors.text },
                ]}
                numberOfLines={1}
              >
                {getTitle()}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  theme.custom.typography.caption,
                  { color: theme.custom.colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {getSubtitle()}
              </Text>
            </View>
          </View>
          <View style={styles.rightSection}>
            <Text
              style={[
                styles.amount,
                theme.custom.typography.h5,
                {
                  color: isExpense
                    ? theme.custom.colors.expense
                    : theme.custom.colors.income,
                },
              ]}
            >
              {isExpense ? "−" : "+"}
              {formatCurrency(transaction.transaction.value)}
            </Text>
            {transaction.transaction.createdAt && (
              <Text
                style={[
                  styles.date,
                  theme.custom.typography.small,
                  { color: theme.custom.colors.textSecondary },
                ]}
              >
                {formatDate(transaction.transaction.createdAt)}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    position: "relative",
  },
  scopeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderRadius: 12,
    padding: 4,
    paddingHorizontal: 6,
    zIndex: 1,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
    fontWeight: "600",
  },
  info: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {},
  rightSection: {
    alignItems: "flex-end",
  },
  amount: {
    marginBottom: 2,
  },
  date: {},
});
