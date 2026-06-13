import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Avoid hitting the AuthContext / Firebase: the section only needs a uid + count.
vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({ currentUser: { uid: "u1" } }),
}));
vi.mock("../../../services/firebaseService", () => ({
  getPatientsCount: (_uid: string, cb: (n: number) => void) => {
    cb(2);
    return () => {};
  },
}));

// Initialize i18next (English default) so labels render translated.
import "../../../i18n";
import BillingSection from "../BillingSection";

describe("BillingSection", () => {
  // billingService persists to localStorage; reset so each test starts on the
  // default (Pro / active) plan.
  beforeEach(() => localStorage.clear());

  it("renders the active plan and the three tiers", () => {
    render(<BillingSection />);
    expect(screen.getByText("Plan & Billing")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("Clinic")).toBeInTheDocument();
  });

  it("asks for confirmation before upgrading the plan", () => {
    render(<BillingSection />);
    fireEvent.click(screen.getByText("Upgrade"));
    expect(screen.getByText(/Switch to Clinic plan/)).toBeInTheDocument();
  });

  it("asks for confirmation before cancelling the subscription", () => {
    render(<BillingSection />);
    fireEvent.click(screen.getByText("Cancel subscription"));
    expect(screen.getByText(/will be canceled/)).toBeInTheDocument();
  });
});
