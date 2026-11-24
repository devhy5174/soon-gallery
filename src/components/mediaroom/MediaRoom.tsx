/**
 * MediaRoom
 * 미디어 룸 메인 컴포넌트 — 고정 시점 + 작품 슬라이드쇼
 * 걷기 힘든 방문객을 위한 앉아서 감상하는 공간
 */

import { useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import MediaRoomScene from "./MediaRoomScene";
import MediaRoomHUD from "./MediaRoomHUD";
import { ARTWORK_LIST } from "../gallery/artworkData";
import { AUTO_ADVANCE_MS, CAMERA_POS } from "./constants";
import "./MediaRoom.css";

interface Props {
  onExit: () => void;
  onSeatChange?: (seated: boolean) => void;
}

export default function MediaRoom({ onExit, onSeatChange }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isThankYou, setIsThankYou] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [seatedAt, setSeatedAt] = useState<[number, number, number] | null>(null);

  const handleBenchSit = (pos: [number, number, number]) => {
    setSeatedAt(pos);
    setIsAutoPlay(true);
    onSeatChange?.(true);
  };
  const handleStandUp = useCallback(() => {
    setSeatedAt(null);
    setIsThankYou(false);
    setLightsOff(false);
    setIsAutoPlay(false);
    setCurrentIndex(0);
    onSeatChange?.(false);
  }, [onSeatChange]);

  // 조명 꺼지면 → 2초 후 자동 일어서기
  useEffect(() => {
    if (!lightsOff || !seatedAt) return;
    const t = setTimeout(() => handleStandUp(), 2000);
    return () => clearTimeout(t);
  }, [lightsOff, seatedAt, handleStandUp]);

  const total = ARTWORK_LIST.length;

  /** 다음 작품 */
  const goNext = useCallback(() => {
    if (isThankYou) { setLightsOff(true); return; } // 감사합니다 → 조명 꺼짐 시작
    if (currentIndex === total - 1) { setIsThankYou(true); return; }
    setCurrentIndex((i) => i + 1);
  }, [currentIndex, isThankYou, total]);

  /** 이전 작품 */
  const goPrev = useCallback(() => {
    if (isThankYou) { setIsThankYou(false); setCurrentIndex(total - 1); return; }
    setCurrentIndex((i) => (i - 1 + total) % total);
  }, [isThankYou, total]);

  /** 자동재생 타이머 */
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(goNext, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isAutoPlay, goNext]);

  /** 3D 씬 내부에서 호출하는 자동전진 (8초 타이머와 별개로 애니메이션 동기화용) */
  const handleAutoAdvance = useCallback(() => {
    if (isAutoPlay) goNext();
  }, [isAutoPlay, goNext]);

  return (
    <div className="mr-wrapper">
      <div className={`mr-lights-overlay${lightsOff ? " mr-lights-overlay--off" : ""}`} />
      <Canvas
        camera={{ fov: 65, near: 0.1, far: 60, position: CAMERA_POS }}
        gl={{ antialias: true }}
      >
        <MediaRoomScene
          currentIndex={currentIndex}
          isThankYou={isThankYou}
          onAutoAdvance={handleAutoAdvance}
          isAutoPlay={isAutoPlay}
          seatedAt={seatedAt}
          onBenchSit={handleBenchSit}
        />
      </Canvas>

      <MediaRoomHUD
        artwork={ARTWORK_LIST[currentIndex]}
        currentIndex={isThankYou ? total : currentIndex}
        total={total + 1}
        isAutoPlay={isAutoPlay}
        isSeated={seatedAt !== null}
        isThankYou={isThankYou}
        onPrev={goPrev}
        onNext={goNext}
        onToggleAutoPlay={() => setIsAutoPlay((v) => !v)}
        onStandUp={handleStandUp}
        onExit={onExit}
      />
    </div>
  );
}
