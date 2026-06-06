import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  getDoc,
  type FirestoreError,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebaseCore";
import type { Patient } from "../types";

// Helper for error handling
const handleSnapshotError = (error: FirestoreError, context: string) => {
  if (error.code === "permission-denied") {
    console.warn(
      `[Firebase] Permission denied for ${context}. Check your Firestore Security Rules.`,
    );
  } else {
    console.error(`[Firebase] Error in ${context}:`, error);
  }
};

const getPatientsCollection = (userId: string) =>
  collection(db, "users", userId, "patients");
const getPatientDoc = (userId: string, patientId: string) =>
  doc(db, "users", userId, "patients", patientId);
const getDietsCollection = (userId: string) =>
  collection(db, "users", userId, "diets");

export const addPatient = (
  userId: string,
  patientData: Omit<Patient, "id">,
) => {
  return addDoc(getPatientsCollection(userId), patientData);
};

export const updatePatient = (
  userId: string,
  patientId: string,
  patientData: Partial<Patient>,
) => {
  return updateDoc(getPatientDoc(userId, patientId), patientData);
};

export const getPatientById = async (userId: string, patientId: string) => {
  const snap = await getDoc(getPatientDoc(userId, patientId));
  return snap.exists() ? { ...snap.data(), id: snap.id } : null;
};

export const deletePatient = async (userId: string, patientId: string) => {
  const dietsRef = getDietsCollection(userId);
  const q = query(dietsRef, where("patientId", "==", patientId));
  const dietsSnapshot = await getDocs(q);
  const dietDocs = dietsSnapshot.docs;

  const batch = writeBatch(db);
  dietDocs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(getPatientDoc(userId, patientId));

  return batch.commit();
};

export const getPatients = (
  userId: string,
  callback: (patients: Patient[]) => void,
  onError?: (error: FirestoreError) => void,
) => {
  if (!userId) return () => {};
  const q = query(getPatientsCollection(userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const patients = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt;
        return { ...data, id: doc.id, createdAt } as Patient;
      });
      patients.sort((a, b) => a.firstName.localeCompare(b.firstName));
      callback(patients);
    },
    (error) => {
      handleSnapshotError(error, "getPatients");
      if (onError) onError(error);
    },
  );
};

const getCountClientSide = (
  q: Query<DocumentData>,
  filterFn: (docData: DocumentData) => boolean,
  callback: (count: number) => void,
  contextName: string,
) => {
  return onSnapshot(
    q,
    (snapshot) => {
      let count = 0;
      snapshot.docs.forEach((doc) => {
        if (filterFn(doc.data())) {
          count++;
        }
      });
      callback(count);
    },
    (error) => {
      handleSnapshotError(error, contextName);
    },
  );
};

export const getPatientsCount = (
  userId: string,
  callback: (count: number) => void,
) => {
  if (!userId) return () => {};
  return getCountClientSide(
    query(getPatientsCollection(userId)),
    () => true,
    callback,
    "getPatientsCount",
  );
};

export const getActivePatientsCount = (
  userId: string,
  callback: (count: number) => void,
) => {
  if (!userId) return () => {};
  return getCountClientSide(
    query(getPatientsCollection(userId)),
    (data) => data.status === "Active",
    callback,
    "getActivePatientsCount",
  );
};

export const getNewPatientsThisMonthCount = (
  userId: string,
  callback: (count: number) => void,
) => {
  if (!userId) return () => {};
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const isoStart = startOfMonth.toISOString();

  return getCountClientSide(
    query(getPatientsCollection(userId)),
    (data) => {
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;
      return createdAt >= isoStart;
    },
    callback,
    "getNewPatientsThisMonthCount",
  );
};
