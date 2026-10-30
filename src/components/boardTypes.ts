import type { Subject, Task } from '../data/types'
import type { Progress } from '../data/weekStats'
import type { DateStr } from '../utils/date'

/** 보기 방식. check = 체크표(학습 내용 줄마다 7칸), plan = 계획표(과목 줄, 칸 안에 그날 학습 내용) */
export type BoardView = 'check' | 'plan'

/** 체크표와 계획표가 함께 받는 값 */
export interface BoardTableProps {
  subjects: Subject[]
  tasksOf(subjectId: string): Task[]
  /** 월~일 7일 */
  dates: DateStr[]
  todayStr: DateStr
  isDone(taskId: string, date: DateStr): boolean
  onToggle(taskId: string, date: DateStr): void
  /** 요일마다 완료/계획 수. 학습 내용이 하나도 없으면 null (아래 줄을 그리지 않음) */
  dayTotals: Progress[] | null
}
