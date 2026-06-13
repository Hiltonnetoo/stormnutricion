import React, { useState, useCallback, useEffect } from "react";
import { FirebaseError } from "firebase/app";
import { useTranslation } from "react-i18next";
import { addPatient, updatePatient } from "../../services/firebaseService";
import { useAuth } from "../../contexts/AuthContext";
import type { Patient } from "../../types";
import usePersistentState from "../../hooks/usePersistentState";
import { loadState } from "../../utils/localStorage";
import { CloseIcon } from "../icons";
import { Button } from "../ui";

import ProgressBar from "../patient-form/ProgressBar";
import Step1Personal from "../patient-form/Step1Personal";
import Step2Contact from "../patient-form/Step2Contact";
import Step3Professional from "../patient-form/Step3Professional";
import Step4Nutritional from "../patient-form/Step4Nutritional";
import Step5Anthropometric from "../patient-form/Step5Anthropometric";
import Step6LabExams from "../patient-form/Step6LabExams";
import Step7Summary from "../patient-form/Step6Summary";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  showToast: (toast: {
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }) => void;
}

const TOTAL_STEPS = 7;
const FORM_STATE_KEY = "newPatientFormState";

const initialFormData: Omit<
  Patient,
  "id" | "createdAt" | "avatarUrl" | "status"
> = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "female" as Patient["gender"],
  email: "",
  phone: "",
  address: {
    cep: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
  },
  profession: "",
  activityLevel: "moderately_active" as Patient["activityLevel"],
  mode: "general" as Patient["mode"],
  clinicalTags: [],
  nutritionalGoal: "maintenance" as Patient["nutritionalGoal"],
  consultationMode: "presencial" as Patient["consultationMode"],
  medications: "",
  familyHistory: "",
  mealsPerDay: 4,
  hydrationLevel: "moderate" as Patient["hydrationLevel"],
  dietaryRestrictions: [],
  foodAllergies: "",
  weight: 0,
  height: 0,
  anthropometryMetadata: {
    weightOrigin: "clinical" as const,
    heightOrigin: "clinical" as const,
  },
  lastLabExams: [],
  termsAccepted: false,
};

