/**
 * MediaRoomScene
 * 미디어 룸 3D 씬
 * - 천장 빔프로젝터 모델 + 뒷벽에 직접 투사
 * - 벤치 클릭 시 앉기 애니메이션
 */

import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { ROOM, CAMERA_POS, CAMERA_TARGET } from "./constants";
import { drawInkArt } from "../gallery/artDrawings";
import { ARTWORK_LIST } from "../gallery/artworkData";

const W = ROOM.width;
const D = ROOM.depth;
const H = ROOM.height;

/** 투사 중심 (OrbitControls 타겟 & 카메라 복귀 기준) */
const SCREEN_POS = new THREE.Vector3(0, H / 2, -6.98);
const STAND_POS  = new THREE.Vector3(...CAMERA_POS);
const STAND_FOV  = 65;
const SEATED_FOV = 50;

// 작품 투사 크기 (4:5 세로 비율)
const ART_H = H - 0.4;          // 3.2
const ART_W = ART_H * (4 / 5);  // 2.56

// ─────────────────────────────────────────────────────────────
/** 슬라이드쇼 — 뒷벽에 직접 투사 */
function drawThankYou(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#f8f4ed";
  ctx.fillRect(0, 0, 800, 1000);
  ctx.textAlign = "center";
  ctx.fillStyle = "#292724";
  ctx.font = "300 88px Georgia, serif";
  ctx.fillText("감사합니다", 400, 440);
  ctx.font = "300 36px sans-serif";
  ctx.fillStyle = "#8b7360";
  ctx.fillText("Thank you", 400, 520);
  ctx.fillStyle = "rgba(166,75,60,0.75)";
  ctx.fillRect(376, 580, 48, 48);
  ctx.fillStyle = "#f8f4ed";
  ctx.font = "bold 24px serif";
  ctx.fillText("순", 400, 612);
}

