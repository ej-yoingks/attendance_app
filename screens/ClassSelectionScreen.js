import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../services/firebaseConfig';
import { useTheme } from '../context/ThemeContext';

export default function ClassSelectionScreen({ navigation }) {
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
            setClasses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
      <Text style={[styles.heading, { color: colors.text }]}>Select a Class</Text>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Attendance', { classId: item.id, className: item.name })}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.iconText, { color: colors.primary }]}>
                {item.name?.charAt(0) || 'C'}
              </Text>
            </View>
            <View style={styles.textArea}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
              {item.section ? (
                <Text style={[styles.cardSub, { color: colors.subtext }]}>{item.section}</Text>
              ) : null}
            </View>
            <Text style={[styles.arrow, { color: colors.subtext }]}>→</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Classes</Text>
            <Text style={[styles.emptySub, { color: colors.subtext }]}>
              Create a class in Manage first
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
  heading: { fontSize: 26, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, letterSpacing: -0.5 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginVertical: 5,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: { fontSize: 22, fontWeight: '800' },
  textArea: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardSub: { fontSize: 13, marginTop: 3 },
  arrow: { fontSize: 20, fontWeight: '300' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 14 },
});
