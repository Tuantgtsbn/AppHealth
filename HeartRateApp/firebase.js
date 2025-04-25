import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDKOZEVJZveUw1biL_qGfbDefqfIQdOEg0",
  authDomain: "heart-rate-backend.firebaseapp.com",
  projectId: "heart-rate-backend",
  storageBucket: "heart-rate-backend.firebasestorage.app",
  messagingSenderId: "374695925057",
  appId: "1:374695925057:web:68ee174f27662a0708fdc0",
  measurementId: "G-3S4X2MKM05"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
