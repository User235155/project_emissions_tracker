const MONTH_ABBREVIATIONS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function getMonthLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  })
}

export function getQuarterLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)
  const month = date.getMonth()

  if (month <= 2) return `Q1 ${date.getFullYear()}`
  if (month <= 5) return `Q2 ${date.getFullYear()}`
  if (month <= 8) return `Q3 ${date.getFullYear()}`
  return `Q4 ${date.getFullYear()}`
}

export function getWeekLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)
  const day = date.getDate()

  let weekOfMonth = 1
  if (day >= 8 && day <= 14) weekOfMonth = 2
  else if (day >= 15 && day <= 21) weekOfMonth = 3
  else if (day >= 22) weekOfMonth = 4

  return `${getMonthLabel(dateString)} - Week ${weekOfMonth}`
}

export function monthSortValue(monthLabel: string) {
  const match = monthLabel.match(/^([A-Za-z]{3}) (\d{4})$/)
  if (!match) return Number.MAX_SAFE_INTEGER

  const monthIndex = MONTH_ABBREVIATIONS.indexOf(match[1])
  const year = Number(match[2])

  if (monthIndex === -1 || Number.isNaN(year)) {
    return Number.MAX_SAFE_INTEGER
  }

  return year * 100 + (monthIndex + 1)
}

export function weekSortValue(weekLabel: string) {
  const match = weekLabel.match(/^([A-Za-z]{3} \d{4}) - Week (\d)$/)
  if (!match) return Number.MAX_SAFE_INTEGER

  const monthValue = monthSortValue(match[1])
  const weekNumber = Number(match[2])

  if (Number.isNaN(weekNumber)) {
    return Number.MAX_SAFE_INTEGER
  }

  return monthValue * 10 + weekNumber
}