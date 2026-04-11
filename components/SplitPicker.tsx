import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './ui/Avatar';
import { colors, fonts, radii, spacing } from '../constants/theme';
import type { Participant } from '../types/database';

export type SplitEntry = {
  participantId: string;
  weight: number;
};

type Props = {
  participants: Participant[];
  splits: SplitEntry[];
  onChange: (splits: SplitEntry[]) => void;
  splitAll: boolean;
  onToggleSplitAll: (val: boolean) => void;
};

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2, 3];

export function SplitPicker({ participants, splits, onChange, splitAll, onToggleSplitAll }: Props) {
  const isIncluded = (pid: string) => splits.some((s) => s.participantId === pid);
  const getWeight = (pid: string) => splits.find((s) => s.participantId === pid)?.weight ?? 1;

  const toggleParticipant = (pid: string) => {
    if (splitAll) {
      // Switching from "everyone" to custom: start with all selected, then toggle this one off
      const allSplits = participants.map((p) => ({ participantId: p.id, weight: 1 }));
      onToggleSplitAll(false);
      onChange(allSplits.filter((s) => s.participantId !== pid));
      return;
    }
    if (isIncluded(pid)) {
      onChange(splits.filter((s) => s.participantId !== pid));
    } else {
      onChange([...splits, { participantId: pid, weight: 1 }]);
    }
  };

  const setWeight = (pid: string, weight: number) => {
    onChange(splits.map((s) => (s.participantId === pid ? { ...s, weight } : s)));
  };

  return (
    <View style={styles.container}>
      {/* Toggle: Everyone vs Custom */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => { onToggleSplitAll(true); onChange([]); }}
          style={[styles.toggleBtn, splitAll && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleText, splitAll && styles.toggleTextActive]}>Everyone</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onToggleSplitAll(false);
            onChange(participants.map((p) => ({ participantId: p.id, weight: 1 })));
          }}
          style={[styles.toggleBtn, !splitAll && styles.toggleBtnActive]}
        >
          <Text style={[styles.toggleText, !splitAll && styles.toggleTextActive]}>Custom Split</Text>
        </TouchableOpacity>
      </View>

      {/* Participant list with checkboxes and weight controls */}
      {!splitAll && participants.map((p) => {
        const included = isIncluded(p.id);
        const weight = getWeight(p.id);
        return (
          <View key={p.id} style={styles.participantRow}>
            <TouchableOpacity
              onPress={() => toggleParticipant(p.id)}
              style={styles.participantLeft}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, included && styles.checkboxActive]}>
                {included && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Avatar name={p.name} color={p.color} size={36} />
              <Text style={[styles.participantName, !included && styles.participantNameDim]}>
                {p.name}
              </Text>
            </TouchableOpacity>

            {included && (
              <View style={styles.weightRow}>
                {WEIGHT_OPTIONS.map((w) => (
                  <TouchableOpacity
                    key={w}
                    onPress={() => setWeight(p.id, w)}
                    style={[styles.weightBtn, weight === w && styles.weightBtnActive]}
                  >
                    <Text style={[styles.weightText, weight === w && styles.weightTextActive]}>
                      {w}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.default,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  toggleTextActive: {
    color: colors.onPrimary,
  },
  participantRow: {
    gap: 8,
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  participantName: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  participantNameDim: {
    color: colors.outline,
  },
  weightRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 72,
  },
  weightBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceContainerLow,
  },
  weightBtnActive: {
    backgroundColor: colors.primaryContainer,
  },
  weightText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  weightTextActive: {
    color: colors.primaryDim,
    fontFamily: fonts.headlineSemiBold,
  },
});
