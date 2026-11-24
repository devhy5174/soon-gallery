/**
 * 미디어 룸 상수
 */

/** 방 치수 (갤러리보다 아늑한 소형 극장) */
export const ROOM = {
  width: 10,   // x: -5 ~ +5
  depth: 14,   // z: -7 ~ +7
  height: 3.6, // y: 0 ~ 3.6
} as const;

/** 작품 자동 전환 간격 (ms) */
export const AUTO_ADVANCE_MS = 8000;

/** 카메라 초기 위치 — 중앙 약간 뒤, 스크린을 바라봄 */
export const CAMERA_POS: [number, number, number] = [0, 1.6, 4.5];
export const CAMERA_TARGET: [number, number, number] = [0, 2.0, -6];
