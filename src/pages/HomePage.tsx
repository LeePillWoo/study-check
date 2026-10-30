import { useState } from 'react'
import { Link } from 'react-router'
import { PlusIcon } from '../components/icons'
import PageHeader from '../components/PageHeader'
import WeekBoard from '../components/WeekBoard'
import { useChildren } from '../data/children'
import { useSelectedChild } from '../data/SelectedChild'
import { thisWeekStart } from '../utils/week'

/** 홈: 고른 아이의 주간 체크 보드 */
export default function HomePage() {
  const { children } = useChildren()
  const { selectedChild } = useSelectedChild()
  const [weekStart, setWeekStart] = useState(thisWeekStart)

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

  return (
    <section>
      <PageHeader title="주간 체크" subtitle={`${selectedChild.name}의 학습 계획을 요일별로 체크하세요.`} />
      <WeekBoard key={selectedChild.id} child={selectedChild} weekStart={weekStart} onChangeWeek={setWeekStart} />
    </section>
  )
}
