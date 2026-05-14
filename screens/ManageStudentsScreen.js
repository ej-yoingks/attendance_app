import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../services/firebaseConfig';
import { useTheme } from '../context/ThemeContext';

export default function ManageStudentsScreen({ route }) {
  const { classId, className } = route.params;
  const { colors } = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [name, setName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [])
  );

  async function loadStudents() {
    try {
      const snapshot = await db
        .collection('students')
        .where('classId', '==', classId)
        .where('teacherId', '==', auth.currentUser?.uid)
        .get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditItem(null);
    setName('');
    setModalVisible(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setName(item.name);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Student name is required');
      return;
    }
    try {
      if (editItem) {
        await db.collection('students').doc(editItem.id).update({
          name: name.trim(),
        });
      } else {
        await db.collection('students').add({
          name: name.trim(),
          classId,
          teacherId: auth.currentUser.uid,
        });
      }
      setModalVisible(false);
      loadStudents();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleDelete(item) {
    Alert.alert('Delete Student', 'Delete "' + item.name + '"?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.collection('students').doc(item.id).delete();
            loadStudents();
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{className} — Students</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.subtext }]}>
            No students yet. Tap "+ Add".
          </Text>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editItem ? 'Edit Student' : 'Add Student'}
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Student name"
              placeholderTextColor={colors.subtext}
              value={name}
              onChangeText={setName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelText, { color: colors.subtext }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800', flex: 1 },
  addBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginLeft: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  name: { fontSize: 16, fontWeight: '600', flex: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  editText: { color: '#2196f3', fontWeight: '600' },
  deleteText: { color: '#f44336', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 15 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelText: { fontSize: 15, fontWeight: '600' },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
