import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, shadows } from '../constants/theme';
import { format, parseISO } from 'date-fns';
import type { Plan } from '../types/database';

type Props = {
  plan: Plan;
  participantCount: number;
  pendingTaskCount: number;
  completedTaskCount: number;
  totalExpense: number;
  onPress: () => void;
};

export function PlanCard({ plan, participantCount, pendingTaskCount, completedTaskCount, totalExpense, onPress }: Props) {
  const isDimmed = plan.status === 'completed' || plan.status === 'archived';
  const totalTasks = pendingTaskCount + completedTaskCount;
  const progress = totalTasks > 0 ? completedTaskCount / totalTasks : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
      <View style={[styles.container, shadows.card, isDimmed && styles.dimmedContainer]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.gradientTitle}>{plan.title}</Text>
              <Text style={styles.gradientSubtitle}>
                {participantCount} {participantCount === 1 ? 'person' : 'people'}
              </Text>
            </View>
            {totalExpense > 0 && (
              <View style={styles.amountBadgeGradient}>
                <Text style={styles.amountTextGradient}>₹{totalExpense.toLocaleString('en-IN')}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Progress bar */}
        {totalTasks > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedTaskCount}/{totalTasks} done
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          {plan.status === 'completed' && (
            <View style={styles.statusTag}>
              <Text style={styles.statusTagText}>Completed</Text>
            </View>
          )}
          {plan.status === 'archived' && (
            <View style={[styles.statusTag, styles.archivedTag]}>
              <Text style={[styles.statusTagText, styles.archivedTagText]}>Archived</Text>
            </View>
          )}
          {pendingTaskCount > 0 && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Pending Tasks: {pendingTaskCount}</Text>
            </View>
          )}
          {plan.event_date && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>📅 {format(parseISO(plan.event_date), 'MMM d, yyyy')}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.default,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  dimmedContainer: {
    opacity: 0.6,
  },
  gradientHeader: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gradientTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: '#ffffff',
  },
  gradientSubtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.onSurface,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  amountBadge: {
    backgroundColor: colors.secondaryContainer + '4D',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  amountText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.secondary,
  },
  amountBadgeGradient: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  amountTextGradient: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: '#ffffff',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  tagText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  statusTag: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  statusTagText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.onSecondaryContainer,
  },
  archivedTag: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  archivedTagText: {
    color: colors.onSurfaceVariant,
  },
});
