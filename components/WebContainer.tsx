import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

/**
 * Constrains content to a mobile-like width on web.
 * On native, renders children as-is with no wrapper.
 */
export function WebContainer({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
});
