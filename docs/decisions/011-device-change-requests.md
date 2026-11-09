# 011: Employees request device changes, IT approves them

**Date:** 2026-11-09
**Status:** Accepted.

## Context

Employees know things about the devices they hold that the register gets wrong: where it is now, or a model or serial number entered incorrectly. Only IT staff can edit devices today.

## Options

- **A. Change requests with approval.** The employee proposes, IT approves or rejects.
- **B. Direct edits with an audit log.** Faster, but anyone could mislabel company property and IT would only find out afterwards.
- **C. Leave it out.**

## Decision

Option A. A new `asset_change_requests` table holds the device, the requester, the proposed values, a note, the status (`pending`, `approved`, `rejected`) and who decided and when.

- Only the current holder can request a change, and only for `location`, `brand`, `model` and `serial_number`. The proposed values are checked by the same zod rules as an IT edit.
- One pending request per device, enforced by a partial unique index.
- Approving applies the change through the existing device update and marks the request approved in one transaction. If the change fails (a serial number already in use), nothing is saved and the request stays pending.

## Consequences

- IT gets a new queue to check.
- The device's history now shows who proposed each correction, not only who made it.

## At 10x

With 1,000 devices, approving every location change by hand becomes busywork. Low-risk fields like location could then apply directly and be logged, keeping approval for identity fields such as the serial number.

## Revisit if

Most requests are approved without changes, which would mean approval is not catching anything.
