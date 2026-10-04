/** The message a form shows when the server refuses it. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-tag bg-urgent-tint px-4 py-3 text-urgent">
      {message}
    </p>
  )
}
