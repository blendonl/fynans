import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../theme';
import { Text } from 'react-native-paper';

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useAppTheme();
  const isDark = theme.dark;
  const insets = useSafeAreaInsets();

  const tabBarHeight = 65;
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.wrapper,
        {
          height: tabBarHeight + bottomPadding,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <BlurView
        intensity={isDark ? 100 : 100}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blur,
          {
            backgroundColor: isDark
              ? 'rgba(30, 30, 30, 0.85)'
              : 'rgba(255, 255, 255, 0.85)',
            borderColor: theme.colors.glassBorder,
          },
        ]}
      />
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconColor = isFocused
            ? theme.colors.primary
            : theme.colors.onSurfaceVariant;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View style={styles.iconContainer}>
                {options.tabBarIcon && options.tabBarIcon({
                  focused: isFocused,
                  color: iconColor,
                  size: 26
                })}
                {options.tabBarBadge != null && (
                  <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                    <Text style={styles.badgeText}>
                      {options.tabBarBadge}
                    </Text>
                  </View>
                )}
              </View>
              {options.tabBarShowLabel !== false && (
                <Text
                  style={[
                    styles.label,
                    {
                      color: iconColor,
                      fontWeight: isFocused ? '500' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {typeof label === 'string' ? label : ''}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 65,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 4,
  },
});
