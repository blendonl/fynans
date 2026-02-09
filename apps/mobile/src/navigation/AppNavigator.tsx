import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { navigationRef } from "./navigationService";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import TransactionDetailScreen from "../screens/transactions/TransactionDetailScreen";
import FamilyListScreen from "../screens/family/FamilyListScreen";
import FamilyDetailScreen from "../screens/family/FamilyDetailScreen";
import CreateFamilyScreen from "../screens/family/CreateFamilyScreen";
import PendingInvitationsScreen from "../screens/family/PendingInvitationsScreen";
import { MainTabsWithFAB } from "./MainTabsWithFAB";
import { View, ActivityIndicator } from "react-native";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { token, isLoading } = useAuth();
  const { theme } = useAppTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.surface,
      elevation: 0,
      shadowOpacity: 0,
    },
    headerTintColor: theme.colors.onSurface,
    headerTitleStyle: {
      fontWeight: "600" as const,
    },
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Main" component={MainTabsWithFAB} />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                headerShown: false,
                presentation: "transparentModal",
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: {
                    opacity: current.progress,
                  },
                }),
              }}
            />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{
                headerShown: false,
                title: "",
                ...screenOptions,
              }}
            />
            <Stack.Screen
              name="FamilyList"
              component={FamilyListScreen}
              options={{
                headerShown: true,
                title: "My Families",
                ...screenOptions,
              }}
            />
            <Stack.Screen
              name="FamilyDetail"
              component={FamilyDetailScreen}
              options={{
                headerShown: true,
                title: "Family Details",
                ...screenOptions,
              }}
            />
            <Stack.Screen
              name="CreateFamily"
              component={CreateFamilyScreen}
              options={{
                headerShown: false,
                title: "Create Family",
                ...screenOptions,
              }}
            />
            <Stack.Screen
              name="PendingInvitations"
              component={PendingInvitationsScreen}
              options={{
                headerShown: true,
                title: "Pending Invitations",
                ...screenOptions,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
