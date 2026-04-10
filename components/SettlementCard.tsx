import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { colors, fonts, radii } from '../constants/theme';
import { strings } from '../constants/strings';
import type { Settlement } from '../types/database';
import { sendReminder } from '../lib/whatsapp';

type Props = {
  settlement: Settlement;
  planTitle?: string;
  planId: string;
};

export function SettlementCard({ settlement, planTitle = 'a plan', planId }: Props) {
  const handleRemind = async () => {
    await sendReminder(
      settlement.to.name,
      settlement.from.name,
      settlement.amount,
      planTitle,
      planId,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.fromCol}>
          <Avatar name={settlement.from.name} color={settlement.from.color} size={56} />
        </View>
        <View style={styles.details}>
          <Text style={styles.description}>
            <Text style={styles.name}>{settlement.from.name}</Text>
            <Text style={styles.owes}> owes </Text>
            <Text style={styles.name}>{settlement.to.name}</Text>
          </Text>
          <Text style={styles.amount}>₹{settlement.amount.toLocaleString('en-IN')}</Text>
        </View>
        <Avatar name={settlement.to.name} color={settlement.to.color} size={56} />
      </View>
      <Button
        title={strings.remindViaWhatsApp}
        variant="whatsapp"
        onPress={handleRemind}
        style={styles.whatsappButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    padding: 24,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fromCol: {
    position: 'relative',
  },
  details: {
    flex: 1,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  name: {
    fontFamily: fonts.headlineExtra,
    color: colors.onSurface,
  },
  owes: {
    fontFamily: fonts.body,
    color: colors.onSurfaceVariant,
  },
  amount: {
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.primary,
    marginTop: 4,
  },
  whatsappButton: {
    height: 48,
  },
});
