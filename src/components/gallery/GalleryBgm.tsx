/**
 * GalleryBgm
 * 갤러리 배경음악 — 자동 재생 + ON/OFF 토글 버튼
 * 브라우저 자동재생 정책상 첫 번째 사용자 상호작용 이후에 재생을 시작한다
 */

import { useEffect, useRef, useState } from "react";
import "./Gallery.css";
import { bgmStore } from "./bgmStore";

export default function GalleryBgm({ bottom, mediaSeated }: { bottom?: boolean; mediaSeated?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;

    // 마운트 시 자동재생 시도
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // 브라우저 자동재생 차단 시 → 첫 클릭/터치 때 재생 시작
        const startOnInteraction = () => {
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        };
        document.addEventListener("click", startOnInteraction, { once: true });
        document.addEventListener("touchstart", startOnInteraction, { once: true });
      });

    return () => {
      audio.pause();
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      bgmStore.setPlaying(false);
    } else {
      audio.play().then(() => { setIsPlaying(true); bgmStore.setPlaying(true); }).catch(() => {});
    }
  };

  // store에 toggle 등록
  useEffect(() => {
    bgmStore.register(toggle);
    bgmStore.setPlaying(isPlaying);
    return () => bgmStore.unregister();
  }, [isPlaying]);

  return (
    <>
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

      {/* 미디어룸에서는 HUD 컨트롤 그룹 안에 버튼이 렌더링되므로 숨김 */}
      {!bottom && <button
        className={[
          "gallery-bgm-btn",
          isPlaying ? "gallery-bgm-btn--playing" : "",
          bottom && !mediaSeated ? "gallery-bgm-btn--media-alone" : "",
          bottom && mediaSeated  ? "gallery-bgm-btn--media-seated" : "",
        ].join(" ").trim()}
        onClick={toggle}
        title={isPlaying ? "음악 끄기" : "음악 켜기"}
        aria-label={isPlaying ? "배경음악 끄기" : "배경음악 켜기"}
      >
        {isPlaying ? (
          /* 재생 중 — 스피커 + 음파 */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M18.5 6a9 9 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          /* 정지 중 — 스피커 + X */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" />
            <line x1="16" y1="10" x2="22" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="22" y1="10" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>}
    </>
  );
}
