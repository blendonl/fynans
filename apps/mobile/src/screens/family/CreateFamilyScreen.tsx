import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated } from "react-native";
import { useFamily } from "../../context/FamilyContext";
import { useNavigation } from "@react-navigation/native";
import { Input, Button, Card } from "../../components/design-system";
import { useAppTheme } from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

export default function CreateFamilyScreen() {
  const { theme } = useAppTheme();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createFamily } = useFamily();
  const navigation = useNavigation();

  // Animation refs
  const iconFadeAnim = useRef(new Animated.Value(0)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const featuresFadeAnim = useRef(new Animated.Value(0)).current;

  const iconPulseAnim = useRef(new Animated.Value(1)).current;
  const iconFloatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Entrance sequence
  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(iconFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(featuresFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(iconPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(iconFloatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotating gradient border
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please enter a family name");
      return;
    }

    if (name.length > 30) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Family name must be 30 characters or less");
      return;
    }

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const family = await createFamily(name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
      navigation.navigate("FamilyDetail" as never, { familyId: family.id } as never);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to create family");
    } finally {
      setIsLoading(false);
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const features = [
    {
      icon: 'chart-line',
      title: 'Shared Budgets',
      description: 'Track expenses together',
    },
    {
      icon: 'account-multiple',
      title: 'Multiple Members',
      description: 'Invite family & friends',
    },
    {
      icon: 'shield-check',
      title: 'Secure & Private',
      description: 'Your data is protected',
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Gradient background */}
      <LinearGradient
        colors={[
          `${theme.custom.colors.gradientPrimaryStart}1A`,
          `${theme.custom.colors.gradientPrimaryEnd}1A`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: theme.custom.spacing.xl,
          justifyContent: 'center',
          minHeight: '100%',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Glass Orb Icon */}
        <Animated.View
          style={[
            styles.iconOrbContainer,
            {
              opacity: iconFadeAnim,
              transform: [
                { scale: iconPulseAnim },
                { translateY: iconFloatAnim },
              ],
              marginBottom: theme.custom.spacing.xl,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.rotatingBorder,
              {
                borderRadius: theme.custom.borderRadius.round,
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                theme.custom.colors.gradientPrimaryStart,
                theme.custom.colors.gradientPrimaryEnd,
                theme.colors.primary,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: theme.custom.borderRadius.round }]}
            />
          </Animated.View>

          <View
            style={[
              styles.glassOrb,
              {
                borderRadius: theme.custom.borderRadius.round,
                overflow: 'hidden',
                ...Platform.select({
                  ios: {
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              },
            ]}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 30 : 20}
              tint={theme.dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                `${theme.custom.colors.familyGroup}40`,
                `${theme.custom.colors.familyGroup}20`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <MaterialCommunityIcons
              name="account-group"
              size={64}
              color={theme.custom.colors.familyGroup}
            />
          </View>
        </Animated.View>

        {/* Title with gradient effect */}
        <Animated.View style={{ opacity: titleFadeAnim }}>
          <Text
            style={[
              styles.title,
              theme.custom.typography.h1,
              { color: theme.colors.onBackground },
            ]}
          >
            Create a New Family
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={{ opacity: subtitleFadeAnim }}>
          <Text
            style={[
              styles.subtitle,
              theme.custom.typography.body,
              { color: theme.custom.colors.textSecondary },
            ]}
          >
            Start managing finances together with your family members
          </Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          style={[
            { opacity: formFadeAnim, marginTop: theme.custom.spacing.xxl },
          ]}
        >
          <Card
            style={{
              padding: theme.custom.spacing.xl,
              overflow: 'hidden',
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                },
                android: {
                  elevation: 4,
                },
              }),
            }}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 20 : 15}
              tint={theme.dark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={[
                `${theme.colors.surface}F2`,
                `${theme.colors.surface}E6`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            <View style={{ marginBottom: theme.custom.spacing.lg }}>
              <Input
                label="Family Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter family name"
                autoFocus
                maxLength={30}
              />
              <Text
                style={[
                  theme.custom.typography.small,
                  {
                    color: name.length > 30
                      ? theme.colors.error
                      : theme.custom.colors.textDisabled,
                    textAlign: 'right',
                    marginTop: 4,
                  },
                ]}
              >
                {name.length}/30
              </Text>
            </View>

            <Button
              title={isLoading ? "Creating..." : "Create Family"}
              onPress={handleCreate}
              disabled={isLoading || !name.trim()}
              loading={isLoading}
            />
          </Card>
        </Animated.View>

        {/* Feature Highlights */}
        <Animated.View
          style={[
            { opacity: featuresFadeAnim, marginTop: theme.custom.spacing.xxl },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: theme.custom.spacing.md }}
          >
            {features.map((feature, index) => (
              <Card
                key={index}
                style={{
                  width: 200,
                  padding: theme.custom.spacing.lg,
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
                    backgroundColor: `${theme.colors.primary}20`,
                    borderRadius: theme.custom.borderRadius.md,
                    width: 48,
                    height: 48,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.custom.spacing.sm,
                  }}
                >
                  <MaterialCommunityIcons
                    name={feature.icon as any}
                    size={24}
                    color={theme.colors.primary}
                  />
                </View>

                <Text
                  style={[
                    theme.custom.typography.bodyMedium,
                    {
                      color: theme.colors.onSurface,
                      fontWeight: '600',
                      marginBottom: 4,
                    },
                  ]}
                >
                  {feature.title}
                </Text>

                <Text
                  style={[
                    theme.custom.typography.small,
                    { color: theme.custom.colors.textSecondary },
                  ]}
                >
                  {feature.description}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconOrbContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatingBorder: {
    position: 'absolute',
    width: 128,
    height: 128,
  },
  glassOrb: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
});
