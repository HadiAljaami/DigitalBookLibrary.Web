/*
  Shapes shared by every endpoint. Verified against the running backend — the API wraps every
  response in ApiResponse and returns lists as PagedResult. `message`/`errors` are stable CODES,
  not display text (the UI translates them).
*/

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
};

export type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

/** Base query string for any paged endpoint. */
export type PaginationParams = {
  pageNumber?: number;
  pageSize?: number;
};

/** Thrown by the API client when the backend returns an error envelope or a transport error fails. */
export class ApiError extends Error {
  constructor(
    /** Primary stable error code, e.g. "AUTH_INVALID_CREDENTIALS". */
    public readonly code: string,
    /** All error codes returned in the envelope. */
    public readonly errors: string[],
    public readonly status?: number,
  ) {
    super(code);
    this.name = "ApiError";
  }
}
