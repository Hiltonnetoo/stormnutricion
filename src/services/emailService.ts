import emailjs from "@emailjs/browser";

/**
 * Envio real de e-mails via EmailJS (cliente).
 *
 * Configure as três variáveis em .env.local (veja .env.example):
 *   VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
 *
 * Quando não configurado, `sendDietEmail` lança "EMAIL_NOT_CONFIGURED" para que
 * a UI exiba uma orientação clara em vez de fingir que enviou.
 *
 * Caminho de evolução (produção): trocar EmailJS por uma Cloud Function do
 * Firebase + provedor transacional (Resend/SendGrid), mantendo a mesma
 * assinatura `sendDietEmail` aqui.
 */

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;

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
        `Olá, ${params.toName}! Seu plano alimentar (${params.dietDate}) está disponível. Qualquer dúvida, estou à disposição.`,
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

export const sendPortalAccessEmail = async (params: PortalAccessEmailParams): Promise<void> => {
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
      message: `Olá, ${params.toName}! Seu acesso ao Portal do Paciente da clínica do(a) ${params.fromName} foi criado com sucesso.

Aqui estão suas credenciais para login:
E-mail: ${params.toEmail}
Senha: ${params.passwordText}

Você pode acessar o portal clicando no botão abaixo ou utilizando o seguinte link: ${params.portalUrl}`,
    },
    { publicKey: PUBLIC_KEY! },
  );
};
