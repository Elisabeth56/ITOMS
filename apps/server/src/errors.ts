import type { ErrorRequestHandler, RequestHandler } from "express"
import type { ApiError } from "@itoms/shared"

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message)
  }
}

export const notFound: RequestHandler = () => {
  throw new AppError(404, "not_found", "That page does not exist.")
}

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof AppError) {
    // details on a server-side failure are for the log, not the client
    const isServerFault = error.status >= 500
    if (isServerFault) req.log.error({ code: error.code, details: error.details })
    const body: ApiError = {
      error: {
        code: error.code,
        message: error.message,
        details: isServerFault ? undefined : error.details,
      },
    }
    res.status(error.status).json(body)
    return
  }

  // malformed JSON bodies surface from express.json() with a 400 status
  if (error?.type === "entity.parse.failed") {
    res
      .status(400)
      .json({ error: { code: "invalid_json", message: "The request body is not valid JSON." } })
    return
  }

  req.log.error(error)
  res
    .status(500)
    .json({ error: { code: "internal_error", message: "Something went wrong on our side." } })
}
