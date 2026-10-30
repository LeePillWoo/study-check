import { createContext, useContext, useState, type ReactNode } from 'react'
import { useChildren } from './children'
import type { Child } from './types'

const STORAGE_KEY = 'study-check:selected-child'

interface SelectedChildValue {
  /** 지금 보고 있는 아이. 아이가 없으면 null */
  selectedChild: Child | null
  selectChild(id: string): void
}

const SelectedChildContext = createContext<SelectedChildValue | null>(null)

/**
 * 화면 위쪽에서 고른 아이를 기억합니다. 앱을 다시 열어도 유지됩니다.
 * 보드는 늘 아이 한 명 것만 보여주므로 '전체'는 없습니다. 고른 적이 없거나 그 아이가 지워졌으면 첫 아이를 보여줍니다.
 */
export function SelectedChildProvider(props: { children: ReactNode }) {
  const { children } = useChildren()
  const [storedId, setStoredId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  const selectedChild = children.find((child) => child.id === storedId) ?? children[0] ?? null

  function selectChild(id: string) {
    setStoredId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return (
    <SelectedChildContext.Provider value={{ selectedChild, selectChild }}>
      {props.children}
    </SelectedChildContext.Provider>
  )
}

export function useSelectedChild() {
  const value = useContext(SelectedChildContext)
  if (!value) throw new Error('useSelectedChild는 SelectedChildProvider 안에서만 쓸 수 있습니다.')
  return value
}