const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  showToast,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData, clearFormData] = usePersistentState<
    Omit<Patient, "id" | "createdAt" | "avatarUrl" | "status">
  >(FORM_STATE_KEY, initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isEditMode = !!patient;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && patient) {
        const { id, createdAt, avatarUrl, status, ...formDataFromPatient } =
          patient;
        setFormData(formDataFromPatient);
      } else if (!isEditMode && loadState(FORM_STATE_KEY)) {
        // Data is already loaded by the hook
      } else {
        setFormData(initialFormData);
      }
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, patient, isEditMode]);

  const handleDataChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (formData.firstName.length < 2)
        newErrors.firstName = t("patient_form.personal.err_first_name");
      if (formData.lastName.length < 2)
        newErrors.lastName = t("patient_form.personal.err_last_name");
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dob)) {
        newErrors.dob = t("patient_form.personal.err_dob_format");
      } else {
        const [day, month, year] = formData.dob.split("/").map(Number);
        const birthDate = new Date(year, month - 1, day);
        if (isNaN(birthDate.getTime())) {
          newErrors.dob = t("patient_form.personal.err_dob_invalid");
        } else {
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 1) newErrors.dob = t("patient_form.personal.err_dob_age");
        }
      }
    } else if (currentStep === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = t("patient_form.contact.err_email");
      if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone))
        newErrors.phone = t("patient_form.contact.err_phone");
      if (formData.address.cep && !/^\d{5}-\d{3}$/.test(formData.address.cep))
        newErrors.cep = t("patient_form.contact.err_cep");
    } else if (currentStep === 3) {
      if (!formData.profession)
        newErrors.profession = t("patient_form.professional.err_profession");
    } else if (currentStep === 5) {
      if (formData.weight < 20 || formData.weight > 300)
        newErrors.weight = t("patient_form.anthropometric.err_weight");
      // formData.height is in cm. Range 0.1m to 3.0m is 10cm to 300cm.
      if (formData.height < 10 || formData.height > 300)
        newErrors.height = t("patient_form.anthropometric.err_height");
      if (!formData.termsAccepted)
        newErrors.termsAccepted = t("patient_form.anthropometric.err_terms");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, formData, t]);

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (isEditMode) {
      setCurrentStep(step);
      return;
    }
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (validateStep()) {
      setCurrentStep(step);
    }
  };

  const isDirty =
    !isEditMode &&
    (!!formData.firstName ||
      !!formData.lastName ||
      !!formData.email ||
      !!formData.dob ||
      !!formData.phone ||
      (Number(formData.weight) || 0) > 0);

  const handleForceClose = () => {
    // Em modo criação com dados preenchidos, confirmar antes de descartar.
    // Fora isso, apenas fecha (o rascunho permanece salvo localmente).
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  const keepDraftAndClose = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  const discardAndClose = () => {
    clearFormData();
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      if (isEditMode && patient?.id) {
        const dietRelatedFields: (keyof Patient)[] = [
          "weight",
          "height",
          "activityLevel",
          "mealsPerDay",
          "dietaryRestrictions",
          "foodAllergies",
          "mode",
          "clinicalTags",
          "nutritionalGoal",
        ];

        const hasRelevantChanges = dietRelatedFields.some((field) => {
          const originalValue = patient[field];
          const newValue = formData[field as keyof typeof formData];
          return JSON.stringify(originalValue) !== JSON.stringify(newValue);
        });

        await updatePatient(currentUser.uid, patient.id, {
          ...formData,
          dietNeedsReview: hasRelevantChanges,
        });

        onClose(); // Close modal first

        // Then show the toast on the main page
        if (hasRelevantChanges) {
          showToast({
            title: t("patients.toast_success_title"),
            message: t("patients.toast_relevant_changes_warning", {
              defaultValue:
                "Clinical data (weight, height, etc.) have changed. It is recommended to review the patient's meal plan.",
            }),
            type: "warning",
          });
        } else {
          showToast({
            title: t("patients.toast_success_title"),
            message: t("patients.toast_update_success", {
              defaultValue: "Patient updated successfully!",
            }),
            type: "success",
          });
        }
      } else {
        const fullPatientData: Omit<Patient, "id"> = {
          ...formData,
          status: "Active",
          createdAt: new Date().toISOString(),
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName + " " + formData.lastName)}&background=8FBC8F&color=fff`,
        };
        await addPatient(currentUser.uid, fullPatientData);
        onClose(); // Close modal
        showToast({
          title: t("patients.toast_success_title"),
          message: t("patients.toast_create_success", {
            defaultValue: "Patient registered successfully!",
          }),
          type: "success",
        });
      }
      clearFormData();
    } catch (error) {
      console.error("Failed to save patient:", error);
      let errorMessage = t("patients.error_save_patient", {
        defaultValue:
          "An error occurred while saving the patient. Please try again.",
      });

      if (
        error instanceof FirebaseError &&
        error.code === "permission-denied"
      ) {
        errorMessage = t("patients.error_permission_denied", {
          defaultValue:
            "Could not save. Check your connection and try again — your data has been kept.",
        });
      }

      showToast({
        title: t("patients.toast_error_title"),
        message: errorMessage,
        type: "error",
      });
      // Do NOT close the modal on error so user can retry or save data
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={handleForceClose}
      />
      <div
        className="relative bg-white dark:bg-slate-850 rounded-t-3xl sm:rounded-3xl shadow-pop border border-slate-200/70 dark:border-slate-700/60 w-full max-w-3xl flex flex-col max-h-[95vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditMode
                ? t("patient_form.edit_patient")
                : t("patient_form.new_patient")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t("patient_form.step_counter", {
                current: currentStep,
                total: TOTAL_STEPS,
              })}
            </p>
          </div>
          <button
            onClick={handleForceClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800"
            aria-label={t("meal_table.close")}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-6 pb-2 shrink-0">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            goToStep={goToStep}
            isEditMode={isEditMode}
          />
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-grow">
          {currentStep === 1 && (
            <Step1Personal
              data={formData}
              onDataChange={handleDataChange}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <Step2Contact
              data={formData}
              onDataChange={handleDataChange}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <Step3Professional
              data={formData}
              onDataChange={handleDataChange}
              errors={errors}
            />
          )}
          {currentStep === 4 && (
            <Step4Nutritional
              data={formData}
              onDataChange={handleDataChange}
              errors={errors}
            />
          )}
          {currentStep === 5 && (
            <Step5Anthropometric
              data={formData}
              onDataChange={handleDataChange}
              errors={errors}
            />
          )}
          {currentStep === 6 && (
            <Step6LabExams data={formData} onDataChange={handleDataChange} />
          )}
          {currentStep === 7 && (
            <Step7Summary data={formData} goToStep={goToStep} />
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            {t("patient_form.prev_btn")}
          </Button>
          {currentStep < TOTAL_STEPS ? (
            <Button size="sm" onClick={nextStep}>
              {t("patient_form.next_btn")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isEditMode
                ? t("patient_form.save_changes")
                : t("patient_form.finish_registration")}
            </Button>
          )}
        </div>
      </div>

      {showDiscardConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 animate-fade-in"
            onClick={() => setShowDiscardConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-850 rounded-2xl shadow-pop border border-slate-200 dark:border-slate-700 p-6 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("patient_form.discard_title")}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {t("patient_form.discard_desc")}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={keepDraftAndClose}>
                {t("patient_form.keep_draft")}
              </Button>
              <Button variant="danger" size="sm" onClick={discardAndClose}>
                {t("patient_form.discard_btn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewPatientModal;
