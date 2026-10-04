import { requireStaff } from "@/lib/api"
import { NewDeviceForm } from "./form"

export const metadata = { title: "Add device" }

export default async function NewDevicePage() {
  await requireStaff()
  return <NewDeviceForm />
}
