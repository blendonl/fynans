import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useFamily } from "../../context/FamilyContext";
import { useAuth } from "../../context/AuthContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Card, Button } from "../../components/design-system";
import { useAppTheme } from "../../theme";
import MemberListItem from "../../components/family/MemberListItem";
import FamilyStatsCard from "../../components/family/FamilyStatsCard";
import FamilyActivityItem from "../../components/family/FamilyActivityItem";
import InviteMemberModal from "../../components/family/InviteMemberModal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Role = "OWNER" | "ADMIN" | "MEMBER";

interface FamilyMember {
  id: string;
  userId: string;
  role: Role;
  balance: number;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface FamilyWithMembers {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  members: FamilyMember[];
}

// Mock recent transactions - in a real app, this would come from an API
interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: number;
  timestamp: string;
  userId: string;
  categoryIcon?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function FamilyDetailScreen() {
  const { theme } = useAppTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { familyId } = route.params as { familyId: string };
  const { user } = useAuth();
  const { leaveFamily, fetchFamilyWithMembers, removeMember } = useFamily();
  const [family, setFamily] = useState<FamilyWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Mock recent transactions - replace with actual API call
  const [recentTransactions] = useState<Transaction[]>([]);

  // Animated values
  const scrollY = useRef(new Animated.Value(0)).current;
  const sectionFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchFamilyDetails();
  }, [familyId]);

  useEffect(() => {
    if (family) {
      // Animate sections fading in
      Animated.timing(sectionFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [family]);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      const data = await fetchFamilyWithMembers(familyId);
      setFamily(data);
    } catch (error) {
      console.error("Failed to fetch family details", error);
      Alert.alert("Error", "Failed to load family details");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFamilyDetails();
    setRefreshing(false);
  };

  const handleLeave = () => {
    const currentMember = family?.members.find((m) => m.userId === user?.id);
    if (
      currentMember?.role === "OWNER" &&
      family &&
      family.members.length > 1
    ) {
      Alert.alert(
        "Cannot Leave",
        "As the owner, you must transfer ownership or remove all members before leaving.",
      );
      return;
    }

    Alert.alert("Leave Family", "Are you sure you want to leave this family?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await leaveFamily(familyId);
            navigation.goBack();
          } catch (error) {
            Alert.alert("Error", "Failed to leave family");
          }
        },
      },
    ]);
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember(familyId, userId);
      await fetchFamilyDetails();
    } catch (error) {
      Alert.alert("Error", "Failed to remove member");
    }
  };

  const currentMember = family?.members.find((m) => m.userId === user?.id);
  const canManageMembers =
    currentMember?.role === "OWNER" || currentMember?.role === "ADMIN";

  const stats = useMemo(() => {
    if (!family) return [];
    return [
      {
        label: "Total Balance",
        value: `$${family.balance.toFixed(2)}`,
        icon: "wallet" as const,
        color: theme.colors.primary,
        valueColor: theme.colors.primary,
      },
      {
        label: "Members",
        value: family.members.length,
        icon: "account-group" as const,
        color: theme.custom.colors.familyGroup,
      },
      {
        label: "Created",
        value: formatDate(family.createdAt),
        icon: "calendar" as const,
        color: theme.custom.colors.info,
      },
    ];
  }, [family?.balance, family?.members.length, family?.createdAt, theme]);

  if (loading && !family) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.custom.colors.textSecondary },
              theme.custom.typography.body,
            ]}
          >
            Loading family details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!family) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        edges={["top"]}
      >
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color={theme.colors.error}
          />
          <Text
            style={[
              styles.errorText,
              { color: theme.colors.error },
              theme.custom.typography.h4,
            ]}
          >
            Family not found
          </Text>
          <View style={{ gap: 12 }}>
            <Button title="Retry" onPress={fetchFamilyDetails} />
            <Button title="Go Back" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Parallax transformations
  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <Animated.ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          padding: theme.custom.spacing.lg,
        }}
      >
        {/* Hero Family Header with Gradient */}
        <Animated.View
          style={[
            styles.header,
            {
              marginBottom: theme.custom.spacing.xl,
              transform: [{ scale: headerScale }],
              opacity: headerOpacity,
            },
          ]}
        >
          <View
            style={{
              borderRadius: theme.custom.borderRadius.xl,
              overflow: "hidden",
              padding: theme.custom.spacing.lg,
              alignItems: "center",
            }}
          >
            <LinearGradient
              colors={[
                `${theme.custom.colors.familyGroup}20`,
                `${theme.custom.colors.familyGroup}10`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: theme.custom.colors.familyGroupLight,
                  borderRadius: theme.custom.borderRadius.round,
                  padding: theme.custom.spacing.lg,
                  marginBottom: theme.custom.spacing.md,
                  ...Platform.select({
                    ios: {
                      shadowColor: theme.custom.colors.familyGroup,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 6,
                    },
                  }),
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={48}
                color={theme.custom.colors.familyGroup}
              />
            </View>

            <Text
              style={[
                styles.familyName,
                { color: theme.colors.onBackground },
                theme.custom.typography.h1,
                { fontWeight: "700", textAlign: "center" },
              ]}
            >
              {family.name}
            </Text>

            <Text
              style={[
                styles.createdDate,
                { color: theme.custom.colors.textSecondary },
                theme.custom.typography.caption,
                { textAlign: "center", marginTop: theme.custom.spacing.xs },
              ]}
            >
              Created {formatDate(family.createdAt)}
            </Text>
          </View>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View
          style={{
            opacity: sectionFadeAnim,
            transform: [
              {
                translateY: sectionFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            marginBottom: theme.custom.spacing.lg,
          }}
        >
          <FamilyStatsCard stats={stats} columns={3} />
        </Animated.View>

        {/* Members Section */}
        <Animated.View
          style={[
            styles.section,
            {
              marginTop: theme.custom.spacing.xxl,
              opacity: sectionFadeAnim,
              transform: [
                {
                  translateY: sectionFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.custom.colors.glassBackground,
                paddingHorizontal: theme.custom.spacing.md,
                paddingVertical: theme.custom.spacing.sm,
                borderRadius: theme.custom.borderRadius.round,
              }}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                  theme.custom.typography.h3,
                  { fontWeight: "600" },
                ]}
              >
                Members
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: `${theme.colors.primary}20`,
                    borderRadius: theme.custom.borderRadius.round,
                    paddingHorizontal: theme.custom.spacing.sm,
                    paddingVertical: 4,
                    marginLeft: theme.custom.spacing.sm,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: theme.colors.primary },
                    theme.custom.typography.small,
                    { fontWeight: "600" },
                  ]}
                >
                  {family.members.length}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              height: 2,
              marginTop: theme.custom.spacing.sm,
              marginBottom: theme.custom.spacing.md,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={[
                theme.custom.colors.gradientPrimaryStart,
                theme.custom.colors.gradientPrimaryEnd,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </View>

          <View>
            {family.members.map((member) => (
              <MemberListItem
                key={member.id}
                member={member}
                currentUserRole={currentMember?.role || null}
                isCurrentUser={member.userId === user?.id}
                onRemove={handleRemoveMember}
                canManage={canManageMembers}
              />
            ))}
          </View>
        </Animated.View>

        {/* Recent Activity Section */}
        {recentTransactions.length > 0 && (
          <View
            style={[styles.section, { marginTop: theme.custom.spacing.lg }]}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.onBackground },
                  theme.custom.typography.h4,
                ]}
              >
                Recent Activity
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Navigate to transactions filtered by family
                  (navigation as any).navigate("Main", {
                    screen: "Transactions",
                  });
                }}
              >
                <Text
                  style={[
                    styles.viewAllText,
                    { color: theme.colors.primary, fontWeight: "500" },
                    theme.custom.typography.bodyMedium,
                  ]}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: theme.custom.spacing.sm }}>
              {recentTransactions.slice(0, 5).map((transaction) => {
                const member = family.members.find(
                  (m) => m.userId === transaction.userId,
                );
                const memberName =
                  member?.user.firstName && member?.user.lastName
                    ? `${member.user.firstName} ${member.user.lastName}`
                    : member?.user.email || "Unknown";

                return (
                  <FamilyActivityItem
                    key={transaction.id}
                    type={transaction.type}
                    description={transaction.description}
                    memberName={memberName}
                    amount={transaction.amount}
                    timestamp={transaction.timestamp}
                    categoryIcon={transaction.categoryIcon as any}
                    onPress={() => {
                      // Navigate to transaction detail
                    }}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Empty state for no activity */}
        {recentTransactions.length === 0 && (
          <View
            style={[
              styles.emptyActivity,
              { marginTop: theme.custom.spacing.lg },
            ]}
          >
            <Card style={{ padding: theme.custom.spacing.lg }}>
              <MaterialCommunityIcons
                name="history"
                size={48}
                color={theme.custom.colors.textDisabled}
                style={{
                  alignSelf: "center",
                  marginBottom: theme.custom.spacing.sm,
                }}
              />
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.custom.colors.textSecondary,
                    fontWeight: "500",
                  },
                  theme.custom.typography.body,
                ]}
              >
                No recent activity
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: theme.custom.colors.textDisabled },
                  theme.custom.typography.caption,
                ]}
              >
                Transactions will appear here
              </Text>
            </Card>
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={{
            marginTop: theme.custom.spacing.xl,
            gap: theme.custom.spacing.md,
            paddingBottom: theme.custom.spacing.lg,
          }}
        >
          <Button
            title="Invite Member"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowInviteModal(true);
            }}
          />

          <Button
            title="Leave Family"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleLeave();
            }}
            style={{
              backgroundColor: theme.colors.error,
            }}
          />
        </View>
      </Animated.ScrollView>

      <InviteMemberModal
        visible={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          fetchFamilyDetails();
        }}
        familyId={familyId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
  },
  headerIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  familyName: {
    textAlign: "center",
    marginBottom: 4,
  },
  createdDate: {
    textAlign: "center",
  },
  section: {},
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {},
  badge: {
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {},
  viewAllText: {},
  emptyActivity: {},
  emptyText: {
    textAlign: "center",
    marginBottom: 4,
  },
  emptySubtext: {
    textAlign: "center",
  },
});
