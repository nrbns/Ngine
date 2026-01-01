import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { colors } from '../../design-system';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
