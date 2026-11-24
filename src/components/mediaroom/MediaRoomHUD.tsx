/**
 * MediaRoomHUD
 * 미디어 룸 오버레이 UI — 슬라이드 컨트롤 + 작품 정보
 */

import { useState, useEffect } from "react";
import type { ArtworkData } from "../gallery/artworkData";
import { bgmStore } from "../gallery/bgmStore";
import "./MediaRoom.css";

interface Props {
  artwork: ArtworkData;
  currentIndex: number;
  total: number;
  isAutoPlay: boolean;
  isSeated: boolean;
  isThankYou?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleAutoPlay: () => void;
  onStandUp: () => void;
  onExit: () => void;
}

function BgmBtn() {
  const [playing, setPlaying] = useState(() => bgmStore.getPlaying());
  useEffect(() => bgmStore.subscribe(setPlaying), []);
  return (
    <button
      className={`mr-controls__btn ${playing ? "mr-controls__btn--active" : ""}`}
      onClick={() => bgmStore.toggle()}
      aria-label={playing ? "음악 끄기" : "음악 켜기"}
    >
      {playing ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
          <line x1="16" y1="10" x2="22" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="22" y1="10" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

export default function MediaRoomHUD({
  artwork,
  currentIndex,
  total,
  isAutoPlay,
  isSeated,
  isThankYou = false,
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

      {/* 앉기 전 안내 */}
      {!isSeated && (
        <p className="mr-sit-hint">의자를 클릭하여 감상하세요</p>
      )}


      {/* 작품 정보 — 앉았을 때만 표시, 감사합니다 시 페이드아웃 */}
      {isSeated && (
        <div className="mr-info" style={{ opacity: isThankYou ? 0 : 1, transition: "opacity 0.8s ease" }}>
          <p className="mr-info__title">{artwork.title}</p>
          <p className="mr-info__title-en">{artwork.titleEn}</p>
        </div>
      )}

      {/* 슬라이드 컨트롤 — 앉았을 때만 표시 */}
      {isSeated && <div className="mr-controls">
        <button className="mr-controls__btn" onClick={onPrev} aria-label="이전 작품">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className={`mr-controls__btn mr-controls__btn--play ${isAutoPlay ? "mr-controls__btn--active" : ""}`}
          onClick={onToggleAutoPlay}
          aria-label={isAutoPlay ? "자동재생 중지" : "자동재생 시작"}
        >
          {isAutoPlay ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          )}
        </button>
        <button className="mr-controls__btn" onClick={onNext} aria-label="다음 작품">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>}

      {/* 음악 버튼 — 항상 표시, 재생버튼 그룹과 같은 라인 오른쪽 끝 */}
      <div className="mr-bgm-wrap">
        <BgmBtn />
      </div>

      {/* 진행 도트 — 앉았을 때만 표시 */}
      {isSeated && (
        <div className="mr-dots" role="tablist" aria-label="작품 목록">
          <div
            className="mr-dots__track"
            style={{ transform: `translateX(${24 - currentIndex * 24}px)` }}
          >
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className="mr-dots__slot" role="tab" aria-selected={i === currentIndex}>
                <div className={`mr-dots__dot ${i === currentIndex ? "mr-dots__dot--active" : ""}`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
