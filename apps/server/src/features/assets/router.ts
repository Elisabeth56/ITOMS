import { Router } from "express"
import {
  assignAssetSchema,
  createAssetSchema,
  createMaintenanceSchema,
  listAssetsQuerySchema,
  returnAssetSchema,
  updateAssetSchema,
  type ListAssetsQuery,
} from "@itoms/shared"
import { requireRole } from "../../auth"
import { idParams, validate } from "../../validate"
import {
  assignAsset,
  createAsset,
  getAsset,
  listAssets,
  listMyAssets,
  logMaintenance,
  returnAsset,
  updateAsset,
} from "./logic"

export const assetsRouter = Router()
const staff = requireRole("it_staff")
const id = validate({ params: idParams })

// employees: their own devices only
assetsRouter.get("/mine", async (req, res) => {
  res.json(await listMyAssets(req.user))
})
assetsRouter.get("/:id", id, async (req, res) => {
  res.json(await getAsset(req.user, req.params.id as string))
})

// everything below is IT staff work
assetsRouter.get("/", staff, validate({ query: listAssetsQuerySchema }), async (req, res) => {
  res.json(await listAssets(req.query as unknown as ListAssetsQuery))
})
assetsRouter.post("/", staff, validate({ body: createAssetSchema }), async (req, res) => {
  res.status(201).json(await createAsset(req.body))
})
assetsRouter.patch("/:id", staff, id, validate({ body: updateAssetSchema }), async (req, res) => {
  res.json(await updateAsset(req.user, req.params.id as string, req.body))
})
assetsRouter.post(
  "/:id/assign",
  staff,
  id,
  validate({ body: assignAssetSchema }),
  async (req, res) => {
    res.json(await assignAsset(req.user, req.params.id as string, req.body.employee_id))
  },
)
assetsRouter.post(
  "/:id/return",
  staff,
  id,
  validate({ body: returnAssetSchema }),
  async (req, res) => {
    res.json(await returnAsset(req.params.id as string, req.body.condition_note))
  },
)
assetsRouter.post(
  "/:id/maintenance",
  staff,
  id,
  validate({ body: createMaintenanceSchema }),
  async (req, res) => {
    res.status(201).json(await logMaintenance(req.user, req.params.id as string, req.body))
  },
)
