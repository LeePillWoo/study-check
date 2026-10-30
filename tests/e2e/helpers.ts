import { expect, type Page } from '@playwright/test'

/** 설정 > 아이에서 아이를 차례로 등록합니다. */
export async function addChildren(page: Page, names: string[]) {
  for (const name of names) {
    await page.goto('/#/settings/children/new')
    await page.getByLabel('이름').fill(name)
    await page.getByRole('button', { name: '저장' }).click()
    await expect(page.getByRole('heading', { name: '아이 추가' })).toHaveCount(0)
  }
}

interface SubjectOptions {
  name: string
  /** 색 이름. 예: '초록' */
  color?: string
  /** 학습 내용. days는 기본(평일)에서 켜고 끌 요일 */
  tasks: { name: string; days?: string[] }[]
}

/** 지금 고른 아이에게 과목과 학습 내용을 등록합니다. */
export async function addSubject(page: Page, options: SubjectOptions) {
  await page.goto('/#/subjects/new')
  await page.getByLabel('과목 이름').fill(options.name)
  if (options.color) await page.getByRole('radio', { name: options.color }).check()
  for (let index = 0; index < options.tasks.length; index++) {
    // 새 과목 화면에는 빈 학습 내용 줄이 하나 있습니다.
    if (index > 0) await page.getByRole('button', { name: '학습 내용 추가' }).click()
    const task = options.tasks[index]
    const label = `학습 내용 ${index + 1}`
    await page.getByLabel(`${label} 이름`).fill(task.name)
    if (task.days) {
      const group = page.getByRole('group', { name: `${label} 요일` })
      for (const day of task.days) await group.getByRole('button', { name: day, exact: true }).click()
    }
  }
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page.getByRole('heading', { name: '과목 추가' })).toHaveCount(0)
}

/** 내용이 화면보다 넓어지지 않았는지 검사합니다. 넓어지면 휴대폰 브라우저가 화면 전체를 축소해서 보여줍니다. */
export async function expectNoHorizontalOverflow(page: Page) {
  const { clientWidth, scrollWidth } = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(scrollWidth, '내용이 화면보다 넓습니다').toBeLessThanOrEqual(clientWidth)
}
