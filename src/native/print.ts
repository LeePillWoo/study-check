/**
 * 지금 화면을 인쇄합니다. 인쇄 모양은 index.css의 @media print 가 정합니다. (화면은 숨기고 인쇄용 표만 보임)
 * - 브라우저: 인쇄 창이 열리고 네트워크 프린터나 'PDF로 저장'을 고릅니다. 파일은 앱이 만들지 않습니다.
 * - APK 단계: 안드로이드 웹뷰는 window.print()가 동작하지 않아서 학원노트처럼 인쇄 플러그인(안드로이드 인쇄 서비스)으로 바꿉니다.
 *
 * name은 인쇄 작업 이름입니다. 'PDF로 저장'을 고르면 파일 이름의 기본값이 됩니다.
 */
export function printPage(name: string) {
  const originalTitle = document.title
  document.title = name
  try {
    window.print()
  } finally {
    document.title = originalTitle
  }
}
