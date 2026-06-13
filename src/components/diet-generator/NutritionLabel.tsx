import React from "react";
import { useTranslation } from "react-i18next";
import { Micronutrients } from "../../types";

interface NutritionLabelProps {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micros?: Micronutrients;
}

const NutritionLabel: React.FC<NutritionLabelProps> = ({
  portion,
  calories,
  protein,
  carbs,
  fat,
  micros,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-4 border-2 border-black font-sans text-black w-full max-w-[300px] shadow-sm">
      <h2 className="text-2xl font-black border-b-8 border-black pb-1 uppercase tracking-tighter leading-none">
        {t("nutrition_label.title")}
      </h2>
      <div className="text-sm font-bold py-1 border-b border-black flex justify-between uppercase">
        <span>{t("nutrition_label.serving_size")}</span>
        <span>{portion}</span>
      </div>

      <div className="border-b-4 border-black py-1">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-black">
            {t("nutrition_label.calories_title")}
          </span>
          <span className="text-lg font-black">{calories} kcal</span>
        </div>
      </div>

      <div className="border-b border-black py-1 flex justify-between text-sm">
        <span>
          <strong>{t("nutrition_label.carbohydrates")}</strong>
        </span>
        <span>{carbs}g</span>
      </div>
      <div className="border-b border-black py-1 flex justify-between text-sm">
        <span>
          <strong>{t("nutrition_label.protein")}</strong>
        </span>
        <span>{protein}g</span>
      </div>
      <div className="border-b-4 border-black py-1 flex justify-between text-sm">
        <span>
          <strong>{t("nutrition_label.fat")}</strong>
        </span>
        <span>{fat}g</span>
      </div>

      {micros && (
        <>
          {micros.fiber !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>{t("nutrition_label.fiber")}</span>
              <span>{micros.fiber}g</span>
            </div>
          )}
          {micros.sodium !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>{t("nutrition_label.sodium")}</span>
              <span>{micros.sodium}mg</span>
            </div>
          )}
          {micros.calcium !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>{t("nutrition_label.calcium")}</span>
              <span>{micros.calcium}mg</span>
            </div>
          )}
          {micros.iron !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>{t("nutrition_label.iron")}</span>
              <span>{micros.iron}mg</span>
            </div>
          )}
          {micros.vitaminC !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>{t("nutrition_label.vitaminC")}</span>
              <span>{micros.vitaminC}mg</span>
            </div>
          )}
        </>
      )}

      <div className="mt-4 text-[9px] leading-tight italic">
        {t("nutrition_label.footnote")}
      </div>
    </div>
  );
};

export default NutritionLabel;
