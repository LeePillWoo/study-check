import { weekdayOf, type DateStr } from '../utils/date'
import type { Task } from './types'

/** 보드 칸 하나의 상태 */
export interface CellState {
  /** 이 요일에 하기로 계획했는지 */
  planned: boolean
  /** 체크했는지 */
  done: boolean
  /** 계획한 날이 지났는데 체크하지 않았는지 (오늘은 아직 아님) */
  missed: boolean
}

export function cellState(task: Task, date: DateStr, done: boolean, todayStr: DateStr): CellState {
  const planned = task.weekdays.includes(weekdayOf(date))
  return { planned, done, missed: planned && !done && date < todayStr }
}

export interface Progress {
  /** 체크한 칸 수. 계획하지 않은 날에 한 것도 셉니다. */
  done: number
  /** 계획한 칸 수 */
  planned: number
}

/** 학습 내용들의 날짜 범위 안 완료·계획 칸 수 */
export function progressOf(tasks: Task[], dates: DateStr[], isDone: (taskId: string, date: DateStr) => boolean): Progress {
  let done = 0
  let planned = 0
  for (const task of tasks) {
    for (const date of dates) {
      if (task.weekdays.includes(weekdayOf(date))) planned += 1
      if (isDone(task.id, date)) done += 1
    }
  }
  return { done, planned }
}

/** 완료 비율(0~100). 계획보다 많이 했어도 100을 넘지 않습니다. */
export function percent(progress: Progress): number {
  if (progress.planned === 0) return progress.done > 0 ? 100 : 0
  return Math.min(100, Math.round((progress.done / progress.planned) * 100))
}
