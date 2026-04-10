import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, radii } from '../constants/theme';
import type { TemplateConfig } from '../lib/templates';

type Props = {
  template: TemplateConfig;
  selected?: boolean;
  onPress: () => void;
};

const iconMap: Record<string, string> = {
  cake: '🎂',
  flight_takeoff: '✈️',
  cleaning_services: '🧹',
  code: '💻',
  restaurant: '🍽️',
  add: '➕',
  celebration: '🎉',
};

export function TemplateCard({ template, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        selected && styles.selected,
      ]}
    >
      <View style={[
        styles.iconCircle,
        { backgroundColor: selected ? colors.primary + '1A' : colors.surfaceContainerLow },
      ]}>
        <Text style={styles.iconText}>{iconMap[template.icon] ?? '📋'}</Text>
      </View>
      <Text style={styles.label}>{template.label}</Text>
      <Text style={styles.description}>{template.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.default,
    padding: 20,
    minHeight: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 20,
  },
  label: {
    fontFamily: fonts.headlineExtra,
    fontSize: 14,
    color: colors.onSurface,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
});
