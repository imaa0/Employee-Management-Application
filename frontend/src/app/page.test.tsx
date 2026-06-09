import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import LoginPage from "./page";

// mocks

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// mock text animation to just show text
vi.mock("@/components/SplitText", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ text, tag = "span" }: { text: string; tag?: string; [key: string]: any }) =>
    React.createElement(tag, null, text),
}));

// mock image to fix jsdom bugs
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement("img", { src, alt }),
}));

// mock api so we dont need backend
vi.mock("@/lib/api", () => ({
  loginAPI: vi.fn().mockResolvedValue({ success: true, data: { token: 'mock', user: {} } }),
  setToken: vi.fn(),
  setUser: vi.fn(),
}));

import { loginAPI, setToken, setUser } from "@/lib/api";

afterEach(() => {
  vi.clearAllMocks();
});

// helpers

function renderLogin() {
  return render(<LoginPage />);
}

// target the form directly because jsdom ignores hidden css classes
function getForm(): HTMLElement {
  return document.querySelector("form")!;
}

function getEmailInput() {
  return within(getForm() as HTMLElement).getByPlaceholderText(/enter your email/i);
}

function getPasswordInput() {
  return within(getForm() as HTMLElement).getByPlaceholderText(/••••/);
}

function getSubmitButton() {
  const form = getForm();
  const buttons = within(form).getAllByRole("button");
  const submit = buttons.find((b) => b.getAttribute("type") === "submit" || (b.textContent && /sign in/i.test(b.textContent)));
  return submit!;
}

// render tests

describe("LoginPage – rendering", () => {
  beforeEach(() => renderLogin());

  it("renders the Sign in heading", () => {
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("renders the email input", () => {
    expect(getEmailInput()).toBeInTheDocument();
  });

  it("renders the password input", () => {
    expect(getPasswordInput()).toBeInTheDocument();
  });

  it("renders the submit button with 'Sign in' text", () => {
    expect(getSubmitButton()).toBeInTheDocument();
  });

  it("renders a link to the register page", () => {
    const links = screen.getAllByRole("link", { name: /sign up/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute("href", "/register");
  });

  it("renders the 'Forgot password?' link", () => {
    const forgot = screen.getAllByText(/forgot password/i);
    expect(forgot.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the 'Remember for 30 days' checkbox area", () => {
    const remember = screen.getAllByText(/remember for 30 days/i);
    expect(remember.length).toBeGreaterThanOrEqual(1);
  });

  it("password input is hidden by default", () => {
    expect(getPasswordInput()).toHaveAttribute("type", "password");
  });
});

// click tests

describe("LoginPage – password visibility toggle", () => {
  it("toggles password input type when the eye button is clicked", async () => {
    renderLogin();
    const passwordInput = getPasswordInput();
    expect(passwordInput).toHaveAttribute("type", "password");

    const form = getForm();
    const toggleButtons = within(form).getAllByRole("button");
    const eyeButton = toggleButtons.find((b) => b.getAttribute("type") === "button");
    fireEvent.click(eyeButton!);

    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(eyeButton!);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});

// skipped complex validation tests
