/**
 * GalleryLights
 * 갤러리 조명
 * - RailSpot: 레일에 달린 스팟 유닛 (하우징 시각 모델 + 작품 조준 광원 통합)
 * - 하우징이 작품 방향으로 기울어져 자연스러운 갤러리 느낌
 */

import { useMemo, Fragment } from "react";
import * as THREE from "three";
import { ROOM } from "./constants";

const H = ROOM.height; // 4.5

// 레일 → 작품까지 기울기 각도 계산
// 레일 x=±2.5, 작품 x=±5.93, 레일 y=4.4, 작품 y=2.1
// dx=3.43, dy=2.3 → atan(3.43/2.3) ≈ 56° ≈ 0.978 rad
const TILT = Math.atan2(3.43, 2.3); // ~0.978 rad

/** 레일 스팟 유닛 — 하우징 + 광원 통합 */
function RailSpot({
  position,
  targetPos,
  tiltDir,       // +1 = 왼쪽 벽 방향, -1 = 오른쪽 벽 방향
  intensity = 50,
}: {
  position: [number, number, number];
  targetPos: [number, number, number];
  tiltDir: 1 | -1;
  intensity?: number;
}) {
  const light = useMemo(() => {
    const l = new THREE.SpotLight("#fff6e8", intensity ?? 75);
    l.angle    = 0.35;
    l.penumbra = 0.5;
    l.distance = 12;
    l.target.position.set(...targetPos);
    return l;
  }, []);

  const tiltZ = tiltDir * TILT;

  return (
    <>
      {/* ── 하우징 시각 모델 (기울어진 스팟) ── */}
      <group position={position}>
        {/* 레일 클립 */}
        <mesh>
          <boxGeometry args={[0.09, 0.07, 0.09]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* 조명 몸체 + 헤드 — tiltDir 방향으로 기울임 */}
        <group rotation={[0, 0, tiltZ]}>
          {/* 연결 스템 */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
            <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* 조명 몸체 (원통) */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.052, 0.058, 0.17, 10]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.75} />
          </mesh>
          {/* 조명 헤드 (콘) */}
          <mesh position={[0, -0.33, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.058, 0.09, 10]} />
            <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* 렌즈 (발광점 표시) */}
          <mesh position={[0, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.044, 10]} />
            <meshBasicMaterial color="#ffe8b0" />
          </mesh>
        </group>
      </group>

      {/* ── 실제 광원 — primitive + target으로 정확한 조준 ── */}
      <primitive object={light} position={position} />
      <primitive object={light.target} />
    </>
  );
}

/** 장식용 레일 하우징 (광원 없음 — 레일 밀도 채우기) */
function DecorLight({
  position,
  tiltDir,
}: {
  position: [number, number, number];
  tiltDir: 1 | -1;
}) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.09, 0.07, 0.09]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
      </mesh>
      <group rotation={[0, 0, tiltDir * TILT * 0.5]}>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
          <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.052, 0.058, 0.17, 10]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.75} />
        </mesh>
        <mesh position={[0, -0.33, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.058, 0.09, 10]} />
          <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 뒷벽 그림 전용 스팟 — 앞에서 뒤를 향해 기울어진 하우징
 * z=-10 천장에서 z=-12.9 뒷벽 그림으로 조준
 */
function BackWallSpot({
  position,
  targetPos,
  intensity = 60,
}: {
  position: [number, number, number];
  targetPos: [number, number, number];
  intensity?: number;
}) {
  const light = useMemo(() => {
    const l = new THREE.SpotLight("#fff8f0", intensity);
    l.angle    = 0.3;
    l.penumbra = 0.5;
    l.distance = 10;
    l.target.position.set(...targetPos);
    return l;
  }, []);

  // 앞으로 기울기: z=-10 → z=-12.9 (dz=2.9), y=4.4 → y=1.85 (dy=2.55)
  const tiltX = Math.atan2(2.9, 2.55); // ≈ 0.85 rad (약 49°)

  return (
    <>
      <group position={position}>
        <mesh>
          <boxGeometry args={[0.09, 0.07, 0.09]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.6} />
        </mesh>
        <group rotation={[tiltX, 0, 0]}>
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.1, 8]} />
            <meshStandardMaterial color="#222" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.052, 0.058, 0.17, 10]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.75} />
          </mesh>
          <mesh position={[0, -0.33, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.058, 0.09, 10]} />
            <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.044, 10]} />
            <meshBasicMaterial color="#ffe8b0" />
          </mesh>
        </group>
      </group>
      <primitive object={light} position={position} />
      <primitive object={light.target} />
    </>
  );
}

export default function GalleryLights() {
  const ceilY = H - 0.1; // 4.4

  // 작품이 걸린 Z 좌표 (artworkData.ts 배치와 동일)
  const artZs: [number, number, number][] = [[7, 0, 0], [1, 0, 0], [-5, 0, 0]];

  return (
    <>
      {/* 전체 주변광 — 낮게 유지해야 스팟 조명이 살아남 */}
      <ambientLight intensity={0.35} color="#fff4e0" />
      <hemisphereLight args={["#fff4e0", "#c9a87c", 0.25]} />

      {/* ── 왼쪽 레일 스팟 (x=-2.5) → 왼쪽 벽 작품 조준 ── */}
      {artZs.map(([z]) => (
        <RailSpot
          key={`l${z}`}
          position={[-2.5, ceilY, z]}
          targetPos={[-5.93, 2.1, z]}
          tiltDir={1}
        />
      ))}

      {/* ── 오른쪽 레일 스팟 (x=+2.5) → 오른쪽 벽 작품 조준 ── */}
      {artZs.map(([z]) => (
        <RailSpot
          key={`r${z}`}
          position={[2.5, ceilY, z]}
          targetPos={[5.93, 2.1, z]}
          tiltDir={-1}
        />
      ))}

      {/* ── 장식용 레일 하우징 (입구·뒤쪽 여백 채우기) ── */}
      {([10, -9] as const).map((z) => (
        <Fragment key={z}>
          <DecorLight position={[-2.5, ceilY, z]} tiltDir={1} />
          <DecorLight position={[2.5, ceilY, z]} tiltDir={-1} />
        </Fragment>
      ))}

      {/* ── 뒷벽 대형 산수화 조명 (3개 — 좌/중/우 고루 비춤) ── */}
      <BackWallSpot position={[-2.5, ceilY, -10]} targetPos={[-1.2, 1.85, -12.9]} />
      <BackWallSpot position={[0,    ceilY, -10]} targetPos={[0,    1.85, -12.9]} />
      <BackWallSpot position={[2.5,  ceilY, -10]} targetPos={[1.2,  1.85, -12.9]} />

      {/* ── 중앙 하향 포인트라이트 — 통로·바닥 전반 조명 ── */}
      {[9, 2, -7].map((z) => (
        <pointLight
          key={`c${z}`}
          position={[0, ceilY, z]}
          intensity={10}
          distance={11}
          color="#fff6e8"
        />
      ))}

      {/* ── 의자 위 은은한 조명 — 아늑한 감상 분위기 ── */}
      <pointLight
        position={[0, ceilY, 0]}
        intensity={14}
        distance={4.5}
        color="#ffecd0"
      />
    </>
  );
}
