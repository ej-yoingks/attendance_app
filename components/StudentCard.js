import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function StudentCard({ student, onToggle, colors }) {
  const isPresent = student.status === 'Present';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: isPresent ? colors.presentBg : colors.absentBg }]}>
        <Text style={[styles.avatarText, { color: isPresent ? colors.present : colors.absent }]}>
          {student.name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{student.name}</Text>
      <TouchableOpacity
        style={[
          styles.badge,
          { backgroundColor: isPresent ? colors.present : colors.absent },
        ]}
        onPress={() => onToggle(student.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.badgeText}>
          {isPresent ? 'Present' : 'Absent'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '800' },
  name: { flex: 1, fontSize: 16, fontWeight: '600' },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.3 },
});
