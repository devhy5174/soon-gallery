/**
 * MediaRoomScene
 * 미디어 룸 3D 씬 — 방 구조 + 슬라이드쇼 스크린 + 조명
 */

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ROOM, CAMERA_TARGET } from "./constants";
import { drawInkArt } from "../gallery/artDrawings";
import { ARTWORK_LIST } from "../gallery/artworkData";

const W = ROOM.width;
const D = ROOM.depth;
const H = ROOM.height;

/** 슬라이드쇼 스크린 — 작품 자동 전환 + 페이드 애니메이션 */
function ArtworkDisplay({
  currentIndex,
  onAutoAdvance,
  isAutoPlay,
}: {
  currentIndex: number;
  onAutoAdvance: () => void;
  isAutoPlay: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  /** ref 기반 페이드 상태 (useFrame에서 직접 조작) */
  const opacity = useRef(1);
  const phase = useRef<"show" | "fade-out" | "fade-in">("show");
  const showTimer = useRef(0);
  const targetIndex = useRef(currentIndex);
  const displayedIndex = useRef(currentIndex);

  // 초기 텍스처 생성
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d")!;
    drawInkArt(ctx, 800, 1000, ARTWORK_LIST[currentIndex].artType);
    const tex = new THREE.CanvasTexture(canvas);
    textureRef.current = tex;
    if (matRef.current) {
      matRef.current.map = tex;
      matRef.current.needsUpdate = true;
    }
  }, []);

  // 외부 index 변경 감지 → 페이드 트리거
  useEffect(() => {
    if (currentIndex !== displayedIndex.current) {
      targetIndex.current = currentIndex;
      if (phase.current === "show") phase.current = "fade-out";
      showTimer.current = 0;
    }
  }, [currentIndex]);

  const updateTexture = (idx: number) => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    drawInkArt(ctx, 800, 1000, ARTWORK_LIST[idx].artType);
    textureRef.current.needsUpdate = true;
    displayedIndex.current = idx;
  };

  useFrame((_, delta) => {
    if (!matRef.current) return;

    if (phase.current === "show") {
      opacity.current = 1;
      if (isAutoPlay) {
        showTimer.current += delta;
        if (showTimer.current > 8) {
          phase.current = "fade-out";
          showTimer.current = 0;
          onAutoAdvance();
        }
      }
    } else if (phase.current === "fade-out") {
      opacity.current = Math.max(0, opacity.current - delta * 2.5);
      if (opacity.current <= 0) {
        updateTexture(targetIndex.current);
        phase.current = "fade-in";
      }
    } else if (phase.current === "fade-in") {
      opacity.current = Math.min(1, opacity.current + delta * 2.5);
      if (opacity.current >= 1) {
        phase.current = "show";
        showTimer.current = 0;
      }
    }

    matRef.current.opacity = opacity.current;
  });

  return (
    <mesh ref={meshRef} position={[0, 2.1, -6.95]}>
      <planeGeometry args={[3.6, 4.5]} />
      <meshBasicMaterial ref={matRef} transparent opacity={1} />
    </mesh>
  );
}

/** 나무 벤치 */
function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.07, 0.42]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.55} />
      </mesh>
      {(
        [[-0.9, -0.17], [0.9, -0.17], [-0.9, 0.17], [0.9, 0.17]] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.055, 0.42, 0.055]} />
          <meshStandardMaterial color="#c8b59a" roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

/** 스크린 액자 */
function ScreenFrame() {
  return (
    <group position={[0, 2.1, -6.9]}>
      {/* 외곽 액자 */}
      <mesh receiveShadow>
        <boxGeometry args={[3.76, 4.76, 0.08]} />
        <meshStandardMaterial color="#8b6845" roughness={0.55} />
      </mesh>
      {/* 내부 흰 매트 */}
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[3.6, 4.5]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
      </mesh>
    </group>
  );
}

interface Props {
  currentIndex: number;
  onAutoAdvance: () => void;
  isAutoPlay: boolean;
}

export default function MediaRoomScene({ currentIndex, onAutoAdvance, isAutoPlay }: Props) {
  return (
    <>
      {/* OrbitControls — 자리에 앉아 고개만 돌리는 느낌 */}
      <OrbitControls
        target={CAMERA_TARGET}
        enablePan={false}
        enableZoom={false}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        dampingFactor={0.08}
        enableDamping
      />

      {/* ── 조명 ── */}
      <ambientLight intensity={0.2} color="#fff4e0" />
      {/* 스크린 조명 */}
      <spotLight
        position={[0, H - 0.2, -3]}
        target-position={[0, 2.1, -7]}
        intensity={30}
        angle={0.55}
        penumbra={0.6}
        color="#fff8ef"
        castShadow
      />
      {/* 은은한 전체 조명 */}
      <pointLight position={[0, H - 0.3, 2]} intensity={4} distance={8} color="#ffe8c0" />

      {/* ── 방 구조 ── */}
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#c0956a" roughness={0.4} />
      </mesh>
      {/* 천장 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.95} />
      </mesh>
      {/* 뒷벽 (스크린) */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.9} />
      </mesh>
      {/* 앞벽 (갤러리 연결 쪽) */}
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.9} />
      </mesh>
      {/* 왼쪽 벽 */}
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.9} />
      </mesh>
      {/* 오른쪽 벽 */}
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.9} />
      </mesh>

      {/* 걸레받이 */}
      {[-W / 2 + 0.04, W / 2 - 0.04].map((x) => (
        <mesh key={x} position={[x, 0.12, 0]}>
          <boxGeometry args={[0.07, 0.24, D]} />
          <meshStandardMaterial color="#b9916a" roughness={0.65} />
        </mesh>
      ))}

      {/* ── 스크린 액자 ── */}
      <ScreenFrame />

      {/* ── 슬라이드쇼 ── */}
      <ArtworkDisplay
        currentIndex={currentIndex}
        onAutoAdvance={onAutoAdvance}
        isAutoPlay={isAutoPlay}
      />

      {/* ── 벤치 ── */}
      <Bench position={[0, 0, 1.5]} />
      <Bench position={[0, 0, 3.8]} />
    </>
  );
}
