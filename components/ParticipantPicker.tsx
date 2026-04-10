import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar } from './ui/Avatar';
import { colors, fonts, radii } from '../constants/theme';
import type { Participant } from '../types/database';

type Props = {
  participants: Participant[];
  selectedId?: string | null;
  onSelect: (participant: Participant) => void;
};

export function ParticipantPicker({ participants, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {participants.map((p) => {
        const isSelected = p.id === selectedId;
        return (
          <TouchableOpacity
            key={p.id}
            onPress={() => onSelect(p)}
            activeOpacity={0.8}
            style={styles.item}
          >
            <View style={[styles.avatarWrap, isSelected && styles.avatarSelected]}>
              <Avatar name={p.name} color={p.color} size={64} />
            </View>
            <Text style={[styles.name, isSelected && styles.nameSelected]}>
              {p.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 8,
    gap: 16,
  },
  item: {
    alignItems: 'center',
    gap: 6,
  },
  avatarWrap: {
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 999,
    padding: 2,
  },
  avatarSelected: {
    borderColor: colors.primary,
  },
  name: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  nameSelected: {
    fontFamily: fonts.headlineSemiBold,
    color: colors.primary,
  },
});
