import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Divider } from 'react-native-paper';
import { useAppTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/design-system';
import { SettingItem } from '../../components/settings';

export default function ProfileScreen({ navigation }: any) {
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return 'Auto';
    }
  };

  const handleThemePress = () => {
    Alert.alert(
      'Select Theme',
      'Choose your preferred theme',
      [
        {
          text: 'Light',
          onPress: () => setThemeMode('light'),
        },
        {
          text: 'Dark',
          onPress: () => setThemeMode('dark'),
        },
        {
          text: 'Auto',
          onPress: () => setThemeMode('auto'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || user.email[0].toUpperCase();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView>
        <Card style={styles.profileCard} elevation={2}>
          <View style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={getInitials()}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <Text
              style={[
                styles.userName,
                theme.custom.typography.h4,
                { color: theme.custom.colors.text },
              ]}
            >
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </Text>
            <Text
              style={[
                styles.userEmail,
                theme.custom.typography.body,
                { color: theme.custom.colors.textSecondary },
              ]}
            >
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </Card>

        <Card style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              Appearance
            </Text>
          </View>
          <SettingItem
            icon="theme-light-dark"
            title="Theme"
            subtitle="Choose your preferred theme"
            value={getThemeLabel()}
            onPress={handleThemePress}
          />
        </Card>

        <Card style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              Preferences
            </Text>
          </View>
          <SettingItem
            icon="currency-usd"
            title="Currency"
            subtitle="Default currency for transactions"
            value="USD"
            onPress={() => Alert.alert('Coming Soon', 'Currency selection will be available soon')}
          />
          <SettingItem
            icon="bell"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon')}
          />
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Download your transactions as CSV"
            onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon')}
          />
        </Card>

        <Card style={styles.section} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                theme.custom.typography.h5,
                { color: theme.custom.colors.text },
              ]}
            >
              About
            </Text>
          </View>
          <SettingItem
            icon="information"
            title="Version"
            subtitle="App version"
            value="1.0.0"
            showChevron={false}
          />
          <SettingItem
            icon="file-document"
            title="Terms of Service"
            onPress={() => Alert.alert('Terms of Service', 'Terms and conditions content here')}
          />
          <SettingItem
            icon="shield-check"
            title="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content here')}
          />
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@fynans.com')}
          />
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outlined"
            fullWidth
            icon="logout"
            style={styles.logoutButton}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
  },
  profileContent: {
    alignItems: 'center',
    padding: 24,
  },
  userName: {
    marginTop: 16,
  },
  userEmail: {
    marginTop: 4,
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {},
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  logoutButton: {
    borderColor: '#D32F2F',
  },
  bottomPadding: {
    height: 100,
  },
});
