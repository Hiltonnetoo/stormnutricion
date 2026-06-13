import React from "react";
import { useTranslation } from "react-i18next";
import type { DietPlan } from "../../types";
import { Modal, Button } from "../ui";

interface ClinicalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: DietPlan;
}

const ClinicalReviewModal: React.FC<ClinicalReviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  plan,
}) => {
  const { t } = useTranslation();
  const totalSodium = plan.meals.reduce(
    (acc, meal) => acc + (meal.micros?.sodium || 0),
    0,
  );
  const totalFiber = plan.meals.reduce(
    (acc, meal) => acc + (meal.micros?.fiber || 0),
    0,
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={t("modals.clinical_review.title")}
      description={t("modals.clinical_review.subtitle")}
      icon={
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 text-xl">
          📋
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("modals.clinical_review.back_btn")}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-sky-600 hover:bg-sky-700 shadow-sky-600/25"
          >
            {t("modals.clinical_review.confirm_btn")}
          </Button>
        </>
      }
    >
      <div className="space-y-6 py-1">
        {/* Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
              {t("modals.clinical_review.goals")}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-sage-600">
                {(plan.dailyCalories || 0).toFixed(0)}
              </span>
              <span className="text-sm text-slate-500">
                {t("modals.clinical_review.kcal_day")}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
              <div className="bg-sage-500 h-1.5 rounded-full w-full" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
              {t("modals.clinical_review.macros")}
            </h3>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-sky-600">
                P: {plan.macronutrients.proteinPercentage}%
              </span>
              <span className="text-amber-600">
                C: {plan.macronutrients.carbsPercentage}%
              </span>
              <span className="text-orange-600">
                G: {plan.macronutrients.fatPercentage}%
              </span>
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden">
              <div
                className="bg-sky-500"
                style={{ width: `${plan.macronutrients.proteinPercentage}%` }}
              />
              <div
                className="bg-amber-500"
                style={{ width: `${plan.macronutrients.carbsPercentage}%` }}
              />
              <div
                className="bg-orange-500"
                style={{ width: `${plan.macronutrients.fatPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <span>✅</span> {t("modals.clinical_review.checklist")}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {t("modals.clinical_review.daily_fiber", {
                  grams: totalFiber.toFixed(1),
                })}
              </span>
              <span
                className={`badge ${totalFiber >= 25 ? "badge-emerald" : "badge-amber"}`}
              >
                {totalFiber >= 25
                  ? t("modals.clinical_review.ideal")
                  : t("modals.clinical_review.moderate")}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {t("modals.clinical_review.total_sodium", {
                  sodium: totalSodium,
                })}
              </span>
              <span
                className={`badge ${totalSodium <= 2000 ? "badge-emerald" : "badge-rose"}`}
              >
                {totalSodium <= 2000
                  ? t("modals.clinical_review.safe")
                  : t("modals.clinical_review.high")}
              </span>
            </div>
            {(plan.clinicalTags || []).map((tag) => {
              const translatedTag = t(
                "clinical_tags." + tag,
                tag.replace(/_/g, " "),
              );
              return (
                <div
                  key={tag}
                  className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {t("modals.clinical_review.restriction", {
                      tag: translatedTag,
                    })}
                  </span>
                  <span className="badge badge-sky">
                    {t("modals.clinical_review.respected")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed italic">
            {t("modals.clinical_review.disclaimer")}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ClinicalReviewModal;
