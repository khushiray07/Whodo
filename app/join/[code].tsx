import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { assignColor } from '../../lib/colors';
import { colors, fonts, spacing, radii } from '../../constants/theme';
import { strings } from '../../constants/strings';
import { showAlert } from '../../lib/alert';
import { WebContainer } from '../../components/WebContainer';

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { isAuthenticated, profile } = useAuth();
  const [planTitle, setPlanTitle] = useState('');
  const [planId, setPlanId] = useState('');
  const [participantCount, setParticipantCount] = useState(0);
  const [eventDate, setEventDate] = useState<string | null>(null);
  const [name, setName] = useState(profile?.display_name ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    lookupPlan();
  }, [code]);

  // Pre-fill name from profile when it loads
  useEffect(() => {
    if (profile?.display_name && !name) {
      setName(profile.display_name);
    }
  }, [profile?.display_name]);

  // Auto-join if logged in and name is available
  useEffect(() => {
    if (isAuthenticated && profile?.display_name && planId) {
      handleJoin();
    }
  }, [isAuthenticated, profile?.display_name, planId]);

  const lookupPlan = async () => {
    if (!code) return;
    const { data, error: err } = await supabase.rpc('lookup_plan_by_invite', { code });

    if (err || !data || data.length === 0) {
      setError(strings.invalidCode);
      return;
    }
    const foundPlanId = data[0].id;
    setPlanTitle(data[0].title);
    setPlanId(foundPlanId);
    setParticipantCount(data[0].participant_count ?? 0);
    setEventDate(data[0].event_date ?? null);

    // Auto-redirect if already a participant
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .eq('plan_id', foundPlanId)
        .eq('user_id', user.id)
        .single();
      if (existing) {
        router.replace(`/plan/${foundPlanId}`);
      }
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !planId) return;

    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Check if already a participant
      const { data: existing } = await supabase
        .from('participants')
        .select('id')
        .eq('plan_id', planId)
        .eq('user_id', user!.id)
        .single();

      if (existing) {
        router.replace(`/plan/${planId}`);
        return;
      }

      // Count existing participants for color assignment
      const { count } = await supabase
        .from('participants')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', planId);

      await supabase.from('participants').insert({
        plan_id: planId,
        name: name.trim(),
        user_id: user!.id,
        color: assignColor(count ?? 0),
        joined_via: 'app_joined',
      });

      router.replace(`/plan/${planId}`);
    } catch (e: any) {
      showAlert(strings.genericError, e.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <WebContainer>
          <View style={styles.center}>
            <Text style={styles.errorIcon}>😕</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Go Home" onPress={() => router.replace('/(tabs)')} variant="secondary" />
          </View>
        </WebContainer>
      </SafeAreaView>
    );
  }

  // If logged in, show joining state (auto-join handles the rest)
  if (isAuthenticated && planId) {
    return (
      <SafeAreaView style={styles.safe}>
        <WebContainer>
          <View style={styles.center}>
            <Text style={styles.brand}>{strings.appName}</Text>
            {planTitle && (
              <View style={styles.planBadge}>
                <Text style={styles.planName}>{planTitle}</Text>
              </View>
            )}
            <Text style={styles.subtitle}>Joining...</Text>
          </View>
        </WebContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <WebContainer>
        <View style={styles.center}>
          <Text style={styles.brand}>{strings.appName}</Text>
          <Text style={styles.title}>{strings.joinTitle}</Text>
          {planTitle && (
            <View style={styles.planBadge}>
              <Text style={styles.planName}>{planTitle}</Text>
            </View>
          )}
          {participantCount > 0 && (
            <Text style={styles.metaText}>
              {participantCount} {participantCount === 1 ? 'person' : 'people'} already in
              {eventDate ? ` · ${new Date(eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
            </Text>
          )}
          <Text style={styles.subtitle}>{strings.joinSubtitle}</Text>

          <Input
            label={strings.yourName}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <Button
            title={strings.joinButton}
            onPress={handleJoin}
            loading={loading}
            disabled={!name.trim()}
          />
        </View>
      </WebContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: 20,
    alignItems: 'center',
  },
  brand: {
    fontFamily: fonts.headlineExtra,
    fontSize: 40,
    color: colors.primary,
    letterSpacing: -2,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 28,
    color: colors.onSurface,
  },
  planBadge: {
    backgroundColor: colors.primary + '1A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  planName: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 16,
    color: colors.primary,
  },
  metaText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 18,
    color: colors.onSurface,
    textAlign: 'center',
  },
});
