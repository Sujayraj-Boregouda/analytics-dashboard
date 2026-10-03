import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Registration } from "../../types/api";
import { RegistrationsTable } from "./RegistrationsTable";

const rows: Registration[] = [
  {
    id: 1,
    attendeeName: "Asha Rao",
    attendeeEmail: "asha@example.com",
    amount: 500,
    status: "PAID",
    createdAt: "2026-09-20T10:00:00.000Z",
    eventName: "Hackathon",
  },
  {
    id: 2,
    attendeeName: "Vikram Shetty",
    attendeeEmail: "vikram@example.com",
    amount: 1000,
    status: "FAILED",
    createdAt: "2026-09-21T12:30:00.000Z",
    eventName: "Cricket Tournament",
  },
];

function setup() {
  const onSort = vi.fn();
  render(
    <RegistrationsTable
      items={rows}
      sortBy="createdAt"
      sortOrder="desc"
      onSort={onSort}
      refreshing={false}
    />,
  );
  return { onSort };
}

describe("RegistrationsTable", () => {
  it("shows one row per registration", () => {
    setup();

    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByText("asha@example.com")).toBeInTheDocument();
    // 1 header row + 2 data rows
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("shows the status as a word, not only a colour", () => {
    setup();

    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("tells screen readers which column is sorted", () => {
    setup();

    expect(screen.getByRole("columnheader", { name: /registered/i })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(screen.getByRole("columnheader", { name: /amount/i })).toHaveAttribute(
      "aria-sort",
      "none",
    );
  });

  it("asks to sort by a column when its header is clicked", async () => {
    const { onSort } = setup();

    await userEvent.click(screen.getByRole("button", { name: /amount/i }));

    expect(onSort).toHaveBeenCalledWith("amount");
  });
});