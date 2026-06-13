import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "../../i18n";
import MealOptionTable from "../MealOptionTable";
import type { MealOption } from "../../types";

describe("MealOptionTable Component", () => {
  const mockMainOption: MealOption = {
    name: "Frango, Arroz e Azeite",
    portion: "100g, 150g e 10g",
    calories: 550,
    protein: 35,
    carbs: 45,
    fat: 12,
    details: "grelhado saudável",
    clinicalWarnings: ["Sódio elevado"],
    items: [
      {
        name: "Peito de Frango Grelhado",
        portion: "100g",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
      },
      {
        name: "Arroz Integral Cozido",
        portion: "150g",
        calories: 180,
        protein: 4,
        carbs: 38,
        fat: 1.5,
      },
      {
        name: "Azeite de Oliva Extra Virgem",
        portion: "10g",
        calories: 90,
        protein: 0,
        carbs: 0,
        fat: 10,
        clinicalWarnings: ["Sódio elevado"],
      },
    ],
  };

  const mockAlternatives: MealOption[] = [
    {
      name: "Patinho, Macarrão e Abacate",
      portion: "100g, 150g e 30g",
      calories: 600,
      protein: 38,
      carbs: 50,
      fat: 14,
      details: "preparação leve",
      items: [
        {
          name: "Patinho Moído Grelhado",
          portion: "100g",
          calories: 220,
          protein: 32,
          carbs: 0,
          fat: 9,
        },
      ],
    },
  ];

  it("renders the main option foods, portions, macros and calories correctly", () => {
    render(
      <MealOptionTable
        mainOption={mockMainOption}
        alternatives={[]}
        accentColor="sage"
      />,
    );

    // Should display main option header
    expect(screen.getByText("Main Option")).toBeInTheDocument();
    expect(screen.getByText("P: 35g | C: 45g | G: 12g")).toBeInTheDocument();
    expect(screen.getByText("grelhado saudável")).toBeInTheDocument();

    // Should render food items
    expect(screen.getByText("Peito de Frango Grelhado")).toBeInTheDocument();
    expect(screen.getByText("Arroz Integral Cozido")).toBeInTheDocument();
    expect(
      screen.getByText("Azeite de Oliva Extra Virgem"),
    ).toBeInTheDocument();

    // Should render portion sizes
    expect(screen.getByText("100g")).toBeInTheDocument();
    expect(screen.getByText("150g")).toBeInTheDocument();
    expect(screen.getAllByText("10g").length).toBe(2);

    // Check calories of individual items
    expect(screen.getByText("165")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("renders clinical warnings for items that contain them", () => {
    render(
      <MealOptionTable
        mainOption={mockMainOption}
        alternatives={[]}
        accentColor="sage"
      />,
    );

    // Warning symbol should be visible
    expect(screen.getByText("⚠️")).toBeInTheDocument();

    // Clinical note text should render
    expect(screen.getByText("Clinical Note:")).toBeInTheDocument();
    expect(screen.getByText("Sódio elevado")).toBeInTheDocument();
  });

  it("handles collapsible alternatives correctly", () => {
    render(
      <MealOptionTable
        mainOption={mockMainOption}
        alternatives={mockAlternatives}
        accentColor="sage"
      />,
    );

    // Alternative button is visible
    const alternativeButton = screen.getByText("View 1 alternative");
    expect(alternativeButton).toBeInTheDocument();

    // Alternative content should not be visible initially
    expect(screen.queryByText("Alternative 1")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Patinho Moído Grelhado"),
    ).not.toBeInTheDocument();

    // Click the button to expand alternatives
    fireEvent.click(alternativeButton);

    // Alternative content should now be rendered
    expect(screen.getByText("Hide 1 alternative")).toBeInTheDocument();
    expect(screen.getByText("Alternative 1")).toBeInTheDocument();
    expect(screen.getByText("Patinho Moído Grelhado")).toBeInTheDocument();
  });

  it("renders legacy format correctly as fallback", () => {
    const legacyMainOption: MealOption = {
      name: "Frango, Arroz e Azeite",
      portion: "100g, 150g e 10g",
      calories: 550,
      protein: 35,
      carbs: 45,
      fat: 12,
    };

    render(
      <MealOptionTable
        mainOption={legacyMainOption}
        alternatives={[]}
        accentColor="sage"
      />,
    );

    // It should render foods and portions using fallback logic
    expect(screen.getByText("Frango")).toBeInTheDocument();
    expect(screen.getByText("Arroz")).toBeInTheDocument();
    expect(screen.getByText("Azeite")).toBeInTheDocument();

    expect(screen.getByText("100g")).toBeInTheDocument();
    expect(screen.getByText("150g")).toBeInTheDocument();
    expect(screen.getByText("10g")).toBeInTheDocument();
  });
});
