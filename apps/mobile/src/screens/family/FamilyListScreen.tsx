import React, { useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, RefreshControl, Platform } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFamily } from "../../context/FamilyContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Card, Button } from "../../components/design-system";
import { useAppTheme } from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RoleBadge from "../../components/family/RoleBadge";

// Skeleton loader component
const SkeletonCard = ({ theme }: { theme: any }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonCard,
        {
          backgroundColor: theme.custom.colors.glassBackground,
          borderRadius: theme.custom.borderRadius.lg,
          padding: theme.custom.spacing.lg,
          marginBottom: theme.custom.spacing.md,
          opacity,
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View
          style={[
            styles.skeletonIcon,
            {
              width: 56,
              height: 56,
              backgroundColor: theme.custom.colors.divider,
              borderRadius: theme.custom.borderRadius.lg,
              marginRight: theme.custom.spacing.md,
            },
          ]}
        />
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.skeletonText,
              {
                width: '60%',
                height: 20,
                backgroundColor: theme.custom.colors.divider,
                borderRadius: 4,
                marginBottom: 8,
              },
            ]}
          />
          <View
            style={[
              styles.skeletonText,
              {
                width: '40%',
                height: 16,
                backgroundColor: theme.custom.colors.divider,
                borderRadius: 4,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// Family list item component to avoid hooks in renderItem
interface FamilyListItemProps {
  item: any;
  index: number;
  theme: any;
  onPress: (familyId: string) => void;
}

const FamilyListItem: React.FC<FamilyListItemProps> = ({ item, index, theme, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 100,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
    ]).start();

    setTimeout(() => {
      onPress(item.id);
    }, 100);
  };

  const memberCount = item.members?.length || 0;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
        marginBottom: theme.custom.spacing.md,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={{
          borderRadius: theme.custom.borderRadius.lg,
          overflow: 'hidden',
        }}
      >
        <View
          style={[
            styles.familyCard,
            {
              padding: theme.custom.spacing.lg,
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.custom.colors.border,
              borderRadius: theme.custom.borderRadius.lg,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 2,
                },
              }),
            }
          ]}
        >
          <View style={styles.cardContent}>
            <View style={[
              styles.iconContainer,
              {
                backgroundColor: theme.custom.colors.familyGroupLight,
                borderRadius: theme.custom.borderRadius.lg,
                padding: theme.custom.spacing.md,
                marginRight: theme.custom.spacing.md,
              }
            ]}>
              <MaterialCommunityIcons
                name="account-group"
                size={28}
                color={theme.custom.colors.familyGroup}
              />
            </View>

            <View style={styles.textContent}>
              <Text style={[
                styles.familyName,
                { color: theme.colors.onSurface },
                theme.custom.typography.h4,
                { fontWeight: '600' },
              ]}>
                {item.name}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[
                  styles.balance,
                  {
                    color: parseFloat(item.balance) >= 0
                      ? theme.custom.colors.income
                      : theme.custom.colors.expense,
                    fontWeight: '500',
                  },
                  theme.custom.typography.caption,
                ]}>
                  ${item.balance.toFixed(2)}
                </Text>
                {memberCount > 0 && (
                  <>
                    <Text style={{ color: theme.custom.colors.divider, marginHorizontal: 8 }}>•</Text>
                    <MaterialCommunityIcons
                      name="account-multiple"
                      size={14}
                      color={theme.custom.colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[
                      { color: theme.custom.colors.textSecondary },
                      theme.custom.typography.caption,
                    ]}>
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.primary}
            />
          </View>

          {/* Role badge overlay - top right */}
          {item.currentUserRole && (
            <View style={styles.roleBadgeContainer}>
              <RoleBadge role={item.currentUserRole} iconOnly />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function FamilyListScreen() {
  const { theme } = useAppTheme();
  const { families, pendingInvitations, fetchFamilies, fetchPendingInvitations, loading } = useFamily();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);
  const bannerSlideAnim = useRef(new Animated.Value(-100)).current;

  useFocusEffect(
    useCallback(() => {
      fetchFamilies();
      fetchPendingInvitations();
    }, [])
  );

  useEffect(() => {
    if (pendingInvitations.length > 0) {
      Animated.spring(bannerSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [pendingInvitations.length]);


  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchFamilies(), fetchPendingInvitations()]);
    setRefreshing(false);
  };

  if (loading && families.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            padding: theme.custom.spacing.lg,
            paddingTop: theme.custom.spacing.xxl,
          }
        ]}
        edges={['top']}
      >
        <SkeletonCard theme={theme} />
        <SkeletonCard theme={theme} />
        <SkeletonCard theme={theme} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      {
        backgroundColor: theme.colors.background,
        padding: theme.custom.spacing.lg,
        paddingTop: theme.custom.spacing.xxl,
      }
    ]} edges={['top']}>
      {pendingInvitations.length > 0 && (
        <Animated.View
          style={{
            transform: [{ translateY: bannerSlideAnim }],
            marginBottom: theme.custom.spacing.lg,
          }}
        >
          <TouchableOpacity
            style={[
              styles.invitationBanner,
              {
                borderRadius: theme.custom.borderRadius.xl,
                overflow: 'hidden',
                ...Platform.select({
                  ios: {
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("PendingInvitations" as never);
            }}
            activeOpacity={0.9}
          >
            <BlurView
              intensity={20}
              tint={theme.dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                theme.custom.colors.gradientPrimaryStart,
                theme.custom.colors.gradientPrimaryEnd,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[
              styles.bannerContent,
              {
                padding: theme.custom.spacing.md + 4,
              }
            ]}>
              <MaterialCommunityIcons
                name="email-alert"
                size={24}
                color={theme.colors.onPrimary}
                style={{ marginRight: theme.custom.spacing.md }}
              />
              <Text style={[
                styles.invitationText,
                { color: theme.colors.onPrimary, fontWeight: '500' },
                theme.custom.typography.bodyMedium,
              ]}>
                You have {pendingInvitations.length} pending invitation{pendingInvitations.length > 1 ? 's' : ''}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onPrimary}
                style={{ marginLeft: 'auto' }}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Button
        title="+ Create New Family"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate("CreateFamily" as never);
        }}
        style={{ marginBottom: theme.custom.spacing.xl }}
      />

      <FlatList
        data={families}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item, index }) => (
          <FamilyListItem
            item={item}
            index={index}
            theme={theme}
            onPress={(familyId) => {
              navigation.navigate("FamilyDetail" as never, { familyId } as never);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={{
                borderRadius: theme.custom.borderRadius.xl,
                padding: theme.custom.spacing.xxl,
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.custom.colors.border,
              }}
            >

              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: theme.custom.borderRadius.round,
                  backgroundColor: `${theme.custom.colors.familyGroup}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.custom.spacing.lg,
                }}
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={56}
                  color={theme.custom.colors.familyGroup}
                />
              </View>

              <Text style={[
                styles.emptyTitle,
                { color: theme.colors.onSurface },
                theme.custom.typography.h3,
                { fontWeight: '600', marginBottom: theme.custom.spacing.sm },
              ]}>
                Your family financial hub starts here
              </Text>
              <Text style={[
                styles.emptyText,
                { color: theme.custom.colors.textSecondary, textAlign: 'center' },
                theme.custom.typography.body,
              ]}>
                Create a family to start tracking finances together
              </Text>
            </View>
          </View>
        }
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
    marginTop: 12,
  },
  skeletonCard: {},
  skeletonIcon: {},
  skeletonText: {},
  invitationBanner: {},
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  invitationText: {
    flex: 1,
  },
  familyCard: {
    position: 'relative',
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {},
  textContent: {
    flex: 1,
  },
  familyName: {
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {},
  roleBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  emptyTitle: {},
  emptyText: {
    textAlign: "center",
    maxWidth: 280,
  },
});
