// Device vocabulary and request schemas, shared by the web app and the API.
import { z } from "zod"

export const assetTypes = [
  "laptop",
  "desktop",
  "printer",
  "monitor",
  "network_device",
  "phone",
  "other",
] as const
// in_use: a shared device that is working but has no single holder (a printer, an access point)
export const assetStatuses = ["in_stock", "assigned", "in_use", "under_repair", "retired"] as const

export type AssetType = (typeof assetTypes)[number]
export type AssetStatus = (typeof assetStatuses)[number]

const text = (max: number) => z.string().trim().min(1).max(max)

export const createAssetSchema = z.object({
  asset_tag: text(30),
  type: z.enum(assetTypes),
  brand: text(80).optional(),
  model: text(80).optional(),
  serial_number: text(80).optional(),
  location: text(120).optional(),
  purchase_date: z.iso.date().optional(),
  status: z.enum(["in_stock", "in_use"]).default("in_stock"),
})

// "assigned" is set by assigning the device to someone, never directly
export const updateAssetSchema = createAssetSchema
  .omit({ status: true })
  .extend({ status: z.enum(["in_stock", "in_use", "under_repair", "retired"]) })
  .partial()
  .refine((input) => Object.keys(input).length > 0, "Nothing to update")

export const listAssetsQuerySchema = z.object({
  type: z.enum(assetTypes).optional(),
  status: z.enum(assetStatuses).optional(),
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(24),
})

export const assignAssetSchema = z.object({ employee_id: z.uuid() })
export const returnAssetSchema = z.object({ condition_note: text(500).optional() })

export const createMaintenanceSchema = z.object({
  action: text(1000),
  parts: text(300).optional(),
  cost: z.number().min(0).max(100_000_000).optional(), // naira
  ticket_id: z.uuid().optional(),
  // where the device goes once this work is logged; leave out while the repair is still open
  status_after: z.enum(["in_stock", "in_use", "retired"]).optional(),
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type ListAssetsQuery = z.infer<typeof listAssetsQuerySchema>
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
