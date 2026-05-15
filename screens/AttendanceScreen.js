import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getStudents, saveAttendance } from '../utils/attendanceUtils';
import StudentCard from '../components/StudentCard';
import { useTheme } from '../context/ThemeContext';

export default function AttendanceScreen({ route, navigation }) {
  const { classId, className } = route.params;
  const { colors } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const data = await getStudents(classId);
      setStudents(data.map((s) => ({ ...s, status: 'Present' })));
    } catch (err) {
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  function toggleStatus(studentId) {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: s.status === 'Present' ? 'Absent' : 'Present' }
          : s
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveAttendance(classId, students, date);
      Alert.alert('Saved', 'Attendance recorded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  }

  function onDateChange(event, selectedDate) {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const presentCount = students.filter((s) => s.status === 'Present').length;
  const absentCount = students.length - presentCount;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View style={[styles.classBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.classBadgeText, { color: colors.primary }]}>{className}</Text>
        </View>
        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: colors.presentBg }]}>
            <Text style={[styles.statValue, { color: colors.present }]}>{presentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.present }]}>Present</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.absentBg }]}>
            <Text style={[styles.statValue, { color: colors.absent }]}>{absentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.absent }]}>Absent</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.dateBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.dateIcon]}>📅</Text>
        <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(date)}</Text>
        <Text style={[styles.dateCaret, { color: colors.subtext }]}>▼</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      <Text style={[styles.hint, { color: colors.subtext }]}>
        Tap a student to toggle status
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <StudentCard student={item} onToggle={toggleStatus} colors={colors} />
        )}
      />

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Attendance</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  classBadge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  classBadgeText: { fontSize: 14, fontWeight: '800' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateIcon: { fontSize: 18, marginRight: 10 },
  dateText: { flex: 1, fontSize: 15, fontWeight: '600' },
  dateCaret: { fontSize: 10, fontWeight: '700' },
  hint: { fontSize: 12, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  footer: {
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  saveButton: { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
