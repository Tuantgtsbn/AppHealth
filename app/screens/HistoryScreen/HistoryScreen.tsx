import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử</Text>
      <Text>Lịch sử tập của bạn tại đây</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  }
});
