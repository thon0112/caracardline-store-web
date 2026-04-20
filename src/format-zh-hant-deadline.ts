/** zh-Hant date+time for reservation / payment deadlines (matches order page). */
export function formatZhHantDeadline(
  input: string | Date | null | undefined,
): string | null {
  if (input == null || input === "") return null;
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("zh-Hant", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
