import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, radii } from '../constants/theme';
import type { Notification } from '../types/database';
import { formatDistanceToNow } from 'date-fns';

type Props = {
  notification: Notification;
  onPress: () => void;
};

const typeIcons: Record<string, string> = {
  task_claimed: '🙋',
  task_done: '✅',
  expense_logged: '💰',
  deadline_approaching: '⏰',
  settlement_reminder: '💸',
  participant_joined: '👋',
};

export function NotificationRow({ notification, onPress }: Props) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        !notification.read && styles.unread,
      ]}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{typeIcons[notification.type] ?? '📌'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.body}>{notification.body}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
  },
  unread: {
    backgroundColor: colors.primary + '08',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.outline,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
