import type { ReactNode } from 'react'
import { Icon } from '../components/icons'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

export const navItems: NavItem[] = [
  {
    to: '/',
    label: '홈',
    // 체크 표시가 있는 주간 표
    icon: (
      <Icon>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M9 4v16" />
        <path d="M12.5 14.5l1.75 1.75L17.5 13" />
      </Icon>
    ),
  },
  {
    to: '/subjects',
    label: '과목',
    // 책 (Lucide 'book' 아이콘 모양, ISC 사용 허가)
    icon: <Icon><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></Icon>,
  },
  {
    to: '/settings',
    label: '설정',
    // 톱니바퀴 (Lucide 'settings' 아이콘 모양, ISC 사용 허가)
    icon: (
      <Icon>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </Icon>
    ),
  },
]
