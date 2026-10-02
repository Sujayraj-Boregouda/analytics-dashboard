import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback(callback: (value: string) => void, delayMs: number) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<number | undefined>(undefined);

  // Always keep the newest version of the callback
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Stop any waiting timer when the component goes away
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const run = useCallback(
    (value: string) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => callbackRef.current(value), delayMs);
    },
    [delayMs],
  );

  const cancel = useCallback(() => window.clearTimeout(timerRef.current), []);

  return { run, cancel };
}