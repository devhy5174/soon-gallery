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
}

export default function MediaRoom({ onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const total = ARTWORK_LIST.length;

  /** 다음 작품 */
  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % total);
  }, [total]);

  /** 이전 작품 */
  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + total) % total);
  }, [total]);

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
      <Canvas
        camera={{ fov: 65, near: 0.1, far: 60, position: CAMERA_POS }}
        gl={{ antialias: true }}
      >
        <MediaRoomScene
          currentIndex={currentIndex}
          onAutoAdvance={handleAutoAdvance}
          isAutoPlay={isAutoPlay}
        />
      </Canvas>

      <MediaRoomHUD
        artwork={ARTWORK_LIST[currentIndex]}
        currentIndex={currentIndex}
        total={total}
        isAutoPlay={isAutoPlay}
        onPrev={goPrev}
        onNext={goNext}
        onToggleAutoPlay={() => setIsAutoPlay((v) => !v)}
        onExit={onExit}
      />
    </div>
  );
}
