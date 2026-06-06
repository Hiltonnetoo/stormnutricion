import React from "react";
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
  return (
    <div className="bg-white p-4 border-2 border-black font-sans text-black w-full max-w-[300px] shadow-sm">
      <h2 className="text-2xl font-black border-b-8 border-black pb-1 uppercase tracking-tighter leading-none">
        Informação Nutricional
      </h2>
      <div className="text-sm font-bold py-1 border-b border-black flex justify-between uppercase">
        <span>Porção</span>
        <span>{portion}</span>
      </div>

      <div className="border-b-4 border-black py-1">
        <div className="flex justify-between items-baseline">
          <span className="text-lg font-black">Valor Energético</span>
          <span className="text-lg font-black">{calories} kcal</span>
        </div>
      </div>

      <div className="border-b border-black py-1 flex justify-between text-sm">
        <span>
          <strong>Carboidratos</strong>
        </span>
        <span>{carbs}g</span>
      </div>
      <div className="border-b border-black py-1 flex justify-between text-sm">
        <span>
          <strong>Proteínas</strong>
        </span>
        <span>{protein}g</span>
      </div>
      <div className="border-b-4 border-black py-1 flex justify-between text-sm">
        <span>
          <strong>Gorduras Totais</strong>
        </span>
        <span>{fat}g</span>
      </div>

      {micros && (
        <>
          {micros.fiber !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>Fibra Alimentar</span>
              <span>{micros.fiber}g</span>
            </div>
          )}
          {micros.sodium !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>Sódio</span>
              <span>{micros.sodium}mg</span>
            </div>
          )}
          {micros.calcium !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>Cálcio</span>
              <span>{micros.calcium}mg</span>
            </div>
          )}
          {micros.iron !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>Ferro</span>
              <span>{micros.iron}mg</span>
            </div>
          )}
          {micros.vitaminC !== undefined && (
            <div className="border-b border-black py-1 flex justify-between text-xs">
              <span>Vitamina C</span>
              <span>{micros.vitaminC}mg</span>
            </div>
          )}
        </>
      )}

      <div className="mt-4 text-[9px] leading-tight italic">
        * Valores diários de referência com base em uma dieta de 2.000 kcal.
        Seus valores diários podem ser maiores ou menores dependendo de suas
        necessidades energéticas.
      </div>
    </div>
  );
};

export default NutritionLabel;
