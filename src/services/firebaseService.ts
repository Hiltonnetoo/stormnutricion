// Re-export core instances and common auth methods
export {
  auth,
  db,
  storage,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  updateProfile,
  createUserWithEmailAndPassword,
} from "./firebaseCore";
export type { User } from "./firebaseCore";

// Import and re-export auth domain services
export {
  firebaseSignOut,
  uploadProfilePicture,
  updateUserProfile,
  getPatientPortalProfile,
  createPatientPortalProfile,
  updatePatientPortalRef,
  createPatientAccount,
  setupPatientPortalAccess,
  sendPortalPasswordReset,
} from "./authService";

// Import and re-export patient domain services
export {
  addPatient,
  updatePatient,
  getPatientById,
  deletePatient,
  getPatients,
  getPatientsCount,
  getActivePatientsCount,
  getNewPatientsThisMonthCount,
} from "./patientService";

// Import and re-export diet domain services
export {
  saveDietPlan,
  updateDietPlan,
  deleteDietPlan,
  getDietPlansForPatient,
  getAllDiets,
  getDietsCount,
  getDietsThisMonthCount,
  getPatientDiets,
} from "./dietService";

// Import and re-export appointment domain services
export {
  addAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointments,
  getPatientAppointments,
} from "./appointmentService";

// Import and re-export evaluation/tracking domain services
export {
  logPatientWeight,
  requestSelfEvaluation,
  completeSelfEvaluation,
  logAdherence,
  updatePatientSettings,
} from "./evaluationService";

// Deprecated alias for patient portal compatibility
import { getPatientDiets } from "./dietService";
/** @deprecated use getPatientDiets + getPatientAppointments separately in PatientPortal */
export const getPatientPortalData = getPatientDiets;
