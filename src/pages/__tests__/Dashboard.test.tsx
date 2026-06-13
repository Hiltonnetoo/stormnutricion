import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

// The user object MUST be a stable reference: Dashboard's effect depends on
// [currentUser], so returning a fresh object each render would loop forever.
vi.mock("../../contexts/AuthContext", () => {
  const user = { uid: "u1", displayName: "Maria Silva" };
  return { useAuth: () => ({ currentUser: user }) };
});

// Every Firestore subscription resolves immediately with empty/zero data so the
// dashboard renders its onboarding/empty state deterministically.
// NOTE: vi.mock is hoisted, so the helpers must live inside the factory.
vi.mock("../../services/firebaseService", () => {
  const zeroCount = (_uid: string, cb: (n: number) => void) => {
    cb(0);
    return () => {};
  };
  const emptyList = (_uid: string, cb: (rows: unknown[]) => void) => {
    cb([]);
    return () => {};
  };
  return {
    getPatientsCount: zeroCount,
    getActivePatientsCount: zeroCount,
    getNewPatientsThisMonthCount: zeroCount,
    getDietsCount: zeroCount,
    getDietsThisMonthCount: zeroCount,
    getAllDiets: emptyList,
    getPatients: emptyList,
  };
});

import "../../i18n";
import Dashboard from "../Dashboard";

describe("Dashboard", () => {
  it("greets the logged-in professional by name", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    // greeting interpolates the first name regardless of the active language
    expect(screen.getByText(/Maria/)).toBeInTheDocument();
  });

  it("renders without crashing when there is no data yet", () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    // Stat cards grid is present even in the empty state
    expect(container.querySelector(".stagger")).toBeTruthy();
  });
});
