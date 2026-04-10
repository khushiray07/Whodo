import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { onToast, type ToastEvent } from '../lib/overlay-events';
import { colors, fonts, radii, spacing } from '../constants/theme';

const DISMISS_MS = 3500;
const MAX_VISIBLE = 3;

const ACCENT_COLORS: Record<ToastEvent['type'], string> = {
  info: colors.primary,
  error: colors.error,
  success: colors.secondary,
};

export function Toast() {
  const [toasts, setToasts] = useState<(ToastEvent & { exiting?: boolean })[]>([]);

  useEffect(() => {
    return onToast((event) => {
      setToasts((prev) => {
        const next = [...prev, event];
        return next.slice(-MAX_VISIBLE);
      });

      setTimeout(() => {
        setToasts((prev) => prev.map((t) => t.id === event.id ? { ...t, exiting: true } : t));
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== event.id));
        }, 300);
      }, DISMISS_MS);
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Pressable
          key={toast.id}
          onPress={() => dismiss(toast.id)}
          style={[
            styles.toast,
            { borderLeftColor: ACCENT_COLORS[toast.type] },
            toast.exiting && styles.toastExiting,
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
            {toast.message && (
              <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
            )}
          </View>
          <Text style={styles.dismiss}>×</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    width: '90%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: radii.default,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  toastExiting: {
    opacity: 0.3,
    transform: [{ translateY: -20 }],
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  dismiss: {
    fontSize: 20,
    color: colors.outline,
    paddingLeft: 12,
    marginTop: -2,
  },
});
