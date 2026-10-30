/**
 * 날짜는 'YYYY-MM-DD' 글자로 다룹니다. (예: '2026-10-30')
 * - 시간대 때문에 날짜가 하루씩 밀리는 문제가 없습니다.
 * - 글자 그대로 크기 비교가 됩니다. ('2026-10-30' < '2026-11-01')
 */
export type DateStr = string

/** 0=일, 1=월, … 6=토 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'] as const

/** 화면에 보여주는 요일 순서 (월요일부터) */
export const WEEKDAYS_FROM_MONDAY: Weekday[] = [1, 2, 3, 4, 5, 6, 0]

/** 평일 (월~금). 새 학습 내용의 기본 계획 요일입니다. */
export const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5]

const pad = (n: number) => String(n).padStart(2, '0')

export function toDateStr(date: Date): DateStr {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function makeDate(year: number, month: number, day: number): DateStr {
  return `${year}-${pad(month)}-${pad(day)}`
}

export function dateParts(date: DateStr): { year: number; month: number; day: number } {
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

function toJsDate(date: DateStr): Date {
  const { year, month, day } = dateParts(date)
  return new Date(year, month - 1, day)
}

export function today(): DateStr {
  return toDateStr(new Date())
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function addDays(date: DateStr, days: number): DateStr {
  const d = toJsDate(date)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}

export function weekdayOf(date: DateStr): Weekday {
  return toJsDate(date).getDay() as Weekday
}

/** 두 날짜 사이의 날 수 (to - from) */
export function daysBetween(from: DateStr, to: DateStr): number {
  return Math.round((toJsDate(to).getTime() - toJsDate(from).getTime()) / 86_400_000)
}

/** 화면에 보여주는 날짜. 올해면 연도를 뺍니다. 예: '10월 30일 (금)', '2025년 3월 2일 (일)' */
export function formatDate(date: DateStr, options: { withYear?: boolean } = {}): string {
  const { year, month, day } = dateParts(date)
  const showYear = options.withYear ?? year !== dateParts(today()).year
  const text = `${month}월 ${day}일 (${WEEKDAY_NAMES[weekdayOf(date)]})`
  return showYear ? `${year}년 ${text}` : text
}

/** 요일 목록을 월요일부터 순서로 정렬합니다. 중복은 없앱니다. */
export function sortWeekdays(days: Weekday[]): Weekday[] {
  return WEEKDAYS_FROM_MONDAY.filter((day) => days.includes(day))
}
