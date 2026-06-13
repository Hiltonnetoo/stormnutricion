import React from "react";
import { useTranslation } from "react-i18next";
import type { Patient } from "../../types";

interface Step1Props {
  data: Partial<Patient>;
  onDataChange: (data: Partial<Patient>) => void;
  errors: Record<string, string>;
}

const Step1Personal: React.FC<Step1Props> = ({
  data,
  onDataChange,
  errors,
}) => {
  const { t } = useTranslation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "dob") {
      value = value.replace(/\D/g, "");
      if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
      if (value.length > 5) value = value.slice(0, 5) + "/" + value.slice(5, 9);
    }
    onDataChange({ [name]: value });
  };

  const errClass = (k: string) =>
    errors[k]
      ? "border-rose-400 focus:ring-rose-500/60 focus:border-rose-400"
      : "";

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {t("patient_form.personal.title")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="input-label">
            {t("patient_form.personal.first_name")}
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={data.firstName || ""}
            onChange={handleChange}
            className={`input-field ${errClass("firstName")}`}
          />
          {errors.firstName && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.firstName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="lastName" className="input-label">
            {t("patient_form.personal.last_name")}
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={data.lastName || ""}
            onChange={handleChange}
            className={`input-field ${errClass("lastName")}`}
          />
          {errors.lastName && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.lastName}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="dob" className="input-label">
            {t("patient_form.personal.dob")}
          </label>
          <input
            type="text"
            name="dob"
            id="dob"
            value={data.dob || ""}
            onChange={handleChange}
            maxLength={10}
            placeholder="DD/MM/AAAA"
            className={`input-field ${errClass("dob")}`}
          />
          {errors.dob && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.dob}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="gender" className="input-label">
            {t("patient_form.personal.gender")}
          </label>
          <select
            id="gender"
            name="gender"
            value={data.gender || "female"}
            onChange={handleChange}
            className="input-field"
          >
            <option value="female">
              {t("patient_form.personal.gender_female")}
            </option>
            <option value="male">
              {t("patient_form.personal.gender_male")}
            </option>
            <option value="other">
              {t("patient_form.personal.gender_other")}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Step1Personal;
