import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

function setup(page: number) {
  const onPageChange = vi.fn();
  render(
    <Pagination page={page} pageSize={20} total={739} totalPages={37} onPageChange={onPageChange} />,
  );
  return { onPageChange };
}

describe("Pagination", () => {
  it("shows which rows are on screen", () => {
    setup(2);

    expect(screen.getByText("21–40")).toBeInTheDocument();
    expect(screen.getByText("739")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 37")).toBeInTheDocument();
  });

  it("shows a shorter range on the last page", () => {
    setup(37);

    expect(screen.getByText("721–739")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last", () => {
    setup(1);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("asks for the next page when Next is clicked", async () => {
    const { onPageChange } = setup(2);

    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});