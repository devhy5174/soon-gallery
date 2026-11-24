/**
 * VaseDecor
 * 갤러리 화병 데코 — 받침대 + 백자 항아리 + 나뭇가지 + 꽃봉오리
 * compact: 짧은 가지 / plumBlossom: 매화 스타일 꽃
 */

import { useMemo } from "react";
import * as THREE from "three";

// ── 긴 가지 (기본) ──────────────────────────────────────────
const BRANCH_FULL: { pts: [number,number,number][]; r: number }[] = [
  { pts: [[0,0,0],[-.05,.22,.04],[-.12,.52,.07],[-.16,.92,.05],[-.18,1.22,.04]], r: 0.011 },
  { pts: [[0,0,0],[.02,.30,-.02],[.04,.68,-.03],[.05,1.08,0],[.06,1.38,.01]],   r: 0.012 },
  { pts: [[0,0,0],[.08,.18,0],[.18,.42,-.06],[.28,.70,-.08],[.34,.88,-.07]],    r: 0.010 },
  { pts: [[-.10,.40,.06],[-.20,.60,.12],[-.26,.80,.09]],                         r: 0.007 },
  { pts: [[-.16,.92,.05],[-.08,1.08,.12],[-.04,1.18,.10]],                      r: 0.006 },
  { pts: [[.04,.68,-.03],[.16,.84,-.09],[.22,.98,-.07]],                        r: 0.006 },
  { pts: [[.28,.70,-.08],[.38,.84,-.02],[.44,.96,.02]],                         r: 0.007 },
  { pts: [[.05,1.08,0],[-.04,1.22,.08],[-.06,1.32,.06]],                       r: 0.005 },
  { pts: [[.05,1.08,0],[.14,1.22,-.05],[.18,1.34,-.03]],                       r: 0.005 },
];
const BUD_FULL: [number,number,number][] = [
  [-.18,1.22,.04],[.06,1.38,.01],[.34,.88,-.07],
  [-.26,.80,.09],[-.04,1.18,.10],[.22,.98,-.07],
  [.44,.96,.02],[-.06,1.32,.06],[.18,1.34,-.03],
  [-.13,.62,.07],[.04,.82,-.03],[.26,.62,-.07],
  [-.16,1.00,.05],[.05,1.15,0],[-.10,1.26,.07],
  [.14,1.28,-.04],[.08,.92,-.04],
];

// ── 짧은 가지 (compact) ──────────────────────────────────────
const BRANCH_COMPACT: { pts: [number,number,number][]; r: number }[] = [
  { pts: [[0,0,0],[-.04,.15,.03],[-.10,.33,.05],[-.13,.55,.04]], r: 0.011 },
  { pts: [[0,0,0],[.01,.18,-.01],[.03,.40,-.02],[.04,.62,.01]], r: 0.012 },
  { pts: [[0,0,0],[.06,.12,0],[.14,.28,-.04],[.20,.48,-.05]],  r: 0.010 },
  { pts: [[-.07,.28,.04],[-.16,.40,.08],[-.19,.52,.06]],        r: 0.007 },
  { pts: [[.03,.40,-.02],[.12,.50,-.06],[.16,.60,-.05]],        r: 0.006 },
  { pts: [[.14,.28,-.04],[.24,.40,-.01],[.28,.52,.02]],         r: 0.007 },
];
const BUD_COMPACT: [number,number,number][] = [
  [-.13,.55,.04],[.04,.62,.01],[.20,.48,-.05],
  [-.19,.52,.06],[.16,.60,-.05],[.28,.52,.02],
  [-.10,.38,.05],[.03,.48,-.02],[.17,.40,-.04],
  [-.14,.46,.05],[.08,.55,0],
];

/** 매화 꽃 한 송이 — 5장 꽃잎 + 꽃술 */
function PlumFlower({ position }: { position: [number,number,number] }) {
  // 위치값으로 의사 난수 회전 → 각 꽃마다 방향이 조금씩 다름
  const rx = (position[0] * 2.1 + position[1] * 1.3) % (Math.PI * 2);
  const ry = (position[1] * 3.7 + position[2] * 2.4) % (Math.PI * 2);

  return (
    <group position={position} rotation={[rx, ry, 0]}>
      {/* 꽃잎 5장 */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        const pr = 0.019;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * pr, Math.sin(a) * pr, 0]}
            rotation={[Math.PI / 2, 0, a + Math.PI / 2]}
          >
            <circleGeometry args={[0.014, 6]} />
            <meshStandardMaterial
              color="#ffe4ee"
              roughness={0.55}
              side={THREE.DoubleSide}
              emissive="#f0a0b8"
              emissiveIntensity={0.08}
            />
          </mesh>
        );
      })}
      {/* 꽃술 */}
      <mesh>
        <sphereGeometry args={[0.007, 5, 4]} />
        <meshStandardMaterial color="#f5d050" roughness={0.4} emissive="#c09010" emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

export default function VaseDecor({
  position,
  compact = false,
  plumBlossom = false,
}: {
  position: [number, number, number];
  compact?: boolean;
  plumBlossom?: boolean;
}) {
  const branchData = compact ? BRANCH_COMPACT : BRANCH_FULL;
  const budPos     = compact ? BUD_COMPACT    : BUD_FULL;

  // 백자 항아리 LatheGeometry
  const vaseGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.04, 0.0),
      new THREE.Vector2(0.14, 0.08),
      new THREE.Vector2(0.20, 0.18),
      new THREE.Vector2(0.22, 0.28),
      new THREE.Vector2(0.20, 0.36),
      new THREE.Vector2(0.14, 0.44),
      new THREE.Vector2(0.075, 0.49),
      new THREE.Vector2(0.088, 0.52),
    ];
    return new THREE.LatheGeometry(pts, 20);
  }, []);

  // 나뭇가지 TubeGeometry 메시
  const branchMeshes = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({ color: "#1e1206", roughness: 0.88 });
    return branchData.map(({ pts, r }) => {
      const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
      return new THREE.Mesh(new THREE.TubeGeometry(curve, 10, r, 6, false), mat);
    });
  }, [compact]);

  // 일반 봉오리 재질
  const budMat = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: "#d4b848", roughness: 0.55,
      emissive: "#a08018", emissiveIntensity: 0.15,
    })
  , []);

  const OPEN_Y = 1.24;

  return (
    <group position={position}>
      {/* 받침대 */}
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.72, 0.42]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.44, 0.015, 0.44]} />
        <meshStandardMaterial color="#d4ccc4" roughness={0.6} />
      </mesh>

      {/* 백자 항아리 */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <primitive object={vaseGeo} attach="geometry" />
        <meshStandardMaterial color="#f2ede6" roughness={0.3} metalness={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* 나뭇가지 + 꽃 */}
      <group position={[0, OPEN_Y, 0]}>
        {branchMeshes.map((mesh, i) => (
          <primitive key={i} object={mesh} />
        ))}

        {plumBlossom
          ? budPos.map((pos, i) => <PlumFlower key={i} position={pos} />)
          : budPos.map((pos, i) => (
              <mesh key={i} position={pos} castShadow>
                <sphereGeometry args={[0.016 + (i % 4) * 0.003, 6, 5]} />
                <primitive object={budMat} attach="material" />
              </mesh>
            ))}
      </group>
    </group>
  );
}
