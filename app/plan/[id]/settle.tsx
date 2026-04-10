import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SettlementCard } from '../../../components/SettlementCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTasks } from '../../../hooks/useTasks';
import { useParticipants } from '../../../hooks/useParticipants';
import { useSettlement } from '../../../hooks/useSettlement';
import { colors, fonts, spacing, radii } from '../../../constants/theme';
import { strings } from '../../../constants/strings';

function formatAmount(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function SettleTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, loading, fetchTasks } = useTasks(id);
  const { participants, getMyParticipant } = useParticipants(id);
  const { settlements, totalSpent } = useSettlement(tasks, participants);
  const [myParticipant, setMyParticipant] = useState<any>(null);

  useEffect(() => {
    getMyParticipant().then(setMyParticipant);
  }, [getMyParticipant]);

  // Calculate only what the current user owes or is owed
  const myOwes = myParticipant
    ? settlements.filter((s) => s.from.id === myParticipant.id).reduce((sum, s) => sum + s.amount, 0)
    : 0;
  const myOwed = myParticipant
    ? settlements.filter((s) => s.to.id === myParticipant.id).reduce((sum, s) => sum + s.amount, 0)
    : 0;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor={colors.primary} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{strings.settleHero}</Text>
        <Text style={styles.heroSubtitle}>{strings.settleSubtitle}</Text>
      </View>

      {/* Summary Bento */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{strings.totalGroupSpend}</Text>
          <Text style={styles.statAmount} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(totalSpent)}</Text>
        </View>
        {myOwed > 0 ? (
          <View style={[styles.statCard, styles.greenCard]}>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>You are owed</Text>
            <Text style={[styles.statAmount, { color: colors.secondary }]} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(myOwed)}</Text>
          </View>
        ) : myOwes > 0 ? (
          <View style={[styles.statCard, styles.redCard]}>
            <Text style={[styles.statLabel, { color: colors.tertiary }]}>You owe</Text>
            <Text style={[styles.statAmount, { color: colors.tertiary }]} adjustsFontSizeToFit numberOfLines={1}>{formatAmount(myOwes)}</Text>
          </View>
        ) : (
          <View style={[styles.statCard, styles.greenCard]}>
            <Text style={[styles.statLabel, { color: colors.secondary }]}>Your balance</Text>
            <Text style={[styles.statAmount, { color: colors.secondary }]} adjustsFontSizeToFit numberOfLines={1}>All clear!</Text>
          </View>
        )}
      </View>

      {/* Settlements */}
      <Text style={styles.sectionLabel}>{strings.smartSettlements}</Text>
      <View style={styles.list}>
        {settlements.map((s, i) => (
          <SettlementCard key={`${s.from.id}-${s.to.id}-${i}`} settlement={s} />
        ))}
      </View>

      {settlements.length === 0 && !loading && (
        <EmptyState
          title="All settled!"
          subtitle="No pending settlements"
        />
      )}

      {settlements.length > 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintTitle}>{strings.almostThere}</Text>
          <Text style={styles.hintSub}>{settlements.length} settlements pending to close this plan.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    color: colors.onSurface,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.default,
    padding: 24,
    justifyContent: 'space-between',
    minHeight: 140,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.04,
    shadowRadius: 40,
    elevation: 2,
  },
  greenCard: {
    backgroundColor: colors.secondaryContainer + '1A',
    borderWidth: 1,
    borderColor: colors.secondaryContainer + '4D',
  },
  redCard: {
    backgroundColor: colors.tertiaryContainer + '1A',
    borderWidth: 1,
    borderColor: colors.tertiaryContainer + '4D',
  },
  statLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  statAmount: {
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.onSurface,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 8,
  },
  list: {
    gap: 12,
  },
  hint: {
    marginTop: spacing.xl,
    padding: 32,
    alignItems: 'center',
    backgroundColor: colors.primary + '08',
    borderRadius: radii.default,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary + '1A',
  },
  hintTitle: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 16,
    color: colors.onSurface,
  },
  hintSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
});
