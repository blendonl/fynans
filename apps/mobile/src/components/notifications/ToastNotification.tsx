import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme';
import { useToast } from '../../context/ToastContext';
import { NotificationIcon } from './NotificationIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_HEIGHT = 90;
const SWIPE_THRESHOLD = -50;

export const ToastNotification: React.FC = () => {
  const { theme } = useAppTheme();
  const { currentToast, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-TOAST_HEIGHT - 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < SWIPE_THRESHOLD) {
          dismissToast();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (currentToast) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentToast]);

  const dismissToast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -TOAST_HEIGHT - 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hideToast();
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismissToast();
  };

  const getAccentColor = (type: string) => {
    const colorMap: Record<string, string> = {
      FAMILY_INVITATION: theme.colors.primary,
      EXPENSE_ADDED: theme.custom.colors.expense,
      INCOME_ADDED: theme.custom.colors.income,
      FAMILY_MEMBER_JOINED: theme.custom.colors.success,
      BUDGET_ALERT: theme.custom.colors.warning,
    };
    return colorMap[type] || theme.custom.colors.info;
  };

  if (!currentToast) return null;

  const accentColor = getAccentColor(currentToast.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={[
          styles.toast,
          {
            borderRadius: theme.custom.borderRadius.lg,
            borderLeftWidth: 4,
            borderLeftColor: accentColor,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              },
              android: {
                elevation: 8,
              },
            }),
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.95}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 40 : 25}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[`${theme.colors.surface}F2`, `${theme.colors.surface}E6`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <NotificationIcon type={currentToast.type} />

          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                theme.custom.typography.bodyMedium,
                { color: theme.colors.onSurface, fontWeight: '600' },
              ]}
              numberOfLines={1}
            >
              {currentToast.title}
            </Text>
            <Text
              style={[
                styles.message,
                theme.custom.typography.small,
                { color: theme.custom.colors.textSecondary },
              ]}
              numberOfLines={2}
            >
              {currentToast.message}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={dismissToast}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={theme.custom.colors.textDisabled}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  toast: {
    overflow: 'hidden',
    minHeight: TOAST_HEIGHT,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    marginBottom: 2,
  },
  message: {},
  dismissButton: {
    padding: 4,
  },
});
