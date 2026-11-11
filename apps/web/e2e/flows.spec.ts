import { expect, test } from "@playwright/test"
import { accounts, signIn } from "./helpers"

// The three critical flows, end to end through the real UI, API, database and auth.
test.describe.serial("critical flows", () => {
  const title = `Scanner will not turn on ${Date.now()}`
  let ticketUrl = ""

  test("A: an employee files a request and lands on it", async ({ browser }) => {
    const page = await signIn(browser, accounts.employee)
    await page
      .getByRole("link", { name: /get help/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/tickets\/new/)

    await page.getByText("Computer or hardware").click()
    await page.getByLabel("In one line, what is wrong?").fill(title)
    await page.getByLabel("Anything IT should know").fill("The power light stays off.")
    await page.getByRole("button", { name: /send to it/i }).click()

    await expect(page.getByRole("heading", { name: title })).toBeVisible()
    ticketUrl = page.url()
  })

  test("B: IT takes it, fixes it, and the employee confirms", async ({ browser }) => {
    const it = await signIn(browser, accounts.staff)
    // the queue is IT's home; it must render with its filters, not just the ticket page
    await expect(it.getByRole("heading", { name: "Queue" })).toBeVisible()
    await expect(it.getByRole("group", { name: "Filter" })).toBeVisible()
    await it.goto(ticketUrl)
    await it.getByRole("button", { name: "Assign to me" }).click()
    await it.getByRole("button", { name: "Start work" }).click()
    await it.getByLabel("What fixed it?").fill("Replaced the power adapter.")
    await it.getByRole("button", { name: "Mark as resolved" }).click()
    await expect(it.getByText(/Resolved · filed/)).toBeVisible()

    const employee = await signIn(browser, accounts.employee)
    await employee.goto(ticketUrl)
    await expect(employee.getByText("Replaced the power adapter.")).toBeVisible()
    await employee.getByRole("button", { name: "Yes, it is fixed" }).click()
    await expect(employee.getByText(/Closed · filed/)).toBeVisible()
  })

  test("C: IT approves a device change and the register follows", async ({ browser }) => {
    const it = await signIn(browser, accounts.staff)
    await it.goto("/change-requests")
    const card = it.locator("section", { hasText: "LAP-0044" })
    await expect(card).toContainText("3rd floor, Accounts")
    await card.getByRole("button", { name: /approve/i }).click()

    await it.goto("/change-requests?status=approved")
    await expect(it.locator("section", { hasText: "LAP-0044" })).toContainText(
      "Approved by Chidi Eze",
    )
  })
})
