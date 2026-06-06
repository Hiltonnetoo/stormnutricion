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
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebaseCore";
import type { DietPlan, AnyDietPlan } from "../types";

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

const getDietsCollection = (userId: string) =>
  collection(db, "users", userId, "diets");
const getDietDoc = (userId: string, dietId: string) =>
  doc(db, "users", userId, "diets", dietId);

export const saveDietPlan = (userId: string, dietPlan: DietPlan) => {
  return addDoc(getDietsCollection(userId), dietPlan);
};

export const updateDietPlan = (
  userId: string,
  dietId: string,
  dietPlan: Partial<DietPlan>,
) => {
  return updateDoc(getDietDoc(userId, dietId), dietPlan);
};

export const deleteDietPlan = (userId: string, dietId: string) => {
  return deleteDoc(getDietDoc(userId, dietId));
};

export const getDietPlansForPatient = (
  userId: string,
  patientId: string,
  callback: (diets: AnyDietPlan[]) => void,
  onError?: (error: FirestoreError) => void,
) => {
  if (!userId) return () => {};
  const q = query(
    getDietsCollection(userId),
    where("patientId", "==", patientId),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt;
        return { ...data, id: doc.id, createdAt } as AnyDietPlan;
      });
      diets.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      callback(diets);
    },
    (error) => {
      handleSnapshotError(error, "getDietPlansForPatient");
      if (onError) onError(error);
    },
  );
};

export const getAllDiets = (
  userId: string,
  callback: (diets: AnyDietPlan[]) => void,
  onError?: (error: FirestoreError) => void,
) => {
  if (!userId) return () => {};
  const q = query(getDietsCollection(userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const diets = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt;
        return { ...data, id: doc.id, createdAt } as AnyDietPlan;
      });
      diets.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      callback(diets);
    },
    (error) => {
      handleSnapshotError(error, "getAllDiets");
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

export const getDietsCount = (
  userId: string,
  callback: (count: number) => void,
) => {
  if (!userId) return () => {};
  return getCountClientSide(
    query(getDietsCollection(userId)),
    () => true,
    callback,
    "getDietsCount",
  );
};

export const getDietsThisMonthCount = (
  userId: string,
  callback: (count: number) => void,
) => {
  if (!userId) return () => {};
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const isoStart = startOfMonth.toISOString();

  return getCountClientSide(
    query(getDietsCollection(userId)),
    (data) => {
      const createdAt = data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : data.createdAt;
      return createdAt >= isoStart;
    },
    callback,
    "getDietsThisMonthCount",
  );
};

export const getPatientDiets = (
  nutritionistId: string,
  patientId: string,
  callback: (diets: AnyDietPlan[]) => void,
  onError?: (e: FirestoreError) => void,
) => {
  const q = query(
    collection(db, "users", nutritionistId, "diets"),
    where("patientId", "==", patientId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const diets = snap.docs
        .map((d) => {
          const data = d.data();
          const createdAt = data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;
          return { ...data, id: d.id, createdAt } as AnyDietPlan;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      callback(diets);
    },
    (err) => {
      handleSnapshotError(err, "getPatientDiets");
      if (onError) onError(err);
    },
  );
};
