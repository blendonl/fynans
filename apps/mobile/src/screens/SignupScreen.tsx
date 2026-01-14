import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { signupSchema, SignupFormData } from '../schemas/signupSchema';
import { GradientBackground, GlassCard, AnimatedInput, FormErrorMessage, PasswordStrengthIndicator, SocialLoginButton } from '../components/auth';
import { Button } from '../components/design-system/Button';
import { useAppTheme } from '../theme';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useAppleAuth } from '../hooks/useAppleAuth';

export default function SignupScreen({ navigation }: any) {
  const { register, loginWithGoogle, loginWithApple } = useAuth();
  const { theme } = useAppTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  const { signInWithApple, loading: appleLoading } = useAppleAuth();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
    } catch (e: any) {
      setApiError(e.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithGoogle();
      await loginWithGoogle(result);
    } catch (e: any) {
      Alert.alert('Google Sign In Failed', e.message || 'Please try again.');
    }
  };

  const handleAppleSignup = async () => {
    try {
      const result = await signInWithApple();
      await loginWithApple(result);
    } catch (e: any) {
      if (e.message !== 'Apple Sign In was canceled') {
        Alert.alert('Apple Sign In Failed', e.message || 'Please try again.');
      }
    }
  };

  return (
    <GradientBackground>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={[styles.title, { color: '#FFFFFF' }]}>Create Account</Text>
              <Text style={[styles.subtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
                Sign up to get started
              </Text>

              <GlassCard style={styles.card}>
                {apiError ? (
                  <View style={styles.apiErrorContainer}>
                    <Text style={styles.apiErrorText}>
                      {apiError}
                    </Text>
                  </View>
                ) : null}

                <Controller
                  control={control}
                  name="firstName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <AnimatedInput
                        label="First Name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!errors.firstName && !!touchedFields.firstName}
                        leftIcon="account"
                      />
                      <FormErrorMessage
                        message={errors.firstName?.message}
                        visible={!!errors.firstName && !!touchedFields.firstName}
                      />
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <AnimatedInput
                        label="Last Name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={!!errors.lastName && !!touchedFields.lastName}
                        leftIcon="account"
                      />
                      <FormErrorMessage
                        message={errors.lastName?.message}
                        visible={!!errors.lastName && !!touchedFields.lastName}
                      />
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <AnimatedInput
                        label="Email"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={!!errors.email && !!touchedFields.email}
                        leftIcon="email"
                      />
                      <FormErrorMessage
                        message={errors.email?.message}
                        visible={!!errors.email && !!touchedFields.email}
                      />
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <AnimatedInput
                        label="Password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        error={!!errors.password && !!touchedFields.password}
                        leftIcon="lock"
                        rightIcon={showPassword ? 'eye-off' : 'eye'}
                        onRightIconPress={() => setShowPassword(!showPassword)}
                      />
                      <PasswordStrengthIndicator password={value} />
                      <FormErrorMessage
                        message={errors.password?.message}
                        visible={!!errors.password && !!touchedFields.password}
                      />
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <AnimatedInput
                        label="Confirm Password"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showConfirmPassword}
                        error={!!errors.confirmPassword && !!touchedFields.confirmPassword}
                        leftIcon="lock"
                        rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                      <FormErrorMessage
                        message={errors.confirmPassword?.message}
                        visible={!!errors.confirmPassword && !!touchedFields.confirmPassword}
                      />
                    </View>
                  )}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  style={styles.signupButton}
                  labelStyle={styles.buttonLabel}
                >
                  {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : 'Sign Up'}
                </Button>

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>
                    Or continue with
                  </Text>
                  <View style={styles.divider} />
                </View>

                <SocialLoginButton
                  provider="google"
                  onPress={handleGoogleSignup}
                  loading={googleLoading}
                />
                <SocialLoginButton
                  provider="apple"
                  onPress={handleAppleSignup}
                  loading={appleLoading}
                />

                <TouchableOpacity
                  style={styles.loginLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginText}>
                    Already have an account?{' '}
                    <Text style={styles.loginTextBold}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </GlassCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    marginTop: 16,
  },
  apiErrorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  apiErrorText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ff6b6b',
  },
  signupButton: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loginTextBold: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
