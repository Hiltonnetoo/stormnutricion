/**
 * Subscription/billing service.
 *
 * Currently, the state is persisted locally (localStorage) so that the
 * "Plan & Billing" screen is fully functional without a backend. The points
 * marked with TODO(stripe) are where the actual integration with Stripe goes:
 * each action (change plan, swap card, cancel) should, in production,
 * open a Stripe Customer Portal / Checkout session via Cloud Function,
 * and the state below is then hydrated via webhook in Firestore.
 */

export type PlanTier = "free" | "pro" | "clinic";
export type SubscriptionStatus = "active" | "canceled";

export interface PlanDef {
  tier: PlanTier;
  name: string;
  priceLabel: string; // display label
  priceValue: number; // BRL/month
  patientLimit: number | null; // null = unlimited
  tagline: string;
  features: string[];
}

export const PLANS: Record<PlanTier, PlanDef> = {
  free: {
    tier: "free",
    name: "Free",
    priceLabel: "R$ 0",
    priceValue: 0,
    patientLimit: 5,
    tagline: "To try the platform",
    features: [
      "Up to 5 patients",
      "3 diets per month",
      "Metabolic calculations",
      "Plan PDF (unbranded)",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceLabel: "R$ 89",
    priceValue: 89,
    patientLimit: null,
    tagline: "For the independent nutritionist",
    features: [
      "Unlimited patients",
      "Unlimited diets",
      "PDF with your clinic's identity",
      "Patient portal",
      "Complete calendar",
      "Email support",
    ],
  },
  clinic: {
    tier: "clinic",
    name: "Clinic",
    priceLabel: "R$ 199",
    priceValue: 199,
    patientLimit: null,
    tagline: "For clinics and teams",
    features: [
      "Everything in Pro",
      "Up to 3 users",
      "Advanced reports",
      "Lab tests module",
      "Priority support",
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
  exp: string; // MM/YY
}

export interface BillingState {
  tier: PlanTier;
  status: SubscriptionStatus;
  startedAt: string; // ISO
  renewsAt: string; // ISO — date of next charge / end of access if canceled
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
    /* ignore invalid JSON and recreate below */
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
 * Swaps the subscription plan. (TODO(stripe): in production, open Checkout/
 * Customer Portal and apply the change via webhook instead of locally.)
 */
export const changePlan = (tier: PlanTier): BillingState => {
  const current = getBillingState();
  const now = new Date();
  const plan = PLANS[tier];
  const invoices = [...current.invoices];
  // Registers a swap "charge" when there is a value and the plan changes.
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

/** Cancels the subscription retaining access until the renewal date. */
export const cancelSubscription = (): BillingState => {
  const current = getBillingState();
  return save({ ...current, status: "canceled" });
};

/** Reactivates a canceled subscription. */
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
