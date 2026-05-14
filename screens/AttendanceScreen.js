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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>{className}</Text>

      <TouchableOpacity
        style={[styles.dateBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setShowPicker(true)}
      >
        <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(date)}</Text>
        <Text style={[styles.dateIcon, { color: colors.subtext }]}>📅</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      <Text style={[styles.subheading, { color: colors.subtext }]}>
        Tap a student to toggle Present/Absent
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <StudentCard student={item} onToggle={toggleStatus} colors={colors} />
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.disabled]}
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
  heading: { fontSize: 24, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20 },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: { fontSize: 15, fontWeight: '600' },
  dateIcon: { fontSize: 18 },
  subheading: { fontSize: 13, paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 16 },
  footer: { padding: 20, paddingBottom: 32 },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  disabled: { opacity: 0.7 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
