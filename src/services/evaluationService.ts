import { doc, getDoc, updateDoc, DocumentData } from "firebase/firestore";
import { db } from "./firebaseCore";
import type { Patient, WeightRecord, SelfEvaluation } from "../types";

export const logPatientWeight = async (
  nutritionistId: string,
  patientId: string,
  weight: number,
  origin: WeightRecord["origin"] = "self_reported",
) => {
  const patientRef = doc(db, "users", nutritionistId, "patients", patientId);
  const snap = await getDoc(patientRef);
  if (!snap.exists()) return;

  const data = snap.data() as Patient;
  const history = data.weightHistory || [];
  const newRecord = {
    date: new Date().toISOString(),
    weight,
    origin,
  };

  return updateDoc(patientRef, {
    weight: weight,
    weightHistory: [...history, newRecord],
  });
};

export const requestSelfEvaluation = async (
  nutritionistId: string,
  patientId: string,
) => {
  const patientRef = doc(db, "users", nutritionistId, "patients", patientId);
  const protocolId = `eval_${Date.now()}`;
  const newProtocol = {
    id: protocolId,
    requestDate: new Date().toISOString(),
    status: "pending",
  };

  const snap = await getDoc(patientRef);
  const data = snap.data() as Patient;
  const evaluations = data.selfEvaluations || [];

  return updateDoc(patientRef, {
    activeProtocolId: protocolId,
    selfEvaluations: [...evaluations, newProtocol],
  });
};

export const completeSelfEvaluation = async (
  nutritionistId: string,
  patientId: string,
  protocolId: string,
  evaluationData: Partial<SelfEvaluation>,
) => {
  const patientRef = doc(db, "users", nutritionistId, "patients", patientId);
  const snap = await getDoc(patientRef);
  if (!snap.exists()) return;

  const data = snap.data() as Patient;
  const evaluations = (data.selfEvaluations || []).map((ev) => {
    if (ev.id === protocolId) {
      return {
        ...ev,
        ...evaluationData,
        status: "completed",
        completionDate: new Date().toISOString(),
      };
    }
    return ev;
  });

  // Also update current weight if provided
  const updates: DocumentData = {
    activeProtocolId: null, // Clear the active trigger
    selfEvaluations: evaluations,
  };

  if (evaluationData.measurements?.weight) {
    updates.weight = evaluationData.measurements.weight;
    const history = data.weightHistory || [];
    updates.weightHistory = [
      ...history,
      {
        date: new Date().toISOString(),
        weight: evaluationData.measurements.weight,
        origin: "remote_guided",
      },
    ];
  }

  return updateDoc(patientRef, updates);
};

export const logAdherence = async (
  nutritionistId: string,
  patientId: string,
  followed: boolean,
) => {
  const patientRef = doc(db, "users", nutritionistId, "patients", patientId);
  const today = new Date().toISOString().split("T")[0];

  const snap = await getDoc(patientRef);
  const data = snap.data() as Patient;
  const log = data.adherenceLog || [];

  // Check if already logged today
  const filteredLog = log.filter((entry) => entry.date !== today);

  return updateDoc(patientRef, {
    adherenceLog: [...filteredLog, { date: today, followed }],
  });
};

export const updatePatientSettings = async (
  nutritionistId: string,
  patientId: string,
  settings: Partial<Patient["automationSettings"]>,
) => {
  const patientRef = doc(db, "users", nutritionistId, "patients", patientId);
  const snap = await getDoc(patientRef);
  const data = snap.data() as Patient;

  return updateDoc(patientRef, {
    automationSettings: {
      ...data.automationSettings,
      ...settings,
    },
  });
};
