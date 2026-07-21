import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { type ApiResponse } from "@/types/api";
import { ApiError } from "@/types/api";
import { tokenStorage } from "./token-storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

/** Called when refresh fails, so the app can send the user back to the login page. */
let onAuthExpired: (() => void) | null = null;
export function setAuthExpiredHandler(handler: () => void) {
  onAuthExpired = handler;
}

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Attach the access token; let axios set the multipart boundary for uploads ---
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // FormData needs a multipart Content-Type with a boundary axios generates itself, so drop the
  // instance's JSON default for these requests.
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  return config;
});

// --- Single-flight refresh: concurrent 401s share one refresh call ---
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error("no refresh token");

  // A bare axios call (not `client`) so this request skips the interceptors below.
  const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );
  if (!data.success) throw new Error(data.errors[0] ?? "refresh failed");

  tokenStorage.setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data.accessToken;
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    // On a 401, try one transparent refresh, then replay the original request.
    const isAuthEndpoint = original?.url?.includes("/auth/");
    if (error.response?.status === 401 && original && !original._retried && !isAuthEndpoint) {
      original._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch {
        tokenStorage.clear();
        onAuthExpired?.();
      }
    }

    return Promise.reject(error);
  },
);

/** Unwraps the ApiResponse envelope; throws ApiError on an error envelope or transport failure. */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await client.request<ApiResponse<T>>(config);
    const body = response.data;
    if (!body.success) {
      throw new ApiError(body.errors[0] ?? body.message, body.errors, response.status);
    }
    return body.data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const axErr = err as AxiosError<ApiResponse<unknown>>;
    const body = axErr.response?.data;
    if (body && typeof body === "object" && "errors" in body) {
      throw new ApiError(body.errors?.[0] ?? body.message ?? "ERROR", body.errors ?? [], axErr.response?.status);
    }
    throw new ApiError("NETWORK_ERROR", [], axErr.response?.status);
  }
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) => request<T>({ method: "GET", url, params }),
  post: <T>(url: string, data?: unknown) => request<T>({ method: "POST", url, data }),
  put: <T>(url: string, data?: unknown) => request<T>({ method: "PUT", url, data }),
  patch: <T>(url: string, data?: unknown) => request<T>({ method: "PATCH", url, data }),
  delete: <T>(url: string) => request<T>({ method: "DELETE", url }),

  /** Posts a single file as multipart/form-data under the given field name. */
  upload: <T>(url: string, file: File, field = "file") => {
    const form = new FormData();
    form.append(field, file);
    return request<T>({ method: "POST", url, data: form });
  },

  /** Fetches a binary response (e.g. a PDF) as a Blob, with the auth header applied. */
  blob: (url: string) =>
    client.request<Blob>({ method: "GET", url, responseType: "blob" }).then((r) => r.data),
};
