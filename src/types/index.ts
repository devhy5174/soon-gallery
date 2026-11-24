/**
 * 앱 전체에서 사용하는 TypeScript 타입 정의
 */

/**
 * 앱 화면 상태
 * - entrance: 갤러리 입장 화면
 * - gallery: 3D 전시관 (게스트 모드)
 * - admin-login: 관리자 로그인
 * - admin-gallery: 3D 전시관 (관리자 모드)
 */
export type AppScreen =
  | "entrance"
  | "gallery"
  | "media-room"
  | "admin-login"
  | "admin-gallery";
