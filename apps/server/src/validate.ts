import type { RequestHandler } from "express"
import { z } from "zod"
import { AppError } from "./errors"

type Schemas = { body?: z.ZodType; query?: z.ZodType; params?: z.ZodType }

/** Parses the listed request parts and replaces them with the validated values. */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part]
      if (!schema) continue

      const result = schema.safeParse(req[part])
      if (!result.success) {
        const { fieldErrors, formErrors } = z.flattenError(result.error)
        throw new AppError(
          422,
          "validation_failed",
          formErrors[0] ?? "Some fields need attention.",
          {
            fields: fieldErrors,
          },
        )
      }
      // req.query is a read-only getter in Express 5, so redefine instead of assigning
      Object.defineProperty(req, part, { value: result.data, writable: true })
    }
    next()
  }
}

export const idParams = z.object({ id: z.uuid() })
