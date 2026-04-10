import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../constants/theme';
import type { Task, Participant } from '../types/database';
import { format } from 'date-fns';

type Props = {
  task: Task;
  payer?: Participant | null;
};

export function ExpenseRow({ task, payer }: Props) {
  const dateStr = task.created_at
    ? format(new Date(task.created_at), 'MMM d, h:mm a')
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>₹</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.topRow}>
          <Text style={styles.description}>
            <Text style={styles.payerName}>{payer?.name ?? 'Someone'}</Text>
            {' spent on '}
            {task.title}
          </Text>
          <Text style={styles.amount}>₹{(task.expense_amount ?? 0).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{dateStr}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: {
    fontFamily: fonts.headlineExtra,
    fontSize: 24,
    color: colors.secondary,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  description: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.onSurface,
    flex: 1,
    lineHeight: 22,
  },
  payerName: {
    fontFamily: fonts.headlineSemiBold,
    color: colors.primary,
  },
  amount: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 16,
    color: colors.secondary,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
});
