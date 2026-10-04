"use client"

import { useActionState } from "react"
import { assetTypes } from "@itoms/shared"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Field, Select } from "@/components/ui/field"
import { label } from "@/lib/format"
import { createDevice } from "../actions"

export function NewDeviceForm() {
  const [state, action, pending] = useActionState(createDevice, {})
  const errors = state.fields ?? {}
  return (
    <form action={action} className="mx-auto flex w-full max-w-[680px] flex-col gap-6">
      <h1 className="text-[44px] leading-[48px] font-medium tracking-[-0.025em]">Add a device.</h1>
      <div className="flex flex-col gap-4 rounded-panel bg-surface p-6">
        <Field
          label="Asset tag"
          name="asset_tag"
          hint="As printed on the sticker, for example LAP-0046."
          required
          errors={errors.asset_tag}
        />
        <Select label="Type" name="type" required errors={errors.type}>
          {assetTypes.map((type) => (
            <option key={type} value={type}>
              {label(type)}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <Field label="Brand" name="brand" errors={errors.brand} />
          <Field label="Model" name="model" errors={errors.model} />
          <Field label="Serial number" name="serial_number" errors={errors.serial_number} />
          <Field label="Bought on" name="purchase_date" type="date" errors={errors.purchase_date} />
        </div>
        <Field
          label="Location"
          name="location"
          hint="Where it is kept or used."
          errors={errors.location}
        />
        <Select label="Right now it is" name="status" defaultValue="in_stock">
          <option value="in_stock">In stock, waiting to be given out</option>
          <option value="in_use">In use and shared (a printer, an access point)</option>
        </Select>
      </div>
      <FormError message={state.error} />
      <Button variant="strong" disabled={pending} className="min-h-12 self-start px-7">
        {pending ? "Saving" : "Add device"}
      </Button>
    </form>
  )
}
