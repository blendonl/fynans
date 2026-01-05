import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../theme';

type Role = 'OWNER' | 'ADMIN' | 'MEMBER';

interface RoleBadgeProps {
  role: Role;
  iconOnly?: boolean;
  style?: ViewStyle;
}

const getRoleConfig = (role: Role, colors: any) => {
  switch (role) {
    case 'OWNER':
      return {
        color: colors.roleOwner,
        gradientColors: [colors.roleOwner, `${colors.roleOwner}CC`],
        icon: 'crown',
        label: 'Owner',
      };
    case 'ADMIN':
      return {
        color: colors.roleAdmin,
        gradientColors: [colors.roleAdmin, `${colors.roleAdmin}CC`],
        icon: 'shield-account',
        label: 'Admin',
      };
    case 'MEMBER':
      return {
        color: colors.roleMember,
        gradientColors: [colors.roleMember, `${colors.roleMember}CC`],
        icon: 'account',
        label: 'Member',
      };
  }
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  iconOnly = false,
  style,
}) => {
  const { theme } = useAppTheme();
  const config = getRoleConfig(role, theme.custom.colors);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();

    // Pulse animation only for OWNER
    if (role === 'OWNER') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [role]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          borderRadius: theme.custom.borderRadius.round,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          `${config.color}28`,
          `${config.color}18`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.container,
          {
            borderRadius: theme.custom.borderRadius.round,
            borderWidth: 1.5,
            borderColor: `${config.color}80`,
            ...Platform.select({
              ios: {
                shadowColor: config.color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              },
              android: {
                elevation: 2,
              },
            }),
          },
          iconOnly && styles.iconOnlyContainer,
        ]}
      >
        <MaterialCommunityIcons
          name={config.icon as any}
          size={iconOnly ? 18 : 14}
          color={config.color}
          style={{
            textShadowColor: `${config.color}40`,
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        />
        {!iconOnly && (
          <Text style={[
            styles.label,
            {
              color: config.color,
              textShadowColor: `${config.color}40`,
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            },
            theme.custom.typography.small,
          ]}>
            {config.label.toUpperCase()}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  iconOnlyContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  label: {
    fontWeight: '700',
    fontSize: 11,
    marginLeft: 6,
    letterSpacing: 0.8,
  },
});

export default RoleBadge;
