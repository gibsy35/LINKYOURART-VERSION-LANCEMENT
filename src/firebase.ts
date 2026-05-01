import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLlunWx3_XXs_DV88IKK70MFXz6JLUdp8",
  authDomain: "linkyourart-cb221.firebaseapp.com",
  projectId: "linkyourart-cb221",
  storageBucket: "linkyourart-cb221.firebasestorage.app",
  messagingSenderId: "906462520843",
  appId: "1:906462520843:web:e20b0fb1eaa0ed1753490e",
  measurementId: "G-54TC7C3Y7Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
