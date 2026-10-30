import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useChildren } from '../data/children'
import { useSelectedChild } from '../data/SelectedChild'
import { navItems } from './navItems'

// 화면 방향에 따라 메뉴 위치가 바뀝니다. (index.css 참고)
// - 세로 화면(휴대폰): 아래쪽 탭 메뉴
// - 가로 화면(PC, 휴대폰 가로): 왼쪽 메뉴
export default function AppShell() {
  const { children } = useChildren()
  const topbarRef = useRef<HTMLElement>(null)
  // 아이가 2명 이상일 때만 아이 선택을 보여줍니다.
  const showSwitcher = children.length >= 2

  // 위쪽 막대 높이를 CSS 변수로 알려줍니다. 보드의 요일 줄이 그 아래에 붙어 따라오게 하기 위해서입니다.
  useEffect(() => {
    const topbar = topbarRef.current
    if (!topbar) return
    const update = () => document.documentElement.style.setProperty('--topbar-height', `${topbar.offsetHeight}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(topbar)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="shell">
      <nav className="nav" aria-label="주 메뉴">
        <div className="nav-brand">
          <Logo />
        </div>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-item">
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="main">
        <header ref={topbarRef} className={showSwitcher ? 'topbar has-switcher' : 'topbar'}>
          <span className="topbar-brand">
            <Logo />
            <span className="brand-text">학습체크</span>
          </span>
          {showSwitcher && <ChildSwitcher />}
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** 로고: 남색 둥근 네모 안의 체크 표시 */
function Logo() {
  return (
    <span className="logo" aria-label="학습체크" role="img">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7" />
      </svg>
    </span>
  )
}

function ChildSwitcher() {
  const { children } = useChildren()
  const { selectedChild, selectChild } = useSelectedChild()

  return (
    <div className="chips" role="group" aria-label="아이 선택">
      {children.map((child) => (
        <button key={child.id} type="button" className="chip" aria-pressed={selectedChild?.id === child.id}
          onClick={() => selectChild(child.id)}>
          <span className="dot" style={{ background: child.color }} />
          {child.name}
        </button>
      ))}
    </div>
  )
}
