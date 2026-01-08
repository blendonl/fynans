import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Animated, Easing } from "react-native";
import { useFamily } from "../../context/FamilyContext";
import { useNavigation } from "@react-navigation/native";
import { Input, Button } from "../../components/design-system";
import { GradientBackground } from "../../components/auth/GradientBackground";
import { GlassCard } from "../../components/auth/GlassCard";
import { useAppTheme } from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export default function CreateFamilyScreen() {
  const { theme } = useAppTheme();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createFamily } = useFamily();
  const navigation = useNavigation();

  // Animation refs
  const iconScaleAnim = useRef(new Animated.Value(0.8)).current;
  const iconOpacityAnim = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const formOpacityAnim = useRef(new Animated.Value(0)).current;
  const orbFloat1 = useRef(new Animated.Value(0)).current;
  const orbFloat2 = useRef(new Animated.Value(0)).current;
  const orbFloat3 = useRef(new Animated.Value(0)).current;

  // Entrance sequence
  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(formTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    const createOrbAnimation = (anim: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
    };

    createOrbAnimation(orbFloat1, 3000).start();
    createOrbAnimation(orbFloat2, 4000).start();
    createOrbAnimation(orbFloat3, 2500).start();
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

  const orb1TranslateY = orbFloat1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const orb2TranslateY = orbFloat2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const orb3TranslateY = orbFloat3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.orbContainer}>
          <Animated.View
            style={[
              styles.orb,
              styles.orb1,
              { transform: [{ translateY: orb1TranslateY }] },
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              styles.orb2,
              { transform: [{ translateY: orb2TranslateY }] },
            ]}
          />
          <Animated.View
            style={[
              styles.orb,
              styles.orb3,
              { transform: [{ translateY: orb3TranslateY }] },
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.heroContainer,
              {
                opacity: iconOpacityAnim,
                transform: [{ scale: iconScaleAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="account-group"
                size={72}
                color="#14B8A6"
              />
            </View>
            <Text style={styles.title}>Create Your Family</Text>
            <Text style={styles.subtitle}>Start managing finances together</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: formOpacityAnim,
              transform: [{ translateY: formTranslateY }],
            }}
          >
            <GlassCard>
              <View style={{ marginBottom: 16 }}>
                <Input
                  label="Family Name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter family name"
                  autoFocus
                  maxLength={30}
                  glass
                />
                <Text
                  style={[
                    styles.characterCount,
                    {
                      color: name.length > 30 ? '#EF4444' : 'rgba(255, 255, 255, 0.6)',
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
                variant="glass"
                icon="plus-circle"
              />
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 120,
    height: 120,
    top: '10%',
    left: -40,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  orb2: {
    width: 80,
    height: 80,
    top: '60%',
    right: -30,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  orb3: {
    width: 60,
    height: 60,
    bottom: '20%',
    right: '20%',
    backgroundColor: 'rgba(187, 134, 252, 0.12)',
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(20, 184, 166, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});
