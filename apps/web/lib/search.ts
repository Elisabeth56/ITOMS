"use server"

import type { SearchResults } from "@itoms/shared"
import { api } from "./api"

export async function search(q: string): Promise<SearchResults> {
  return api<SearchResults>(`/search?q=${encodeURIComponent(q)}`)
}
