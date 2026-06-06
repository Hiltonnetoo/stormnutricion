// --- Appointment (Calendar) ---
export type AppointmentType =
  | "consultation"
  | "followup"
  | "assessment"
  | "other";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  dateTime: string; // ISO string
  durationMinutes: number;
  type: AppointmentType;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}
