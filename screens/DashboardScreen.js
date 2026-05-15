import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../services/firebaseConfig';
import { useTheme } from '../context/ThemeContext';

const quickActions = [
  { key: 'attendance', label: 'Take\nAttendance', icon: '📋', nav: 'ClassSelection' },
  { key: 'history', label: 'View\nHistory', icon: '📊', nav: 'HistoryTab' },
  { key: 'manage', label: 'Manage\nClasses', icon: '⚙️', nav: 'ManageTab' },
];

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Good Day!</Text>
          <Text style={[styles.subtitle, { color: colors.subtext }]}>
            {classes.length} class{classes.length !== 1 ? 'es' : ''} ready
          </Text>
        </View>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {(auth.currentUser?.email?.[0] || 'T').toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Quick Actions</Text>

      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate(action.nav)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Your Classes</Text>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.classCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Attendance', { classId: item.id, className: item.name })}
          >
            <View style={[styles.classIcon, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.classIconText, { color: colors.primary }]}>
                {item.name?.charAt(0) || 'C'}
              </Text>
            </View>
            <View style={styles.classInfo}>
              <Text style={[styles.className, { color: colors.text }]}>{item.name}</Text>
              {item.section ? (
                <Text style={[styles.classSection, { color: colors.subtext }]}>{item.section}</Text>
              ) : null}
            </View>
            <View style={[styles.arrowCircle, { backgroundColor: colors.border }]}>
              <Text style={[styles.arrow, { color: colors.subtext }]}>→</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Classes Yet</Text>
            <Text style={[styles.emptySub, { color: colors.subtext }]}>
              Create one in the Manage tab
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  greeting: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 2 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginVertical: 5,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  classIconText: { fontSize: 20, fontWeight: '800' },
  classInfo: { flex: 1 },
  className: { fontSize: 16, fontWeight: '700' },
  classSection: { fontSize: 13, marginTop: 2 },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: { fontSize: 16, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 14 },
});
