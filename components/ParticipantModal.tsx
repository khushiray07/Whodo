import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Avatar } from './ui/Avatar';
import { computeSettlements } from '../lib/settlement';
import { formatRelative } from '../lib/date';
import { colors, fonts, radii, spacing } from '../constants/theme';
import type { Participant, Task } from '../types/database';

type Props = {
  participant: Participant | null;
  tasks: Task[];
  participants: Participant[];
  isOwner: boolean;
  onClose: () => void;
  onRemove?: (id: string, name: string) => void;
  currentUserId?: string;
};

export function ParticipantModal({ participant, tasks, participants, isOwner, onClose, onRemove, currentUserId }: Props) {
  const stats = useMemo(() => {
    if (!participant) return null;

    const claimed = tasks.filter((t) => t.assigned_to === participant.id && !t.is_standalone_expense);
    const completed = claimed.filter((t) => t.status === 'done');
    const expensesPaid = tasks
      .filter((t) => (t.expense_paid_by === participant.id || (!t.expense_paid_by && t.assigned_to === participant.id)) && t.expense_amount && t.expense_amount > 0)
      .reduce((sum, t) => sum + (t.expense_amount ?? 0), 0);

    const settlements = computeSettlements(tasks, participants);
    const owes = settlements.filter((s) => s.from.id === participant.id).reduce((sum, s) => sum + s.amount, 0);
    const owed = settlements.filter((s) => s.to.id === participant.id).reduce((sum, s) => sum + s.amount, 0);

    return {
      tasksClaimed: claimed.length,
      tasksCompleted: completed.length,
      taskNames: claimed.slice(0, 5).map((t) => t.title),
      expensesPaid,
      owes,
      owed,
      netBalance: owed - owes,
    };
  }, [participant, tasks, participants]);

  if (!participant || !stats) return null;

  const canRemove = isOwner && participant.user_id !== currentUserId;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile header */}
            <View style={styles.profileHeader}>
              <Avatar name={participant.name} color={participant.color} size={72} />
              <Text style={styles.name}>{participant.name}</Text>
              <Text style={styles.joinInfo}>
                {participant.user_id ? 'Joined via app' : 'Added by organizer'} · {formatRelative(participant.joined_at)}
              </Text>
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.tasksClaimed}</Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.tasksCompleted}</Text>
                <Text style={styles.statLabel}>Done</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>₹{stats.expensesPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
            </View>

            {/* Settlement status */}
            <View style={[styles.balanceCard, { backgroundColor: stats.netBalance >= 0 ? '#e8f5e9' : '#fce4ec' }]}>
              <Text style={styles.balanceLabel}>
                {stats.netBalance > 0 ? 'Gets back' : stats.netBalance < 0 ? 'Owes' : 'All settled'}
              </Text>
              {stats.netBalance !== 0 && (
                <Text style={[styles.balanceAmount, { color: stats.netBalance > 0 ? colors.secondary : colors.error }]}>
                  ₹{Math.abs(stats.netBalance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
              )}
            </View>

            {/* Tasks list */}
            {stats.taskNames.length > 0 && (
              <View style={styles.taskSection}>
                <Text style={styles.taskSectionTitle}>Their tasks</Text>
                {stats.taskNames.map((name, i) => (
                  <View key={i} style={styles.taskRow}>
                    <Text style={styles.taskDot}>•</Text>
                    <Text style={styles.taskName} numberOfLines={1}>{name}</Text>
                  </View>
                ))}
                {stats.tasksClaimed > 5 && (
                  <Text style={styles.moreText}>+{stats.tasksClaimed - 5} more</Text>
                )}
              </View>
            )}

            {/* Remove button (owner only) */}
            {canRemove && onRemove && (
              <Pressable
                onPress={() => { onClose(); onRemove(participant.id, participant.name); }}
                style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.removeBtnText}>Remove from plan</Text>
              </Pressable>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  name: {
    fontFamily: fonts.headlineExtra,
    fontSize: 24,
    color: colors.onSurface,
    marginTop: 4,
  },
  joinInfo: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontFamily: fonts.headlineExtra,
    fontSize: 18,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceCard: {
    borderRadius: radii.default,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  balanceLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  balanceAmount: {
    fontFamily: fonts.headlineExtra,
    fontSize: 28,
    color: colors.primary,
  },
  taskSection: {
    marginBottom: 16,
    gap: 6,
  },
  taskSectionTitle: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDot: {
    color: colors.primary,
    fontSize: 16,
  },
  taskName: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurface,
    flex: 1,
  },
  moreText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.outline,
    marginTop: 2,
  },
  removeBtn: {
    backgroundColor: colors.error + '12',
    borderRadius: radii.default,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  removeBtnText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.error,
  },
});
