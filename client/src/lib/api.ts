export class ApiError extends Error {
    status: number;
  
    constructor(status: number, message: string) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }
  
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: { "Content-Type": "application/json" },
    });
  
    if (!res.ok) {
      const body: unknown = await res.json().catch(() => null);
      const message =
        typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
          ? body.error
          : `Request failed (${res.status})`;
      throw new ApiError(res.status, message);
    }
  
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
  
  export const api = {
    get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  };