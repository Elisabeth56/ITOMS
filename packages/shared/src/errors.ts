/** Error body every API endpoint returns. `code` is stable; `message` is safe to show. */
export type ApiError = {
  error: { code: string; message: string; details?: Record<string, unknown> }
}
