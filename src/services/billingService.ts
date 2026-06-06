/**
 * Serviço de assinatura/faturamento.
 *
 * Hoje o estado é persistido localmente (localStorage) para que a tela de
 * "Plano & Faturamento" seja totalmente funcional sem backend. Os pontos
 * marcados com TODO(stripe) são onde a integração real com o Stripe entra:
 * cada ação (mudar de plano, trocar cartão, cancelar) deve, em produção,
 * abrir uma sessão do Stripe Customer Portal / Checkout via Cloud Function,
 * e o estado abaixo passa a ser hidratado por webhook no Firestore.
 */

export type PlanTier = "free" | "pro" | "clinic";
export type SubscriptionStatus = "active" | "canceled";

export interface PlanDef {
  tier: PlanTier;
  name: string;
  priceLabel: string; // exibição
  priceValue: number; // BRL/mês
  patientLimit: number | null; // null = ilimitado
  tagline: string;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanDef> = {
  free: {
    tier: "free",
    name: "Gratuito",
    priceLabel: "R$ 0",
    priceValue: 0,
    patientLimit: 5,
    tagline: "Para experimentar a plataforma",
    features: [
      "Até 5 pacientes",
      "3 dietas por mês",
      "Cálculos metabólicos",
      "PDF do plano (sem sua marca)",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceLabel: "R$ 89",
    priceValue: 89,
    patientLimit: null,
    tagline: "Para o nutricionista autônomo",
    features: [
      "Pacientes ilimitados",
      "Dietas ilimitadas",
      "PDF com a identidade da sua clínica",
      "Portal do paciente",
      "Agenda completa",
      "Suporte por e-mail",
    ],
  },
  clinic: {
    tier: "clinic",
    name: "Clínica",
    priceLabel: "R$ 199",
    priceValue: 199,
    patientLimit: null,
    tagline: "Para clínicas e equipes",
    features: [
      "Tudo do plano Pro",
      "Até 3 usuários",
      "Relatórios avançados",
      "Módulo de exames laboratoriais",
      "Suporte prioritário",
    ],
  },
};

export const PLAN_ORDER: PlanTier[] = ["free", "pro", "clinic"];

export interface Invoice {
  id: string;
  date: string; // ISO
  amount: number; // BRL
  status: "paid";
}

export interface PaymentMethod {
  brand: string;
  last4: string;
  exp: string; // MM/AA
}

export interface BillingState {
  tier: PlanTier;
  status: SubscriptionStatus;
  startedAt: string; // ISO
  renewsAt: string; // ISO — data da próxima cobrança / fim do acesso se cancelado
  paymentMethod: PaymentMethod | null;
  invoices: Invoice[];
}

const KEY = "billingState";

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const buildDefaultState = (): BillingState => {
  const now = new Date();
  const startedAt = addMonths(now, -2);
  const plan = PLANS.pro;
  const invoices: Invoice[] = [0, 1, 2].map((i) => {
    const d = addMonths(startedAt, i);
    return {
      id: `inv_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`,
      date: d.toISOString(),
      amount: plan.priceValue,
      status: "paid",
    };
  });
  return {
    tier: "pro",
    status: "active",
    startedAt: startedAt.toISOString(),
    renewsAt: addMonths(now, 1).toISOString(),
    paymentMethod: { brand: "Visa", last4: "4242", exp: "12/28" },
    invoices,
  };
};

export const getBillingState = (): BillingState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as BillingState;
  } catch {
    /* ignora JSON inválido e recria abaixo */
  }
  const fresh = buildDefaultState();
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
};

const save = (state: BillingState): BillingState => {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
};

/**
 * Troca o plano da assinatura. (TODO(stripe): em produção, abrir o Checkout/
 * Customer Portal e aplicar a mudança via webhook em vez de localmente.)
 */
export const changePlan = (tier: PlanTier): BillingState => {
  const current = getBillingState();
  const now = new Date();
  const plan = PLANS[tier];
  const invoices = [...current.invoices];
  // Registra uma "cobrança" da troca quando há valor e o plano muda.
  if (plan.priceValue > 0 && tier !== current.tier) {
    invoices.unshift({
      id: `inv_${now.getTime()}`,
      date: now.toISOString(),
      amount: plan.priceValue,
      status: "paid",
    });
  }
  return save({
    ...current,
    tier,
    status: "active",
    renewsAt: addMonths(now, 1).toISOString(),
    invoices,
  });
};

/** Cancela a assinatura mantendo acesso até a data de renovação. */
export const cancelSubscription = (): BillingState => {
  const current = getBillingState();
  return save({ ...current, status: "canceled" });
};

/** Reativa uma assinatura cancelada. */
export const reactivateSubscription = (): BillingState => {
  const current = getBillingState();
  return save({
    ...current,
    status: "active",
    renewsAt: addMonths(new Date(), 1).toISOString(),
  });
};

export const formatBRL = (value: number): string =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
