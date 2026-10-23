// Pure check, kept free of server imports so it can be unit-tested.
export function isAllowedEmail(
  email: string | undefined,
  verified: boolean | undefined,
  allowed: string | undefined,
): boolean {
  const want = allowed?.trim().toLowerCase()
  if (!want || !email || verified !== true) return false
  return email.trim().toLowerCase() === want
}
