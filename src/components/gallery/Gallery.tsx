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
import ArtworkModal from "./ArtworkModal";
import CelebrationForm from "./CelebrationForm";
import CelebrationFlowers from "./CelebrationFlower";
import { ARTWORK_LIST } from "./artworkData";
import { VIEWPOINTS } from "./viewpoints";
import type { ArtworkData } from "./artworkData";
import { CAMERA_INITIAL } from "./constants";
import {
  loadCelebrations,
  saveCelebration,
  type CelebrationEntry,
} from "./celebrationService";
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
  const [artworkIdx, setArtworkIdx] = useState(-1); // -1 = 투어 미시작

  // 축하하기 — 폼 표시 여부 + 축하 항목 목록
  const [showCelebrationForm, setShowCelebrationForm] = useState(false);
  const [celebrations, setCelebrations] = useState<CelebrationEntry[]>(
    () => loadCelebrations(),
  );

  const handleActivateTour = useCallback(() => setArtworkIdx(0), []);
  const handleReturnToStart = useCallback(() => setArtworkIdx(-1), []);
  const handlePrevArtwork = useCallback(() => {
    setArtworkIdx((i) => (Math.max(0, i) - 1 + VIEWPOINTS.length) % VIEWPOINTS.length);
  }, []);
  const handleNextArtwork = useCallback(() => {
    setArtworkIdx((i) => (Math.max(0, i) + 1) % VIEWPOINTS.length);
  }, []);

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

  // 축하하기 — 폼 제출 시 저장 후 목록 갱신
  const handleCelebrationSubmit = useCallback(
    (data: Omit<CelebrationEntry, "id" | "createdAt">) => {
      const updated = saveCelebration(data);
      setCelebrations(updated);
    },
    [],
  );

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
        <CelebrationFlowers celebrations={celebrations} />

        {isMobile ? (
          <GalleryControlsMobile
            onInteract={handleInteract}
            onEnterMediaRoom={handleEnterMediaRoom}
            onNearDoor={setNearDoor}
            artworkIdx={artworkIdx}
            isModalOpen={!!selectedArtwork}
          />
        ) : (
          <GalleryControls
            onLockChange={setIsLocked}
            onLookingAt={handleLookingAt}
            onInteract={handleInteract}
            onEnterMediaRoom={handleEnterMediaRoom}
            onNearDoor={setNearDoor}
            artworkIdx={artworkIdx}
            viewpoints={VIEWPOINTS}
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
        artworkIdx={artworkIdx}
        artworkTotal={VIEWPOINTS.length}
        onActivateTour={handleActivateTour}
        onReturnToStart={handleReturnToStart}
        onPrevArtwork={handlePrevArtwork}
        onNextArtwork={handleNextArtwork}
        onCelebrate={() => setShowCelebrationForm(true)}
      />

      {selectedArtwork && (
        <ArtworkModal artwork={selectedArtwork} onClose={handleCloseModal} />
      )}

      {/* 축하하기 폼 모달 */}
      {showCelebrationForm && (
        <CelebrationForm
          onSubmit={handleCelebrationSubmit}
          onClose={() => setShowCelebrationForm(false)}
        />
      )}

    </div>
  );
}
