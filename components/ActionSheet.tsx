import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { onActionSheet, type ActionSheetEvent } from '../lib/overlay-events';
import { colors, fonts, radii, spacing } from '../constants/theme';

export function ActionSheet() {
  const [event, setEvent] = useState<ActionSheetEvent | null>(null);

  useEffect(() => {
    return onActionSheet((e) => setEvent(e));
  }, []);

  if (!event) return null;

  const handleOption = (onPress: () => void) => {
    setEvent(null);
    onPress();
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => setEvent(null)}>
      <Pressable style={styles.backdrop} onPress={() => setEvent(null)}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{event.title}</Text>
            {event.subtitle && <Text style={styles.subtitle}>{event.subtitle}</Text>}
          </View>

          {/* Options */}
          <View style={styles.options}>
            {event.options.map((opt, i) => (
              <Pressable
                key={i}
                onPress={() => handleOption(opt.onPress)}
                style={({ pressed }) => [
                  styles.option,
                  i < event.options.length - 1 && styles.optionBorder,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={[styles.optionText, opt.destructive && styles.destructiveText]}>
                  {opt.text}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Cancel */}
          <Pressable
            onPress={() => setEvent(null)}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.optionPressed]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    gap: 8,
    marginBottom: spacing.md,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: radii.default,
    paddingVertical: 18,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.outline,
  },
  options: {
    backgroundColor: '#ffffff',
    borderRadius: radii.default,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceContainer,
  },
  optionPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  optionText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 17,
    color: colors.primary,
  },
  destructiveText: {
    color: colors.error,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderRadius: radii.default,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.headlineExtra,
    fontSize: 17,
    color: colors.onSurfaceVariant,
  },
});
