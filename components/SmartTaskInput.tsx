import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { parseTaskInput, ParsedTask } from '../lib/smart-parse';
import { showAlert } from '../lib/alert';
import { colors, fonts, radii } from '../constants/theme';
import type { Participant } from '../types/database';

type Props = {
  participants: Participant[];
  onSubmit: (parsed: ParsedTask) => Promise<void>;
};

export function SmartTaskInput({ participants, onSubmit }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    return parseTaskInput(text, participants);
  }, [text, participants]);

  const handleSubmit = async () => {
    if (!parsed || !parsed.title) return;
    setLoading(true);
    try {
      await onSubmit(parsed);
      setText('');
    } catch (e: any) {
      showAlert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a task... e.g. 'Buy cake assign to Ankur ₹500'"
          placeholderTextColor={colors.outlineVariant}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          multiline={false}
        />
        {text.trim() ? (
          <TouchableOpacity onPress={handleSubmit} style={styles.sendBtn} disabled={loading}>
            <Text style={styles.sendText}>{loading ? '...' : '→'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Smart Preview */}
      {parsed && text.trim().length > 2 && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Smart Preview</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewIcon}>📝</Text>
            <Text style={styles.previewTitle}>{parsed.title}</Text>
          </View>
          {parsed.assigneeName && (
            <View style={styles.previewRow}>
              <Text style={styles.previewIcon}>👤</Text>
              <Text style={styles.previewDetail}>Assign to {parsed.assigneeName}</Text>
            </View>
          )}
          {parsed.amount != null && (
            <View style={styles.previewRow}>
              <Text style={styles.previewIcon}>💰</Text>
              <Text style={styles.previewDetail}>₹{parsed.amount}</Text>
            </View>
          )}
          {parsed.deadline && (
            <View style={styles.previewRow}>
              <Text style={styles.previewIcon}>📅</Text>
              <Text style={styles.previewDetail}>{parsed.deadline}</Text>
            </View>
          )}
          {!parsed.assigneeName && !parsed.amount && (
            <Text style={styles.hint}>Tip: Include a name to auto-assign, or ₹ amount to track expense</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: colors.primary + '1A',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
    paddingVertical: 12,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  preview: {
    backgroundColor: colors.primary + '08',
    borderRadius: radii.default,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '15',
    gap: 6,
  },
  previewLabel: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewIcon: {
    fontSize: 14,
  },
  previewTitle: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.onSurface,
  },
  previewDetail: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.outline,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
