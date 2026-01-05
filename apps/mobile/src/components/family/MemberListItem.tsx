import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme';
import { Card } from '../design-system';
import RoleBadge from './RoleBadge';

// Generate a personalized gradient based on user ID
const generateGradientColors = (userId: string, baseColor: string): string[] => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return [
    `hsl(${hue}, 70%, 60%)`,
    `hsl(${(hue + 30) % 360}, 70%, 50%)`,
  ] as const;
};

type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

interface FamilyMember {
  id: string;
  userId: string;
  role: Role;
  balance: number;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface MemberListItemProps {
  member: FamilyMember;
  currentUserRole: Role | null;
  isCurrentUser: boolean;
  onRemove?: (userId: string) => void;
  canManage: boolean;
}

const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  return email[0].toUpperCase();
};

const formatJoinDate = (joinedAt: string): string => {
  const date = new Date(joinedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `Joined ${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Joined ${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `Joined ${years} year${years > 1 ? 's' : ''} ago`;
  }
};

export const MemberListItem: React.FC<MemberListItemProps> = ({
  member,
  currentUserRole,
  isCurrentUser,
  onRemove,
  canManage,
}) => {
  const { theme } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const initials = getInitials(
    member.user.firstName,
    member.user.lastName,
    member.user.email
  );

  const displayName = member.user.firstName && member.user.lastName
    ? `${member.user.firstName} ${member.user.lastName}`
    : member.user.email;

  const showRemoveButton = canManage && !isCurrentUser && member.role !== 'OWNER';

  const avatarGradientColors = generateGradientColors(member.userId, theme.colors.primary);

  // Pulse animation for current user's avatar
  useEffect(() => {
    if (isCurrentUser) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isCurrentUser]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to member detail would go here
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handleRemove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${displayName} from this family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onRemove?.(member.userId);
          },
        },
      ]
    );
  };

  const joinDateText = formatJoinDate(member.joinedAt);

  return (

    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: theme.custom.spacing.md,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card
          style={{
            padding: theme.custom.spacing.lg,
            borderTopWidth: (member.role === 'OWNER' || member.role === 'ADMIN') ? 3 : 0,
            borderTopColor: member.role === 'OWNER'
              ? theme.custom.colors.roleOwner
              : member.role === 'ADMIN'
                ? theme.custom.colors.roleAdmin
                : 'transparent',
          }}
          elevation={2}
        >
          <View style={styles.container}>
            <View style={styles.leftContent}>
              {/* Enhanced Avatar with Gradient */}
              <Animated.View
                style={[
                  styles.avatar,
                  {
                    borderRadius: theme.custom.borderRadius.round,
                    transform: [{ scale: pulseAnim }],
                    borderWidth: 2,
                    borderColor: isCurrentUser
                      ? theme.colors.primary
                      : theme.custom.colors.glassBorder,
                    ...Platform.select({
                      ios: {
                        shadowColor: isCurrentUser ? theme.colors.primary : '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isCurrentUser ? 0.4 : 0.2,
                        shadowRadius: 6,
                      },
                      android: {
                        elevation: isCurrentUser ? 6 : 3,
                      },
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={avatarGradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: theme.custom.borderRadius.round }]}
                />
                <Text style={[
                  styles.avatarText,
                  { color: '#FFFFFF' },
                ]}>
                  {initials}
                </Text>
              </Animated.View>

              <View style={styles.infoContainer}>
                {/* Name and Role Badge Row */}
                <View style={styles.nameRow}>
                  <Text
                    style={[
                      styles.name,
                      { color: theme.colors.onSurface },
                      theme.custom.typography.bodyMedium,
                    ]}
                    numberOfLines={1}
                  >
                    {displayName}
                    {isCurrentUser && (
                      <Text style={[
                        styles.youLabel,
                        { color: theme.custom.colors.textSecondary },
                      ]}>
                        {' '}(You)
                      </Text>
                    )}
                  </Text>
                  <View style={styles.badgeContainer}>
                    <RoleBadge role={member.role} iconOnly />
                  </View>
                </View>

                {/* Email */}
                {member.user.email && (
                  <Text
                    style={[
                      styles.email,
                      { color: theme.custom.colors.textSecondary },
                      theme.custom.typography.small,
                    ]}
                    numberOfLines={1}
                  >
                    {member.user.email}
                  </Text>
                )}

                {/* Join date and balance */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={14}
                      color={theme.custom.colors.textSecondary}
                    />
                    <Text style={[
                      styles.metaText,
                      { color: theme.custom.colors.textSecondary },
                      theme.custom.typography.small,
                    ]}>
                      {joinDateText}
                    </Text>
                  </View>
                  <View style={[styles.metaDivider, { backgroundColor: theme.custom.colors.divider, height: 16 }]} />
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="wallet"
                      size={14}
                      color={theme.custom.colors.textSecondary}
                    />
                    <Text style={[
                      styles.metaText,
                      {
                        color: parseFloat(member.balance.toString()) >= 0
                          ? theme.custom.colors.income
                          : theme.custom.colors.expense,
                        fontWeight: '600',
                      },
                      theme.custom.typography.small,
                    ]}>
                      ${member.balance.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {showRemoveButton && (
              <TouchableOpacity
                style={[
                  styles.removeButton,
                  {
                    borderWidth: 1.5,
                    borderColor: theme.colors.error,
                    borderRadius: theme.custom.borderRadius.round,
                    padding: theme.custom.spacing.sm,
                  },
                ]}
                onPress={handleRemove}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="account-remove"
                  size={20}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
  },
  name: {
    fontWeight: '600',
    flex: 1,
  },
  badgeContainer: {
    flexShrink: 0,
    marginLeft: 8,
  },
  youLabel: {
    fontWeight: '400',
  },
  email: {
    marginTop: 2,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  metaText: {
    fontSize: 11,
  },
  removeButton: {
    marginLeft: 12,
  },
});

export default MemberListItem;
