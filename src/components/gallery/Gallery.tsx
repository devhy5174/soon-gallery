/**
 * Gallery
 * 3D 갤러리 메인 컴포넌트
 * React Three Fiber Canvas + HUD 오버레이를 조합한다
 */

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import GalleryLights from "./GalleryLights";
import GalleryRoom from "./GalleryRoom";
import GalleryArtworks from "./GalleryArtworks";
import GalleryControls from "./GalleryControls";
import GalleryHUD from "./GalleryHUD";
import { CAMERA_INITIAL } from "./constants";
import "./Gallery.css";

interface Props {
  /** 갤러리 나가기 → 입장 화면 복귀 콜백 */
  onExit: () => void;
}

export default function Gallery({ onExit }: Props) {
  /** 포인터 락(1인칭 조작) 활성화 여부 */
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="gallery-wrapper">
      {/* Three.js 3D 씬 */}
      <Canvas
        shadows
        camera={{
          fov: CAMERA_INITIAL.fov,
          near: 0.1,
          far: 100,
          position: CAMERA_INITIAL.position,
        }}
        gl={{ antialias: true }}
      >
        {/* 조명 */}
        <GalleryLights />

        {/* 방 구조 (바닥, 벽, 천장, 빔, 가구) */}
        <GalleryRoom />

        {/* 작품 액자 */}
        <GalleryArtworks />

        {/* 1인칭 이동 컨트롤 */}
        <GalleryControls onLockChange={setIsLocked} />
      </Canvas>

      {/* HTML 오버레이 UI */}
      <GalleryHUD isLocked={isLocked} onExit={onExit} />
    </div>
  );
}
