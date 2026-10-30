import { expect, test } from '@playwright/test'
import { addChildren, addSubject, expectNoHorizontalOverflow } from './helpers'

test('과목과 학습 내용 등록, 요일 체크, 지난주 놓침 표시, 아이별 분리', async ({ page }, testInfo) => {
  const board = page.getByRole('table')
  const weekBadge = page.locator('.week-badge')
  const summaryDone = page.locator('.week-summary strong')

  await addChildren(page, ['첫째'])
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '주간 체크' })).toBeVisible()
  await expect(page.getByText('아직 과목이 없습니다.')).toBeVisible()

  // 과목 추가: 문제집은 기본(평일), 연산은 토·일도 켜서 매일
  await addSubject(page, { name: '수학', tasks: [{ name: '문제집 2쪽' }, { name: '연산 10분', days: ['토', '일'] }] })
  await expect(page.getByRole('link', { name: '수학 학습 내용 2개' })).toBeVisible()
  await expectNoHorizontalOverflow(page)

  // 보드: 요일 줄, 과목 띠, 학습 내용 줄
  await page.goto('/')
  await expect(weekBadge).toHaveText('이번 주')
  await expect(page.getByRole('link', { name: '수학 과목 설정' })).toBeVisible()
  await expect(board.getByRole('rowheader', { name: '문제집 2쪽' })).toBeVisible()
  await expect(board.getByRole('rowheader', { name: '연산 10분' })).toBeVisible()
  await expect(page.locator('.day-head')).toHaveCount(7)
  await expect(page.locator('.board-head .is-today')).toHaveCount(1)
  // 계획 칸: 평일 5 + 매일 7 = 12
  await expect(page.locator('.check-cell.is-planned')).toHaveCount(12)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('1-board.png') })

  // 오늘 칸 체크 (연산은 매일 계획이라 어느 요일에 테스트해도 '미완료')
  await page.getByRole('button', { name: /^연산 10분 .* 오늘 미완료$/ }).click()
  const checkedToday = page.getByRole('button', { name: /^연산 10분 .* 오늘 완료$/ })
  await expect(checkedToday).toHaveAttribute('aria-pressed', 'true')
  await expect(summaryDone).toHaveText('1')
  await page.screenshot({ path: testInfo.outputPath('2-board-checked.png') })

  // 새로고침해도 유지되고, 다시 누르면 취소
  await page.reload()
  await expect(checkedToday).toBeVisible()
  await checkedToday.click()
  await expect(summaryDone).toHaveText('0')

  // 지난주: 계획한 칸이 모두 지났으니 전부 '놓침'(옅은 분홍)
  await page.getByRole('button', { name: '지난주' }).click()
  await expect(weekBadge).toHaveCount(0)
  await expect(page.locator('.check-cell.is-missed')).toHaveCount(12)
  // 지난 칸도 체크할 수 있고, 체크하면 놓침이 풀림
  await page.locator('.check-cell.is-missed').first().click()
  await expect(page.locator('.check-cell.is-missed')).toHaveCount(11)
  await expect(page.locator('.check-cell.is-done')).toHaveCount(1)
  await page.screenshot({ path: testInfo.outputPath('3-last-week.png') })

  // 이번 주로 돌아오면 지난주 체크는 보이지 않음
  await page.getByRole('button', { name: '이번 주로' }).click()
  await expect(weekBadge).toBeVisible()
  await expect(page.locator('.check-cell.is-done')).toHaveCount(0)

  // 과목 이름을 눌러 설정 화면으로. 학습 내용 하나를 지우고 저장하면 보드에서 사라짐
  await page.getByRole('link', { name: '수학 과목 설정' }).click()
  await expect(page.getByRole('heading', { name: '과목 수정' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('4-subject-form.png') })
  await page.getByRole('button', { name: '학습 내용 1 삭제' }).click()
  await page.getByRole('button', { name: '저장' }).click()
  await expect(board.getByRole('rowheader', { name: '문제집 2쪽' })).toHaveCount(0)
  await expect(board.getByRole('rowheader', { name: '연산 10분' })).toBeVisible()

  // 아이별 분리: 둘째를 추가하고 고르면 과목이 비어 있고, 첫째로 돌아오면 그대로
  await addChildren(page, ['둘째'])
  const switcher = page.getByRole('group', { name: '아이 선택' })
  await page.goto('/')
  await switcher.getByRole('button', { name: '둘째' }).click()
  await expect(page.getByText('아직 과목이 없습니다.')).toBeVisible()
  await switcher.getByRole('button', { name: '첫째' }).click()
  await expect(board.getByRole('rowheader', { name: '연산 10분' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('계획표 보기: 과목 줄과 칸 안의 학습 내용, 체크, 보기 방식 기억', async ({ page }, testInfo) => {
  const viewPicker = page.getByRole('radiogroup', { name: '보기 방식' })
  const planTable = page.locator('.plan-table')
  const summaryDone = page.locator('.week-summary strong')

  await addChildren(page, ['첫째'])
  await addSubject(page, { name: '국어', tasks: [{ name: '받아쓰기' }, { name: '독서 20분', days: ['토', '일'] }] })
  await addSubject(page, { name: '수학', color: '초록', tasks: [{ name: '연산', days: ['토', '일'] }] })
  await page.goto('/')

  // 기본은 체크표. 계획표로 바꾸면 과목이 줄이 되고 칸 안에 그날 학습 내용이 보임
  await expect(viewPicker.getByRole('radio', { name: '체크표' })).toBeChecked()
  await expect(page.locator('.check-table')).toBeVisible()
  await viewPicker.getByRole('radio', { name: '계획표' }).check()
  await expect(planTable).toBeVisible()
  await expect(page.locator('.check-table')).toHaveCount(0)
  await expect(planTable.getByRole('link', { name: '국어 과목 설정' })).toBeVisible()
  await expect(planTable.getByRole('link', { name: '수학 과목 설정' })).toBeVisible()
  // 칸 안의 학습 내용: 받아쓰기 평일 5 + 독서 매일 7 + 연산 매일 7 = 19
  await expect(page.locator('.plan-item')).toHaveCount(19)
  await expect(page.locator('.plan-item.is-planned')).toHaveCount(19)
  // 표는 넓어도 화면(문서) 자체는 넓어지지 않음 (좁은 화면은 표 안에서 옆으로 밂)
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: testInfo.outputPath('1-plan.png') })

  // 오늘 칸의 학습 내용을 누르면 체크되고 이름에 줄이 그어짐
  const todayItem = page.getByRole('button', { name: /^연산 .* 오늘 미완료$/ })
  await todayItem.click()
  const checked = page.getByRole('button', { name: /^연산 .* 오늘 완료$/ })
  await expect(checked).toHaveAttribute('aria-pressed', 'true')
  await expect(checked).toHaveClass(/is-done/)
  await expect(summaryDone).toHaveText('1')
  await page.screenshot({ path: testInfo.outputPath('2-plan-checked.png') })

  // 새로고침해도 계획표 보기가 유지되고 체크도 남아 있음
  await page.reload()
  await expect(viewPicker.getByRole('radio', { name: '계획표' })).toBeChecked()
  await expect(page.getByRole('button', { name: /^연산 .* 오늘 완료$/ })).toBeVisible()

  // 체크표로 돌아가도 같은 체크가 보임
  await viewPicker.getByRole('radio', { name: '체크표' }).check()
  await expect(page.locator('.check-table')).toBeVisible()
  await expect(page.getByRole('button', { name: /^연산 .* 오늘 완료$/ })).toHaveAttribute('aria-pressed', 'true')
  await expectNoHorizontalOverflow(page)
})
