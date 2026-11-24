/**
 * Gallery
 * 3D 갤러리 메인 컴포넌트
 * - 모바일/데스크톱 감지 후 맞는 컨트롤 렌더링
 * - 문 근처 E키로 미디어 룸 입장
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
  onEnterMediaRoom: () => void;
}

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

export default function Gallery({ onExit, onEnterMediaRoom }: Props) {
  const isMobile = useIsMobile();
  const [isLocked, setIsLocked] = useState(false);
  const [lookingAt, setLookingAt] = useState<string | null>(null);
  const [nearDoor, setNearDoor] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null);

  const lookingAtRef = useRef<string | null>(null);
  const handleLookingAt = useCallback((id: string | null) => {
    if (id !== lookingAtRef.current) {
      lookingAtRef.current = id;
      setLookingAt(id);
    }
  }, []);

  const handleInteract = useCallback((artworkId: string) => {
    const artwork = ARTWORK_LIST.find((a) => a.id === artworkId);
    if (!artwork) return;
    if (document.pointerLockElement) document.exitPointerLock();
    setSelectedArtwork(artwork);
  }, []);

  const handleEnterMediaRoom = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
    onEnterMediaRoom();
  }, [onEnterMediaRoom]);

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

        {isMobile ? (
          <GalleryControlsMobile onInteract={handleInteract} />
        ) : (
          <GalleryControls
            onLockChange={setIsLocked}
            onLookingAt={handleLookingAt}
            onInteract={handleInteract}
            onEnterMediaRoom={handleEnterMediaRoom}
            onNearDoor={setNearDoor}
          />
        )}
      </Canvas>

      <GalleryHUD
        isLocked={isLocked}
        isMobile={isMobile}
        lookingAt={lookingAt}
        nearDoor={nearDoor}
        onExit={onExit}
        isModalOpen={!!selectedArtwork}
      />

      <GalleryBgm />

      {isMobile && !selectedArtwork && <MobileJoystick />}

      {selectedArtwork && (
        <ArtworkModal artwork={selectedArtwork} onClose={handleCloseModal} />
      )}
    </div>
  );
}
