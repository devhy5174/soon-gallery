/**
 * 갤러리 3D 공간 공통 상수
 * 방 크기, 색상, 배치 좌표를 한 곳에서 관리한다
 */

/** 갤러리 방 치수 (Three.js 단위, 1 unit ≈ 1m) */
export const ROOM = {
  width: 12,    // x: -6 ~ +6
  depth: 26,    // z: -13 ~ +13
  height: 4.5,  // y: 0 ~ 4.5
} as const;

/** 갤러리 재질 색상 */
export const COLORS = {
  wall: "#f3e9dc",      // 아이보리 벽
  floor: "#c9a87c",     // 원목 바닥
  ceiling: "#f7f2e9",   // 천장
  beam: "#3d2b1f",      // 천장 빔 (다크 우드)
  track: "#1c1c1c",     // 레일 조명 트랙
  frameWood: "#8b6845", // 액자 원목
  baseboard: "#b9916a", // 걸레받이
  bench: "#e8ddd0",     // 벤치 상판
  benchLeg: "#c8b59a",  // 벤치 다리
} as const;

/** 카메라 초기 위치 (갤러리 입구) */
export const CAMERA_INITIAL = {
  position: [0, 1.7, 11] as [number, number, number],
  fov: 72,
} as const;

/** 이동 경계 (벽에 가까이 붙지 않도록) */
export const MOVE_BOUNDS = {
  minX: -5.2, maxX: 5.2,
  minZ: -12.0, maxZ: 12.0,
} as const;
