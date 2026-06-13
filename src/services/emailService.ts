import emailjs from "@emailjs/browser";
import i18n from "../i18n";

/**
 * Real sending of emails via EmailJS (client).
 *
 * Configure the three variables in .env.local (see .env.example):
 *   VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
 *
 * When not configured, `sendDietEmail` throws "EMAIL_NOT_CONFIGURED" so that
 * the UI displays a clear guidance instead of pretending it sent the email.
 *
 * Evolutionary path (production): replace EmailJS with a Firebase Cloud Function
 * + transactional provider (Resend/SendGrid), maintaining the same
 * signature `sendDietEmail` here.
 */

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as
  | string
  | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as
  | string
  | undefined;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as
  | string
  | undefined;

export const isEmailConfigured = (): boolean =>
  Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

export interface DietEmailParams {
  toEmail: string;
  toName: string;
  fromName: string;
  dietDate: string;
  portalUrl?: string;
  message?: string;
}

export const sendDietEmail = async (params: DietEmailParams): Promise<void> => {
  if (!isEmailConfigured()) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }
  await emailjs.send(
    SERVICE_ID!,
    TEMPLATE_ID!,
    {
      to_email: params.toEmail,
      to_name: params.toName,
      from_name: params.fromName,
      diet_date: params.dietDate,
      portal_url: params.portalUrl || "",
      message:
        params.message ||
        i18n.t("email.diet_message", {
          toName: params.toName,
          dietDate: params.dietDate,
        }),
    },
    { publicKey: PUBLIC_KEY! },
  );
};

export interface PortalAccessEmailParams {
  toEmail: string;
  toName: string;
  fromName: string;
  portalUrl: string;
  passwordText: string;
}

export const sendPortalAccessEmail = async (
  params: PortalAccessEmailParams,
): Promise<void> => {
  if (!isEmailConfigured()) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }
  await emailjs.send(
    SERVICE_ID!,
    TEMPLATE_ID!,
    {
      to_email: params.toEmail,
      to_name: params.toName,
      from_name: params.fromName,
      portal_url: params.portalUrl,
      message: i18n.t("email.portal_message", {
        toName: params.toName,
        fromName: params.fromName,
        toEmail: params.toEmail,
        passwordText: params.passwordText,
        portalUrl: params.portalUrl,
      }),
    },
    { publicKey: PUBLIC_KEY! },
  );
};
