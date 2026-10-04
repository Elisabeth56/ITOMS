import type { ComponentProps, ReactNode } from "react"

const control =
  "w-full min-h-12 rounded-[12px] border-[1.5px] border-hairline bg-ground px-4 text-ink placeholder:text-ink-3"

type FieldProps = { label: string; name: string; hint?: string; errors?: string[] }

function Shell({ label, name, hint, errors, children }: FieldProps & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      {hint && <p className="text-sm text-ink-3">{hint}</p>}
      {children}
      {errors?.map((error) => (
        <p key={error} className="text-sm text-urgent">
          {error}
        </p>
      ))}
    </div>
  )
}

export function Field({ label, hint, errors, ...props }: FieldProps & ComponentProps<"input">) {
  return (
    <Shell label={label} name={props.name} hint={hint} errors={errors}>
      <input id={props.name} className={control} {...props} />
    </Shell>
  )
}

export function TextArea({
  label,
  hint,
  errors,
  ...props
}: FieldProps & ComponentProps<"textarea">) {
  return (
    <Shell label={label} name={props.name} hint={hint} errors={errors}>
      <textarea id={props.name} rows={4} className={`${control} py-3`} {...props} />
    </Shell>
  )
}

export function Select({
  label,
  hint,
  errors,
  children,
  ...props
}: FieldProps & ComponentProps<"select">) {
  return (
    <Shell label={label} name={props.name} hint={hint} errors={errors}>
      <select id={props.name} className={control} {...props}>
        {children}
      </select>
    </Shell>
  )
}
