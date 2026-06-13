import type { DietMode, ClinicalTag, LabTest } from "./diet";

export interface WeightRecord {
  date: string;
  weight: number;
  fatPercentage?: number;
  muscleMassKg?: number;
  origin?: "clinical" | "remote_guided" | "self_reported";
}

export interface SelfEvaluation {
  id: string;
  requestDate: string;
  completionDate?: string;
  status: "pending" | "completed";
  measurements?: {
    weight?: number;
    waist?: number;
    hip?: number;
    neck?: number;
  };
  wellbeing?: {
    sleepQuality: number; // 1-5
    energyLevel: number; // 1-5
    satiety: number; // 1-5
    digestiveHealth: string;
  };
  notes?: string;
}

/**
 * Represents a patient registered in the system.
 */
export interface Patient {
  id?: string;
  // Step 1: Personal Data
  firstName: string;
  lastName: string;
  dob: string; // Date of Birth
  gender: "male" | "female" | "other";

  // Step 2: Contact & Address
  email: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };

  // Step 3: Professional Data
  profession: string;
  activityLevel:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";

  // Step 4: Nutritional & Clinical Data
  mode: DietMode;
  clinicalTags: ClinicalTag[];
  nutritionalGoal:
    | "weight_loss"
    | "weight_gain"
    | "maintenance"
    | "clinical_control"
    | "performance";
  consultationMode: "presencial" | "remoto";
  medications: string;
  familyHistory: string;
  mealsPerDay: number;
  hydrationLevel: "low" | "moderate" | "high";
  dietaryRestrictions: string[]; // e.g., ['diabetes', 'lactose_intolerance']
  foodAllergies: string; // free text

  // Step 5: Anthropometric Data
  weight: number; // in kg
  height: number; // in cm
  anthropometryMetadata: {
    weightOrigin:
      | "clinical"
      | "remote_guided"
      | "self_reported"
      | "not_available";
    heightOrigin:
      | "clinical"
      | "remote_guided"
      | "self_reported"
      | "not_available";
    circumferenceOrigin?:
      | "clinical"
      | "remote_guided"
      | "self_reported"
      | "not_available";
    bodyFatOrigin?:
      | "clinical"
      | "remote_guided"
      | "self_reported"
      | "not_available";
  };
  circumferenceAbdominal?: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  bloodPressure?: string;
  termsAccepted: boolean;

  // Metadata
  status: "Active" | "Inactive";
  portalUid?: string; // Firebase Auth UID of the patient (when portal access is granted)
  createdAt: string;
  avatarUrl: string;
  lastLabExams?: LabTest[];
  weightHistory?: WeightRecord[];
  activeProtocolId?: string;
  selfEvaluations?: SelfEvaluation[];
  adherenceLog?: { date: string; followed: boolean }[];
  labExamHistory?: { date: string; exams: LabTest[] }[];
  automationSettings?: {
    autoRequestAssessment: boolean;
    intervalDays: number;
    lastAutoRequestDate?: string;
  };
  dietNeedsReview?: boolean;
}

// --- Patient Portal ---
export interface PatientPortalProfile {
  uid: string;
  patientId: string;
  nutritionistId: string;
  nutritionistName: string;
  nutritionistEmail: string;
  role: "patient";
  createdAt: string;
}
