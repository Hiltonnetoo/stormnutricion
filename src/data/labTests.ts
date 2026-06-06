import { LabTest } from "../types";

export interface LabCategory {
  id: string;
  name: string;
  icon: string;
  tests: {
    name: string;
    unit: string;
    min?: number;
    max?: number;
    description?: string;
  }[];
}

export const labCategories: LabCategory[] = [
  {
    id: "hemogram",
    name: "Hemograma Completo",
    icon: "🩸",
    tests: [
      { name: "Hemoglobina", unit: "g/dL", min: 12, max: 16 },
      { name: "Hematócrito", unit: "%", min: 36, max: 48 },
      { name: "Leucócitos", unit: "/mm3", min: 4000, max: 11000 },
      { name: "Plaquetas", unit: "/mm3", min: 150000, max: 450000 },
    ],
  },
  {
    id: "lipid",
    name: "Perfil Lipídico",
    icon: "🫀",
    tests: [
      { name: "Colesterol Total", unit: "mg/dL", max: 190 },
      { name: "LDL-Colesterol", unit: "mg/dL", max: 130 },
      { name: "HDL-Colesterol", unit: "mg/dL", min: 40 },
      { name: "Triglicerídeos", unit: "mg/dL", max: 150 },
    ],
  },
  {
    id: "glucose",
    name: "Glicemia / Metabolismo",
    icon: "🍬",
    tests: [
      { name: "Glicemia de Jejum", unit: "mg/dL", min: 70, max: 99 },
      { name: "Hemoglobina Glicada", unit: "%", max: 5.7 },
      { name: "Insulina de Jejum", unit: "uUI/mL", min: 2, max: 25 },
    ],
  },
  {
    id: "renal",
    name: "Função Renal",
    icon: "🫘",
    tests: [
      { name: "Creatinina", unit: "mg/dL", min: 0.7, max: 1.3 },
      { name: "Ureia", unit: "mg/dL", min: 15, max: 45 },
      { name: "Ácido Úrico", unit: "mg/dL", min: 2.4, max: 6.0 },
    ],
  },
  {
    id: "hepatic",
    name: "Função Hepática",
    icon: "🫁",
    tests: [
      { name: "TGO / AST", unit: "U/L", max: 40 },
      { name: "TGP / ALT", unit: "U/L", max: 40 },
      { name: "Gama-GT", unit: "U/L", max: 60 },
    ],
  },
  {
    id: "vitamins",
    name: "Ferro e Vitaminas",
    icon: "🔴",
    tests: [
      { name: "Vitamina D", unit: "ng/mL", min: 30, max: 100 },
      { name: "Vitamina B12", unit: "pg/mL", min: 200, max: 900 },
      { name: "Ferritina", unit: "ng/mL", min: 30, max: 400 },
      { name: "Ferro Sérico", unit: "mcg/dL", min: 60, max: 170 },
    ],
  },
];

export const interpretTest = (
  name: string,
  value: string,
): LabTest["status"] => {
  const numValue = parseFloat(value.replace(",", "."));
  if (isNaN(numValue)) return "normal";

  const testDef = labCategories
    .flatMap((c) => c.tests)
    .find((t) => t.name === name);
  if (!testDef) return "normal";

  if (testDef.min !== undefined && numValue < testDef.min) return "alert";
  if (testDef.max !== undefined && numValue > testDef.max) return "alert";

  return "normal";
};
