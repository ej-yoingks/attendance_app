import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function StudentCard({ student, onToggle, colors }) {
  const isPresent = student.status === 'Present';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.name, { color: colors.text }]}>{student.name}</Text>
      <TouchableOpacity
        style={[styles.button, isPresent ? styles.present : styles.absent]}
        onPress={() => onToggle(student.id)}
      >
        <Text style={styles.buttonText}>{isPresent ? 'Present' : 'Absent'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '600' },
  button: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  present: { backgroundColor: '#4caf50' },
  absent: { backgroundColor: '#f44336' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
