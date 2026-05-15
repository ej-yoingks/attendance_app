import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../services/firebaseConfig';
import { getClasses } from '../utils/attendanceUtils';
import { useTheme } from '../context/ThemeContext';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const unsubRecords = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadClasses();
    }, [])
  );

  async function loadClasses() {
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (unsubRecords.current) {
      unsubRecords.current();
    }
    if (!selectedClass) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    unsubRecords.current = db
      .collection('attendance')
      .where('classId', '==', selectedClass)
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setRecords(data);
          setLoadingRecords(false);
        },
        (err) => {
          console.error(err);
          setLoadingRecords(false);
        }
      );
    return () => {
      if (unsubRecords.current) {
        unsubRecords.current();
        unsubRecords.current = null;
      }
    };
  }, [selectedClass]);

  function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Attendance History</Text>

      <View style={styles.chipsWrapper}>
        <FlatList
          horizontal
          data={classes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.classList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = selectedClass === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.classChip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedClass(item.id)}
              >
                <View style={[styles.chipAvatar, { backgroundColor: active ? '#ffffff30' : colors.primary + '20' }]}>
                  <Text style={[styles.chipAvatarText, { color: active ? '#fff' : colors.primary }]}>
                    {item.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Text>
                </View>
                <View style={styles.chipTextWrap}>
                  <Text
                    style={[
                      styles.classChipText,
                      { color: active ? '#fff' : colors.text },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.section ? (
                    <Text
                      style={[
                        styles.chipSection,
                        { color: active ? '#ffffffaa' : colors.subtext },
                      ]}
                      numberOfLines={1}
                    >
                      {item.section}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loadingRecords ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : selectedClass && records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Records</Text>
          <Text style={[styles.emptySub, { color: colors.subtext }]}>
            Take attendance first
          </Text>
        </View>
      ) : !selectedClass ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👆</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Select a Class</Text>
          <Text style={[styles.emptySub, { color: colors.subtext }]}>
            Tap a class above to view records
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.record, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.recordAvatar, { backgroundColor: item.status === 'Present' ? colors.presentBg : colors.absentBg }]}>
                <Text style={[styles.recordAvatarText, { color: item.status === 'Present' ? colors.present : colors.absent }]}>
                  {item.studentName?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.recordInfo}>
                <Text style={[styles.recordName, { color: colors.text }]}>{item.studentName}</Text>
                <Text style={[styles.recordDate, { color: colors.subtext }]}>{formatDate(item.date)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Present' ? colors.present : colors.absent }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { fontSize: 26, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, letterSpacing: -0.5 },
  chipsWrapper: { height: 76, justifyContent: 'center' },
  classList: { paddingHorizontal: 16, paddingBottom: 14 },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginRight: 10,
    minHeight: 60,
  },
  chipAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  chipAvatarText: { fontSize: 16, fontWeight: '800' },
  chipTextWrap: {},
  classChipText: { fontSize: 15, fontWeight: '700' },
  chipSection: { fontSize: 11, marginTop: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginVertical: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  recordAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordAvatarText: { fontSize: 18, fontWeight: '800' },
  recordInfo: { flex: 1 },
  recordName: { fontSize: 16, fontWeight: '600' },
  recordDate: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 14 },
});
