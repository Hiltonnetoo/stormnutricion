import React, { useState } from "react";
import type { MealOption, MealOptionItem } from "../types";
import NutritionLabel from "./diet-generator/NutritionLabel";

interface Props {
  mainOption: MealOption;
  alternatives?: MealOption[];
  /** Tailwind color token for label: 'sage' (nutritionist) or 'teal' (patient) */
  accentColor?: "sage" | "teal";
}

const NutritionModal: React.FC<{ item: MealOptionItem; onClose: () => void }> = ({
  item,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto transform transition-all animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors flex items-center gap-2 font-bold"
      >
        Fechar <span className="text-2xl">×</span>
      </button>
      <NutritionLabel
        name={item.name}
        portion={item.portion}
        calories={item.calories}
        protein={item.protein}
        carbs={item.carbs}
        fat={item.fat}
        micros={item.micros}
      />
    </div>
  </div>
);

/**
 * Splits a combined portion string into individual amounts.
 * e.g. "10850g, 252g e 103g" → ["10850g", "252g", "103g"]
 */
function parseAmounts(portion: string): string[] {
  return portion
    .replace(/\s+e\s+/g, ", ")
    .split(/,\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Tries to split food names to match the number of portions.
 * Falls back to [fullName] if parsing is unreliable.
 */
function parseFoodNames(name: string, count: number): string[] {
  if (count <= 1) return [name];

  // Normalize: replace the last " e " before the final item with ", "
  const normalized = name.replace(/,?\s+e\s+(?=[^,]+$)/, ", ");
  const parts = normalized.split(/,\s+/);

  if (parts.length === count) return parts.map((p) => p.trim());

  // Fallback: return full name as single item
  return [name];
}

/** Renders one MealOption as a professional table */
const OptionTable: React.FC<{
  option: MealOption;
  accent: "sage" | "teal";
  isAlternative?: boolean;
  index?: number;
}> = ({ option, accent, isAlternative, index }) => {
  const [selectedItem, setSelectedItem] = useState<MealOptionItem | null>(null);

  // Use structured items if available (New Plans)
  if (option.items && option.items.length > 0) {
    const borderColor =
      accent === "sage"
        ? "border-sage-200 dark:border-sage-800"
        : "border-teal-200";
    const headerBg =
      accent === "sage"
        ? "bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300"
        : "bg-teal-50 text-teal-700";
    const pillBg =
      accent === "sage"
        ? "bg-sage-100 text-sage-800 dark:bg-sage-800 dark:text-sage-100"
        : "bg-teal-100 text-teal-800";

    return (
      <div
        className={`rounded-xl border ${borderColor} overflow-hidden ${isAlternative ? "opacity-90" : ""}`}
      >
        <div
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${headerBg} flex items-center justify-between`}
        >
          <span>
            {isAlternative
              ? `Alternativa ${(index ?? 0) + 1}`
              : "Opção Principal"}
          </span>
          <div className="flex gap-4">
            {option.protein !== undefined && (
              <span className="text-[11px]">
                P: {Math.round(option.protein)}g | C: {Math.round(option.carbs)}
                g | G: {Math.round(option.fat)}g
              </span>
            )}
            {option.details && (
              <span className="font-normal normal-case text-[11px] italic opacity-80">
                {option.details}
              </span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Alimento
                </th>
                <th className="text-right px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">
                  Porção
                </th>
                <th className="text-center px-2 py-1.5 text-[9px] font-semibold text-slate-400 uppercase w-10">
                  P
                </th>
                <th className="text-center px-2 py-1.5 text-[9px] font-semibold text-slate-400 uppercase w-10">
                  C
                </th>
                <th className="text-center px-2 py-1.5 text-[9px] font-semibold text-slate-400 uppercase w-10">
                  G
                </th>
                <th className="text-right px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">
                  Kcal
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {option.items.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200 font-medium text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      {item.name}
                      {item.clinicalWarnings &&
                        item.clinicalWarnings.length > 0 && (
                          <span
                            title={item.clinicalWarnings.join(", ")}
                            className="cursor-help text-red-500 hover:text-red-600 transition-colors"
                          >
                            ⚠️
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${pillBg}`}
                    >
                      {item.portion}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center text-[11px] font-medium text-blue-600">
                    {Math.round(item.protein)}g
                  </td>
                  <td className="px-2 py-2 text-center text-[11px] font-medium text-amber-600">
                    {Math.round(item.carbs)}g
                  </td>
                  <td className="px-2 py-2 text-center text-[11px] font-medium text-orange-600">
                    {Math.round(item.fat)}g
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-slate-700 dark:text-slate-300 text-xs">
                    {item.calories}
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400 hover:text-slate-600"
                      title="Ver Tabela Nutricional"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {option.clinicalWarnings && option.clinicalWarnings.length > 0 && (
          <div className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-800">
            <p className="text-[11px] font-bold text-red-700 dark:text-red-400 flex items-center gap-1 uppercase">
              <span>💡 Nota Clínica:</span>
              <span className="font-medium normal-case">
                {option.clinicalWarnings.join(" • ")}
              </span>
            </p>
          </div>
        )}
        {selectedItem && (
          <NutritionModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>
    );
  }

  // Fallback for Legacy Plans (V2 without items)
  const amounts = parseAmounts(option.portion);
  const foods = parseFoodNames(option.name, amounts.length);
  const matched = foods.length === amounts.length;

  const borderColor =
    accent === "sage"
      ? "border-sage-200 dark:border-sage-800"
      : "border-teal-200";
  const headerBg =
    accent === "sage"
      ? "bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300"
      : "bg-teal-50 text-teal-700";
  const pillBg =
    accent === "sage"
      ? "bg-sage-100 text-sage-800 dark:bg-sage-800 dark:text-sage-100"
      : "bg-teal-100 text-teal-800";

  return (
    <div
      className={`rounded-xl border ${borderColor} overflow-hidden ${isAlternative ? "opacity-90" : ""}`}
    >
      {/* Table header */}
      <div
        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${headerBg} flex items-center justify-between`}
      >
        <span>
          {isAlternative
            ? `Alternativa ${(index ?? 0) + 1}`
            : "Opção Principal"}
        </span>
        {option.details && (
          <span className="font-normal normal-case text-[11px] italic opacity-80">
            {option.details}
          </span>
        )}
      </div>

      {matched ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-2/3">
                Alimento
              </th>
              <th className="text-right px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">
                Porção
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {foods.map((food, i) => (
              <tr
                key={i}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-3 py-2 text-slate-800 dark:text-slate-200 font-medium">
                  {food}
                </td>
                <td className="px-3 py-2 text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${pillBg}`}
                  >
                    {amounts[i]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        /* Fallback: food name spans all portion rows via rowSpan */
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <th className="text-left px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-2/3">
                Alimento
              </th>
              <th className="text-right px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/3">
                Porção
              </th>
            </tr>
          </thead>
          <tbody>
            {amounts.map((amount, i) => (
              <tr
                key={i}
                className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {i === 0 && (
                  <td
                    rowSpan={amounts.length}
                    className="px-3 py-2 text-slate-800 dark:text-slate-200 font-medium align-top leading-relaxed"
                  >
                    {option.name}
                  </td>
                )}
                <td className="px-3 py-2 text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${pillBg}`}
                  >
                    {amount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/** Full MealOptionTable: main option + collapsible alternatives */
const MealOptionTable: React.FC<Props> = ({
  mainOption,
  alternatives = [],
  accentColor = "sage",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2 mt-2">
      <OptionTable option={mainOption} accent={accentColor} />

      {alternatives.length > 0 && (
        <div>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
              accentColor === "sage"
                ? "text-sage-600 hover:text-sage-800 dark:text-sage-400"
                : "text-teal-600 hover:text-teal-800"
            }`}
          >
            <svg
              className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {open ? "Ocultar" : `Ver ${alternatives.length}`} alternativa
            {alternatives.length > 1 ? "s" : ""}
          </button>

          {open && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-slate-100 dark:border-slate-700">
              {alternatives.map((alt, i) => (
                <OptionTable
                  key={i}
                  option={alt}
                  accent={accentColor}
                  isAlternative
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealOptionTable;
