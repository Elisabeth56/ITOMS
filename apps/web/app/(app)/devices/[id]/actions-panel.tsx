"use client"

import { useActionState } from "react"
import type { AssetDetail, Person } from "@itoms/shared"
import { FormError } from "@/components/form-error"
import { Button } from "@/components/ui/button"
import { Field, Select, TextArea } from "@/components/ui/field"
import { changeDevice } from "../actions"

/** What IT can do with a device right now, given its status. */
export function DeviceActions({
  device,
  people,
  isAdmin,
}: {
  device: AssetDetail
  people: Person[]
  isAdmin: boolean
}) {
  const [state, action, pending] = useActionState(changeDevice.bind(null, device.id), {})
  const openTickets = device.tickets.filter((ticket) => ticket.status !== "closed")
  const available = device.status === "in_stock" || device.status === "in_use"

  return (
    <div className="flex flex-col gap-3">
      <FormError message={state.error} />

      {available && (
        <form action={action} className="flex flex-col gap-4 rounded-panel bg-surface p-6">
          <input type="hidden" name="$do" value="assign" />
          <Select label="Give this device to" name="employee_id" required defaultValue="">
            <option value="" disabled>
              Choose a person
            </option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
                {person.department ? `, ${person.department}` : ""}
              </option>
            ))}
          </Select>
          <Button variant="strong" disabled={pending}>
            Assign device
          </Button>
        </form>
      )}

      {device.holder_id && (
        <form action={action} className="flex flex-col gap-4 rounded-panel bg-surface p-6">
          <input type="hidden" name="$do" value="return" />
          <Field
            label={`Take it back from ${device.holder_name}`}
            name="condition_note"
            hint="Condition on return, if worth noting."
          />
          <Button variant="quiet" disabled={pending}>
            Mark as returned
          </Button>
        </form>
      )}

      {device.status !== "retired" && (
        <form
          action={action}
          key={device.maintenance.length}
          className="flex flex-col gap-4 rounded-panel bg-surface p-6"
        >
          <input type="hidden" name="$do" value="repair" />
          <p className="text-[19px] leading-[26px] font-medium tracking-[-0.01em]">Log a repair</p>
          <TextArea
            label="What was done"
            name="action"
            rows={3}
            required
            errors={state.fields?.action}
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
            <Field label="Parts used" name="parts" />
            <Field
              label="Cost in naira"
              name="cost"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              errors={state.fields?.cost}
            />
          </div>
          {openTickets.length > 0 && (
            <Select label="For ticket" name="ticket_id" defaultValue="">
              <option value="">No ticket</option>
              {openTickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.ref}: {ticket.title}
                </option>
              ))}
            </Select>
          )}
          <Select label="After this, the device is" name="status_after" defaultValue="">
            <option value="">Unchanged, the repair is still open</option>
            <option value="in_stock">Working: back to its holder, or into stock</option>
            <option value="in_use">Working: back in shared use</option>
          </Select>
          <Button disabled={pending}>Save repair</Button>
        </form>
      )}

      {device.status !== "retired" && (
        <form action={action} className="flex flex-wrap gap-2">
          <input type="hidden" name="$do" value="status" />
          {device.status !== "under_repair" && (
            <Button variant="quiet" name="status" value="under_repair" disabled={pending}>
              Send to the bench
            </Button>
          )}
          {isAdmin && !device.holder_id && (
            <Button variant="quiet" name="status" value="retired" disabled={pending}>
              Retire device
            </Button>
          )}
        </form>
      )}
    </div>
  )
}
