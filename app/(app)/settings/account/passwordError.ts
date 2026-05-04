/** URL `error` query values that belong to the password form (not general profile). */
export function isPasswordError(msg: string | null): boolean {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("current password") ||
    m.includes("new password") ||
    m.includes("password must") ||
    m.includes("passwords do not") ||
    m.includes("fill in all password")
  );
}
