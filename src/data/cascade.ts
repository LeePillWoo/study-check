import type { Change, Database } from './types'

/** 학습 내용을 지울 때 함께 지울 것들: 그 내용의 체크 기록 전부 */
export function taskRemovalChanges(data: Database, taskId: string): Change[] {
  return [
    ...data.checks
      .filter((check) => check.taskId === taskId)
      .map((check): Change => ({ type: 'remove', collection: 'checks', id: check.id })),
    { type: 'remove', collection: 'tasks', id: taskId },
  ]
}

/** 과목을 지울 때 함께 지울 것들: 과목의 학습 내용과 그 체크 기록 */
export function subjectRemovalChanges(data: Database, subjectId: string): Change[] {
  return [
    ...data.tasks
      .filter((task) => task.subjectId === subjectId)
      .flatMap((task) => taskRemovalChanges(data, task.id)),
    { type: 'remove', collection: 'subjects', id: subjectId },
  ]
}

/** 아이를 지울 때 함께 지울 것들: 아이의 과목(과 거기에 딸린 학습 내용, 체크) */
export function childRemovalChanges(data: Database, childId: string): Change[] {
  return [
    ...data.subjects
      .filter((subject) => subject.childId === childId)
      .flatMap((subject) => subjectRemovalChanges(data, subject.id)),
    { type: 'remove', collection: 'children', id: childId },
  ]
}
