import { deleteApp, initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage, updateProfile } from "./firebaseCore";
import type { User } from "./firebaseCore";
import type { PatientPortalProfile } from "../types";
import { firebaseConfig } from "./firebase.config";

export const sendPortalPasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const firebaseSignOut = (authInstance: typeof auth) => {
  return signOut(authInstance);
};

export const uploadProfilePicture = async (
  uid: string,
  file: File,
): Promise<string> => {
  const storageRef = ref(storage, `profilePictures/${uid}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const updateUserProfile = (
  user: User,
  profile: { displayName?: string; photoURL?: string },
) => {
  return updateProfile(user, profile);
};

export const getPatientPortalProfile = async (
  uid: string,
): Promise<PatientPortalProfile | null> => {
  const snap = await getDoc(doc(db, "patientProfiles", uid));
  return snap.exists() ? (snap.data() as PatientPortalProfile) : null;
};

export const createPatientPortalProfile = (
  uid: string,
  profile: Omit<PatientPortalProfile, "uid">,
) => setDoc(doc(db, "patientProfiles", uid), { ...profile, uid });

export const updatePatientPortalRef = (
  userId: string,
  patientId: string,
  portalUid: string,
) => updateDoc(doc(db, "users", userId, "patients", patientId), { portalUid });

export const setupPatientPortalAccess = async (
  email: string,
  passwordText: string,
  patientId: string,
  nutritionistId: string,
  nutritionistName: string,
  nutritionistEmail: string,
): Promise<string> => {
  const secondaryApp = initializeApp(
    firebaseConfig,
    "patientCreation_" + Date.now(),
  );
  const secondaryAuth = getAuth(secondaryApp);
  let createdUser: User | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      passwordText,
    );
    createdUser = cred.user;

    // 1. Create patient portal profile in Firestore
    await setDoc(doc(db, "patientProfiles", createdUser.uid), {
      patientId,
      nutritionistId,
      nutritionistName,
      nutritionistEmail,
      role: "patient",
      createdAt: new Date().toISOString(),
    });

    // 2. Update patient reference with portalUid
    await updateDoc(doc(db, "users", nutritionistId, "patients", patientId), {
      portalUid: createdUser.uid,
    });

    return createdUser.uid;
  } catch (error) {
    if (createdUser) {
      try {
        await deleteUser(createdUser);
      } catch (deleteErr) {
        console.error("Erro ao deletar usuário no rollback:", deleteErr);
      }
    }
    throw error;
  } finally {
    await deleteApp(secondaryApp);
  }
};

/** @deprecated use setupPatientPortalAccess */
export const createPatientAccount = async (
  email: string,
  password: string,
): Promise<string> => {
  const secondaryApp = initializeApp(
    firebaseConfig,
    "patientCreation_" + Date.now(),
  );
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    return cred.user.uid;
  } finally {
    await deleteApp(secondaryApp);
  }
};
