/**
 * GalleryHUD
 * 갤러리 오버레이 UI — 데스크톱/모바일 공통
 * - 데스크톱: 클릭 유도 오버레이, 크로스헤어, E키 힌트, 조작 가이드
 * - 모바일: 입장 안내, 나가기 버튼, 조작 가이드
 */

import { useState } from "react";
import { dpadStore } from "./dpadStore";
import type { DpadDir } from "./dpadStore";
import "./Gallery.css";

function DPad() {
  const btn = (dir: DpadDir, label: string, area: string) => (
    <button
      className="gallery-dpad__btn"
      style={{ gridArea: area }}
      onPointerDown={(e) => { e.preventDefault(); dpadStore.press(dir); }}
      onPointerUp={() => dpadStore.release(dir)}
      onPointerLeave={() => dpadStore.release(dir)}
      onPointerCancel={() => dpadStore.release(dir)}
    >
      {label}
    </button>
  );
  return (
    <div className="gallery-dpad" data-dpad="true">
      {btn("f", "▲", "up")}
      {btn("l", "◀", "left")}
      {btn("r", "▶", "right")}
      {btn("b", "▼", "down")}
    </div>
  );
}

interface Props {
  isLocked: boolean;
  isMobile: boolean;
  lookingAt: string | null;
  nearDoor: boolean;
  onExit: () => void;
  isModalOpen: boolean;
  artworkIdx?: number;
  artworkTotal?: number;
  onActivateTour?: () => void;
  onReturnToStart?: () => void;
  onPrevArtwork?: () => void;
  onNextArtwork?: () => void;
  onCelebrate?: () => void;
}

export default function GalleryHUD({
  isLocked,
  isMobile,
  lookingAt,
  nearDoor,
  onExit,
  isModalOpen,
  artworkIdx = -1,
  artworkTotal = 12,
  onActivateTour,
  onReturnToStart,
  onPrevArtwork,
  onNextArtwork,
  onCelebrate,
}: Props) {
  const [navOpen, setNavOpen] = useState(false);
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
            {/* 왼쪽 상단 버튼 — 투어 중이면 첫 자리로, 아니면 입장 화면으로 */}
            <button
              className="gallery-exit-btn"
              onClick={() => {
                if (navOpen) {
                  setNavOpen(false);
                  onReturnToStart?.();
                } else {
                  handleExit();
                }
              }}
              title={navOpen ? "처음 자리로" : "입장 화면으로"}
            >
              ✕
            </button>

            {/* 하단 작품 순서 네비게이션 */}
            {!navOpen ? (
              <div className="gallery-artwork-nav gallery-artwork-nav--start">
                <button
                  className="gallery-artwork-nav__start-btn"
                  onClick={() => { setNavOpen(true); onActivateTour?.(); }}
                >
                  작품 감상하기
                </button>
              </div>
            ) : (
              <div className="gallery-artwork-nav">
                <button className="gallery-artwork-nav__btn" onClick={onPrevArtwork} aria-label="이전 작품">
                  〈 이전
                </button>
                <span className="gallery-artwork-nav__count">
                  {Math.max(0, artworkIdx) + 1} / {artworkTotal}
                </span>
                <button className="gallery-artwork-nav__btn" onClick={onNextArtwork} aria-label="다음 작품">
                  다음 〉
                </button>
              </div>
            )}

            {/* 축하하기 버튼 */}
            {onCelebrate && (
              <button className="gallery-celebration-btn" onClick={onCelebrate}>
                🌸 축하하기
              </button>
            )}

            {/* D패드 방향키 */}
            <DPad />

            {/* 하단 모바일 조작 가이드 */}
            <div className="gallery-controls-guide gallery-controls-guide--mobile">
              <span>D패드 · 바닥 터치 이동</span>
              <span>드래그 시점</span>
              <span>그림 터치 감상</span>
            </div>
          </>
        )}
      </>
    );
  }

  // ── 데스크톱 HUD ─────────────────────────────────────────
  return (
    <>
      {/* 투어 모드 UI (artworkIdx >= 0) */}
      {artworkIdx >= 0 && !isModalOpen && (
        <>
          <button className="gallery-exit-btn" onClick={() => { onReturnToStart?.(); }} title="자유 이동으로">✕</button>
          <div className="gallery-artwork-nav">
            <button className="gallery-artwork-nav__btn" onClick={onPrevArtwork}>〈 이전</button>
            <span className="gallery-artwork-nav__count">{artworkIdx + 1} / {artworkTotal}</span>
            <button className="gallery-artwork-nav__btn" onClick={onNextArtwork}>다음 〉</button>
          </div>
        </>
      )}

      {/* 클릭 유도 오버레이 — 자유 이동 모드에서만 */}
      {!isLocked && !isModalOpen && artworkIdx < 0 && (
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
              작품·문 조준 후 <strong>클릭</strong>으로 입장
            </p>
            {onActivateTour && (
              <button className="gallery-overlay__tour-btn btn btn-primary" onClick={onActivateTour}>
                작품 감상하기
              </button>
            )}
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

          {/* 작품 클릭 힌트 */}
          {lookingAt && (
            <div className="gallery-interact-hint">
              <span className="gallery-interact-hint__icon" aria-hidden="true">
                {/* 마우스 클릭 아이콘 */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 3v8l3-3m-3 3L9 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span>클릭하여 감상</span>
            </div>
          )}

          {/* 문 근처 힌트 */}
          {nearDoor && !lookingAt && (
            <div className="gallery-interact-hint gallery-interact-hint--door">
              <span className="gallery-interact-hint__icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M9 12h6m-3-3v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <span>클릭하여 미디어 룸 입장</span>
            </div>
          )}

          {/* 하단 조작 가이드 */}
          <div className="gallery-controls-guide">
            <span>WASD · 방향키 이동</span>
            <span className="gallery-controls-guide__sep">|</span>
            <span>클릭 감상·입장</span>
            <span className="gallery-controls-guide__sep">|</span>
            <span>ESC 일시정지</span>
          </div>
        </>
      )}

      {/* 나가기 버튼 — 자유 이동 모드에서만 */}
      {!isLocked && !isModalOpen && artworkIdx < 0 && (
        <button className="gallery-exit-btn" onClick={handleExit} title="입장 화면으로">
          ✕
        </button>
      )}

      {/* 축하하기 버튼 — 포인터 락 해제 상태에서 항상 표시 */}
      {!isLocked && !isModalOpen && onCelebrate && (
        <button className="gallery-celebration-btn" onClick={onCelebrate}>
          🌸 축하하기
        </button>
      )}
    </>
  );
}
