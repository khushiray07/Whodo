import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { EmptyState } from '../../components/ui/EmptyState';
import { useActivityLog } from '../../hooks/useActivityLog';
import { colors, fonts, spacing, radii } from '../../constants/theme';
import { strings } from '../../constants/strings';
import { formatDistanceToNow } from 'date-fns';

const actionIcons: Record<string, string> = {
  task_created: '📝',
  task_claimed: '🙋',
  task_completed: '✅',
  expense_logged: '💰',
  participant_joined: '👋',
  plan_created: '🎉',
};

const actionLabels: Record<string, string> = {
  task_created: 'created a task',
  task_claimed: 'claimed a task',
  task_completed: 'completed a task',
  expense_logged: 'logged an expense',
  participant_joined: 'joined the plan',
  plan_created: 'created a plan',
};

export default function ActivityScreen() {
  const { activities, loading, fetchActivities } = useActivityLog();

  // Refetch when tab gains focus
  useFocusEffect(useCallback(() => {
    fetchActivities();
  }, [fetchActivities]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchActivities} tintColor={colors.primary} />}
      >
        <Text style={styles.title}>{strings.activityTitle}</Text>

        {activities.length === 0 && !loading && (
          <EmptyState title={strings.noActivity} subtitle={strings.noActivitySubtitle} />
        )}

        <View style={styles.list}>
          {activities.map((a) => (
            <View key={a.id} style={styles.item}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>{actionIcons[a.action] ?? '📌'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionText}>
                  {(a.metadata as any)?.title
                    ? `${actionLabels[a.action] ?? a.action}: "${(a.metadata as any).title}"`
                    : actionLabels[a.action] ?? a.action}
                </Text>
                {(a.metadata as any)?.amount != null && (
                  <Text style={styles.amountText}>₹{(a.metadata as any).amount}</Text>
                )}
                <Text style={styles.timeText}>
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 120,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    color: colors.onSurface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    padding: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  actionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurface,
  },
  amountText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.secondary,
    marginTop: 2,
  },
  timeText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.outline,
    marginTop: 4,
  },
});
