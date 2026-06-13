import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

// No authenticated user -> no Firebase fetches (search/notifications stay idle).
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ currentUser: null }),
}));
vi.mock("../../services/firebaseService", () => ({
  getPatients: () => () => {},
  firebaseSignOut: vi.fn(),
  auth: {},
}));

// Initialize i18next (English default) so labels render translated.
import "../../i18n";
import Sidebar from "../Sidebar";

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );

describe("Sidebar", () => {
  it("renders all primary navigation links", () => {
    const { container } = renderSidebar();
    [
      "/dashboard",
      "/patients",
      "/calendar",
      "/diet-generator",
      "/metabolic-calculator",
      "/food-database",
      "/reports",
      "/email-admin",
    ].forEach((href) => {
      expect(container.querySelector(`a[href="${href}"]`)).toBeTruthy();
    });
  });

  it("renders labels in English by default (i18n wired)", () => {
    renderSidebar();
    expect(screen.getByText("Patients")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });
});
