import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    FacebookAuthProvider
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBdf5pdM2VCm3IkB4ejoFlkKcQanTVQmaY',
    authDomain: 'appheartrate-b2df6.firebaseapp.com',
    projectId: 'appheartrate-b2df6',
    storageBucket: 'appheartrate-b2df6.firebasestorage.app',
    messagingSenderId: '922781130321',
    appId: '1:922781130321:web:4074729bdcd8d5f824e270'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const facebookProvider = new FacebookAuthProvider();
