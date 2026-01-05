import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Animated } from "react-native";
import { useFamily } from "../../context/FamilyContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Input, Button, Card } from "../../components/design-system";
import { useAppTheme } from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import RoleBadge from "../../components/family/RoleBadge";

export default function InviteMemberScreen() {
  const { theme } = useAppTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { familyId } = route.params as { familyId: string };
  const { inviteMember } = useFamily();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Animation refs
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const infoFadeAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.stagger(150, [
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(infoFadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInvite = async () => {
    if (!email.trim() || !isValidEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await inviteMember(familyId, email);

      // Success animation
      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.spring(successScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Wait for animation, then navigate back
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to send invitation");
      setIsLoading(false);
    }
  };

  const timelineSteps = [
    {
      icon: 'email-send',
      text: 'Invitation sent to their email',
    },
    {
      icon: 'account-check',
      text: 'They accept the invitation',
    },
    {
      icon: 'account-multiple',
      text: 'They join your family',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{
            padding: theme.custom.spacing.lg,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Gradient Header Section */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: headerFadeAnim,
                marginBottom: theme.custom.spacing.lg,
              },
            ]}
          >
            <View
              style={[
                styles.headerCard,
                {
                  borderRadius: theme.custom.borderRadius.lg,
                  overflow: 'hidden',
                  padding: theme.custom.spacing.xxl,
                },
              ]}
            >
              <LinearGradient
                colors={[
                  `${theme.custom.colors.gradientPrimaryStart}30`,
                  `${theme.custom.colors.gradientPrimaryEnd}20`,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <BlurView
                intensity={Platform.OS === 'ios' ? 20 : 15}
                tint={theme.dark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />

              <View
                style={{
                  backgroundColor: `${theme.colors.primary}30`,
                  borderRadius: theme.custom.borderRadius.round,
                  width: 80,
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  marginBottom: theme.custom.spacing.md,
                }}
              >
                <MaterialCommunityIcons
                  name="account-plus"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>

              <Text
                style={[
                  theme.custom.typography.h2,
                  {
                    color: theme.colors.onBackground,
                    fontWeight: '700',
                    textAlign: 'center',
                    marginBottom: theme.custom.spacing.xs,
                  },
                ]}
              >
                Invite Member
              </Text>

              <Text
                style={[
                  theme.custom.typography.body,
                  {
                    color: theme.custom.colors.textSecondary,
                    textAlign: 'center',
                  },
                ]}
              >
                Send an invitation to join your family
              </Text>
            </View>
          </Animated.View>

          {/* Form Card */}
          <Animated.View style={{ opacity: formFadeAnim }}>
            <Card
              style={{
                padding: theme.custom.spacing.xl,
                marginBottom: theme.custom.spacing.lg,
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
                  `${theme.colors.surface}F2`,
                  `${theme.colors.surface}E6`,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              <View style={{ marginBottom: theme.custom.spacing.md }}>
                <View style={{ position: 'relative' }}>
                  <Input
                    label="Search or Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Search by name or email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="magnify"
                  />
                  {email.length > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: 38,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      {isValidEmail(email) && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={theme.custom.colors.income}
                        />
                      )}
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color={theme.custom.colors.textSecondary}
                        onPress={() => setEmail('')}
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* Permission Preview */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: theme.custom.spacing.md,
                  padding: theme.custom.spacing.sm,
                  backgroundColor: `${theme.custom.colors.roleMember}15`,
                  borderRadius: theme.custom.borderRadius.md,
                }}
              >
                <MaterialCommunityIcons
                  name="information"
                  size={16}
                  color={theme.custom.colors.textSecondary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    theme.custom.typography.small,
                    {
                      color: theme.custom.colors.textSecondary,
                      flex: 1,
                    },
                  ]}
                >
                  They will join as a
                </Text>
                <RoleBadge role="MEMBER" />
              </View>

              <Button
                title={isLoading ? 'Sending...' : 'Send Invitation'}
                onPress={handleInvite}
                disabled={isLoading || !isValidEmail(email)}
                loading={isLoading}
              />
            </Card>
          </Animated.View>

          {/* What Happens Next Timeline */}
          <Animated.View style={{ opacity: infoFadeAnim }}>
            <Card
              style={{
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

              <Text
                style={[
                  theme.custom.typography.bodyMedium,
                  {
                    color: theme.colors.onSurface,
                    fontWeight: '600',
                    marginBottom: theme.custom.spacing.md,
                  },
                ]}
              >
                What happens next?
              </Text>

              {timelineSteps.map((step, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom:
                      index < timelineSteps.length - 1
                        ? theme.custom.spacing.md
                        : 0,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: theme.custom.borderRadius.round,
                      backgroundColor: `${theme.colors.primary}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: theme.custom.spacing.sm,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={step.icon as any}
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text
                    style={[
                      theme.custom.typography.body,
                      {
                        color: theme.custom.colors.textSecondary,
                        flex: 1,
                      },
                    ]}
                  >
                    {step.text}
                  </Text>
                </View>
              ))}
            </Card>
          </Animated.View>
        </ScrollView>

        {/* Success Overlay */}
        {isSuccess && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.7)',
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: successScaleAnim }],
              },
            ]}
          >
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.custom.borderRadius.xl,
                padding: theme.custom.spacing.xxl,
                alignItems: 'center',
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                  },
                  android: {
                    elevation: 8,
                  },
                }),
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: theme.custom.borderRadius.round,
                  backgroundColor: `${theme.custom.colors.income}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.custom.spacing.md,
                }}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={48}
                  color={theme.custom.colors.income}
                />
              </View>
              <Text
                style={[
                  theme.custom.typography.h3,
                  {
                    color: theme.colors.onSurface,
                    fontWeight: '700',
                    marginBottom: theme.custom.spacing.xs,
                  },
                ]}
              >
                Invitation Sent!
              </Text>
              <Text
                style={[
                  theme.custom.typography.body,
                  {
                    color: theme.custom.colors.textSecondary,
                    textAlign: 'center',
                  },
                ]}
              >
                They will receive an email shortly
              </Text>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {},
  headerCard: {},
});
