import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase.config";

const app: FirebaseApp = initializeApp(firebaseConfig);
console.log("🔥 Firebase conectado ao projeto:", firebaseConfig.projectId);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  db,
  storage,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  updateProfile,
  createUserWithEmailAndPassword,
};
export type { User };
