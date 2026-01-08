import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from "react-native";
import { Divider } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ImageView from "react-native-image-viewing";
import { useAppTheme } from "../../theme";
import { Transaction } from "../../features/transactions/types";
import { Card } from "../../components/design-system";
import { CategoryIcon } from "../../components/transactions/CategoryIcon";
import { apiClient } from "../../api/client";

interface TransactionDetailScreenProps {
  route: {
    params: {
      transaction: Transaction;
    };
  };
  navigation: any;
}

export default function TransactionDetailScreen({
  route,
  navigation,
}: TransactionDetailScreenProps) {
  const { transaction } = route.params;
  const { theme } = useAppTheme();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const isExpense = transaction.type === "expense";
  const date = transaction.transaction.createdAt
    ? new Date(transaction.transaction.createdAt)
    : new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleImagePress = (index: number) => {
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              const endpoint = isExpense
                ? `/expenses/${transaction.id}`
                : `/transactions/${transaction.transaction.id}`;
              await apiClient.post(endpoint, { _method: "DELETE" });
              Alert.alert("Success", "Transaction deleted successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete transaction",
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const calculateTotal = () => {
    if (!transaction.items || transaction.items.length === 0) {
      return transaction.transaction.value;
    }
    return transaction.items.reduce(
      (sum, item) =>
        sum + (item.price - (item.discount || 0)) * (item.quantity || 1),
      0,
    );
  };

  const GradientDivider = () => (
    <View style={styles.gradientDividerContainer}>
      <LinearGradient
        colors={[
          theme.custom.colors.gradientPrimaryStart,
          theme.custom.colors.gradientPrimaryEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientDivider}
      />
    </View>
  );

  const accentColor = isExpense
    ? theme.custom.colors.expense
    : theme.custom.colors.income;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.heroHeader,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={[`${accentColor}15`, theme.colors.background]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[
                styles.heroIconContainer,
                {
                  backgroundColor: `${accentColor}15`,
                  ...Platform.select({
                    ios: {
                      shadowColor: accentColor,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.25,
                      shadowRadius: 12,
                    },
                    android: { elevation: 8 },
                  }),
                },
              ]}
            >
              <CategoryIcon
                categoryName={transaction.category?.name || "Unknown"}
                size={40}
                color={accentColor}
              />
            </View>

            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: theme.custom.colors.glassBackground },
              ]}
            >
              <Text
                style={[
                  theme.custom.typography.caption,
                  { color: theme.custom.colors.textSecondary },
                ]}
              >
                {transaction.category?.name || "Unknown"}
              </Text>
            </View>

            <Text
              style={[
                styles.heroAmount,
                theme.custom.typography.h1,
                { color: accentColor },
              ]}
            >
              {`${isExpense ? "−" : "+"} $${transaction.transaction.value.toFixed(2)}`}
            </Text>

            <View style={styles.dateTimeRow}>
              <MaterialCommunityIcons
                name="calendar"
                size={14}
                color={theme.custom.colors.textSecondary}
              />
              <Text
                style={[
                  theme.custom.typography.caption,
                  { color: theme.custom.colors.textSecondary, marginLeft: 4 },
                ]}
              >
                {formatDate(date)}
              </Text>
              <View
                style={[
                  styles.dateSeparator,
                  { backgroundColor: theme.custom.colors.textDisabled },
                ]}
              />
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color={theme.custom.colors.textSecondary}
              />
              <Text
                style={[
                  theme.custom.typography.caption,
                  { color: theme.custom.colors.textSecondary, marginLeft: 4 },
                ]}
              >
                {formatTime(date)}
              </Text>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.custom.colors.glassBackgroundStrong },
                ]}
                onPress={() => {
                  Alert.alert(
                    "Coming Soon",
                    "Edit functionality will be available soon",
                  );
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color={theme.custom.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: `${theme.colors.error}15` },
                ]}
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={20}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {transaction.store && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            }}
          >
            <Card style={styles.section} elevation={1}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionHeaderPill,
                    { backgroundColor: theme.custom.colors.glassBackground },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="store"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      theme.custom.typography.h5,
                      { color: theme.custom.colors.text, marginLeft: 8 },
                    ]}
                  >
                    Store
                  </Text>
                </View>
              </View>
              <GradientDivider />
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    theme.custom.typography.bodyMedium,
                    { color: theme.custom.colors.textSecondary },
                  ]}
                >
                  Name
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    theme.custom.typography.body,
                    { color: theme.custom.colors.text },
                  ]}
                >
                  {transaction.store?.name || "Unknown"}
                </Text>
              </View>
              {transaction.store.location && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      theme.custom.typography.bodyMedium,
                      { color: theme.custom.colors.textSecondary },
                    ]}
                  >
                    Location
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      theme.custom.typography.body,
                      { color: theme.custom.colors.text },
                    ]}
                  >
                    {transaction.store.location}
                  </Text>
                </View>
              )}
            </Card>
          </Animated.View>
        )}

        {transaction.items && transaction.items.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            }}
          >
            <Card style={styles.section} elevation={1}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionHeaderPill,
                    { backgroundColor: theme.custom.colors.glassBackground },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="format-list-bulleted"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      theme.custom.typography.h5,
                      { color: theme.custom.colors.text, marginLeft: 8 },
                    ]}
                  >
                    Items
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: `${theme.colors.primary}20` },
                    ]}
                  >
                    <Text
                      style={[
                        theme.custom.typography.small,
                        { color: theme.colors.primary, fontWeight: "600" },
                      ]}
                    >
                      {transaction.items.length}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    theme.custom.typography.bodyMedium,
                    { color: theme.custom.colors.textSecondary },
                  ]}
                >
                  Total: ${calculateTotal().toFixed(2)}
                </Text>
              </View>
              <GradientDivider />
              {transaction.items.map((item, index) => (
                <View key={index}>
                  <View
                    style={[
                      styles.itemRow,
                      index % 2 === 0 && {
                        backgroundColor: `${theme.custom.colors.surfaceVariant}30`,
                      },
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.itemDot,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      />
                      <View style={styles.itemDetails}>
                        <Text
                          style={[
                            theme.custom.typography.bodyMedium,
                            { color: theme.custom.colors.text },
                          ]}
                        >
                          {item.name || "Unknown item"}
                        </Text>
                        {(item.quantity || 1) > 1 && (
                          <Text
                            style={[
                              theme.custom.typography.caption,
                              { color: theme.custom.colors.textSecondary },
                            ]}
                          >
                            Qty: {item.quantity}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.itemRight}>
                      <Text
                        style={[
                          theme.custom.typography.bodyMedium,
                          { color: theme.custom.colors.text },
                        ]}
                      >
                        $
                        {(
                          ((item.price || 0) - (item.discount || 0)) *
                          (item.quantity || 1)
                        ).toFixed(2)}
                      </Text>
                      {item.discount && item.discount > 0 && (
                        <View
                          style={[
                            styles.discountBadge,
                            { backgroundColor: `${theme.custom.colors.success}15` },
                          ]}
                        >
                          <Text
                            style={[
                              theme.custom.typography.small,
                              { color: theme.custom.colors.success },
                            ]}
                          >
                            -${item.discount.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {index < (transaction.items?.length || 0) - 1 && (
                    <Divider style={{ marginVertical: 4 }} />
                  )}
                </View>
              ))}
            </Card>
          </Animated.View>
        )}

        {transaction.transaction.description && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            }}
          >
            <Card style={styles.section} elevation={1}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionHeaderPill,
                    { backgroundColor: theme.custom.colors.glassBackground },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="text"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      theme.custom.typography.h5,
                      { color: theme.custom.colors.text, marginLeft: 8 },
                    ]}
                  >
                    Description
                  </Text>
                </View>
              </View>
              <GradientDivider />
              <Text
                style={[
                  styles.description,
                  theme.custom.typography.body,
                  { color: theme.custom.colors.text },
                ]}
              >
                {transaction.transaction.description}
              </Text>
            </Card>
          </Animated.View>
        )}

        {transaction.receiptImages && transaction.receiptImages.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            }}
          >
            <Card style={styles.section} elevation={1}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionHeaderPill,
                    { backgroundColor: theme.custom.colors.glassBackground },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="receipt"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      theme.custom.typography.h5,
                      { color: theme.custom.colors.text, marginLeft: 8 },
                    ]}
                  >
                    Receipts
                  </Text>
                  <View
                    style={[
                      styles.countBadge,
                      { backgroundColor: `${theme.colors.primary}20` },
                    ]}
                  >
                    <Text
                      style={[
                        theme.custom.typography.small,
                        { color: theme.colors.primary, fontWeight: "600" },
                      ]}
                    >
                      {transaction.receiptImages.length}
                    </Text>
                  </View>
                </View>
              </View>
              <GradientDivider />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.receiptGrid}>
                  {transaction.receiptImages.map((uri, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleImagePress(index)}
                      activeOpacity={0.85}
                      style={styles.receiptThumbnailWrapper}
                    >
                      <Image
                        source={{ uri }}
                        style={[
                          styles.receiptThumbnail,
                          { borderColor: theme.custom.colors.border },
                        ]}
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.3)"]}
                        style={styles.receiptOverlay}
                      />
                      <View style={styles.receiptIndex}>
                        <Text style={styles.receiptIndexText}>{index + 1}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Card>
          </Animated.View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {transaction.receiptImages && transaction.receiptImages.length > 0 && (
        <ImageView
          images={transaction.receiptImages.map((uri) => ({ uri }))}
          imageIndex={imageViewerIndex}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  heroContainer: {
    alignItems: "center",
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  heroAmount: {
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dateSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionHeaderPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  gradientDividerContainer: {
    height: 2,
    marginVertical: 12,
    borderRadius: 1,
    overflow: "hidden",
  },
  gradientDivider: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  infoLabel: {},
  infoValue: {},
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  discountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  description: {
    lineHeight: 24,
  },
  receiptGrid: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8,
  },
  receiptThumbnailWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  receiptThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
  },
  receiptOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  receiptIndex: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  receiptIndexText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
