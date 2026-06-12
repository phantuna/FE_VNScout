/**
 * Parse a date string from the backend safely.
 *
 * The Java backend (Spring Boot) returns LocalDateTime serialized WITHOUT timezone info,
 * e.g. "2026-05-22T15:06:00" — which is actually UTC.
 * JavaScript's new Date() treats strings without timezone as LOCAL time (UTC+7 in Vietnam),
 * causing a 7-hour offset bug.
 *
 * This function appends "Z" to ensure the string is parsed as UTC.
 */
export function parseUTCDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date()
  // Already has timezone info — don't touch
  if (dateStr.endsWith("Z") || dateStr.includes("+") || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return new Date(dateStr)
  }
  // Treat as UTC by appending Z
  return new Date(dateStr + "Z")
}

/**
 * Format a backend timestamp as relative time in Vietnamese.
 * e.g. "3 phút trước", "2 giờ trước", "5 ngày trước"
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  const date = parseUTCDate(dateStr)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 10) return "Vừa xong"
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  return date.toLocaleDateString("vi-VN")
}

/**
 * Format a backend timestamp as a short time string (HH:mm) in local Vietnam time.
 */
export function formatTimeOnly(dateStr: string | null | undefined): string {
  if (!dateStr) return ""
  return parseUTCDate(dateStr).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}
