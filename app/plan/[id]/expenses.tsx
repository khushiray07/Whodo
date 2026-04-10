import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ExpenseRow } from '../../../components/ExpenseRow';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTasks } from '../../../hooks/useTasks';
import { useParticipants } from '../../../hooks/useParticipants';
import { useSettlement } from '../../../hooks/useSettlement';
import { colors, fonts, spacing, radii } from '../../../constants/theme';
import { strings } from '../../../constants/strings';

export default function ExpensesTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses, tasks, loading, fetchTasks } = useTasks(id);
  const { participants, getMyParticipant } = useParticipants(id);
  const { totalSpent, perPerson, settlements } = useSettlement(tasks, participants);
  const [myParticipant, setMyParticipant] = useState<any>(null);

  useEffect(() => {
    getMyParticipant().then(setMyParticipant);
  }, [getMyParticipant]);

  const participantMap = new Map(participants.map((p) => [p.id, p]));

  // Calculate what I owe
  const mySettlement = myParticipant
    ? settlements.find((s) => s.from.id === myParticipant.id)
    : null;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor={colors.primary} />}
    >
      {/* Summary Bento */}
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalCard}
      >
        <Text style={styles.totalLabel}>{strings.totalSpent}</Text>
        <Text style={styles.totalAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
        <View style={styles.totalMeta}>
          <Text style={styles.totalMetaText}>
            {participants.length} {participants.length === 1 ? 'Person' : 'People'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        {mySettlement && (
          <View style={[styles.statCard, styles.oweCard]}>
            <Text style={styles.statLabel}>{strings.youOwe}</Text>
            <Text style={[styles.statAmount, { color: colors.secondaryDim }]}>₹{mySettlement.amount.toLocaleString('en-IN')}</Text>
          </View>
        )}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>{strings.perPerson}</Text>
          <Text style={styles.statAmount}>₹{perPerson.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Khatabook */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{strings.khatabook}</Text>
        <Badge text={`${expenses.length} Expenses`} variant="secondary" />
      </View>

      <View style={styles.list}>
        {expenses.map((task) => (
          <ExpenseRow
            key={task.id}
            task={task}
            payer={task.expense_paid_by ? participantMap.get(task.expense_paid_by) : null}
          />
        ))}
      </View>

      {expenses.length === 0 && !loading && (
        <EmptyState title={strings.expensesEmpty} subtitle={strings.expensesEmptyHint} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  totalCard: {
    borderRadius: radii.default,
    padding: 24,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 4,
  },
  totalLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  totalAmount: {
    fontFamily: fonts.headlineExtra,
    fontSize: 36,
    color: '#ffffff',
    marginTop: 4,
  },
  totalMeta: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: 16,
  },
  totalMetaText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.default,
    padding: 20,
  },
  oweCard: {
    backgroundColor: colors.secondaryContainer + '4D',
    borderWidth: 2,
    borderColor: colors.secondaryContainer + '33',
  },
  statLabel: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statAmount: {
    fontFamily: fonts.headlineExtra,
    fontSize: 24,
    color: colors.onSurface,
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
  list: {
    gap: 16,
  },
});
