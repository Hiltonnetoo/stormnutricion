import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Patient } from "../../types";

interface Step2Props {
  data: Partial<Patient>;
  onDataChange: (data: Partial<Patient>) => void;
  errors: Record<string, string>;
}

const errMsg = (m?: string) =>
  m ? <p className="mt-1.5 text-xs font-medium text-rose-600">{m}</p> : null;
const errBorder = (on?: string) =>
  on ? "border-rose-400 focus:ring-rose-500/60 focus:border-rose-400" : "";

const Step2Contact: React.FC<Step2Props> = ({ data, onDataChange, errors }) => {
  const { t } = useTranslation();
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "phone") {
      value = value.replace(/\D/g, "");
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      value = value.replace(/(\d{5})(\d)/, "$1-$2");
    } else if (name === "cep") {
      value = value.replace(/\D/g, "");
      value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    }
    onDataChange({ [name]: value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({
      address: {
        ...data.address,
        [e.target.name]: e.target.value,
      } as Patient["address"],
    });
  };

  useEffect(() => {
    const cep = data.address?.cep?.replace(/\D/g, "");
    if (cep && cep.length === 8) {
      const fetchAddress = async () => {
        setCepLoading(true);
        setCepError("");
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const addressData = await response.json();
          if (addressData.erro) {
            setCepError(t("patient_form.contact.cep_not_found"));
          } else {
            onDataChange({
              address: {
                ...data.address,
                street: addressData.logradouro,
                neighborhood: addressData.bairro,
                city: addressData.localidade,
                state: addressData.uf,
              } as Patient["address"],
            });
          }
        } catch {
          setCepError(t("patient_form.contact.cep_error"));
        } finally {
          setCepLoading(false);
        }
      };
      fetchAddress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.address?.cep]);

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {t("patient_form.contact.title")}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="input-label">
            {t("patient_form.contact.email")}
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={data.email || ""}
            onChange={handleInputChange}
            className={`input-field ${errBorder(errors.email)}`}
          />
          {errMsg(errors.email)}
        </div>
        <div>
          <label htmlFor="phone" className="input-label">
            {t("patient_form.contact.phone")}
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={data.phone || ""}
            onChange={handleInputChange}
            maxLength={15}
            placeholder="(XX) XXXXX-XXXX"
            className={`input-field ${errBorder(errors.phone)}`}
          />
          {errMsg(errors.phone)}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cep" className="input-label">
            {t("patient_form.contact.cep")}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              name="cep"
              id="cep"
              value={data.address?.cep || ""}
              onChange={handleAddressChange}
              maxLength={9}
              placeholder="XXXXX-XXX"
              className={`input-field sm:w-40 ${errBorder(errors.cep || cepError)}`}
            />
            {cepLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-sage-500 border-t-transparent" />
            )}
          </div>
          {errMsg(errors.cep)}
          {errMsg(cepError)}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="street" className="input-label">
            {t("patient_form.contact.street")}
          </label>
          <input
            type="text"
            name="street"
            id="street"
            value={data.address?.street || ""}
            onChange={handleAddressChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="number" className="input-label">
            {t("patient_form.contact.number")}
          </label>
          <input
            type="text"
            name="number"
            id="number"
            value={data.address?.number || ""}
            onChange={handleAddressChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="neighborhood" className="input-label">
            {t("patient_form.contact.neighborhood")}
          </label>
          <input
            type="text"
            name="neighborhood"
            id="neighborhood"
            value={data.address?.neighborhood || ""}
            onChange={handleAddressChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="city" className="input-label">
            {t("patient_form.contact.city")}
          </label>
          <input
            type="text"
            name="city"
            id="city"
            value={data.address?.city || ""}
            onChange={handleAddressChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="state" className="input-label">
            {t("patient_form.contact.state")}
          </label>
          <input
            type="text"
            name="state"
            id="state"
            value={data.address?.state || ""}
            onChange={handleAddressChange}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Contact;
