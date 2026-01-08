import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Keyboard,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ToggleSwitch } from '../components/design-system';
import { useAppTheme } from '../theme';
import AddExpenseScreen from './AddExpenseScreen';
import AddIncomeScreen from './AddIncomeScreen';

type TransactionType = 'EXPENSE' | 'INCOME';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

export default function AddTransactionScreen({ navigation, route }: any) {
    const { theme } = useAppTheme();
    const initialType = route?.params?.initialType || 'EXPENSE';
    const [transactionType, setTransactionType] = useState<TransactionType>(initialType);

    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const keyboardOffset = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
    }, []);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
            const keyboardHeight = e.endCoordinates.height;
            const sheetVisibleHeight = SCREEN_HEIGHT - SHEET_HEIGHT;
            const offset = keyboardHeight - sheetVisibleHeight;
            Animated.timing(keyboardOffset, {
                toValue: -Math.max(offset, 0),
                duration: Platform.OS === 'ios' ? e.duration : 200,
                useNativeDriver: true,
            }).start();
        });

        const keyboardHideListener = Keyboard.addListener(hideEvent, (e) => {
            Animated.timing(keyboardOffset, {
                toValue: 0,
                duration: Platform.OS === 'ios' ? e.duration : 200,
                useNativeDriver: true,
            }).start();
        });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    const handleClose = () => {
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
        ]).start(() => {
            navigation.goBack();
        });
    };

    const toggleOptions = [
        {
            value: 'EXPENSE',
            label: 'Expense',
            icon: 'minus-circle',
        },
        {
            value: 'INCOME',
            label: 'Income',
            icon: 'plus-circle',
        },
    ];

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={handleClose}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        {
                            backgroundColor: theme.colors.backdrop,
                            opacity: fadeAnim,
                        },
                    ]}
                />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: theme.colors.surface,
                        borderTopLeftRadius: theme.custom.borderRadius.xl + 8,
                        borderTopRightRadius: theme.custom.borderRadius.xl + 8,
                        transform: [
                            { translateY: slideAnim },
                            { translateY: keyboardOffset },
                        ],
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

                    <View style={[styles.header, { borderBottomColor: theme.custom.colors.divider }]}>
                        <View style={styles.toggleContainer}>
                            <ToggleSwitch
                                options={toggleOptions}
                                value={transactionType}
                                onChange={(value) => setTransactionType(value as TransactionType)}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={[
                                styles.closeButton,
                                {
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

                    <View style={styles.content}>
                        {transactionType === 'EXPENSE' ? (
                            <AddExpenseScreen navigation={navigation} />
                        ) : (
                            <AddIncomeScreen navigation={navigation} />
                        )}
                    </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        height: SHEET_HEIGHT,
        overflow: 'hidden',
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    toggleContainer: {
        flex: 1,
        marginRight: 12,
    },
    closeButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        minHeight: 0,
    },
});
