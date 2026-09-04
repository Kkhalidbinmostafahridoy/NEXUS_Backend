export class AppError extends Error {
  public readonly status: "failed" | "error";
  public readonly isOperational = true;
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.status = statusCode >= 400 && statusCode < 500 ? "failed" : "error";
    Error.captureStackTrace(this, AppError);
  }
}