function ArtworkDisplay({
  currentIndex,
  isThankYou,
  onAutoAdvance,
  isAutoPlay,
}: {
  currentIndex: number;
  isThankYou: boolean;
  onAutoAdvance: () => void;
  isAutoPlay: boolean;
}) {
  const matRef   = useRef<THREE.MeshBasicMaterial>(null);
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  /** artType → 로딩 완료된 HTMLImageElement 캐시 */
  const imgCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const opacity        = useRef(1);
  const phase          = useRef<"show" | "fade-out" | "fade-in">("show");
  const showTimer      = useRef(0);
  const targetIndex    = useRef(currentIndex);
  const displayedIndex = useRef(currentIndex);

  // 전체 작품 이미지 프리로딩 (jpg → png → webp 순서 시도)
  useEffect(() => {
    ARTWORK_LIST.forEach((artwork) => {
      if (artwork.imageUrl) {
        const img = new Image();
        img.onload = () => imgCache.current.set(artwork.artType, img);
        img.onerror = () => {};
        img.src = artwork.imageUrl;
        return;
      }
      const exts = ["jpg", "jpeg", "png", "webp"];
      let i = 0;
      const tryNext = () => {
        if (i >= exts.length) return;
        const img = new Image();
        img.onload = () => imgCache.current.set(artwork.artType, img);
        img.onerror = tryNext;
        img.src = `${import.meta.env.BASE_URL}artworks/${artwork.artType}.${exts[i++]}`;
      };
      tryNext();
    });
  }, []);

  // 초기 텍스처 생성
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = 800;
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

  // 외부 index 변경 → 페이드 트리거
  useEffect(() => {
    if (currentIndex !== displayedIndex.current) {
      targetIndex.current = currentIndex;
      if (phase.current === "show") phase.current = "fade-out";
      showTimer.current = 0;
    }
  }, [currentIndex]);

  // 감사합니다 화면 → 페이드 트리거 (특수 index -1 사용)
  const THANK_YOU_IDX = -1;
  useEffect(() => {
    targetIndex.current = isThankYou ? THANK_YOU_IDX : currentIndex;
    if (phase.current === "show") phase.current = "fade-out";
    showTimer.current = 0;
  }, [isThankYou]);

  const updateTexture = (idx: number) => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    if (idx === THANK_YOU_IDX) return; // 프레임 숨겨져 있으므로 불필요
    {
      const artwork = ARTWORK_LIST[idx];
      const img = imgCache.current.get(artwork.artType);
      if (img) {
        ctx.clearRect(0, 0, 800, 1000);
        const scale = Math.min(800 / img.naturalWidth, 1000 / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (800 - dw) / 2, (1000 - dh) / 2, dw, dh);
      } else {
        drawInkArt(ctx, 800, 1000, artwork.artType);
      }
    }
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
          phase.current   = "fade-out";
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
    } else {
      opacity.current = Math.min(1, opacity.current + delta * 2.5);
      if (opacity.current >= 1) {
        phase.current   = "show";
        showTimer.current = 0;
      }
    }

    matRef.current.opacity = opacity.current;
  });

  const frameT = 0.1;
  const frameD = 0.08;

  return (
    <group position={[0, H / 2, -6.97]} visible={!isThankYou}>
      {/* 베이지 배킹 패널 */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[ART_W + frameT * 2 + 0.5, ART_H + frameT * 2 + 0.5]} />
        <meshStandardMaterial color="#f0e9df" roughness={0.9} />
      </mesh>
      {/* 원목 액자 */}
      <mesh>
        <boxGeometry args={[ART_W + frameT * 2, ART_H + frameT * 2, frameD]} />
        <meshStandardMaterial color="#8b6845" roughness={0.5} />
      </mesh>
      {/* 작품 */}
      <mesh position={[0, 0, frameD / 2 + 0.003]}>
        <planeGeometry args={[ART_W, ART_H]} />
        <meshBasicMaterial ref={matRef} transparent opacity={1} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
/** 감사합니다 — 벽에 직접 텍스트 투영 */
function ThankYouWall({ visible }: { visible: boolean }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const opacity = useRef(0);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 800, 400);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(41, 39, 36, 0.9)";
    ctx.font = "300 96px Georgia, serif";
    ctx.fillText("감사합니다", 400, 180);
    ctx.font = "300 38px sans-serif";
    ctx.fillStyle = "rgba(100, 80, 60, 0.75)";
    ctx.fillText("Thank you", 400, 250);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((_, delta) => {
    if (!matRef.current) return;
    opacity.current = THREE.MathUtils.clamp(
      opacity.current + (visible ? 1 : -1) * delta * 1.5,
      0, 1,
    );
    matRef.current.opacity = opacity.current;
  });

  return (
    <mesh position={[0, H / 2, -6.95]}>
      <planeGeometry args={[4.0, 2.0]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        roughness={0.9}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
/** 천장 빔프로젝터 */
function Projector() {
  return (
    <group position={[0, H - 0.06, -1.9]}>
      {/* 천장 마운트 암 */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.07, 0.18, 0.07]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.4} />
      </mesh>
      {/* 본체 */}
      <mesh>
        <boxGeometry args={[0.36, 0.13, 0.5]} />
        <meshStandardMaterial color="#1f1f1f" roughness={0.25} metalness={0.55} />
      </mesh>
      {/* 렌즈 하우징 */}
      <mesh position={[0, -0.01, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.052, 0.072, 0.1, 20]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.1} metalness={0.85} />
      </mesh>
      {/* 렌즈 유리 */}
      <mesh position={[0, -0.01, -0.34]}>
        <circleGeometry args={[0.044, 20]} />
        <meshBasicMaterial color="#2255cc" transparent opacity={0.85} />
      </mesh>
      {/* 측면 환기구 */}
      {([-0.19, 0.19] as number[]).map((x) => (
        <mesh key={x} position={[x, 0, 0.02]}>
          <boxGeometry args={[0.01, 0.09, 0.38]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** 프로젝터 빔 (투명 사각뿔) */
function ProjectorBeam() {
  // 렌즈 위치 → 작품 중심까지 비스듬히 내려오는 빛
  // 렌즈: [0, 3.5, -2.2]  작품: [0, 1.8, -6.98]
  // 중간점: [0, 2.65, -4.59]  회전각(x): ~atan2(4.78, 1.7) ≈ 1.23 rad
  return (
    <mesh
      position={[0, 2.65, -4.59]}
      rotation={[1.23, 0, 0]}
      renderOrder={-1}
    >
      {/* segments=4 → 사각뿔 모양 */}
      <coneGeometry args={[ART_W * 0.52, 5.0, 4, 1, true]} />
      <meshBasicMaterial
        color="#fffce8"
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
/** 나무 벤치 — 클릭 시 앉기 */
function Bench({
  position,
  onSit,
  isSeated,
}: {
  position: [number, number, number];
  onSit: () => void;
  isSeated: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  // Html 컴포넌트 첫 마운트 시 React root 초기화 충돌 방지 — 한 프레임 뒤에 표시
  const [hintReady, setHintReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHintReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <group position={position}>
      {/* 앉기 전에만 보이는 안내 문구 — hintReady로 초기 충돌 방지 */}
      {hintReady && !isSeated && (
        <Html center position={[0, 0.95, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            color: "rgba(200,180,155,0.9)",
            fontSize: "11px",
            letterSpacing: "1.2px",
            whiteSpace: "nowrap",
            textAlign: "center",
            lineHeight: "1.6",
            userSelect: "none",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}>
            클릭하여 앉기<br />
            <span style={{ fontSize: "10px", opacity: 0.75 }}>작품 감상</span>
          </div>
        </Html>
      )}

      {/* 호버 시 하이라이트 힌트 */}
      {hintReady && hovered && !isSeated && (
        <Html center position={[0, 1.15, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(41,39,36,0.78)",
            color: "rgba(255,252,247,0.92)",
            padding: "4px 10px",
            fontSize: "12px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            letterSpacing: "1px",
          }}>
            앉기
          </div>
        </Html>
      )}

      <mesh
        position={[0, 0.44, 0]}
        castShadow
        receiveShadow
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
          setHovered(true);
          if (matRef.current) matRef.current.emissiveIntensity = 0.14;
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          setHovered(false);
          if (matRef.current) matRef.current.emissiveIntensity = 0;
        }}
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
          setHovered(false);
          onSit();
        }}
      >
        <boxGeometry args={[2.2, 0.07, 0.42]} />
        <meshStandardMaterial
          ref={matRef}
          color="#e8ddd0"
          roughness={0.55}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
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

// ─────────────────────────────────────────────────────────────
interface Props {
  currentIndex: number;
  isThankYou?: boolean;
  onAutoAdvance: () => void;
  isAutoPlay: boolean;
  seatedAt: [number, number, number] | null;
  onBenchSit: (pos: [number, number, number]) => void;
}

export default function MediaRoomScene({
  currentIndex,
  isThankYou = false,
  onAutoAdvance,
  isAutoPlay,
  seatedAt,
  onBenchSit,
}: Props) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const animTarget   = useRef(new THREE.Vector3(...CAMERA_POS));
  const targetFov    = useRef(STAND_FOV);
  const isAnimating  = useRef(false);
  const isFirstMount = useRef(true);

  /**
   * 프로젝터 스포트라이트 — 프로젝터 위치에서 뒷벽 작품을 조준
   * primitive로 target을 scene에 추가해야 Three.js가 인식
   */
  const spotlight = useMemo(() => {
    const light = new THREE.SpotLight("#fff8f0", 55);
    light.angle      = 0.38;
    light.penumbra   = 0.3;
    light.castShadow = true;
    light.target.position.set(0, H / 2, -6.98);
    return light;
  }, []);

  // seatedAt 변경 → 카메라 애니메이션
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const pos = seatedAt ? new THREE.Vector3(...seatedAt) : STAND_POS.clone();
    animTarget.current  = pos;
    targetFov.current   = seatedAt ? SEATED_FOV : STAND_FOV;
    isAnimating.current = true;
    if (controlsRef.current) controlsRef.current.enabled = false;
  }, [seatedAt]);

  useFrame((_, delta) => {
    if (!isAnimating.current) return;

    const t = Math.min(1, delta * 4.5);
    camera.position.lerp(animTarget.current, t);
    camera.lookAt(SCREEN_POS);

    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov.current, t * 0.8);
    cam.updateProjectionMatrix();

    if (camera.position.distanceTo(animTarget.current) < 0.018) {
      camera.position.copy(animTarget.current);
      camera.lookAt(SCREEN_POS);
      cam.fov = targetFov.current;
      cam.updateProjectionMatrix();
      isAnimating.current = false;

      if (controlsRef.current) {
        controlsRef.current.target.copy(SCREEN_POS);
        controlsRef.current.enabled = true;
        controlsRef.current.update();
      }
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        target={CAMERA_TARGET}
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        dampingFactor={0.08}
        enableDamping
      />

      {/* ── 조명 ── */}
      <ambientLight intensity={0.25} color="#fff4e0" />

      {/* 프로젝터에서 뒷벽으로 향하는 스포트라이트 */}
      <primitive object={spotlight} position={[0, H - 0.14, -1.9]} />
      <primitive object={spotlight.target} />

      {/* 좌석 쪽 간접 조명 */}
      <pointLight position={[0, H - 0.3, 2]} intensity={3} distance={8} color="#ffe8c0" />

      {/* ── 방 구조 ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#c0956a" roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.95} />
      </mesh>
      {/* 뒷벽 — 밝은 아이보리로 투사된 그림이 선명하게 보임 */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#f0ebe2" roughness={0.88} />
      </mesh>
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.9} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#ede5d8" roughness={0.9} />
      </mesh>
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

      {/* ── 빔프로젝터 ── */}
      <Projector />
      <ProjectorBeam />

      {/* ── 작품 투사 (뒷벽 직접) ── */}
      <ArtworkDisplay
        currentIndex={currentIndex}
        isThankYou={isThankYou}
        onAutoAdvance={onAutoAdvance}
        isAutoPlay={isAutoPlay}
      />
      <ThankYouWall visible={isThankYou} />

      {/* ── 벤치 ── */}
      <Bench position={[0, 0, 1.5]} onSit={() => onBenchSit([0, 1.0, 1.9])} isSeated={seatedAt !== null} />
      <Bench position={[0, 0, 3.8]} onSit={() => onBenchSit([0, 1.0, 4.2])} isSeated={seatedAt !== null} />
    </>
  );
}
