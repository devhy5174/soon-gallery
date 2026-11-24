/**
 * GalleryHUD
 * 갤러리 오버레이 UI — 데스크톱/모바일 공통
 * - 데스크톱: 클릭 유도 오버레이, 크로스헤어, E키 힌트, 조작 가이드
 * - 모바일: 입장 안내, 나가기 버튼, 조작 가이드
 */

import "./Gallery.css";

interface Props {
  isLocked: boolean;
  isMobile: boolean;
  lookingAt: string | null;
  onExit: () => void;
  isModalOpen: boolean;
}

export default function GalleryHUD({
  isLocked,
  isMobile,
  lookingAt,
  onExit,
  isModalOpen,
}: Props) {
  const handleExit = () => {
    if (document.pointerLockElement) document.exitPointerLock();
    onExit();
  };

  // ── 모바일 HUD ──────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* 모바일 입장 안내 — 첫 진입 시 1회 표시 (isModalOpen 아닐 때) */}
        {!isModalOpen && (
          <>
            {/* 나가기 버튼 */}
            <button className="gallery-exit-btn" onClick={handleExit} title="입장 화면으로">
              ✕
            </button>

            {/* 하단 모바일 조작 가이드 */}
            <div className="gallery-controls-guide gallery-controls-guide--mobile">
              <span>왼쪽 하단 조이스틱 이동</span>
              <span className="gallery-controls-guide__sep">|</span>
              <span>드래그 시점 전환</span>
              <span className="gallery-controls-guide__sep">|</span>
              <span>그림 탭 감상</span>
            </div>
          </>
        )}
      </>
    );
  }

  // ── 데스크톱 HUD ─────────────────────────────────────────
  return (
    <>
      {/* 클릭 유도 오버레이 (포인터 락 전, 모달 닫힌 상태) */}
      {!isLocked && !isModalOpen && (
        <div className="gallery-overlay">
          <div className="gallery-overlay__inner">
            <div className="gallery-overlay__icon" aria-hidden="true">
              <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
                <rect x="8" y="4" width="16" height="26" rx="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="16" y1="4" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <p className="gallery-overlay__title">클릭하여 관람 시작</p>
            <p className="gallery-overlay__hint">
              WASD · 방향키 이동 &nbsp;|&nbsp; 마우스 시점 전환
              <br />
              작품 조준 후 <strong>E</strong> 키로 감상
            </p>
            <button className="gallery-overlay__exit btn btn-outline" onClick={handleExit}>
              ← 입장 화면으로
            </button>
          </div>
        </div>
      )}

      {/* 포인터 락 활성 상태 UI */}
      {isLocked && (
        <>
          {/* 크로스헤어 — 작품 조준 시 강조 */}
          <div
            className={`gallery-crosshair ${lookingAt ? "gallery-crosshair--active" : ""}`}
            aria-hidden="true"
          />

          {/* 작품 E키 힌트 */}
          {lookingAt && (
            <div className="gallery-interact-hint">
              <kbd className="gallery-interact-hint__key">E</kbd>
              <span>작품 감상</span>
            </div>
          )}

          {/* 하단 조작 가이드 */}
          <div className="gallery-controls-guide">
            <span>WASD · 방향키 이동</span>
            <span className="gallery-controls-guide__sep">|</span>
            <span>E 작품 감상</span>
            <span className="gallery-controls-guide__sep">|</span>
            <span>ESC 일시정지</span>
          </div>
        </>
      )}

      {/* 나가기 버튼 */}
      {!isLocked && !isModalOpen && (
        <button className="gallery-exit-btn" onClick={handleExit} title="입장 화면으로">
          ✕
        </button>
      )}
    </>
  );
}
