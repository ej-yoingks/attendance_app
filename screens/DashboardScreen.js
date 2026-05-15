import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../services/firebaseConfig';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const unsub = db
        .collection('classes')
        .where('teacherId', '==', auth.currentUser?.uid)
        .onSnapshot(
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setClasses(data);
            setLoading(false);
          },
          (err) => {
            console.error(err);
            setLoading(false);
          }
        );
      return () => unsub();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const teacherName = auth.currentUser?.email?.split('@')[0] || 'Teacher';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>
          Good Day!
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {classes.length} class{classes.length !== 1 ? 'es' : ''} available
        </Text>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('ClassSelection')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Take Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('HistoryTab')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={[styles.actionLabel, { color: colors.text }]}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('ManageTab')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Manage</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Classes</Text>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.classCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Attendance', { classId: item.id, className: item.name })}
          >
            <View>
              <Text style={[styles.className, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.classSection, { color: colors.subtext }]}>{item.section || ''}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.subtext }]}>
            No classes yet. Create one in Manage.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  greeting: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  className: { fontSize: 16, fontWeight: '600' },
  classSection: { fontSize: 13, marginTop: 2 },
  arrow: { fontSize: 18, color: '#999' },
  empty: { textAlign: 'center', marginTop: 20, fontSize: 15 },
});
