import type { DateStr, Weekday } from '../utils/date'

/** 모든 기록에 공통으로 들어가는 항목입니다. updatedAt은 백업을 합칠 때 더 최근 기록을 고르는 데 씁니다. */
export interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
}

/** 아이. 과목과 체크는 아이별로 따로 둡니다. */
export interface Child extends BaseRecord {
  name: string
  color: string
  /** 화면에 보이는 순서 (작을수록 앞) */
  order: number
}

/** 과목. 예: 수학, 영어, 독서. 보드 왼쪽 묶음 이름이 됩니다. */
export interface Subject extends BaseRecord {
  childId: string
  name: string
  color: string
  order: number
}

/** 학습 내용. 과목 아래 한 줄이 됩니다. 예: 문제집 2쪽, 영어 단어 20개 */
export interface Task extends BaseRecord {
  subjectId: string
  name: string
  /** 계획한 요일. 계획하지 않은 요일에도 체크할 수는 있습니다. */
  weekdays: Weekday[]
  order: number
}

/** 체크 하나 = 어떤 학습 내용을 어느 날 했는지. 체크한 날만 저장하고, 취소하면 지웁니다. id는 `${taskId}:${date}` */
export interface Check extends BaseRecord {
  taskId: string
  date: DateStr
}

/** 저장하는 데이터 종류입니다. 새 종류는 여기에 추가합니다. */
export interface Collections {
  children: Child
  subjects: Subject
  tasks: Task
  checks: Check
}

export type CollectionName = keyof Collections

export type Database = { [K in CollectionName]: Collections[K][] }

/** 저장소에 보내는 변경 하나. 여러 개를 묶어 한 번에 저장합니다. */
export type Change =
  | { [K in CollectionName]: { type: 'put'; collection: K; item: Collections[K] } }[CollectionName]
  | { type: 'remove'; collection: CollectionName; id: string }
