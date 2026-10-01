import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

type Result<T> = {
  key: string;
  data: T | null;
  error: Error | null;
};

export function useApiData<T>(path: string) {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  // A label for "this exact request". It changes when the path changes or on reload.
  const key = `${path}#${reloadCount}`;

  useEffect(() => {
    const controller = new AbortController();

    api
      .get<T>(path, controller.signal)
      .then((data) => setResult({ key, data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof Error ? err : new Error("Something went wrong");
        setResult((prev) => ({ key, data: prev?.data ?? null, error }));
      });

    return () => controller.abort();
  }, [path, key]);

  const reload = useCallback(() => setReloadCount((n) => n + 1), []);
  const loading = result?.key !== key;

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    reload,
  };
}