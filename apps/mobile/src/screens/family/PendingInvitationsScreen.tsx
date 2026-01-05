import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Alert, SafeAreaView, Animated, Platform, RefreshControl } from "react-native";
import { useFamily } from "../../context/FamilyContext";
import { Card, Button } from "../../components/design-system";
import { useAppTheme } from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import RoleBadge from "../../components/family/RoleBadge";

export default function PendingInvitationsScreen() {
  const { theme } = useAppTheme();
  const { pendingInvitations, acceptInvitation, declineInvitation } = useFamily();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAccept = async (invitationId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [invitationId]: true }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await acceptInvitation(invitationId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Invitation accepted!");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to accept invitation");
    } finally {
      setLoadingStates(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  const handleDecline = async (invitationId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Decline Invitation",
      "Are you sure you want to decline this invitation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              setLoadingStates(prev => ({ ...prev, [invitationId]: true }));
              await declineInvitation(invitationId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Error", "Failed to decline invitation");
            } finally {
              setLoadingStates(prev => ({ ...prev, [invitationId]: false }));
            }
          },
        },
      ]
    );
  };

  const InvitationItem = ({ item, index }: { item: any; index: number }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          delay: index * 100,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const isLoading = loadingStates[item.id] || false;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginBottom: theme.custom.spacing.md,
        }}
      >
        <Card
          style={{
            padding: theme.custom.spacing.lg,
            overflow: 'hidden',
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
              },
              android: {
                elevation: 3,
              },
            }),
          }}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 15 : 10}
            tint={theme.dark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={[
              `${theme.colors.surface}E6`,
              `${theme.colors.surface}CC`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Family Name */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.custom.spacing.sm,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: theme.custom.borderRadius.round,
                backgroundColor: `${theme.custom.colors.familyGroup}30`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.custom.spacing.sm,
              }}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={24}
                color={theme.custom.colors.familyGroup}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  theme.custom.typography.bodyMedium,
                  {
                    color: theme.colors.onSurface,
                    fontWeight: '600',
                  },
                ]}
              >
                {item.family?.name || 'Family Invitation'}
              </Text>
              <Text
                style={[
                  theme.custom.typography.small,
                  {
                    color: theme.custom.colors.textSecondary,
                  },
                ]}
              >
                Invited on {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <RoleBadge role="MEMBER" iconOnly />
          </View>

          {/* Details */}
          {item.inviterEmail && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.custom.spacing.sm,
                padding: theme.custom.spacing.sm,
                backgroundColor: `${theme.colors.primary}08`,
                borderRadius: theme.custom.borderRadius.md,
              }}
            >
              <MaterialCommunityIcons
                name="account"
                size={16}
                color={theme.custom.colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  theme.custom.typography.small,
                  {
                    color: theme.custom.colors.textSecondary,
                  },
                ]}
              >
                Invited by {item.inviterEmail}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: theme.custom.spacing.md,
              marginTop: theme.custom.spacing.sm,
            }}
          >
            <Button
              title={isLoading ? 'Accepting...' : 'Accept'}
              onPress={() => handleAccept(item.id)}
              disabled={isLoading}
              loading={isLoading}
              style={{ flex: 1, minHeight: 48 }}
              icon="check-circle"
            />
            <Button
              title="Decline"
              onPress={() => handleDecline(item.id)}
              disabled={isLoading}
              variant="outlined"
              style={{ flex: 1, minHeight: 48 }}
              icon="close-circle"
            />
          </View>
        </Card>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <Animated.View
      style={{
        marginTop: theme.custom.spacing.xxl,
        alignItems: 'center',
      }}
    >
      <Card
        style={{
          padding: theme.custom.spacing.xxl,
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 15 : 10}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[
            `${theme.colors.surface}E6`,
            `${theme.colors.surface}CC`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: theme.custom.borderRadius.round,
            backgroundColor: `${theme.custom.colors.textDisabled}20`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.custom.spacing.md,
          }}
        >
          <MaterialCommunityIcons
            name="email-open-outline"
            size={48}
            color={theme.custom.colors.textDisabled}
          />
        </View>

        <Text
          style={[
            theme.custom.typography.h3,
            {
              color: theme.colors.onSurface,
              fontWeight: '600',
              marginBottom: theme.custom.spacing.xs,
            },
          ]}
        >
          No Pending Invitations
        </Text>

        <Text
          style={[
            theme.custom.typography.body,
            {
              color: theme.custom.colors.textSecondary,
              textAlign: 'center',
              marginBottom: theme.custom.spacing.lg,
            },
          ]}
        >
          You don't have any pending family invitations at the moment
        </Text>

        <Button
          title="Create a Family"
          onPress={() => {}}
          variant="outlined"
          icon="account-group-outline"
        />
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top']}
    >
      <View style={[styles.container, { padding: theme.custom.spacing.lg }]}>
        <Text
          style={[
            theme.custom.typography.h2,
            {
              color: theme.colors.onBackground,
              fontWeight: '700',
              marginBottom: theme.custom.spacing.lg,
            },
          ]}
        >
          Pending Invitations
        </Text>

        <FlatList
          data={pendingInvitations}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <InvitationItem item={item} index={index} />}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
