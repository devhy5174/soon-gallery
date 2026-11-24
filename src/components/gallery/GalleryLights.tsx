/**
 * GalleryLights
 * 갤러리 조명 — 주변광 + 천장 레일 스팟 조명
 * 참고 이미지: 블랙 트랙 조명이 벽면 작품을 비추는 갤러리 분위기
 */

import { ROOM } from "./constants";

/** 레일 조명 스팟 단일 유닛 (하우징 + 빛) */
function TrackLight({
  position,
  targetX,
}: {
  position: [number, number, number];
  targetX: number;
}) {
  return (
    <group position={position}>
      {/* 조명 하우징 — 블랙 원통 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.18, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* 조명 헤드 — 작은 원뿔 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <coneGeometry args={[0.055, 0.1, 8]} />
        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* 스팟 광원 — 벽면 작품을 비춤 */}
      <spotLight
        position={[0, 0, 0]}
        target-position={[targetX, 1.5, 0]}
        intensity={40}
        angle={0.45}
        penumbra={0.5}
        distance={12}
        color="#fff8ef"
        castShadow
        shadow-mapSize={[512, 512]}
      />
    </group>
  );
}

export default function GalleryLights() {
  // 레일 조명 Z 좌표 (방 길이에 따라 균등 배치)
  const lightZPositions = [9, 4, -1, -6, -11];
  const ceilY = ROOM.height - 0.1;

  return (
    <>
      {/* 전체 주변광 — 낮은 강도의 따뜻한 주변광 */}
      <ambientLight intensity={0.35} color="#fff4e0" />

      {/* 반구 조명 — 하늘/바닥 반사 시뮬레이션 */}
      <hemisphereLight
        args={["#fff4e0", "#c9a87c", 0.25]}
      />

      {/* 왼쪽 레일 (x = -2.5): 왼쪽 벽 작품 조명 */}
      {lightZPositions.map((z) => (
        <TrackLight
          key={`left-${z}`}
          position={[-2.5, ceilY, z]}
          targetX={-6}
        />
      ))}

      {/* 오른쪽 레일 (x = +2.5): 오른쪽 벽 작품 조명 */}
      {lightZPositions.map((z) => (
        <TrackLight
          key={`right-${z}`}
          position={[2.5, ceilY, z]}
          targetX={6}
        />
      ))}

      {/* 중앙 하향 조명 — 바닥/벤치 조명 */}
      {[-5, 1, 7].map((z) => (
        <pointLight
          key={`center-${z}`}
          position={[0, ceilY, z]}
          intensity={8}
          distance={8}
          color="#fff6e8"
        />
      ))}
    </>
  );
}
