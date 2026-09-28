const SIRIUS_TIMEZONE = "America/Sao_Paulo"

export function getLocalDate() {
  const now = new Date()

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SIRIUS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)

  const year =
    parts.find((part) => part.type === "year")?.value || ""

  const month =
    parts.find((part) => part.type === "month")?.value || ""

  const day =
    parts.find((part) => part.type === "day")?.value || ""

  return `${year}-${month}-${day}`
}

export function getMonthReference() {
  const now = new Date()

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SIRIUS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now)

  const year =
    parts.find((part) => part.type === "year")?.value || ""

  const month =
    parts.find((part) => part.type === "month")?.value || ""

  return `${year}-${month}`
}

export function isFirstDayOfMonth() {
  const now = new Date()

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SIRIUS_TIMEZONE,
    day: "2-digit",
  }).formatToParts(now)

  const day =
    parts.find((part) => part.type === "day")?.value || ""

  return day === "01"
}