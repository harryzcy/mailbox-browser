export function getCurrentYearMonth(): {
  year: number
  month: number
} {
  const date = new Date()
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1
  }
}

export function formatDate(date: string, short: boolean = false): string {
  if (!date) return ''
  if (short) return formatDateShort(date)
  return formatDateLong(date)
}

function formatDateShort(date: string): string {
  const dateObj = new Date(date)
  const now = new Date()

  // If the date is today, show the time
  if (
    dateObj.getFullYear() == now.getFullYear() &&
    dateObj.getMonth() == now.getMonth() &&
    dateObj.getDate() == now.getDate()
  ) {
    const hour = dateObj.getHours()
    const minutesStr = dateObj.getMinutes().toString().padStart(2, '0')
    const meridian = hour >= 12 ? 'PM' : 'AM'
    return `${hour % 12 || 12}:${minutesStr} ${meridian}`
  }

  // If the date is in current year, show the month and day
  if (dateObj.getFullYear() == now.getFullYear()) {
    const month = dateObj.toLocaleString('default', { month: 'short' })
    const day = dateObj.getDate()
    return `${month} ${day}`
  }

  // Otherwise, show the full date
  let year = dateObj.getFullYear()
  if (year > 2000) year -= 2000 // Show 2-digit year
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  return `${month}/${day}/${year}`
}

function formatDateLong(date: string): string {
  const dateObj = new Date(date)

  const year = dateObj.getFullYear()
  const month = dateObj.toLocaleString('default', { month: 'short' })
  const day = dateObj.getDate()
  let hour = dateObj.getHours()
  const minutesStr = dateObj.getMinutes().toString().padStart(2, '0')
  const meridian = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12 // Convert 0 to 12
  return `${month} ${day}, ${year}, ${hour}:${minutesStr} ${meridian}`
}

export function formatDateFull(date: string): string {
  const dateObj = new Date(date)
  const dayOfWeek = dateObj.toLocaleString('default', { weekday: 'short' })

  return `${dayOfWeek}, ${formatDateLong(date)}`
}
