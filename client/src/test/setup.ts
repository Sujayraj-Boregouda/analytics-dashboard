import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Remove whatever the previous test drew, so tests can't affect each other
afterEach(() => {
  cleanup();
});