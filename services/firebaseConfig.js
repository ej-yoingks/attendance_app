import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyBgoqv5HV88z7dBCgt4xVATw3ewDfJMU3U",

  authDomain: "attendance-ap-5d6de.firebaseapp.com",

  projectId: "attendance-ap-5d6de",

  storageBucket: "attendance-ap-5d6de.firebasestorage.app",

  messagingSenderId: "917066183072",

  appId: "1:917066183072:web:cb610e90be7b0e5e2bb4c5"

};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };
