import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Animated, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFamily } from '../../context/FamilyContext';
import { useAppTheme } from '../../theme';
import FamilySelectorModal from './FamilySelectorModal';

interface FamilySwitcherProps {
  style?: ViewStyle;
  compact?: boolean;
}

export const FamilySwitcher: React.FC<FamilySwitcherProps> = ({
  style,
  compact = false,
}) => {
  const { theme } = useAppTheme();
  const { selectedFamily, families } = useFamily();
  const [modalVisible, setModalVisible] = useState(false);

  // Animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const chevronRotation = useRef(new Animated.Value(0)).current;

  const displayName = selectedFamily ? selectedFamily.name : 'Personal';
  const displayBalance = selectedFamily
    ? `$${selectedFamily.balance.toFixed(2)}`
    : null;

  // Animate chevron when modal opens/closes
  useEffect(() => {
    Animated.spring(chevronRotation, {
      toValue: modalVisible ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [modalVisible]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handlePress = () => {
    setModalVisible(true);
  };

  const chevronRotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const minHeight = compact ? 44 : 56;

  return (
    <>
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
            borderRadius: theme.custom.borderRadius.lg,
            overflow: 'hidden',
            minHeight,
          },
          style,
        ]}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 30 : 25}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[
            `${theme.custom.colors.gradientPrimaryStart}14`,
            `${theme.custom.colors.gradientPrimaryEnd}0A`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <TouchableOpacity
          style={[
            styles.container,
            {
              borderColor: theme.custom.colors.glassBorder,
              borderRadius: theme.custom.borderRadius.lg,
              paddingHorizontal: compact ? theme.custom.spacing.md : theme.custom.spacing.lg,
              paddingVertical: compact ? theme.custom.spacing.sm : theme.custom.spacing.md,
              minHeight,
            },
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.85}
        >
          <View style={styles.leftContent}>
            <View
              style={[
                styles.iconContainer,
                {
                  marginRight: theme.custom.spacing.md,
                  backgroundColor: `${theme.colors.primary}14`,
                  borderRadius: theme.custom.borderRadius.round,
                  padding: theme.custom.spacing.xs,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={selectedFamily ? 'account-group' : 'account'}
                size={compact ? 20 : 28}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.name,
                compact && styles.nameCompact,
                { color: theme.colors.onSurface },
                theme.custom.typography.bodyMedium,
              ]}>
                {displayName}
              </Text>
              {displayBalance && !compact && (
                <Text style={[
                  styles.balance,
                  {
                    color: parseFloat(selectedFamily?.balance?.toString() || '0') >= 0
                      ? theme.custom.colors.income
                      : theme.custom.colors.expense,
                  },
                  theme.custom.typography.caption,
                  { fontWeight: '600' },
                ]}>
                  {displayBalance}
                </Text>
              )}
            </View>
          </View>
          <Animated.View
            style={{
              transform: [{ rotate: chevronRotate }],
            }}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={compact ? 18 : 20}
              color={theme.custom.colors.textSecondary}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Shadow effect for Android */}
        {Platform.OS === 'android' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: theme.custom.borderRadius.lg,
                borderWidth: 1.5,
                borderColor: theme.custom.colors.glassBorder,
              },
            ]}
            pointerEvents="none"
          />
        )}
      </Animated.View>

      <FamilySelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
  },
  nameCompact: {
    fontSize: 14,
  },
  balance: {
    marginTop: 2,
  },
});

export default FamilySwitcher;
