/**
 * GalleryRoom
 * 갤러리 방 구조 — 바닥, 벽, 천장, 천장 빔, 레일 트랙, 걸레받이, 벤치
 */

import { useMemo } from "react";
import * as THREE from "three";
import { ROOM, COLORS } from "./constants";

const W = ROOM.width;
const D = ROOM.depth;
const H = ROOM.height;

/** 원목 바닥 — 판재 그루브 텍스처를 Canvas로 생성 */
function FloorMaterial() {
  const texture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // 베이스 색상
    ctx.fillStyle = "#c4a06e";
    ctx.fillRect(0, 0, size, size);

    // 판재 줄눈
    ctx.strokeStyle = "rgba(90, 60, 30, 0.18)";
    ctx.lineWidth = 1.5;
    const plankWidth = size / 6;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(i * plankWidth, 0);
      ctx.lineTo(i * plankWidth, size);
      ctx.stroke();
    }

    // 판재별 미세한 명도 차이
    for (let i = 0; i < 6; i++) {
      const alpha = (Math.random() * 0.06 - 0.03);
      ctx.fillStyle = alpha > 0 ? `rgba(255,230,180,${alpha})` : `rgba(0,0,0,${Math.abs(alpha)})`;
      ctx.fillRect(i * plankWidth + 1, 0, plankWidth - 2, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 13);
    return tex;
  }, []);

  return <meshStandardMaterial map={texture} roughness={0.35} metalness={0} />;
}

/** 미디어 룸 문 위 사인 */
function DoorSign() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 96;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#f3e9dc";
    ctx.fillRect(0, 0, 320, 96);
    ctx.strokeStyle = "#b9916a";
    ctx.lineWidth = 2;
    ctx.strokeRect(6, 6, 308, 84);
    ctx.fillStyle = "#6b5240";
    ctx.font = "500 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("미디어 룸", 160, 46);
    ctx.font = "400 20px sans-serif";
    ctx.fillStyle = "#a08060";
    ctx.fillText("Media Room", 160, 76);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh position={[-5.92, 2.86, -10]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[1.1, 0.33]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

/** 갤러리 벤치 */
function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 상판 */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.07, 0.42]} />
        <meshStandardMaterial color={COLORS.bench} roughness={0.55} />
      </mesh>
      {/* 다리 4개 */}
      {(
        [
          [-0.78, -0.17],
          [0.78, -0.17],
          [-0.78, 0.17],
          [0.78, 0.17],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.055, 0.42, 0.055]} />
          <meshStandardMaterial color={COLORS.benchLeg} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

/** 화분 받침대 (백자 항아리 분위기) */
function VasePedestal({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 받침대 */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.8, 0.35]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.7} />
      </mesh>
      {/* 항아리 — 구 + 원기둥으로 표현 */}
      <mesh position={[0, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} />
      </mesh>
      {/* 항아리 목 */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 0.18, 10]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function GalleryRoom() {
  // 천장 빔 Z 좌표 — 균등 간격
  const beamZs = [-10, -5, 0, 5, 10];

  return (
    <group>
      {/* ── 바닥 ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <FloorMaterial />
      </mesh>

      {/* ── 천장 ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={COLORS.ceiling} roughness={0.95} />
      </mesh>

      {/* ── 뒷벽 (z = -13) ── */}
      <mesh position={[0, H / 2, -D / 2]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>

      {/* ── 앞벽 (z = +13, 입구) ── */}
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>

      {/* ── 왼쪽 벽 — 문 개구부(z=-9.3~-10.7, h=2.4) 를 제외하고 3조각으로 분리 ── */}
      {/* 구역 A: 문 오른쪽 ~ 입구 (z = -9.3 ~ 13) */}
      <mesh position={[-W / 2, H / 2, 1.85]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[22.3, H]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>
      {/* 구역 B: 뒤쪽 끝 (z = -13 ~ -10.7) */}
      <mesh position={[-W / 2, H / 2, -11.85]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[2.3, H]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>
      {/* 구역 C: 문 위 (z = -9.3 ~ -10.7, y = 2.4 ~ 4.5) */}
      <mesh position={[-W / 2, 3.45, -10]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[1.4, 2.1]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>

      {/* 문 액자 (원목 프레임) */}
      {/* 왼쪽 세로 기둥 */}
      <mesh position={[-5.95, 1.2, -9.26]} castShadow>
        <boxGeometry args={[0.1, 2.4, 0.14]} />
        <meshStandardMaterial color={COLORS.frameWood} roughness={0.6} />
      </mesh>
      {/* 오른쪽 세로 기둥 */}
      <mesh position={[-5.95, 1.2, -10.74]} castShadow>
        <boxGeometry args={[0.1, 2.4, 0.14]} />
        <meshStandardMaterial color={COLORS.frameWood} roughness={0.6} />
      </mesh>
      {/* 상단 가로 보 */}
      <mesh position={[-5.95, 2.46, -10]} castShadow>
        <boxGeometry args={[0.1, 0.14, 1.62]} />
        <meshStandardMaterial color={COLORS.frameWood} roughness={0.6} />
      </mesh>

      {/* 문 너머 따뜻한 빛 — 미디어 룸 존재 암시 */}
      <pointLight position={[-5.6, 1.5, -10]} intensity={6} distance={5} color="#ffe0a0" />

      {/* 문 위 "미디어 룸" 사인 */}
      <DoorSign />

      {/* ── 오른쪽 벽 (x = +6) ── */}
      <mesh
        position={[W / 2, H / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.9} />
      </mesh>

      {/* ── 천장 빔 — 다크 우드 가로 빔 ── */}
      {beamZs.map((z) => (
        <mesh key={`beam-${z}`} position={[0, H - 0.14, z]} castShadow receiveShadow>
          <boxGeometry args={[W, 0.28, 0.28]} />
          <meshStandardMaterial color={COLORS.beam} roughness={0.75} />
        </mesh>
      ))}

      {/* ── 레일 트랙 — 천장 세로 2줄 ── */}
      {[-2.5, 2.5].map((x) => (
        <mesh key={`rail-${x}`} position={[x, H - 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.07, 0.07, D]} />
          <meshStandardMaterial
            color={COLORS.track}
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>
      ))}

      {/* ── 걸레받이 (좌/우) ── */}
      <mesh position={[-W / 2 + 0.04, 0.12, 0]}>
        <boxGeometry args={[0.07, 0.24, D]} />
        <meshStandardMaterial color={COLORS.baseboard} roughness={0.65} />
      </mesh>
      <mesh position={[W / 2 - 0.04, 0.12, 0]}>
        <boxGeometry args={[0.07, 0.24, D]} />
        <meshStandardMaterial color={COLORS.baseboard} roughness={0.65} />
      </mesh>

      {/* ── 벤치 ── */}
      <Bench position={[0, 0, 0]} />

      {/* ── 화분 받침대 ── */}
      <VasePedestal position={[2.5, 0, 2]} />
    </group>
  );
}
