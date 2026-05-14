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
    return date.toLocaleDateString();
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

      <FlatList
        horizontal
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.classList}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.classChip,
              { backgroundColor: colors.surface, borderColor: colors.border },
              selectedClass === item.id && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setSelectedClass(item.id)}
          >
            <Text
              style={[
                styles.classChipText,
                { color: colors.text },
                selectedClass === item.id && { color: '#fff' },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loadingRecords ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : selectedClass && records.length === 0 ? (
        <Text style={[styles.empty, { color: colors.subtext }]}>No attendance records found</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.record, { backgroundColor: colors.surface }]}>
              <View style={styles.recordLeft}>
                <Text style={[styles.recordName, { color: colors.text }]}>{item.studentName}</Text>
                <Text style={[styles.recordDate, { color: colors.subtext }]}>{formatDate(item.date)}</Text>
              </View>
              <View style={[styles.statusBadge, item.status === 'Present' ? styles.presentBadge : styles.absentBadge]}>
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
  heading: { fontSize: 24, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  classList: { paddingHorizontal: 20, paddingBottom: 12 },
  classChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  classChipText: { fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { textAlign: 'center', fontSize: 16, marginTop: 40 },
  record: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginVertical: 4 },
  recordLeft: { flex: 1 },
  recordName: { fontSize: 16, fontWeight: '600' },
  recordDate: { fontSize: 13, marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8 },
  presentBadge: { backgroundColor: '#e8f5e9' },
  absentBadge: { backgroundColor: '#fce4ec' },
  statusText: { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
});
