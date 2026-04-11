import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationRow } from '../../components/NotificationRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { colors, fonts, spacing } from '../../constants/theme';
import { strings } from '../../constants/strings';

export default function AlertsScreen() {
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{strings.alertsTitle}</Text>
          {notifications.some((n) => !n.read) && (
            <Text style={styles.markAll} onPress={markAllAsRead}>Mark all read</Text>
          )}
        </View>

        {notifications.length === 0 && !loading && (
          <EmptyState
            emoji="🔔"
            title="All quiet!"
            subtitle="When your crew claims tasks, logs expenses, or joins your plans, you'll see it here."
          />
        )}

        <View style={styles.list}>
          {notifications.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onPress={() => {
                markAsRead(n.id);
                if (n.plan_id) router.push(`/plan/${n.plan_id}`);
              }}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    color: colors.onSurface,
  },
  markAll: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.primary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: 8,
  },
});
