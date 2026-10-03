import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../auth/context";
import type { AuthState } from "../auth/context";
import { ApiError } from "../lib/api";
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