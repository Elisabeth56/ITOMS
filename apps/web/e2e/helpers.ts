import { expect, type Browser, type Page } from "@playwright/test"

export const accounts = {
  employee: "adaeze.okafor@itoms.example",
  staff: "chidi.eze@itoms.example",
  admin: "amaka.obi@itoms.example",
}
const password = "itoms-demo-2026"

/** Signs in through the real form in a fresh browser context. */
export async function signIn(browser: Browser, email: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage()
  await page.goto("/sign-in")
  await page.getByLabel("Work email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/(home|tickets)/)
  return page
}
