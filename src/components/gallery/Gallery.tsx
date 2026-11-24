/**
 * Gallery
 * 3D 갤러리 메인 컴포넌트
 * - 모바일/데스크톱 감지 후 맞는 컨트롤 렌더링
 * - Canvas(씬) + HUD + 작품 모달 조합
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import GalleryLights from "./GalleryLights";
import GalleryRoom from "./GalleryRoom";
import GalleryArtworks from "./GalleryArtworks";
import GalleryControls from "./GalleryControls";
import GalleryControlsMobile from "./GalleryControlsMobile";
import GalleryHUD from "./GalleryHUD";
import MobileJoystick from "./MobileJoystick";
import ArtworkModal from "./ArtworkModal";
import GalleryBgm from "./GalleryBgm";
import { ARTWORK_LIST } from "./artworkData";
import type { ArtworkData } from "./artworkData";
import { CAMERA_INITIAL } from "./constants";
import "./Gallery.css";

interface Props {
  onExit: () => void;
}

/** 터치 디바이스 여부 감지 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(pointer: coarse)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function Gallery({ onExit }: Props) {
  const isMobile = useIsMobile();
  const [isLocked, setIsLocked] = useState(false);
  const [lookingAt, setLookingAt] = useState<string | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null);

  // lookingAt 중복 setState 방지
  const lookingAtRef = useRef<string | null>(null);
  const handleLookingAt = useCallback((id: string | null) => {
    if (id !== lookingAtRef.current) {
      lookingAtRef.current = id;
      setLookingAt(id);
    }
  }, []);

  /** 작품 모달 오픈 (데스크톱 E키 / 모바일 탭 공통) */
  const handleInteract = useCallback((artworkId: string) => {
    const artwork = ARTWORK_LIST.find((a) => a.id === artworkId);
    if (!artwork) return;
    if (document.pointerLockElement) document.exitPointerLock();
    setSelectedArtwork(artwork);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedArtwork(null);
  }, []);

  return (
    <div className="gallery-wrapper">
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
        <GalleryLights />
        <GalleryRoom />
        <GalleryArtworks />

        {/* 디바이스별 컨트롤 — 데스크톱: 포인터락+WASD / 모바일: 터치 */}
        {isMobile ? (
          <GalleryControlsMobile onInteract={handleInteract} />
        ) : (
          <GalleryControls
            onLockChange={setIsLocked}
            onLookingAt={handleLookingAt}
            onInteract={handleInteract}
          />
        )}
      </Canvas>

      {/* HUD 오버레이 */}
      <GalleryHUD
        isLocked={isLocked}
        isMobile={isMobile}
        lookingAt={lookingAt}
        onExit={onExit}
        isModalOpen={!!selectedArtwork}
      />

      {/* 배경음악 */}
      <GalleryBgm />

      {/* 모바일 가상 조이스틱 */}
      {isMobile && !selectedArtwork && <MobileJoystick />}

      {/* 작품 감상 모달 */}
      {selectedArtwork && (
        <ArtworkModal artwork={selectedArtwork} onClose={handleCloseModal} />
      )}
    </div>
  );
}
