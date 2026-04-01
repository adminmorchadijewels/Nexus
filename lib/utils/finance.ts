export function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount)
}

export function utilisationColor(pct: number): string {
  if (pct >= 0.8) return '#EF4444'
  if (pct >= 0.5) return '#F59E0B'
  return '#0D9488'
}

export function urgencyColor(daysLeft: number): string {
  if (daysLeft <= 3) return '#EF4444'
  if (daysLeft <= 7) return '#F59E0B'
  return '#10B981'
}

export function urgencyLabel(daysLeft: number): string {
  if (daysLeft < 0) return 'Overdue'
  if (daysLeft === 0) return 'Due Today'
  if (daysLeft === 1) return 'Due Tomorrow'
  return `${daysLeft}d left`
}
