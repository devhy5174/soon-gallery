/**
 * viewpoints
 * 모바일 작품 뷰포인트 — 각 작품 앞 최적 감상 위치 + 시점
 */

export interface Viewpoint {
  artworkId: string;
  position: [number, number, number]; // 카메라 위치
  lookAt: [number, number, number];   // 바라볼 지점
}

// 시계방향 투어: 왼쪽 벽(문 근처→입구) → 앞벽 → 오른쪽 벽(입구→뒤) → 뒷벽(메인 마지막)
export const VIEWPOINTS: Viewpoint[] = [
  // ── 왼쪽 벽 (문 근처→입구 방향) ──────────────
  { artworkId: "left-n5",  position: [-3.5, 1.7, -5], lookAt: [-5.93, 1.7, -5]  },
  { artworkId: "left-1",   position: [-3.5, 1.7,  1], lookAt: [-5.93, 1.7,  1]  },
  { artworkId: "left-7",   position: [-3.5, 1.7,  7], lookAt: [-5.93, 1.7,  7]  },
  // ── 앞벽 (왼쪽→오른쪽) ───────────────────────
  { artworkId: "front-1",  position: [-3.5, 1.7, 9.5], lookAt: [-3.5, 1.7, 12.9] },
  { artworkId: "front-2",  position: [0,    1.7, 9.5], lookAt: [0,    1.7, 12.9] },
  { artworkId: "front-3",  position: [3.5,  1.7, 9.5], lookAt: [3.5,  1.7, 12.9] },
  // ── 오른쪽 벽 (입구→문 근처 방향) ───────────
  { artworkId: "right-7",  position: [3.5,  1.7,  7], lookAt: [5.93,  1.7,  7]  },
  { artworkId: "right-1",  position: [3.5,  1.7,  1], lookAt: [5.93,  1.7,  1]  },
  { artworkId: "right-n5", position: [3.5,  1.7, -5], lookAt: [5.93,  1.7, -5]  },
  // ── 뒷벽 (사이드→메인 하이라이트) ───────────
  { artworkId: "back-left-1",  position: [-3.8, 1.7, -9.5], lookAt: [-3.8, 1.7, -12.9] },
  { artworkId: "back-right-1", position: [3.8,  1.7, -9.5], lookAt: [3.8,  1.7, -12.9] },
  { artworkId: "back-main",    position: [0,    1.7, -8.5],  lookAt: [0,    1.7, -12.9] },
];
