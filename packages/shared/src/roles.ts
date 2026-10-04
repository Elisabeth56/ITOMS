export const userRoles = ["employee", "it_staff", "admin"] as const
export type UserRole = (typeof userRoles)[number]

/** Each role includes the permissions of the ones before it. */
export function hasRole(role: UserRole, required: UserRole) {
  return userRoles.indexOf(role) >= userRoles.indexOf(required)
}
