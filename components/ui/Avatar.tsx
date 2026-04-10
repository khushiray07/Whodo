import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getInitials } from '../../lib/colors';
import { fonts, radii } from '../../constants/theme';

type Props = {
  name: string;
  color: string;
  size?: number;
};

export function Avatar({ name, color, size = 40 }: Props) {
  const initials = getInitials(name);
  const fontSize = size * 0.38;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '20',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize, color }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.headlineExtra,
  },
});
