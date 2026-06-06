export interface EmailLog {
  id: string;
  patientName: string;
  patientEmail: string;
  dietDate: string;
  sentAt: string;
  status: "Sent" | "Failed";
}
