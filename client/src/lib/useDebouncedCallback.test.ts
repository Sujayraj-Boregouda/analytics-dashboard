import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedCallback } from "./useDebouncedCallback";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits until typing stops, then runs once with the latest value", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current.run("h");
      result.current.run("ha");
      result.current.run("hack");
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("hack");
  });

  it("restarts the wait on every new keystroke", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current.run("h");
      vi.advanceTimersByTime(200);
      result.current.run("ha");
      vi.advanceTimersByTime(200);
    });
    // 400 ms have passed in total, but only 200 ms since the last keystroke
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(callback).toHaveBeenCalledWith("ha");
  });

  it("does nothing if it's cancelled before the wait is over", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current.run("hack");
      result.current.cancel();
      vi.advanceTimersByTime(300);
    });
    expect(callback).not.toHaveBeenCalled();
  });
});