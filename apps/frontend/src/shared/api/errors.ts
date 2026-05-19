export class ApiError extends Error {
  code: string;
  status: number;
  statusText: string;
  body: {
    error: string;
    code: string;
    status: number;
    details?: unknown;
  };

  constructor(
    status: number,
    statusText: string,
    body: {
      error: string;
      code: string;
      status: number;
      details?: unknown;
    },
  ) {
    super(body.error || `API Error ${status}: ${statusText}`);
    this.code = body.code || "UNKNOWN_ERROR";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}
