import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { WebContainer } from '../../components/WebContainer';
import { colors, fonts, spacing } from '../../constants/theme';
import { strings } from '../../constants/strings';

type AuthMode = 'email-login' | 'email-signup';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ redirect?: string }>();
  const redirectTo = params.redirect ?? '/(tabs)';

  const [mode, setMode] = useState<AuthMode>('email-login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, signIn } = useAuth();

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'email-signup') {
        const data = await signUp(email.trim(), password);
        if (data.session) {
          router.replace(redirectTo as any);
        } else {
          setError('Check your email to confirm your account, then log in.');
          setMode('email-login');
        }
      } else {
        await signIn(email.trim(), password);
        router.replace(redirectTo as any);
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
          {error ? (
            <Text style={[styles.error, error.includes('Check your email') && { color: colors.secondary }]}>
              {error}
            </Text>
          ) : null}
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
