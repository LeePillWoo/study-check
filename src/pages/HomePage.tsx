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

const VIEW_KEY = 'study-check:view'

// 계획표가 먼저 (요청). 체크표는 두 번째
const VIEW_OPTIONS: { value: BoardView; label: string }[] = [
  { value: 'plan', label: '계획표' },
  { value: 'check', label: '체크표' },
]

/** 마지막으로 고른 보기 방식. 기본은 계획표 */
function loadView(): BoardView {
  return localStorage.getItem(VIEW_KEY) === 'check' ? 'check' : 'plan'
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

  const viewLabel = view === 'plan' ? '계획표' : '체크표'

  return (
    <section>
      <PageHeader
        title="주간 체크"
        subtitle={`${selectedChild.name}의 학습 계획을 요일별로 체크하세요.`}
        actions={
          <div className="board-actions">
            <Segmented<BoardView> label="보기 방식" name="board-view" value={view} options={VIEW_OPTIONS} onChange={changeView} />
            <button type="button" className="btn btn-secondary btn-small"
              onClick={() => printPage(`학습체크 ${viewLabel} ${selectedChild.name} ${formatWeekRange(weekStart)}`)}>
              <PrinterIcon />
              인쇄
            </button>
          </div>
        }
      />
      <WeekBoard key={selectedChild.id} child={selectedChild} weekStart={weekStart} onChangeWeek={setWeekStart} view={view} />
      <BoardPrintSheet child={selectedChild} weekStart={weekStart} view={view} />
    </section>
  )
}
