import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal, Pressable, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
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
  const [planStats, setPlanStats] = useState<Record<string, { participants: number; pending: number; completed: number; expenses: number }>>({});
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refetch plans when screen gains focus (e.g. after deleting a plan)
  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans])
  );

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
    if (plans.length === 0) { setPlanStats({}); return; }
    const { data, error } = await supabase.rpc('get_plan_stats', {
      plan_ids: plans.map((p) => p.id),
    });
    if (error || !data) return;
    const stats: typeof planStats = {};
    for (const row of data as any[]) {
      stats[row.plan_id] = {
        participants: Number(row.participant_count) || 0,
        pending: Number(row.pending_task_count) || 0,
        completed: Number(row.completed_task_count) || 0,
        expenses: Number(row.total_expenses) || 0,
      };
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
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>{strings.appName}</Text>
          </View>
          <Text style={styles.greeting}>
            {profile?.display_name ?? ''}
          </Text>
        </View>

        {/* Search + Join row */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchField}
              placeholder="Search plans..."
              placeholderTextColor={colors.outlineVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.joinIconBtn} onPress={() => setShowJoinInput(true)} activeOpacity={0.7}>
            <Text style={styles.joinIconText}>🔗</Text>
          </TouchableOpacity>
        </View>

        {/* Join Modal */}
        <Modal transparent visible={showJoinInput} animationType="fade" onRequestClose={() => setShowJoinInput(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowJoinInput(false)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Join a Plan</Text>
              <Text style={styles.modalSubtitle}>Enter the invite code shared with you</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. AB3K9XYZ"
                placeholderTextColor={colors.outlineVariant}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
                autoFocus
                onSubmitEditing={handleJoinWithCode}
                returnKeyType="go"
                maxLength={8}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => { setShowJoinInput(false); setJoinCode(''); }}
                  style={styles.modalCancelBtn}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleJoinWithCode}
                  style={[styles.modalJoinBtn, !joinCode.trim() && { opacity: 0.5 }]}
                  disabled={!joinCode.trim()}
                >
                  <Text style={styles.modalJoinText}>Join →</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

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
              {plans
                .filter((p) => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((plan) => {
                const stat = planStats[plan.id] ?? { participants: 0, pending: 0, completed: 0, expenses: 0 };
                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    participantCount={stat.participants}
                    pendingTaskCount={stat.pending}
                    completedTaskCount={stat.completed}
                    totalExpense={stat.expenses}
                    onPress={() => router.push(`/plan/${plan.id}`)}
                  />
                );
              })}
            </View>
          </View>
        )}

        {plans.length === 0 && !loading && (
          <EmptyState
            emoji="📋"
            title="No plans yet!"
            subtitle="Start something new with your group. Pick a template below or create a custom plan."
            actionLabel="Create Your First Plan"
            onAction={() => router.push('/create-plan')}
          />
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 4,
  },
  brand: {
    fontFamily: fonts.headlineExtra,
    fontSize: 26,
    color: colors.primary,
    letterSpacing: -1,
  },
  greeting: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  // Search + Join row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 10,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchField: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  joinIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinIconText: {
    fontSize: 18,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.onSurface,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: -8,
  },
  modalInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.onSurface,
    letterSpacing: 4,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.default,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
  },
  modalCancelText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.onSurfaceVariant,
  },
  modalJoinBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.default,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalJoinText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: '#ffffff',
  },
});
