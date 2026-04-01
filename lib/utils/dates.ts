export function computeDueDate(cycleEndDate: Date, bufferDays: number): Date {
  return new Date(cycleEndDate.getTime() + bufferDays * 86400000)
}

export function getFYRange(date: Date): { start: Date; end: Date } {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-indexed
  const fyStart =
    month >= 3
      ? new Date(year, 3, 1) // Apr 1 this year
      : new Date(year - 1, 3, 1) // Apr 1 last year
  const fyEnd = new Date(fyStart.getFullYear() + 1, 2, 31)
  return { start: fyStart, end: fyEnd }
}

export function getFYLabel(date: Date): string {
  const { start } = getFYRange(date)
  return `FY ${start.getFullYear()}-${String(start.getFullYear() + 1).slice(2)}`
}

export function isInFY(date: Date, fyStart: Date, fyEnd: Date): boolean {
  return date >= fyStart && date <= fyEnd
}

export function getDaysUntil(date: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function monthsBetween(start: Date, end: Date): number {
  return (
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
  )
}

export function getCurrentCycleStart(billGenerateDay: number): Date {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDate()

  if (day >= billGenerateDay) {
    return new Date(year, month, billGenerateDay)
  } else {
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    return new Date(prevYear, prevMonth, billGenerateDay)
  }
}
