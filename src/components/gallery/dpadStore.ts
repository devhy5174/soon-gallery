/** D패드 방향키 상태 — GalleryHUD ↔ GalleryControlsMobile 공유 */

export type DpadDir = "f" | "b" | "l" | "r";

const pressed = new Set<DpadDir>();

export const dpadStore = {
  press(dir: DpadDir) { pressed.add(dir); },
  release(dir: DpadDir) { pressed.delete(dir); },
  isAny() { return pressed.size > 0; },
  isActive(dir: DpadDir) { return pressed.has(dir); },
  releaseAll() { pressed.clear(); },
};
