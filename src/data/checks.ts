import { useMemo } from 'react'
import type { DateStr } from '../utils/date'
import { useData } from './DataProvider'
import { nowIso } from './id'

/** 체크 기록의 id. 학습 내용과 날짜로 정해지므로 같은 칸을 두 번 저장하지 않습니다. */
export function checkId(taskId: string, date: DateStr): string {
  return `${taskId}:${date}`
}

/** 체크 기록을 읽고, 칸을 누르면 켜고 끄는 기능 */
export function useChecks() {
  const { data, apply } = useData()
  const doneIds = useMemo(() => new Set(data.checks.map((check) => check.id)), [data.checks])

  function isDone(taskId: string, date: DateStr): boolean {
    return doneIds.has(checkId(taskId, date))
  }

  async function toggleCheck(taskId: string, date: DateStr) {
    const id = checkId(taskId, date)
    if (doneIds.has(id)) {
      await apply([{ type: 'remove', collection: 'checks', id }])
      return
    }
    const now = nowIso()
    await apply([{ type: 'put', collection: 'checks', item: { id, taskId, date, createdAt: now, updatedAt: now } }])
  }

  return { isDone, toggleCheck }
}
