"use client"

import { useActionState } from "react"
import type { AssetDetail } from "@itoms/shared"
import { requestChange } from "@/app/(app)/devices/actions"
import { FormError } from "./form-error"
import { Button } from "./ui/button"
import { Field } from "./ui/field"

/**
 * Lets the holder suggest corrections to their device. IT approves them before they
 * change the register. Shows the waiting request instead when there is one.
 */
export function ChangeRequestForm({ device }: { device: AssetDetail }) {
  const [state, action, pending] = useActionState(requestChange.bind(null, device.id), {})

  if (device.pending_change) {
    return (
      <div className="flex flex-col gap-2 rounded-card bg-butter p-6 text-on-butter">
        <h2 className="text-lg font-medium text-ink">Waiting for IT</h2>
        <p>
          You asked to change{" "}
          {Object.entries(device.pending_change.proposed)
            .map(([field, value]) => `${field.replace("_", " ")} to ${value}`)
            .join(", ")}
          . IT will approve or reject it.
        </p>
      </div>
    )
  }

  return (
    <form action={action} id="change" className="flex flex-col gap-4 rounded-card bg-surface p-6">
      <div>
        <h2 className="text-lg font-medium">Something wrong with these details?</h2>
        <p className="text-sm text-ink-3">
          Fill in only what changed. IT checks it before the record is updated.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Location"
          name="location"
          placeholder={device.location ?? "3rd floor, Accounts"}
          errors={state.fields?.location}
        />
        <Field
          label="Serial number"
          name="serial_number"
          placeholder={device.serial_number ?? ""}
          errors={state.fields?.serial_number}
        />
        <Field
          label="Brand"
          name="brand"
          placeholder={device.brand ?? ""}
          errors={state.fields?.brand}
        />
        <Field
          label="Model"
          name="model"
          placeholder={device.model ?? ""}
          errors={state.fields?.model}
        />
      </div>
      <Field label="Note for IT" name="note" placeholder="Moved upstairs with my team" />
      <FormError message={state.error} />
      <Button variant="strong" disabled={pending} className="self-start">
        {pending ? "Sending" : "Send to IT"}
      </Button>
    </form>
  )
}
