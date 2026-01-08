import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useFamily } from "../context/FamilyContext";
import { GlassScreenLayout } from "../components/layout/GlassScreenLayout";
import { Card } from "../components/design-system/Card";
import FamilySwitcher from "../components/family/FamilySwitcher";
import { ScaleButton } from "../components/design-system/ScaleButton";
import { animations } from "../theme/animations";

export default function HomeScreen() {
  const { user } = useAuth();
  const { selectedFamily } = useFamily();
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const statsScaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(statsScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <GlassScreenLayout scrollable>
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.firstName || "User"}!</Text>
      </Animated.View>

      <Animated.View
        style={{ transform: [{ scale: statsScaleAnim }], opacity: fadeAnim }}
      >
        <Card glass style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={24}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.statLabel}>Total Balance</Text>
              <Text style={styles.statValue}>$12,450.00</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                ]}
              >
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color="#4CAF50"
                />
              </View>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={[styles.statValue, { color: "#4CAF50" }]}>
                +$2,340.00
              </Text>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.quickActions}>
          <ScaleButton
            style={styles.actionButton}
            onPress={() => navigation.navigate("AddTransaction" as never)}
          >
            <Card glass style={styles.actionCard}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons name="plus" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Add Transaction</Text>
            </Card>
          </ScaleButton>

          <ScaleButton
            style={styles.actionButton}
            onPress={() => navigation.navigate("Transactions" as never)}
          >
            <Card glass style={styles.actionCard}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons
                  name="format-list-bulleted"
                  size={32}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.actionText}>View All</Text>
            </Card>
          </ScaleButton>
        </View>

        <View style={styles.quickActions}>
          <ScaleButton
            style={styles.actionButton}
            onPress={() => navigation.navigate("Analytics" as never)}
          >
            <Card glass style={styles.actionCard}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons
                  name="chart-pie"
                  size={32}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </Card>
          </ScaleButton>

          <ScaleButton
            style={styles.actionButton}
            onPress={() => navigation.navigate("Profile" as never)}
          >
            <Card glass style={styles.actionCard}>
              <View style={styles.actionIconBg}>
                <MaterialCommunityIcons
                  name="account"
                  size={32}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.actionText}>Profile</Text>
            </Card>
          </ScaleButton>
        </View>
      </Animated.View>
    </GlassScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  familySwitcher: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
    fontWeight: "500",
  },
  userName: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  statsCard: {
    marginBottom: 32,
    padding: 0,
    overflow: "hidden",
  },
  statRow: {
    flexDirection: "row",
    padding: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 24,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  actionCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
    borderRadius: 20,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  actionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
    textAlign: "center",
  },
});
