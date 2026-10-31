import { useState } from 'react'
import { Link } from 'react-router'
import BoardPrintSheet from '../components/BoardPrintSheet'
import type { BoardView } from '../components/boardTypes'
import { PlusIcon, PrinterIcon } from '../components/icons'
import PageHeader from '../components/PageHeader'
import Segmented from '../components/Segmented'
import WeekBoard from '../components/WeekBoard'
import { useChildren } from '../data/children'
import { useSelectedChild } from '../data/SelectedChild'
import { printPage } from '../native/print'
import { formatWeekRange, thisWeekStart } from '../utils/week'

// 2026-10-31: 기본 보기를 요일별로 바꾸면서 저장 이름도 바꿨습니다. 이전에 고른 보기 대신 한 번은 요일별로 열립니다.
const VIEW_KEY = 'study-check:view-v2'

// 요일별(왼쪽 요일, 위 과목)이 먼저이자 기본 (요청). 계획표는 왼쪽 과목, 위 요일
const VIEW_OPTIONS: { value: BoardView; label: string }[] = [
  { value: 'days', label: '요일별' },
  { value: 'plan', label: '계획표' },
  { value: 'check', label: '체크표' },
]

/** 마지막으로 고른 보기 방식. 앱을 다시 열어도, 다른 화면에 다녀와도 그대로입니다. 기본은 요일별 */
function loadView(): BoardView {
  const stored = localStorage.getItem(VIEW_KEY)
  return VIEW_OPTIONS.some((option) => option.value === stored) ? (stored as BoardView) : 'days'
}

/** 홈: 고른 아이의 주간 체크 보드 */
export default function HomePage() {
  const { children } = useChildren()
  const { selectedChild } = useSelectedChild()
  const [weekStart, setWeekStart] = useState(thisWeekStart)
  const [view, setView] = useState<BoardView>(loadView)

  function changeView(next: BoardView) {
    setView(next)
    localStorage.setItem(VIEW_KEY, next)
  }

  if (children.length === 0 || !selectedChild) {
    return (
      <section className="narrow">
        <PageHeader title="주간 체크" subtitle="아이의 학습 계획을 요일별로 체크하세요." />
        <div className="card">
          <h2 className="card-title">학습체크에 오신 것을 환영합니다</h2>
          <p>먼저 아이를 등록하세요. 아이마다 과목과 학습 내용을 따로 두고 주 단위로 체크할 수 있습니다.</p>
          <Link to="/settings/children/new" className="btn btn-primary">
            <PlusIcon />
            아이 등록하기
          </Link>
        </div>
      </section>
    )
  }

  const viewLabel = view === 'check' ? '체크표' : '계획표'

  return (
    <section>
      <PageHeader
        title="주간 체크"
        subtitle={`${selectedChild.name}의 학습 계획을 요일별로 체크하세요.`}
        actions={
          <div className="board-actions">
            <Segmented<BoardView> label="보기 방식" name="board-view" value={view} options={VIEW_OPTIONS} onChange={changeView} />
            <button type="button" className="btn btn-secondary btn-small print-btn"
              onClick={() => printPage(`학습체크 ${viewLabel} ${selectedChild.name} ${formatWeekRange(weekStart)}`)}>
              <PrinterIcon />
              <span className="btn-label">인쇄</span>
            </button>
          </div>
        }
      />
      <WeekBoard key={selectedChild.id} child={selectedChild} weekStart={weekStart} onChangeWeek={setWeekStart} view={view} />
      <BoardPrintSheet child={selectedChild} weekStart={weekStart} view={view} />
    </section>
  )
}
