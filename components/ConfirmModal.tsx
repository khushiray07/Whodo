import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { onConfirm, type ConfirmEvent } from '../lib/overlay-events';
import { colors, fonts, radii, spacing } from '../constants/theme';

export function ConfirmModal() {
  const [event, setEvent] = useState<ConfirmEvent | null>(null);

  useEffect(() => {
    return onConfirm((e) => setEvent(e));
  }, []);

  if (!event) return null;

  const handleConfirm = () => {
    event.onConfirm();
    setEvent(null);
  };

  const handleCancel = () => {
    setEvent(null);
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={handleCancel}>
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.message}>{event.message}</Text>
          <View style={styles.buttons}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>{event.cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={({ pressed }) => [styles.button, styles.confirmButton, pressed && styles.pressed]}
            >
              <Text style={styles.confirmText}>{event.confirmText}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 20,
    color: colors.onSurface,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.default,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceContainer,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.onSurfaceVariant,
  },
  confirmText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
});
