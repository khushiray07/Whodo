import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { WebContainer } from '../../components/WebContainer';
import { colors, fonts, spacing } from '../../constants/theme';
import { strings } from '../../constants/strings';

type AuthMode = 'phone' | 'otp' | 'email-login' | 'email-signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, signIn, signInWithPhone, verifyOtp } = useAuth();

  const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithPhone(fullPhone);
      setMode('otp');
    } catch (e: any) {
      setError(e.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length < 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyOtp(fullPhone, otp.trim());
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'email-signup') {
        const data = await signUp(email.trim(), password);
        if (data.session) {
          router.replace('/(tabs)');
        } else {
          setError('Check your email to confirm your account, then log in.');
          setMode('email-login');
        }
      } else {
        await signIn(email.trim(), password);
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setError(e.message || strings.genericError);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then tap Forgot Password.');
      return;
    }
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
      setError('Password reset link sent! Check your email.');
    } catch {
      setError('Could not send reset email.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <WebContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>{strings.loginTitle}</Text>
          <Text style={styles.tagline}>{strings.loginSubtitle}</Text>
        </View>

        <View style={styles.form}>
          {/* Phone OTP flow */}
          {mode === 'phone' && (
            <>
              <Input
                label="WhatsApp Number"
                placeholder="Enter 10-digit number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Text style={styles.phoneHint}>We'll send an OTP to +91{phone.replace(/^\+91/, '')}</Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title="Send OTP via WhatsApp"
                onPress={handleSendOtp}
                loading={loading}
                disabled={!phone.trim()}
                variant="whatsapp"
              />
              <TouchableOpacity onPress={() => { setMode('email-login'); setError(''); }}>
                <Text style={styles.toggle}>Use email instead</Text>
              </TouchableOpacity>
            </>
          )}

          {mode === 'otp' && (
            <>
              <Text style={styles.otpInfo}>OTP sent to {fullPhone}</Text>
              <Input
                label="Enter OTP"
                placeholder="6-digit code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title="Verify & Login"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={otp.trim().length < 6}
              />
              <TouchableOpacity onPress={handleSendOtp}>
                <Text style={styles.toggle}>Resend OTP</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode('phone'); setOtp(''); setError(''); }}>
                <Text style={styles.forgot}>Change number</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Email flow */}
          {(mode === 'email-login' || mode === 'email-signup') && (
            <>
              <Input
                label={strings.emailLabel}
                placeholder={strings.emailPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <Input
                label="Password"
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={mode === 'email-signup' ? 'Sign Up' : 'Login'}
                onPress={handleEmailSubmit}
                loading={loading}
                disabled={!email.trim() || !password.trim()}
              />
              <TouchableOpacity onPress={() => {
                setMode(mode === 'email-signup' ? 'email-login' : 'email-signup');
                setError('');
              }}>
                <Text style={styles.toggle}>
                  {mode === 'email-signup' ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
              {mode === 'email-login' && (
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgot}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => { setMode('phone'); setError(''); }}>
                <Text style={styles.toggle}>Login with WhatsApp instead</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
      </WebContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brand: {
    fontFamily: fonts.headlineExtra,
    fontSize: 48,
    color: colors.primary,
    letterSpacing: -2,
  },
  tagline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  phoneHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: -8,
  },
  otpInfo: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.onSurface,
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  toggle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  forgot: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
  },
});
