/**
 * MediaRoomHUD
 * 미디어 룸 오버레이 UI — 슬라이드 컨트롤 + 작품 정보
 */

import type { ArtworkData } from "../gallery/artworkData";
import "./MediaRoom.css";

interface Props {
  artwork: ArtworkData;
  currentIndex: number;
  total: number;
  isAutoPlay: boolean;
  isSeated: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleAutoPlay: () => void;
  onStandUp: () => void;
  onExit: () => void;
}

export default function MediaRoomHUD({
  artwork,
  currentIndex,
  total,
  isAutoPlay,
  isSeated,
  onPrev,
  onNext,
  onToggleAutoPlay,
  onStandUp,
  onExit,
}: Props) {
  return (
    <>
      {/* 나가기 버튼 */}
      <button className="mr-exit-btn" onClick={onExit} title="나가기">
        ← 갤러리
      </button>

      {/* 앉아 있을 때 — 일어서기 버튼 */}
      {isSeated && (
        <button className="mr-standup-btn" onClick={onStandUp} title="일어서기">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 5 }}>
            <path d="M12 19V5m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          일어서기
        </button>
      )}

      {/* 작품 정보 — 앉았을 때만 표시 */}
      {isSeated && (
        <div className="mr-info">
          <p className="mr-info__title">{artwork.title}</p>
          <p className="mr-info__title-en">{artwork.titleEn}</p>
        </div>
      )}

      {/* 슬라이드 컨트롤 — 앉았을 때만 표시 */}
      {isSeated && <div className="mr-controls">
        {/* 이전 */}
        <button className="mr-controls__btn" onClick={onPrev} aria-label="이전 작품">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 자동재생 토글 */}
        <button
          className={`mr-controls__btn mr-controls__btn--play ${isAutoPlay ? "mr-controls__btn--active" : ""}`}
          onClick={onToggleAutoPlay}
          aria-label={isAutoPlay ? "자동재생 중지" : "자동재생 시작"}
        >
          {isAutoPlay ? (
            /* 일시정지 아이콘 */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            /* 재생 아이콘 */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          )}
        </button>

        {/* 다음 */}
        <button className="mr-controls__btn" onClick={onNext} aria-label="다음 작품">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>}

      {/* 진행 도트 — 앉았을 때만 표시 */}
      {isSeated && (
        <div className="mr-dots" role="tablist" aria-label="작품 목록">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`mr-dots__dot ${i === currentIndex ? "mr-dots__dot--active" : ""}`}
              role="tab"
              aria-selected={i === currentIndex}
            />
          ))}
        </div>
      )}
    </>
  );
}
