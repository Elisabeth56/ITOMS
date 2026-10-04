import type { Asset } from "@itoms/shared"
import { api } from "@/lib/api"
import { NewTicketForm } from "./form"

export const metadata = { title: "New request" }

export default async function NewTicketPage() {
  const devices = await api<Asset[]>("/assets/mine")
  return <NewTicketForm devices={devices} />
}
