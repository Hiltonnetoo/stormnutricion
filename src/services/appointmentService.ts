import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  type FirestoreError,
} from "firebase/firestore";
import { db } from "./firebaseCore";
import type { Appointment } from "../types";

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

const getAppointmentsCollection = (userId: string) =>
  collection(db, "users", userId, "appointments");
const getAppointmentDoc = (userId: string, apptId: string) =>
  doc(db, "users", userId, "appointments", apptId);

export const addAppointment = (userId: string, data: Omit<Appointment, "id">) =>
  addDoc(getAppointmentsCollection(userId), data);

export const updateAppointment = (
  userId: string,
  apptId: string,
  data: Partial<Appointment>,
) => updateDoc(getAppointmentDoc(userId, apptId), data);

export const deleteAppointment = (userId: string, apptId: string) =>
  deleteDoc(getAppointmentDoc(userId, apptId));

export const getAppointments = (
  userId: string,
  callback: (appts: Appointment[]) => void,
  onError?: (e: FirestoreError) => void,
) => {
  if (!userId) return () => {};
  return onSnapshot(
    getAppointmentsCollection(userId),
    (snap) => {
      const appts = snap.docs.map(
        (d) => ({ ...d.data(), id: d.id }) as Appointment,
      );
      appts.sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
      callback(appts);
    },
    (err) => {
      handleSnapshotError(err, "getAppointments");
      if (onError) onError(err);
    },
  );
};

export const getPatientAppointments = (
  nutritionistId: string,
  patientId: string,
  callback: (appts: Appointment[]) => void,
  onError?: (e: FirestoreError) => void,
) => {
  const q = query(
    collection(db, "users", nutritionistId, "appointments"),
    where("patientId", "==", patientId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const appts = snap.docs.map(
        (d) => ({ ...d.data(), id: d.id }) as Appointment,
      );
      appts.sort(
        (a, b) =>
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
      );
      callback(appts);
    },
    (err) => {
      handleSnapshotError(err, "getPatientAppointments");
      if (onError) onError(err);
    },
  );
};
