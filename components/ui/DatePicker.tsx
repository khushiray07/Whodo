import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { colors, fonts, radii, spacing } from '../../constants/theme';

type Props = {
  label?: string;
  value: string; // YYYY-MM-DD or empty
  onChange: (date: string) => void;
  placeholder?: string;
};

export function DatePicker({ label, value, onChange, placeholder = 'Select date' }: Props) {
  const [show, setShow] = useState(false);

  const dateValue = value ? new Date(value + 'T00:00:00') : new Date();

  const handleChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selectedDate) {
      onChange(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  const displayText = value
    ? format(new Date(value + 'T00:00:00'), 'MMM d, yyyy')
    : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={() => setShow(true)} style={styles.button}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          📅  {displayText}
        </Text>
      </TouchableOpacity>
      {show && (
        <View>
          <DateTimePicker
            value={dateValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleChange}
            minimumDate={new Date()}
            accentColor={colors.primary}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity onPress={() => setShow(false)} style={styles.doneBtn}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
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
  label: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  button: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.default,
    padding: spacing.md,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  text: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.onSurface,
  },
  placeholder: {
    color: colors.outlineVariant,
  },
  doneBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  doneText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.primary,
  },
});
