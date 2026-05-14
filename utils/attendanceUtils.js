import { auth, db } from '../services/firebaseConfig';

export async function saveAttendance(classId, studentRecords, date) {
  const batch = [];
  studentRecords.forEach((record) => {
    batch.push(
      db.collection('attendance').add({
        classId,
        studentId: record.id,
        studentName: record.name,
        status: record.status,
        date: date || new Date(),
        timestamp: new Date(),
        teacherId: auth.currentUser?.uid,
      })
    );
  });
  return Promise.all(batch);
}

export async function getAttendanceHistory(classId) {
  const snapshot = await db
    .collection('attendance')
    .where('classId', '==', classId)
    .orderBy('timestamp', 'desc')
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getClasses() {
  const snapshot = await db
    .collection('classes')
    .where('teacherId', '==', auth.currentUser?.uid)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getStudents(classId) {
  const snapshot = await db
    .collection('students')
    .where('classId', '==', classId)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
