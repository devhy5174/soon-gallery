/**
 * GalleryHUD
 * 갤러리 오버레이 UI — 입장 안내, 조작 가이드, 나가기 버튼
 * Canvas 외부에서 렌더링되는 HTML 레이어
 */

import "./Gallery.css";

interface Props {
  /** 포인터 락 활성화 여부 */
  isLocked: boolean;
  /** 갤러리 나가기 콜백 */
  onExit: () => void;
}

export default function GalleryHUD({ isLocked, onExit }: Props) {
  const handleExit = () => {
    // 포인터 락 해제 후 입장 화면으로 이동
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    onExit();
  };

  return (
    <>
      {/* 클릭 유도 오버레이 — 포인터 락 전에만 표시 */}
      {!isLocked && (
        <div className="gallery-overlay">
          <div className="gallery-overlay__inner">
            <div className="gallery-overlay__icon" aria-hidden="true">
              {/* 마우스 아이콘 SVG */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="10" y="4" width="12" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="16" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="gallery-overlay__title">클릭하여 관람 시작</p>
            <p className="gallery-overlay__hint">
              WASD 또는 방향키로 이동 · 마우스로 시점 전환
            </p>
            <button className="gallery-overlay__exit btn btn-outline" onClick={handleExit}>
              ← 입장 화면으로
            </button>
          </div>
        </div>
      )}

      {/* 조작 가이드 — 포인터 락 활성 시 하단 표시 */}
      {isLocked && (
        <div className="gallery-controls-guide">
          <span>WASD · 방향키 이동</span>
          <span className="gallery-controls-guide__sep">|</span>
          <span>ESC 일시정지</span>
        </div>
      )}

      {/* 나가기 버튼 — 포인터 락 활성 시 숨김 (ESC로 먼저 해제 필요) */}
      {!isLocked && (
        <button className="gallery-exit-btn" onClick={handleExit} title="입장 화면으로">
          ✕
        </button>
      )}
    </>
  );
}
