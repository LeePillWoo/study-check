import { useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { useChecks } from '../data/checks'
import { softColorVars } from '../data/colors'
import { useSubjects } from '../data/subjects'
import { useTasks } from '../data/tasks'
import type { Child } from '../data/types'
import { cellState, percent, progressOf } from '../data/weekStats'
import { WEEKDAY_NAMES, addDays, dateParts, formatDate, today, weekdayOf, type DateStr } from '../utils/date'
import { formatWeekRange, startOfWeek, weekDates } from '../utils/week'
import CheckCell from './CheckCell'
import { BackIcon, ChevronRightIcon, PlusIcon } from './icons'

interface WeekBoardProps {
  child: Child
  /** 보여줄 주의 월요일 */
  weekStart: DateStr
  onChangeWeek(weekStart: DateStr): void
}

/**
 * 주간 체크 보드. 위에는 월~일, 왼쪽에는 과목과 학습 내용, 칸을 누르면 체크합니다.
 * 과목 이름을 누르면 과목 설정 화면으로 갑니다.
 */
export default function WeekBoard({ child, weekStart, onChangeWeek }: WeekBoardProps) {
  const { subjects } = useSubjects(child.id)
  const { tasksOf } = useTasks()
  const { isDone, toggleCheck } = useChecks()
  const [error, setError] = useState('')
  const todayStr = today()
  const currentWeek = startOfWeek(todayStr)
  const dates = useMemo(() => weekDates(weekStart), [weekStart])
  const allTasks = useMemo(() => subjects.flatMap((subject) => tasksOf(subject.id)), [subjects, tasksOf])
  const total = progressOf(allTasks, dates, isDone)
  const dayTotals = dates.map((date) => progressOf(allTasks, [date], isDone))

  async function toggle(taskId: string, date: DateStr) {
    try {
      setError('')
      await toggleCheck(taskId, date)
    } catch {
      setError('저장하지 못했습니다. 다시 시도하세요.')
    }
  }

  return (
    <div className="card board-card">
      <div className="board-toolbar">
        <div className="week-nav">
          <button type="button" className="icon-btn" onClick={() => onChangeWeek(addDays(weekStart, -7))} aria-label="지난주">
            <BackIcon />
          </button>
          <strong>{formatWeekRange(weekStart)}</strong>
          <button type="button" className="icon-btn" onClick={() => onChangeWeek(addDays(weekStart, 7))} aria-label="다음 주">
            <ChevronRightIcon />
          </button>
        </div>
        {weekStart === currentWeek ? (
          <span className="badge week-badge">이번 주</span>
        ) : (
          <button type="button" className="btn btn-secondary btn-small today-btn" onClick={() => onChangeWeek(currentWeek)}>
            이번 주로
          </button>
        )}
      </div>

      {allTasks.length > 0 && (
        <div className="week-summary" aria-label="이번 주 진행">
          <p className="week-summary-text">
            <strong>{total.done}</strong>
            <span className="muted">
              / {total.planned} 완료 · {percent(total)}%
            </span>
          </p>
          <span className="progress" aria-hidden="true">
            <span style={{ width: `${percent(total)}%` }} />
          </span>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="board-empty">
          <p>아직 과목이 없습니다.</p>
          <p className="muted">과목을 추가하고 그 아래에 학습 내용(예: 문제집 2쪽, 영어 단어 20개)을 넣으면 요일마다 체크할 수 있습니다.</p>
        </div>
      ) : (
        <table className="board-table">
          <colgroup>
            <col className="col-label" />
            <col span={7} />
          </colgroup>
          <thead className="board-head">
            <tr>
              <th scope="col">
                <span className="visually-hidden">과목과 학습 내용</span>
              </th>
              {dates.map((date) => {
                const weekday = weekdayOf(date)
                const isToday = date === todayStr
                return (
                  <th key={date} scope="col" className={`wd-${weekday}${isToday ? ' is-today' : ''}`}
                    aria-label={`${formatDate(date)}${isToday ? ' 오늘' : ''}`}>
                    <span className="day-head">
                      <span className="day-name">{WEEKDAY_NAMES[weekday]}</span>
                      <span className="day-num">{dateParts(date).day}</span>
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          {subjects.map((subject) => {
            const tasks = tasksOf(subject.id)
            const progress = progressOf(tasks, dates, isDone)
            return (
              <tbody key={subject.id} style={softColorVars(subject.color) as CSSProperties}>
                <tr className="subject-row">
                  <th scope="rowgroup" colSpan={8}>
                    <div className="subject-cell">
                      <Link to={`/subjects/${subject.id}`} className="subject-link" aria-label={`${subject.name} 과목 설정`}>
                        <span className="dot" style={{ background: subject.color }} />
                        <span className="subject-name">{subject.name}</span>
                        <ChevronRightIcon />
                      </Link>
                      {tasks.length > 0 && (
                        <span className="subject-progress">
                          <span>
                            {progress.done}/{progress.planned}
                          </span>
                          <span className="progress" aria-hidden="true">
                            <span style={{ width: `${percent(progress)}%` }} />
                          </span>
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
                {tasks.length === 0 ? (
                  <tr className="empty-row">
                    <th scope="row" colSpan={8}>
                      학습 내용이 없습니다. 과목 이름을 눌러 추가하세요.
                    </th>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="task-row">
                      <th scope="row">
                        <span className="task-name">{task.name}</span>
                      </th>
                      {dates.map((date) => {
                        const isToday = date === todayStr
                        return (
                          <td key={date} className={isToday ? 'is-today' : undefined}>
                            <CheckCell taskName={task.name} date={date} isToday={isToday}
                              state={cellState(task, date, isDone(task.id, date), todayStr)}
                              onToggle={() => toggle(task.id, date)} />
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            )
          })}
          {allTasks.length > 0 && (
            <tfoot className="board-foot">
              <tr>
                <th scope="row">완료</th>
                {dayTotals.map((progress, index) => (
                  <td key={dates[index]} className={dates[index] === todayStr ? 'is-today' : undefined}>
                    {progress.done}/{progress.planned}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      )}

      {error && <p className="field-error" role="alert">{error}</p>}

      <Link to="/subjects/new" className="btn btn-secondary add-subject">
        <PlusIcon />
        과목 추가
      </Link>
      {subjects.length > 0 && <p className="muted board-hint">과목 이름을 누르면 학습 내용과 계획 요일을 고칠 수 있습니다.</p>}
    </div>
  )
}
