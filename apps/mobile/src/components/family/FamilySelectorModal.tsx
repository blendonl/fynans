import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useFamily } from '../../context/FamilyContext';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme';

interface FamilySelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FamilySelectorModal: React.FC<FamilySelectorModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const { families, selectedFamily, selectFamily } = useFamily();
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (visible) {
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

      // Pulse animation for create button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
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

  const handleSelect = async (family: any | null) => {
    Haptics.selectionAsync();
    await selectFamily(family);
    onClose();
  };

  const handleCreateFamily = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    navigation.navigate('CreateFamily' as never);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
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
              {/* Enhanced handle with gradient */}
              <View style={styles.handleContainer}>
                <LinearGradient
                  colors={[
                    theme.custom.colors.primaryLight,
                    theme.colors.primary,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.handle,
                    {
                      shadowColor: theme.colors.primary,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                    },
                  ]}
                />
              </View>

              <View style={[
                styles.header,
                {
                  paddingHorizontal: theme.custom.spacing.lg,
                  paddingVertical: theme.custom.spacing.lg,
                  borderBottomColor: theme.custom.colors.divider,
                }
              ]}>
                <Text style={[
                  styles.title,
                  { color: theme.colors.onSurface },
                  theme.custom.typography.h2,
                ]}>
                  Select Context
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.closeButton,
                    {
                      padding: theme.custom.spacing.sm,
                      backgroundColor: theme.custom.colors.glassBackground,
                      borderRadius: theme.custom.borderRadius.round,
                    }
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={[null, ...families]}
                keyExtractor={(item) => item?.id || 'personal'}
                renderItem={({ item, index }) => {
                  const isSelected = item
                    ? selectedFamily?.id === item.id
                    : !selectedFamily;
                  const isPersonal = !item;
                  const memberCount = item?.members?.length || 0;

                  return (
                    <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }),
                          },
                        ],
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.item,
                          {
                            borderRadius: theme.custom.borderRadius.lg,
                            paddingVertical: theme.custom.spacing.lg,
                            paddingHorizontal: theme.custom.spacing.lg,
                            marginVertical: theme.custom.spacing.xs,
                            borderWidth: isSelected ? 2 : 0,
                            borderColor: isSelected ? theme.colors.primary : 'transparent',
                            overflow: 'hidden',
                          },
                          isPersonal && !isSelected && {
                            borderWidth: 1.5,
                            borderColor: `${theme.colors.primary}40`,
                          },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          handleSelect(item);
                        }}
                        activeOpacity={0.97}
                      >
                        {/* Selection gradient background */}
                        {isSelected && (
                          <LinearGradient
                            colors={[
                              `${theme.colors.primary}14`,
                              `${theme.colors.primary}0A`,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                          />
                        )}

                        <View style={styles.itemLeft}>
                          <View
                            style={[
                              styles.iconContainer,
                              {
                                backgroundColor: isPersonal
                                  ? theme.custom.colors.familyPersonalLight
                                  : theme.custom.colors.familyGroupLight,
                                borderRadius: theme.custom.borderRadius.round,
                                ...Platform.select({
                                  ios: {
                                    shadowColor: isSelected ? theme.colors.primary : '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: isSelected ? 0.3 : 0.1,
                                    shadowRadius: 4,
                                  },
                                  android: {
                                    elevation: isSelected ? 4 : 2,
                                  },
                                }),
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={isPersonal ? 'account' : 'account-group'}
                              size={28}
                              color={isPersonal
                                ? theme.custom.colors.familyPersonal
                                : theme.custom.colors.familyGroup
                              }
                            />
                          </View>
                          <View style={styles.itemTextContainer}>
                            <View style={styles.itemNameRow}>
                              <Text
                                style={[
                                  styles.itemName,
                                  { color: theme.colors.onSurface },
                                  theme.custom.typography.bodyMedium,
                                ]}
                              >
                                {isPersonal ? 'Personal' : item.name}
                              </Text>
                              {!isPersonal && memberCount > 0 && (
                                <View
                                  style={[
                                    styles.memberBadge,
                                    {
                                      backgroundColor: `${theme.custom.colors.familyGroup}20`,
                                      paddingHorizontal: theme.custom.spacing.sm,
                                      paddingVertical: 2,
                                      borderRadius: theme.custom.borderRadius.round,
                                      marginLeft: theme.custom.spacing.sm,
                                    },
                                  ]}
                                >
                                  <MaterialCommunityIcons
                                    name="account-multiple"
                                    size={12}
                                    color={theme.custom.colors.familyGroup}
                                  />
                                  <Text
                                    style={[
                                      {
                                        color: theme.custom.colors.familyGroup,
                                        fontSize: 11,
                                        fontWeight: '600',
                                        marginLeft: 2,
                                      },
                                    ]}
                                  >
                                    {memberCount}
                                  </Text>
                                </View>
                              )}
                            </View>
                            {!isPersonal && (
                              <Text style={[
                                styles.itemBalance,
                                {
                                  color: parseFloat(item.balance) >= 0
                                    ? theme.custom.colors.income
                                    : theme.custom.colors.expense,
                                  fontWeight: '600',
                                },
                                theme.custom.typography.caption,
                              ]}>
                                ${item.balance.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>
                        {isSelected && (
                          <Animated.View
                            style={{
                              transform: [
                                {
                                  scale: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                  }),
                                },
                              ],
                            }}
                          >
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={26}
                              color={theme.colors.primary}
                            />
                          </Animated.View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                }}
                contentContainerStyle={[
                  styles.listContent,
                  {
                    paddingHorizontal: theme.custom.spacing.lg,
                    paddingTop: theme.custom.spacing.md,
                  }
                ]}
              />

              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  marginHorizontal: theme.custom.spacing.lg,
                  marginTop: theme.custom.spacing.lg,
                  marginBottom: theme.custom.spacing.lg,
                  borderRadius: theme.custom.borderRadius.lg,
                  overflow: 'hidden',
                  ...Platform.select({
                    ios: {
                      shadowColor: theme.colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                    },
                    android: {
                      elevation: 8,
                    },
                  }),
                }}
              >
                <LinearGradient
                  colors={[
                    theme.custom.colors.gradientPrimaryStart,
                    theme.custom.colors.gradientPrimaryEnd,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <TouchableOpacity
                  style={[
                    styles.createButton,
                    {
                      paddingVertical: theme.custom.spacing.md + 2,
                      borderRadius: theme.custom.borderRadius.lg,
                    },
                  ]}
                  onPress={handleCreateFamily}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="sparkles"
                    size={22}
                    color={theme.colors.onPrimary}
                  />
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={20}
                    color={theme.colors.onPrimary}
                    style={{ marginLeft: 4 }}
                  />
                  <Text style={[
                    styles.createButtonText,
                    { color: theme.colors.onPrimary },
                    theme.custom.typography.button,
                  ]}>
                    Create New Family
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 20,
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
  listContent: {},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontWeight: '600',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemBalance: {
    marginTop: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default FamilySelectorModal;
