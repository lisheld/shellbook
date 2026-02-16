/**
 * Format date for day headers
 * Returns format like "February 14, 2026"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format timestamp for post display
 * Returns format like "2:30 PM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Group posts by date
 * Returns a map of date strings to arrays of posts
 */
export function groupByDate<T extends { createdAt: { toDate: () => Date } }>(
  items: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>()

  items.forEach(item => {
    const date = item.createdAt.toDate()
    const dateKey = formatDate(date)

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(item)
  })

  return grouped
}
