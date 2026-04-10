import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PlanCard } from '../../components/PlanCard';
import { TemplateCard } from '../../components/TemplateCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { usePlans } from '../../hooks/usePlans';
import { useAuth } from '../../hooks/useAuth';
import { templates } from '../../lib/templates';
import { supabase } from '../../lib/supabase';
import { colors, fonts, spacing, radii, shadows } from '../../constants/theme';
import { strings } from '../../constants/strings';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { plans, loading, fetchPlans } = usePlans();
  const [planStats, setPlanStats] = useState<Record<string, { participants: number; pending: number; expenses: number }>>({});
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoinWithCode = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinCode('');
    setShowJoinInput(false);
    router.push(`/join/${code}`);
  };

  useEffect(() => {
    loadPlanStats();
  }, [plans]);

  const loadPlanStats = async () => {
    const stats: typeof planStats = {};
    for (const plan of plans) {
      const [{ count: pCount }, { data: tasks }] = await Promise.all([
        supabase.from('participants').select('*', { count: 'exact', head: true }).eq('plan_id', plan.id),
        supabase.from('tasks').select('status, expense_amount').eq('plan_id', plan.id),
      ]);
      const pendingTasks = (tasks ?? []).filter((t) => t.status === 'pending');
      const totalExpense = (tasks ?? []).reduce((s, t) => s + (t.expense_amount ?? 0), 0);
      stats[plan.id] = { participants: pCount ?? 0, pending: pendingTasks.length, expenses: totalExpense };
    }
    setPlanStats(stats);
  };

  const displayTemplates = templates.filter((t) => t.key !== 'custom').slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPlans} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Namaste{profile?.display_name ? `, ${profile.display_name}` : ''}!
            </Text>
            <Text style={styles.brand}>{strings.appName}</Text>
          </View>
        </View>
        <Text style={styles.tagline}>{strings.tagline}</Text>

        {/* Join with Code */}
        {showJoinInput ? (
          <View style={styles.joinSection}>
            <View style={styles.joinRow}>
              <TextInput
                style={styles.joinInput}
                placeholder="Enter invite code"
                placeholderTextColor={colors.outlineVariant}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                autoFocus
                onSubmitEditing={handleJoinWithCode}
                returnKeyType="go"
              />
              <TouchableOpacity onPress={handleJoinWithCode} style={styles.joinGoBtn}>
                <Text style={styles.joinGoText}>Join</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowJoinInput(false)}>
                <Text style={styles.joinCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.joinButton} onPress={() => setShowJoinInput(true)}>
            <Text style={styles.joinButtonIcon}>🔗</Text>
            <Text style={styles.joinButtonText}>Join a plan with invite code</Text>
          </TouchableOpacity>
        )}

        {/* Active Plans */}
        {plans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{strings.currentScenes}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{plans.filter(p => p.status === 'active').length} Active</Text>
              </View>
            </View>
            <View style={styles.planList}>
              {plans.map((plan) => {
                const stat = planStats[plan.id] ?? { participants: 0, pending: 0, expenses: 0 };
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    participantCount={stat.participants}
                    pendingTaskCount={stat.pending}
                    totalExpense={stat.expenses}
                    onPress={() => router.push(`/plan/${plan.id}`)}
                  />
                );
              })}
            </View>
          </View>
        )}

        {plans.length === 0 && !loading && (
          <EmptyState title={strings.noPlansTitle} subtitle={strings.noPlansSubtitle} />
        )}

        {/* Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.needIdeas}</Text>
          <View style={styles.templateGrid}>
            {displayTemplates.map((t) => (
              <View key={t.key} style={styles.templateCell}>
                <TemplateCard
                  template={t}
                  onPress={() => router.push({ pathname: '/create-plan', params: { template: t.key } })}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => router.push('/create-plan')}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
  },
  scroll: {
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  greeting: {
    fontFamily: fonts.headlineMedium,
    fontSize: 14,
    color: colors.primary,
  },
  brand: {
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    color: colors.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    color: colors.onSurface,
    letterSpacing: -1,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 20,
    color: colors.onSurface,
  },
  countBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  countText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.onSecondaryContainer,
  },
  planList: {
    gap: 16,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.md,
  },
  templateCell: {
    width: '48%',
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    ...shadows.fab,
    borderRadius: 32,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.full,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.primary + '25',
    borderStyle: 'dashed',
  },
  joinButtonIcon: {
    fontSize: 16,
  },
  joinButtonText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  joinSection: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinInput: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.default,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.headlineExtra,
    fontSize: 16,
    color: colors.onSurface,
    letterSpacing: 2,
  },
  joinGoBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  joinGoText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.onPrimary,
  },
  joinCancel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    paddingHorizontal: 8,
  },
});
