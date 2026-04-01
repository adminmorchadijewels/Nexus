import { monthsBetween } from './dates'

export function getMilestoneProgress(
  targetAmount: number,
  spentAmount: number
): number {
  if (targetAmount === 0) return 0
  return Math.min((spentAmount / targetAmount) * 100, 100)
}

export function getMonthlyTarget(
  targetAmount: number,
  startDate: Date,
  endDate: Date
): number {
  if (targetAmount === 0) return 0
  const months = monthsBetween(startDate, endDate)
  return months > 0 ? targetAmount / months : targetAmount
}

export function getMilestoneStatus(
  endDate: Date,
  progress: number
): 'active' | 'achieved' | 'expired' | 'missed' {
  const now = new Date()
  if (progress >= 100) return 'achieved'
  if (endDate < now) return 'missed'
  return 'active'
}

export function getDaysLeft(endDate: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000))
}

export function isExpiringSoon(endDate: Date, daysThreshold = 7): boolean {
  return getDaysLeft(endDate) <= daysThreshold && getDaysLeft(endDate) > 0
}
