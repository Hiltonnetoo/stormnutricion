import React from "react";
import { useTranslation } from "react-i18next";
import type { Patient } from "../../types";
import { EditIcon } from "../icons";

interface Step6Props {
  data: Partial<Patient>;
  goToStep: (step: number) => void;
}

const SummaryItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
      {label}
    </dt>
    <dd className="mt-0.5 text-sm text-slate-900 dark:text-white">
      {value || "-"}
    </dd>
  </div>
);

const Section: React.FC<{
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}> = ({ title, step, onEdit, children }) => {
  const { t } = useTranslation();
  return (
    <div className="py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
        <button
          onClick={() => onEdit(step)}
          className="text-sm font-semibold text-sage-600 hover:text-sage-700 flex items-center gap-1"
        >
          <EditIcon className="w-4 h-4" /> {t("patient_form.summary.edit")}
        </button>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
        {children}
      </dl>
    </div>
  );
};

const Step6Summary: React.FC<Step6Props> = ({ data, goToStep }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {t("patient_form.summary.title")}
      </h3>
      <p className="text-sm text-slate-500">
        {t("patient_form.summary.subtitle")}
      </p>

      <div className="mt-3 rounded-2xl border border-slate-100 dark:border-slate-800 px-5">
        <Section
          title={t("patient_form.summary.section_personal")}
          step={1}
          onEdit={goToStep}
        >
          <SummaryItem
            label={t("patient_form.summary.full_name")}
            value={`${data.firstName} ${data.lastName}`}
          />
          <SummaryItem label={t("patient_form.summary.dob")} value={data.dob} />
          <SummaryItem
            label={t("patient_form.summary.gender")}
            value={data.gender}
          />
        </Section>
        <Section
          title={t("patient_form.summary.section_contact")}
          step={2}
          onEdit={goToStep}
        >
          <SummaryItem
            label={t("patient_form.summary.email")}
            value={data.email}
          />
          <SummaryItem
            label={t("patient_form.summary.phone")}
            value={data.phone}
          />
          <SummaryItem
            label={t("patient_form.summary.address")}
            value={`${data.address?.street}, ${data.address?.number} - ${data.address?.neighborhood}, ${data.address?.city} - ${data.address?.state}, ${data.address?.cep}`}
          />
        </Section>
        <Section
          title={t("patient_form.summary.section_professional")}
          step={3}
          onEdit={goToStep}
        >
          <SummaryItem
            label={t("patient_form.summary.profession")}
            value={data.profession}
          />
          <SummaryItem
            label={t("patient_form.summary.activity_level")}
            value={data.activityLevel?.replace(/_/g, " ")}
          />
        </Section>
        <Section
          title={t("patient_form.summary.section_nutritional")}
          step={4}
          onEdit={goToStep}
        >
          <SummaryItem
            label={t("patient_form.summary.mode")}
            value={data.mode?.toUpperCase()}
          />
          <SummaryItem
            label={t("patient_form.summary.goal")}
            value={data.nutritionalGoal?.replace(/_/g, " ")}
          />
          <SummaryItem
            label={t("patient_form.summary.consultation")}
            value={data.consultationMode}
          />
          <SummaryItem
            label={t("patient_form.summary.clinical_tags")}
            value={
              (data.clinicalTags || []).join(", ") ||
              t("patient_form.summary.none")
            }
          />
          <SummaryItem
            label={t("patient_form.summary.meals_per_day")}
            value={data.mealsPerDay}
          />
          <SummaryItem
            label={t("patient_form.summary.hydration")}
            value={data.hydrationLevel}
          />
          <SummaryItem
            label={t("patient_form.summary.restrictions")}
            value={
              (data.dietaryRestrictions || []).join(", ") ||
              t("patient_form.summary.none")
            }
          />
          <SummaryItem
            label={t("patient_form.summary.medications")}
            value={data.medications || t("patient_form.summary.none_male")}
          />
        </Section>
        <Section
          title={t("patient_form.summary.section_anthropometric")}
          step={5}
          onEdit={goToStep}
        >
          <SummaryItem
            label={t("patient_form.summary.weight")}
            value={`${data.weight} kg (${data.anthropometryMetadata?.weightOrigin || "-"})`}
          />
          <SummaryItem
            label={t("patient_form.summary.height")}
            value={`${data.height ? (data.height / 100).toFixed(2).replace(".", ",") : "-"} m (${data.anthropometryMetadata?.heightOrigin || "-"})`}
          />
          <SummaryItem
            label={t("patient_form.summary.abdominal")}
            value={
              data.circumferenceAbdominal
                ? `${data.circumferenceAbdominal} cm`
                : t("patient_form.summary.na")
            }
          />
          <SummaryItem
            label={t("patient_form.summary.body_fat")}
            value={
              data.bodyFatPercentage
                ? `${data.bodyFatPercentage}%`
                : t("patient_form.summary.na")
            }
          />
          <SummaryItem
            label={t("patient_form.summary.muscle_mass")}
            value={
              data.muscleMassKg
                ? `${data.muscleMassKg} kg`
                : t("patient_form.summary.na")
            }
          />
          <SummaryItem
            label={t("patient_form.summary.blood_pressure")}
            value={data.bloodPressure || t("patient_form.summary.na")}
          />
        </Section>
        <Section
          title={t("patient_form.summary.section_exams")}
          step={6}
          onEdit={goToStep}
        >
          <SummaryItem
            label={t("patient_form.summary.exams_reported")}
            value={t("patient_form.summary.registered_tests", {
              count: (data.lastLabExams || []).length,
            })}
          />
        </Section>
      </div>
    </div>
  );
};

export default Step6Summary;
