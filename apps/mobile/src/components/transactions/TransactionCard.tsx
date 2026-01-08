import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "../design-system";
import { useAppTheme } from "../../theme";
import { Transaction } from "../../features/transactions/types";
import { useAuth } from "../../context/AuthContext";
import { getCategoryIcon } from "../../utils/categoryIcons";
import { formatRelativeDate } from "../../utils/timeUtils";

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
  const hasReceipts = transaction.receiptImages && transaction.receiptImages.length > 0;

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getSubtitle = () => {
    const parts: string[] = [];

    if (isExpense && transaction.store) {
      parts.push(transaction.store.name);
    }

    if (isExpense && transaction.items && transaction.items.length > 0) {
      const itemCount = transaction.items.length;
      parts.push(`${itemCount} item${itemCount > 1 ? "s" : ""}`);
    }

    const isCurrentUser = currentUser?.id === transaction.transaction.user.id;
    const userName = isCurrentUser
      ? "(you)"
      : `${transaction.transaction.user.firstName} ${transaction.transaction.user.lastName}`.trim() ||
        "Unknown";
    parts.push(userName);

    return parts.join(" • ");
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <Card style={styles.card} elevation={2}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isExpense
                    ? theme.custom.colors.expense + "15"
                    : theme.custom.colors.income + "15",
                },
              ]}
            >
              <Text style={styles.iconEmoji}>
                {getCategoryIcon(transaction.category.name)}
              </Text>
            </View>
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    theme.custom.typography.bodyMedium,
                    { color: theme.custom.colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {transaction.category.name}
                </Text>
                {transaction.scope === "FAMILY" && (
                  <View
                    style={[
                      styles.familyBadge,
                      { backgroundColor: theme.custom.colors.income + "20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account-group"
                      size={10}
                      color={theme.custom.colors.income}
                    />
                    <Text
                      style={[
                        styles.familyBadgeText,
                        { color: theme.custom.colors.income },
                      ]}
                    >
                      Family
                    </Text>
                  </View>
                )}
              </View>
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
                theme.custom.typography.bodyMedium,
                {
                  color: isExpense
                    ? theme.custom.colors.expense
                    : theme.custom.colors.income,
                  fontWeight: "600",
                },
              ]}
            >
              {isExpense ? "−" : "+"}
              {formatCurrency(transaction.transaction.value)}
            </Text>
            <View style={styles.dateRow}>
              {hasReceipts && (
                <MaterialCommunityIcons
                  name="paperclip"
                  size={12}
                  color={theme.custom.colors.textSecondary}
                  style={styles.receiptIcon}
                />
              )}
              <Text
                style={[
                  styles.date,
                  theme.custom.typography.small,
                  { color: theme.custom.colors.textSecondary },
                ]}
              >
                {formatRelativeDate(transaction.transaction.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  title: {
    marginRight: 8,
    flexShrink: 1,
  },
  familyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  familyBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  subtitle: {},
  rightSection: {
    alignItems: "flex-end",
  },
  amount: {
    marginBottom: 3,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  receiptIcon: {
    marginRight: 4,
  },
  date: {},
});
