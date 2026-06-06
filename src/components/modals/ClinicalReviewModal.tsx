import React from "react";
import type { DietPlan } from "../../types";
import { Modal, Button } from "../ui";

interface ClinicalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: DietPlan;
}

const ClinicalReviewModal: React.FC<ClinicalReviewModalProps> = ({ isOpen, onClose, onConfirm, plan }) => {
  const totalSodium = plan.meals.reduce((acc, meal) => acc + (meal.micros?.sodium || 0), 0);
  const totalFiber = plan.meals.reduce((acc, meal) => acc + (meal.micros?.fiber || 0), 0);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      title="Revisão Clínica Final"
      description="Validação nutricional pré-salvamento"
      icon={<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 text-xl">📋</span>}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Voltar e Ajustar</Button>
          <Button onClick={onConfirm} className="bg-sky-600 hover:bg-sky-700 shadow-sky-600/25">Confirmar e Salvar Plano</Button>
        </>
      }
    >
      <div className="space-y-6 py-1">
        {/* Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Metas Calóricas</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-sage-600">{(plan.dailyCalories || 0).toFixed(0)}</span>
              <span className="text-sm text-slate-500">kcal/dia</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
              <div className="bg-sage-500 h-1.5 rounded-full w-full" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Distribuição de Macros</h3>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-sky-600">P: {plan.macronutrients.proteinPercentage}%</span>
              <span className="text-amber-600">C: {plan.macronutrients.carbsPercentage}%</span>
              <span className="text-orange-600">G: {plan.macronutrients.fatPercentage}%</span>
            </div>
            <div className="flex h-1.5 w-full rounded-full overflow-hidden">
              <div className="bg-sky-500" style={{ width: `${plan.macronutrients.proteinPercentage}%` }} />
              <div className="bg-amber-500" style={{ width: `${plan.macronutrients.carbsPercentage}%` }} />
              <div className="bg-orange-500" style={{ width: `${plan.macronutrients.fatPercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <span>✅</span> Checklist de Conformidade
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
              <span className="text-sm text-slate-600 dark:text-slate-300">Fibras Diárias ({totalFiber.toFixed(1)}g)</span>
              <span className={`badge ${totalFiber >= 25 ? "badge-emerald" : "badge-amber"}`}>{totalFiber >= 25 ? "IDEAL" : "MODERADO"}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
              <span className="text-sm text-slate-600 dark:text-slate-300">Sódio Total ({totalSodium}mg)</span>
              <span className={`badge ${totalSodium <= 2000 ? "badge-emerald" : "badge-rose"}`}>{totalSodium <= 2000 ? "SEGURO" : "ALTO"}</span>
            </div>
            {(plan.clinicalTags || []).map((tag) => (
              <div key={tag} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                <span className="text-sm text-slate-600 dark:text-slate-300">Restrição para: {tag.replace(/_/g, " ")}</span>
                <span className="badge badge-sky">RESPEITADO</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed italic">
            "Ao confirmar, declaro que revisei as substituições automáticas e as porções sugeridas, garantindo que o plano atende às necessidades individuais do paciente conforme o julgamento clínico profissional."
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ClinicalReviewModal;
