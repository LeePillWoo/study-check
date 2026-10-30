import { useMemo } from 'react'
import { useData } from './DataProvider'
import { byOrder } from './subjects'
import type { Task } from './types'

/** 학습 내용 전체와, 과목별로 순서대로 꺼내는 기능 */
export function useTasks() {
  const { data } = useData()
  const bySubject = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of data.tasks) {
      const list = map.get(task.subjectId)
      if (list) list.push(task)
      else map.set(task.subjectId, [task])
    }
    for (const list of map.values()) list.sort(byOrder)
    return map
  }, [data.tasks])

  function tasksOf(subjectId: string): Task[] {
    return bySubject.get(subjectId) ?? []
  }

  return { tasks: data.tasks, tasksOf }
}
