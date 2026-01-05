import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TransactionsListScreen from '../screens/transactions/TransactionsListScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import FamilyListScreen from '../screens/family/FamilyListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import { useAppTheme } from '../theme';
import { useNotifications } from '../context/NotificationContext';
import { useFamily } from '../context/FamilyContext';
import { GlassTabBar } from '../components/navigation/GlassTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    const { theme } = useAppTheme();
    const { unreadCount } = useNotifications();
    const { pendingInvitations } = useFamily();

    return (
        <Tab.Navigator
            tabBar={(props) => <GlassTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    letterSpacing: 0.3,
                    marginTop: 4,
                },
                tabBarIconStyle: {
                    marginBottom: 0,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            }}
        >
            <Tab.Screen
                name="Transactions"
                component={TransactionsListScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons name="format-list-bulleted" size={26} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons
                            name={focused ? 'chart-box' : 'chart-box-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Family"
                component={FamilyListScreen}
                options={{
                    tabBarBadge: pendingInvitations.length > 0 ? pendingInvitations.length : undefined,
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons
                            name={focused ? 'account-group' : 'account-group-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons
                            name={focused ? 'bell' : 'bell-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused, color }) => (
                        <MaterialCommunityIcons
                            name={focused ? 'account' : 'account-outline'}
                            size={26}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
