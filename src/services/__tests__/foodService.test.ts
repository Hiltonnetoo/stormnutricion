import { describe, it, expect } from "vitest";
import type { Food } from "../../types";
import {
  getNovaGroup,
  getAvailableCarbs,
  glycemicLoad,
  giLevel,
  glLevel,
  NOVA_LABELS,
} from "../foodService";

/** Builds a Food with sane defaults so each test only sets what it asserts. */
const food = (overrides: Partial<Food>): Food => ({
  id: "t",
  name: "Test",
  category: "Cereais e Derivados",
  portion: "100",
  unit: "g",
  calories: 100,
  protein: 1,
  carbs: 20,
  fat: 1,
  fiber: 1,
  sodium: 1,
  ...overrides,
});

describe("foodService — NOVA classification", () => {
  it("respects an explicit novaGroup over inference", () => {
    expect(getNovaGroup(food({ novaGroup: 2, category: "Frutas" }))).toBe(2);
  });

  it("flags ultraprocessed foods by name hint", () => {
    expect(
      getNovaGroup(
        food({ name: "Salsicha de frango", category: "Carnes e Derivados" }),
      ),
    ).toBe(4);
    expect(
      getNovaGroup(food({ name: "Refrigerante de cola", category: "Bebidas" })),
    ).toBe(4);
    expect(
      getNovaGroup(
        food({ name: "Margarina cremosa", category: "Óleos e Gorduras" }),
      ),
    ).toBe(4);
  });

  it("classifies whole/minimally processed foods as NOVA 1", () => {
    expect(getNovaGroup(food({ name: "Maçã", category: "Frutas" }))).toBe(1);
    expect(
      getNovaGroup(
        food({ name: "Arroz integral", category: "Cereais e Derivados" }),
      ),
    ).toBe(1);
    expect(
      getNovaGroup(food({ name: "Lentilha cozida", category: "Leguminosas" })),
    ).toBe(1);
    expect(
      getNovaGroup(
        food({ name: "Peito de frango", category: "Carnes e Derivados" }),
      ),
    ).toBe(1);
    expect(
      getNovaGroup(
        food({ name: "Leite integral", category: "Leite e Derivados" }),
      ),
    ).toBe(1);
  });

  it("classifies bread/biscuits in cereals as processed (NOVA 3)", () => {
    expect(
      getNovaGroup(
        food({ name: "Pão francês", category: "Cereais e Derivados" }),
      ),
    ).toBe(3);
    expect(
      getNovaGroup(
        food({ name: "Torrada integral", category: "Cereais e Derivados" }),
      ),
    ).toBe(3);
  });

  it("classifies cheese/yogurt (dairy, not milk) as processed (NOVA 3)", () => {
    expect(
      getNovaGroup(
        food({ name: "Queijo minas frescal", category: "Leite e Derivados" }),
      ),
    ).toBe(3);
  });

  it("classifies culinary oils as NOVA 2 and butter as NOVA 3", () => {
    expect(
      getNovaGroup(
        food({ name: "Azeite de oliva", category: "Óleos e Gorduras" }),
      ),
    ).toBe(2);
    expect(
      getNovaGroup(
        food({ name: "Manteiga com sal", category: "Óleos e Gorduras" }),
      ),
    ).toBe(3);
  });

  it("classifies refined sugars/sweets", () => {
    expect(
      getNovaGroup(
        food({ name: "Açúcar refinado", category: "Açúcares e Doces" }),
      ),
    ).toBe(2);
    expect(
      getNovaGroup(
        food({ name: "Doce de abóbora", category: "Açúcares e Doces" }),
      ),
    ).toBe(4);
  });

  it("classifies anything in Industrializados as ultraprocessed", () => {
    expect(
      getNovaGroup(
        food({ name: "Lasanha congelada", category: "Industrializados" }),
      ),
    ).toBe(4);
  });

  it("treats Preparações (home-cooked dishes) as processed (NOVA 3)", () => {
    expect(
      getNovaGroup(food({ name: "Feijoada", category: "Preparações" })),
    ).toBe(3);
  });

  it("exposes a label and tone for every NOVA group", () => {
    ([1, 2, 3, 4] as const).forEach((g) => {
      expect(NOVA_LABELS[g].short).toBeTruthy();
      expect(NOVA_LABELS[g].full).toBeTruthy();
      expect(NOVA_LABELS[g].tone).toContain("bg-");
    });
  });
});

describe("foodService — glycemic load", () => {
  it("computes available carbs as total carbs minus fiber (never negative)", () => {
    expect(getAvailableCarbs(food({ carbs: 30, fiber: 9 }))).toBe(21);
    expect(getAvailableCarbs(food({ carbs: 2, fiber: 5 }))).toBe(0);
  });

  it("computes glycemic load as GI × available carbs ÷ 100", () => {
    // GI 55, carbs 66, fiber 9 -> avail 57 -> 55*57/100 = 31.35 -> 31
    expect(glycemicLoad(food({ glycemicIndex: 55, carbs: 66, fiber: 9 }))).toBe(
      31,
    );
  });

  it("returns undefined glycemic load when GI is unknown", () => {
    expect(glycemicLoad(food({ glycemicIndex: undefined }))).toBeUndefined();
  });

  it("classifies glycemic index into low/medium/high bands", () => {
    expect(giLevel(50)).toBe("low");
    expect(giLevel(60)).toBe("medium");
    expect(giLevel(80)).toBe("high");
    expect(giLevel(undefined)).toBeNull();
  });

  it("classifies glycemic load into low/medium/high bands", () => {
    expect(glLevel(8)).toBe("low");
    expect(glLevel(15)).toBe("medium");
    expect(glLevel(25)).toBe("high");
    expect(glLevel(undefined)).toBeNull();
  });
});
