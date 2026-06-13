import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { getPatientsCount } from "../../services/firebaseService";
import {
  PLANS,
  PLAN_ORDER,
  getBillingState,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  formatBRL,
  formatDate,
  type BillingState,
  type PlanTier,
} from "../../services/billingService";
import { Card, Button, Badge } from "../ui";
import { ConfirmationModal } from "../modals/PatientModal";
import { CheckCircleIcon, CreditCardIcon, DownloadIcon } from "../icons";

const BillingSection: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [billing, setBilling] = useState<BillingState>(() => getBillingState());
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [pendingTier, setPendingTier] = useState<PlanTier | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!currentUser) return;
    const unsub = getPatientsCount(currentUser.uid, (c) => setPatientCount(c));
    return () => unsub?.();
  }, [currentUser]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  };

  const plan = PLANS[billing.tier];
  const isCanceled = billing.status === "canceled";
  const usagePct =
    plan.patientLimit && patientCount !== null
      ? Math.min(100, Math.round((patientCount / plan.patientLimit) * 100))
      : null;

  const handleChangePlan = (tier: PlanTier) => {
    // TODO(stripe): abrir Checkout/Customer Portal; aqui aplicamos localmente.
    setBilling(changePlan(tier));
    setPendingTier(null);
    flash(t("billing.notice_changed", { name: PLANS[tier].name }));
  };

  const handleCancel = () => {
    setBilling(cancelSubscription());
    setConfirmCancel(false);
    flash(t("billing.notice_canceled"));
  };

  const handleReactivate = () => {
    setBilling(reactivateSubscription());
    flash(t("billing.notice_reactivated"));
  };

  const handleManagePayment = () => {
    // TODO(stripe): redirect para stripe.billingPortal.sessions.create({ customer }).
    flash(t("billing.notice_card_stripe"));
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t("billing.title")}
        </h2>
        <p className="text-sm text-slate-500 mb-6">{t("billing.subtitle")}</p>

        {notice && (
          <div className="mb-5 flex items-center gap-2 text-sm text-sage-700 bg-sage-50 border border-sage-100 rounded-xl p-3">
            <CheckCircleIcon className="w-5 h-5 shrink-0" /> {notice}
          </div>
        )}

        {/* Plano atual */}
        <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-900/20 border border-sage-100 dark:border-sage-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sage-100 rounded-xl text-sage-600">
                <CreditCardIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sage-900 dark:text-sage-100">
                  Storm Nutrition{" "}
                  {t("home.pricing_" + billing.tier + "_title", {
                    defaultValue: plan.name,
                  })}
                  {plan.priceValue > 0 && (
                    <span className="font-semibold text-sage-600">
                      {" "}
                      · {plan.priceLabel}
                      {t("billing.per_month")}
                    </span>
                  )}
                </p>
                <p className="text-xs text-sage-600 dark:text-sage-400">
                  {isCanceled
                    ? t("billing.canceled_on", {
                        date: formatDate(billing.renewsAt),
                      })
                    : t("billing.renews_on", {
                        date: formatDate(billing.renewsAt),
                      })}
                </p>
              </div>
            </div>
            {isCanceled ? (
              <Badge tone="amber">{t("billing.canceled")}</Badge>
            ) : (
              <Badge tone="emerald">{t("billing.active")}</Badge>
            )}
          </div>

          {/* Uso do plano */}
          {plan.patientLimit !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                <span>{t("billing.patients")}</span>
                <span>
                  {patientCount ?? "—"} / {plan.patientLimit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-sage-100 dark:bg-sage-900/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sage-500 transition-all"
                  style={{ width: `${usagePct ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {isCanceled && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={handleReactivate}
            >
              {t("billing.reactivate_btn")}
            </Button>
          )}
        </div>

        {/* Seletor de planos */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {t("billing.change_plan_title")}
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {PLAN_ORDER.map((tier) => {
              const p = PLANS[tier];
              const isCurrent = tier === billing.tier && !isCanceled;
              const curIdx = PLAN_ORDER.indexOf(billing.tier);
              const isUpgrade = PLAN_ORDER.indexOf(tier) > curIdx;
              return (
                <div
                  key={tier}
                  className={`flex flex-col rounded-2xl border p-4 ${
                    isCurrent
                      ? "border-sage-400 bg-sage-50/50 dark:bg-sage-900/10"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <p className="font-bold text-slate-900 dark:text-white">
                    {t("home.pricing_" + tier + "_title", {
                      defaultValue: p.name,
                    })}
                  </p>
                  <p className="text-xs text-slate-500 mb-2">
                    {t("home.pricing_" + tier + "_tagline", {
                      defaultValue: p.tagline,
                    })}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white stat-number">
                    {p.priceLabel}
                    <span className="text-xs font-medium text-slate-400">
                      {p.priceValue > 0 ? t("billing.per_month") : ""}
                    </span>
                  </p>
                  <div className="mt-auto pt-3">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-700">
                        <CheckCircleIcon className="w-4 h-4" />{" "}
                        {t("billing.current_plan")}
                      </span>
                    ) : (
                      <Button
                        variant={isUpgrade ? "primary" : "secondary"}
                        size="sm"
                        fullWidth
                        onClick={() => setPendingTier(tier)}
                      >
                        {isUpgrade
                          ? t("billing.upgrade_btn")
                          : t("billing.downgrade_btn")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forma de pagamento */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {t("billing.payment_method_title")}
          </p>
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                <CreditCardIcon className="w-5 h-5" />
              </div>
              {billing.paymentMethod ? (
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {billing.paymentMethod.brand} ••••{" "}
                    {billing.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-slate-400">
                    Expira em {billing.paymentMethod.exp}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">{t("billing.no_card")}</p>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={handleManagePayment}>
              {t("billing.change_card_btn")}
            </Button>
          </div>
        </div>

        {/* Histórico de pagamentos */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            {t("billing.payment_history_title")}
          </p>
          {billing.invoices.length === 0 ? (
            <p className="text-sm text-slate-400">{t("billing.no_payments")}</p>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
              {billing.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {formatDate(inv.date)}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {t("billing.paid")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {formatBRL(inv.amount)}
                    </span>
                    <button
                      onClick={() => flash(t("billing.notice_pdf_stripe"))}
                      className="flex items-center gap-1 text-xs font-semibold text-sage-600 hover:text-sage-700"
                    >
                      <DownloadIcon className="w-4 h-4" /> NF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cancelamento */}
        {!isCanceled && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setConfirmCancel(true)}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              {t("billing.cancel_btn")}
            </button>
            <p className="mt-1 text-xs text-slate-400">
              {t("billing.cancel_desc")}
            </p>
          </div>
        )}
      </Card>

      <ConfirmationModal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        title={t("billing.cancel_confirm_title")}
        message={t("billing.cancel_confirm_message", {
          name: plan.name,
          date: formatDate(billing.renewsAt),
        })}
        confirmText={t("billing.cancel_confirm_btn")}
        cancelText={t("billing.cancel_keep_btn")}
      />

      <ConfirmationModal
        isOpen={pendingTier !== null}
        onClose={() => setPendingTier(null)}
        onConfirm={() => pendingTier && handleChangePlan(pendingTier)}
        title={
          pendingTier
            ? t("billing.change_confirm_title", {
                name: PLANS[pendingTier].name,
              })
            : ""
        }
        message={
          pendingTier
            ? t("billing.change_confirm_message", {
                name: PLANS[pendingTier].name,
                price: PLANS[pendingTier].priceLabel,
                perMonth:
                  PLANS[pendingTier].priceValue > 0
                    ? t("billing.per_month")
                    : "",
              })
            : ""
        }
        confirmText={t("billing.change_confirm_btn")}
        cancelText={t("billing.change_back_btn")}
      />
    </>
  );
};

export default BillingSection;
