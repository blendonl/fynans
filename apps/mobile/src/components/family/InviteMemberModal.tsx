import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '../../theme';
import { useFamily } from '../../context/FamilyContext';

interface UserSearchResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface InviteMemberModalProps {
  visible: boolean;
  onClose: () => void;
  familyId: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  onClose,
  familyId,
}) => {
  const { theme } = useAppTheme();
  const { inviteMember, searchUsers } = useFamily();
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setSearchText('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSuccess(false);
      setError(null);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
          speed: 12,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSearch = useCallback(async (text: string) => {
    setSearchText(text);
    setError(null);

    if (text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await searchUsers(text, familyId);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (err) {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, [familyId, searchUsers]);

  const isValidEmail = useMemo(() => EMAIL_REGEX.test(searchText), [searchText]);

  const handleSelectUser = async (user: UserSearchResult) => {
    Haptics.selectionAsync();
    setShowSuggestions(false);
    setSearchText(user.email);
    await handleInvite(user.email);
  };

  const handleInviteByEmail = async () => {
    if (!isValidEmail) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await handleInvite(searchText);
  };

  const handleInvite = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      await inviteMember(familyId, email);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = err?.response?.data?.message || err?.message || 'Failed to send invitation';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: UserSearchResult) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  const renderSuggestionItem = ({ item }: { item: UserSearchResult }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        { borderBottomColor: theme.custom.colors.border },
      ]}
      onPress={() => handleSelectUser(item)}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: theme.custom.colors.primaryLight },
        ]}
      >
        <MaterialCommunityIcons
          name="account"
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.suggestionContent}>
        <Text
          style={[
            styles.suggestionName,
            theme.custom.typography.body,
            { color: theme.custom.colors.text },
          ]}
          numberOfLines={1}
        >
          {getUserDisplayName(item)}
        </Text>
        {item.firstName && (
          <Text
            style={[
              styles.suggestionEmail,
              theme.custom.typography.caption,
              { color: theme.custom.colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {item.email}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { backgroundColor: theme.colors.backdrop }]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.colors.surface,
                    borderTopLeftRadius: theme.custom.borderRadius.xl + 8,
                    borderTopRightRadius: theme.custom.borderRadius.xl + 8,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <View style={styles.handleContainer}>
                  <LinearGradient
                    colors={[
                      theme.custom.colors.primaryLight,
                      theme.colors.primary,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.handle}
                  />
                </View>

                <View
                  style={[
                    styles.header,
                    {
                      paddingHorizontal: theme.custom.spacing.lg,
                      paddingVertical: theme.custom.spacing.lg,
                      borderBottomColor: theme.custom.colors.divider,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.title,
                      { color: theme.colors.onSurface },
                      theme.custom.typography.h2,
                    ]}
                  >
                    Invite Member
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[
                      styles.closeButton,
                      {
                        padding: theme.custom.spacing.sm,
                        backgroundColor: theme.custom.colors.glassBackground,
                        borderRadius: theme.custom.borderRadius.round,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={22}
                      color={theme.colors.onSurface}
                    />
                  </TouchableOpacity>
                </View>

                {success ? (
                  <View style={styles.successContainer}>
                    <View
                      style={[
                        styles.successIcon,
                        { backgroundColor: `${theme.custom.colors.income}20` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={48}
                        color={theme.custom.colors.income}
                      />
                    </View>
                    <Text
                      style={[
                        styles.successText,
                        theme.custom.typography.h3,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      Invitation Sent!
                    </Text>
                  </View>
                ) : (
                  <View style={{ padding: theme.custom.spacing.lg }}>
                    <View style={styles.searchContainer}>
                      <View
                        style={[
                          styles.inputContainer,
                          {
                            backgroundColor: theme.custom.colors.glassBackground,
                            borderColor: error
                              ? theme.colors.error
                              : theme.custom.colors.border,
                            borderRadius: theme.custom.borderRadius.lg,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="magnify"
                          size={20}
                          color={theme.custom.colors.textSecondary}
                        />
                        <TextInput
                          style={[
                            styles.input,
                            theme.custom.typography.body,
                            { color: theme.custom.colors.text },
                          ]}
                          placeholder="Search by name or email..."
                          placeholderTextColor={theme.custom.colors.textSecondary}
                          value={searchText}
                          onChangeText={handleSearch}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          autoCorrect={false}
                        />
                        {searchLoading && (
                          <ActivityIndicator
                            size="small"
                            color={theme.colors.primary}
                          />
                        )}
                        {searchText.length > 0 && !searchLoading && (
                          <TouchableOpacity
                            onPress={() => {
                              setSearchText('');
                              setSuggestions([]);
                              setShowSuggestions(false);
                            }}
                          >
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={20}
                              color={theme.custom.colors.textSecondary}
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      {showSuggestions && suggestions.length > 0 && (
                        <View
                          style={[
                            styles.suggestionsContainer,
                            {
                              backgroundColor: theme.colors.surface,
                              borderColor: theme.custom.colors.border,
                              ...Platform.select({
                                ios: {
                                  shadowColor: '#000',
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 4,
                                },
                                android: {
                                  elevation: 3,
                                },
                              }),
                            },
                          ]}
                        >
                          <FlatList
                            data={suggestions.slice(0, 5)}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSuggestionItem}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                          />
                        </View>
                      )}
                    </View>

                    {error && (
                      <View
                        style={[
                          styles.errorContainer,
                          { backgroundColor: `${theme.colors.error}15` },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="alert-circle"
                          size={18}
                          color={theme.colors.error}
                        />
                        <Text
                          style={[
                            styles.errorText,
                            theme.custom.typography.caption,
                            { color: theme.colors.error },
                          ]}
                        >
                          {error}
                        </Text>
                      </View>
                    )}

                    {isValidEmail && suggestions.length === 0 && !searchLoading && (
                      <View style={{ marginTop: theme.custom.spacing.lg }}>
                        <TouchableOpacity
                          style={[
                            styles.inviteButton,
                            {
                              backgroundColor: theme.colors.primary,
                              borderRadius: theme.custom.borderRadius.lg,
                              opacity: loading ? 0.7 : 1,
                            },
                          ]}
                          onPress={handleInviteByEmail}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator color={theme.colors.onPrimary} />
                          ) : (
                            <>
                              <MaterialCommunityIcons
                                name="email-send"
                                size={20}
                                color={theme.colors.onPrimary}
                              />
                              <Text
                                style={[
                                  styles.inviteButtonText,
                                  theme.custom.typography.button,
                                  { color: theme.colors.onPrimary },
                                ]}
                              >
                                Invite {searchText}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <Text
                          style={[
                            styles.hintText,
                            theme.custom.typography.caption,
                            { color: theme.custom.colors.textSecondary },
                          ]}
                        >
                          They will receive an invitation to join your family
                        </Text>
                      </View>
                    )}

                    {!isValidEmail && searchText.length > 0 && suggestions.length === 0 && !searchLoading && (
                      <Text
                        style={[
                          styles.noResultsText,
                          theme.custom.typography.body,
                          { color: theme.custom.colors.textSecondary },
                        ]}
                      >
                        No users found. Enter a valid email to invite.
                      </Text>
                    )}
                  </View>
                )}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 50,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '700',
  },
  closeButton: {},
  searchContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    zIndex: 1001,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontWeight: '500',
  },
  suggestionEmail: {},
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  errorText: {},
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  inviteButtonText: {
    fontWeight: '600',
  },
  hintText: {
    textAlign: 'center',
    marginTop: 8,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 24,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successText: {
    fontWeight: '600',
  },
});

export default InviteMemberModal;
