import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/context";
import type { AuthState } from "../auth/context";
import { ApiError } from "../lib/api";
import type { User } from "../types/api";
import { LoginPage } from "./LoginPage";

// Draw the login page with a pretend "logged out" notice board
function renderLogin(login: AuthState["login"]) {
  const auth: AuthState = {
    user: null,
    status: "anonymous",
    login,
    logout: async () => {},
    retry: () => {},
  };

  render(
    <MemoryRouter>
      <AuthContext.Provider value={auth}>
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

// Recreate the moment just after someone signs in, with a leftover note saying where to go
function renderJustSignedIn(user: User, savedPage: string) {
  const auth: AuthState = {
    user,
    status: "authenticated",
    login: async () => {},
    logout: async () => {},
    retry: () => {},
  };

  render(
    <MemoryRouter initialEntries={[{ pathname: "/login", state: { from: savedPage } }]}>
      <AuthContext.Provider value={auth}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<p>Overview page</p>} />
          <Route path="/registrations" element={<p>Registrations page</p>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
}

async function fillAndSubmit(email: string, password: string) {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginPage", () => {
  it("sends the typed email and password", async () => {
    const login = vi.fn<AuthState["login"]>().mockResolvedValue(undefined);
    renderLogin(login);

    await fillAndSubmit("admin@demo.com", "admin123");

    expect(login).toHaveBeenCalledWith("admin@demo.com", "admin123");
    expect(await screen.findByRole("button", { name: "Sign in" })).toBeEnabled();
  });

  it("shows a friendly message for a wrong password", async () => {
    const login = vi
      .fn<AuthState["login"]>()
      .mockRejectedValue(new ApiError(401, "Invalid email or password"));
    renderLogin(login);

    await fillAndSubmit("admin@demo.com", "wrong");

    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong email or password.");
  });

  it("explains when the server is down instead of blaming the password", async () => {
    const login = vi.fn<AuthState["login"]>().mockRejectedValue(new ApiError(502, "Bad Gateway"));
    renderLogin(login);

    await fillAndSubmit("admin@demo.com", "admin123");

    expect(await screen.findByRole("alert")).toHaveTextContent("The server isn't responding.");
  });
});

describe("LoginPage: where people land after signing in", () => {
  const viewer: User = { id: 2, email: "viewer@demo.com", role: "VIEWER" };
  const admin: User = { id: 1, email: "admin@demo.com", role: "ADMIN" };

  it("sends a viewer to the overview, even if the saved page was admin-only", async () => {
    renderJustSignedIn(viewer, "/registrations");

    expect(await screen.findByText("Overview page")).toBeInTheDocument();
    expect(screen.queryByText("Registrations page")).not.toBeInTheDocument();
  });

  it("still returns an admin to the page they were on", async () => {
    renderJustSignedIn(admin, "/registrations");

    expect(await screen.findByText("Registrations page")).toBeInTheDocument();
  });
});