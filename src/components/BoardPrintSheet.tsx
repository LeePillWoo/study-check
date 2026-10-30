import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useChecks } from '../data/checks'
import { useSubjects } from '../data/subjects'
import { useTasks } from '../data/tasks'
import type { Child } from '../data/types'
import { WEEKDAY_NAMES, dateParts, weekdayOf, type DateStr } from '../utils/date'
import { formatWeekRange, weekDates } from '../utils/week'
import type { BoardView } from './boardTypes'

interface BoardPrintSheetProps {
  child: Child
  weekStart: DateStr
  view: BoardView
}

/**
 * 인쇄용 주간표 (A4 가로 한 장). 화면에서는 숨겨져 있다가 인쇄할 때만 보입니다. (index.css의 @media print)
 * 보고 있는 표를 그대로 인쇄합니다. 계획표면 과목 줄과 칸 안의 학습 내용, 체크표면 학습 내용 줄과 체크 칸입니다.
 * 체크한 칸은 채워서 나오므로, 주 초에 뽑으면 손으로 체크할 빈 표가 되고 주 중간에 뽑으면 진행 상황이 나옵니다.
 */
export default function BoardPrintSheet({ child, weekStart, view }: BoardPrintSheetProps) {
  const { subjects } = useSubjects(child.id)
  const { tasksOf } = useTasks()
  const { isDone } = useChecks()
  const dates = weekDates(weekStart)

  return createPortal(
    <div className="print-sheet" aria-hidden="true">
      <header className="print-head">
        <h1>{view === 'plan' ? '주간 학습 계획표' : '주간 학습 체크표'}</h1>
        <p>
          {child.name} · {formatWeekRange(weekStart)} · 학습체크
        </p>
      </header>
      <table className={`print-table ${view === 'plan' ? 'print-plan' : 'print-check'}`}>
        <colgroup>
          <col className="print-col-label" />
          <col span={7} />
        </colgroup>
        <thead>
          <tr>
            <th>{view === 'plan' ? '과목' : '학습 내용'}</th>
            {dates.map((date) => {
              const weekday = weekdayOf(date)
              const { month, day } = dateParts(date)
              return (
                <th key={date} className={`wd-${weekday}`}>
                  {WEEKDAY_NAMES[weekday]}
                  <span className="print-day-date">
                    {month}/{day}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        {view === 'plan' ? (
          <tbody>
            {subjects.map((subject) => {
              const tasks = tasksOf(subject.id)
              return (
                <tr key={subject.id} style={{ '--c': subject.color } as CSSProperties}>
                  <th className="print-subject">{subject.name}</th>
                  {dates.map((date) => {
                    const weekday = weekdayOf(date)
                    // 그날 계획한 학습 내용과, 계획에 없어도 그날 체크한 것
                    const items = tasks.filter((task) => task.weekdays.includes(weekday) || isDone(task.id, date))
                    return (
                      <td key={date}>
                        {items.map((task) => (
                          <div key={task.id} className="print-item">
                            <PrintBox done={isDone(task.id, date)} />
                            <span>{task.name}</span>
                          </div>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        ) : (
          subjects.map((subject) => (
            <tbody key={subject.id} style={{ '--c': subject.color } as CSSProperties}>
              <tr className="print-band">
                <th colSpan={8}>{subject.name}</th>
              </tr>
              {tasksOf(subject.id).map((task) => (
                <tr key={task.id}>
                  <th className="print-task">{task.name}</th>
                  {dates.map((date) => {
                    const planned = task.weekdays.includes(weekdayOf(date))
                    const done = isDone(task.id, date)
                    return <td key={date}>{planned || done ? <PrintBox done={done} /> : <span className="print-dot" />}</td>
                  })}
                </tr>
              ))}
            </tbody>
          ))
        )}
      </table>
      {subjects.length === 0 && <p className="print-empty">과목이 없습니다.</p>}
    </div>,
    document.body,
  )
}

/** 체크 네모. 체크한 것은 과목 색으로 채우고 흰 체크 표시 */
function PrintBox({ done }: { done: boolean }) {
  return (
    <span className={done ? 'print-box is-done' : 'print-box'}>
      {done && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
      )}
    </span>
  )
}
