/**
 * bgmStore
 * GalleryBgm ↔ MediaRoomHUD 간 음악 상태 공유용 경량 스토어
 */

type Listener = (playing: boolean) => void;

let _toggle: (() => void) | null = null;
let _isPlaying = false;
const _listeners: Set<Listener> = new Set();

export const bgmStore = {
  register(toggle: () => void) { _toggle = toggle; },
  unregister() { _toggle = null; },
  toggle() { _toggle?.(); },
  setPlaying(v: boolean) {
    _isPlaying = v;
    _listeners.forEach((l) => l(v));
  },
  getPlaying() { return _isPlaying; },
  subscribe(fn: Listener) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
