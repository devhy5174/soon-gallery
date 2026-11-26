/**
 * CelebrationFlower
 * 갤러리 축하 화분 3D 컴포넌트
 *
 * VaseDecor와 동일한 재질/기법 사용:
 * - 화분: LatheGeometry 백자 (#f2ede6, roughness 0.3)
 * - 가지: TubeGeometry CatmullRomCurve3, 먹색 (#1e1206)
 * - 호접란 꽃: VaseDecor PlumFlower와 동일 구조
 * - 산세베리아: PlaneGeometry 칼잎
 * - 리본 태그: 흰 배경 세로 텍스트
 */

import { useMemo } from "react";
import * as THREE from "three";
import type { CelebrationEntry, PlantType } from "./celebrationService";

// ── 배치 좌표 — 묵란도(right-7, x=5.93 z=7) 오른쪽 빈 공간 ───
const SLOT_POSITIONS: [number, number, number][] = [
  [4.4, 0, 8.2],
  [3.4, 0, 8.2],
  [4.4, 0, 9.5],
  [3.4, 0, 9.5],
  [4.4, 0, 10.8],
  [3.4, 0, 10.8],
];

// 화분이 갤러리 중앙(-X 방향)을 향하도록 회전
const POT_ROT: [number, number, number] = [0, Math.PI / 2, 0];

const BOW_COLORS: Record<PlantType, string> = {
  orchid:       "#cc7a90",  // 연분홍
  sansevieria:  "#7a9e45",  // 올리브 그린
};

// ── 캔버스 텍스처 ───────────────────────────────────────────────

/** 리본 태그: 흰 배경 + 뾰족 하단 + 세로 한글 텍스트 */
function makeTagTex(text: string, bowColor: string): THREE.CanvasTexture {
  const W = 96, H = 320;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;
  c.clearRect(0, 0, W, H);

  const bodyH = H - 42;

  // 흰 배경 (사각 본문 + 뾰족 하단)
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, W, bodyH);
  c.beginPath();
  c.moveTo(0, bodyH);
  c.lineTo(W / 2, H);
  c.lineTo(W, bodyH);
  c.closePath();
  c.fill();

  // 테두리
  c.strokeStyle = "#d8d0c8"; c.lineWidth = 1.5;
  c.strokeRect(3, 3, W - 6, bodyH - 3);
  c.beginPath();
  c.moveTo(3, bodyH - 2);
  c.lineTo(W / 2, H - 3);
  c.lineTo(W - 3, bodyH - 2);
  c.stroke();

  // 상단 색 점
  c.fillStyle = bowColor;
  c.beginPath(); c.arc(W / 2, 10, 5, 0, Math.PI * 2); c.fill();

  // 세로 한글 텍스트 — 한 글자씩
  c.fillStyle = "#292724";
  c.font = "bold 18px serif";
  c.textAlign = "center";
  c.textBaseline = "top";
  Array.from(text).slice(0, 11).forEach((ch, i) => {
    c.fillText(ch, W / 2, 24 + i * 25);
  });

  // 하단 소화문 장식
  c.fillStyle = bowColor;
  c.font = "13px serif";
  c.textBaseline = "bottom";
  c.fillText("✿", W / 2, bodyH - 5);

  return new THREE.CanvasTexture(cv);
}

/** 산세베리아 잎 텍스처 (짙은 녹색 + 황금 테두리 + 가로 무늬) */
function makeSansLeafTex(): THREE.CanvasTexture {
  const W = 64, H = 256;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;
  c.clearRect(0, 0, W, H);

  const grad = c.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0,    "#2a5c2a");
  grad.addColorStop(0.35, "#428040");
  grad.addColorStop(0.65, "#428040");
  grad.addColorStop(1,    "#2a5c2a");
  c.fillStyle = grad;

  // 잎 모양 (위로 뾰족)
  c.beginPath();
  c.moveTo(W * 0.1, H);
  c.lineTo(W * 0.9, H);
  c.quadraticCurveTo(W * 0.9, H * 0.08, W / 2, 0);
  c.quadraticCurveTo(W * 0.1, H * 0.08, W * 0.1, H);
  c.fill();

  // 황금 테두리 선
  c.strokeStyle = "#c8d430"; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(W * 0.14, H); c.quadraticCurveTo(W * 0.1, H * 0.1, W / 2, 1); c.stroke();
  c.beginPath(); c.moveTo(W * 0.86, H); c.quadraticCurveTo(W * 0.9, H * 0.1, W / 2, 1); c.stroke();

  // 가로 호피 무늬
  c.strokeStyle = "rgba(50,90,40,0.5)"; c.lineWidth = 2;
  for (let y = 20; y < H - 20; y += 24) {
    c.beginPath(); c.moveTo(W * 0.14, y); c.quadraticCurveTo(W / 2, y + 5, W * 0.86, y); c.stroke();
  }

  return new THREE.CanvasTexture(cv);
}

// ── 화분 프로필 (LatheGeometry) — VaseDecor 백자와 동일 재질 ──

function usePotGeo() {
  return useMemo(() => {
    // 전통 화분 형태: 아래 좁고 위로 벌어지는 팔각 항아리 느낌
    const pts = [
      new THREE.Vector2(0.05, 0.00),
      new THREE.Vector2(0.11, 0.03),
      new THREE.Vector2(0.16, 0.10),
      new THREE.Vector2(0.19, 0.20),
      new THREE.Vector2(0.20, 0.28),
      new THREE.Vector2(0.215, 0.31), // 살짝 벌어지는 테두리
    ];
    return new THREE.LatheGeometry(pts, 16);
  }, []);
}

// ── 호접란 가지: 위로 올라갔다가 아치형으로 늘어지는 곡선 ────────
// 각 가지는 흙에서 출발 → 위로 상승 → 외측으로 아치 → 살짝 하강
// 꽃은 가지 중간~끝 구간(t=0.45~1.0)에 분포

const ORCHID_STEMS: { pts: [number,number,number][]; r: number }[] = [
  // 오른쪽으로 늘어지는 가지
  { pts: [[.02,.00,.00],[.04,.22,.02],[.06,.42,.03],[.14,.55,.02],[.26,.60,.00],[.36,.56,-.02],[.42,.50,-.03]], r: 0.007 },
  // 왼쪽으로 늘어지는 가지
  { pts: [[-.02,.00,.00],[-.04,.20,-.01],[-.07,.40,.01],[-.16,.54,.02],[-.28,.58,.00],[-.38,.54,-.01],[-.44,.48,-.02]], r: 0.007 },
  // 가운데 위로 뻗는 가지
  { pts: [[.00,.00,.00],[.00,.24,.01],[.02,.48,.02],[.04,.65,.01],[.04,.72,.00]], r: 0.006 },
];

// ── 서브 컴포넌트 ──────────────────────────────────────────────

/** 호접란 꽃 한 송이 — 넓적한 흰 꽃잎 5장 + 연분홍 중심 */
function OrchidFlower({ position, faceDir }: {
  position: [number, number, number];
  faceDir?: number; // Y축 회전 (방향 힌트)
}) {
  // 위치 기반 의사난수 회전 (각 꽃마다 약간씩 다름)
  const seed = position[0] * 7.3 + position[1] * 3.1 + position[2] * 5.7;
  const ry = faceDir ?? (seed % (Math.PI * 2));
  const rx = -0.3 + (seed % 0.4); // 약간 위를 향해 기울기

  const PETAL_R = 0.028; // 꽃잎 중심까지 거리
  const PETAL_RX = 0.030; // 꽃잎 가로반경
  const PETAL_RY = 0.038; // 꽃잎 세로반경

  return (
    <group position={position} rotation={[rx, ry, 0]}>
      {/* 꽃잎 5장 — PlaneGeometry + scale 로 타원 표현 */}
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={`p${i}`}
            position={[Math.cos(a) * PETAL_R, Math.sin(a) * PETAL_R, 0.001]}
            rotation={[0, 0, a]}
            scale={[PETAL_RX * 2, PETAL_RY * 2, 1]}
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              color="#fff8fc"
              roughness={0.5}
              side={THREE.DoubleSide}
              emissive="#f0d0e8"
              emissiveIntensity={0.04}
              transparent
              opacity={0.97}
            />
          </mesh>
        );
      })}
      {/* 연분홍 중심 (립) */}
      <mesh position={[0, 0, 0.003]} scale={[0.022, 0.028, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#e878b0"
          roughness={0.5}
          side={THREE.DoubleSide}
          emissive="#d04080"
          emissiveIntensity={0.15}
          transparent opacity={0.95}
        />
      </mesh>
      {/* 노란 꽃술 */}
      <mesh position={[0, 0.004, 0.005]}>
        <sphereGeometry args={[0.006, 5, 4]} />
        <meshStandardMaterial color="#f5d840" roughness={0.4} emissive="#c09010" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

/** 호접란 — 아치 가지 + 꽃 여러 송이 + 넓은 기부 잎 */
function OrchidPlant({ baseY }: { baseY: number }) {
  const stemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#3a5020", roughness: 0.82 }),
    [],
  );

  // 가지 메시 & 꽃 위치 계산
  const { stemMeshes, flowerInfos, budPositions } = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    const flowers: { pos: [number,number,number]; dir: number }[] = [];
    const buds: [number,number,number][] = [];

    ORCHID_STEMS.forEach(({ pts, r }) => {
      const curve = new THREE.CatmullRomCurve3(
        pts.map(([x, y, z]) => new THREE.Vector3(x, y + baseY, z)),
      );
      meshes.push(new THREE.Mesh(new THREE.TubeGeometry(curve, 14, r, 6, false), stemMat));

      // 꽃: 가지 중간~끝 (t=0.45 ~ 0.90) 에 4송이
      for (let f = 0; f < 4; f++) {
        const t = 0.45 + f * 0.15;
        const p = curve.getPoint(t);
        flowers.push({ pos: [p.x, p.y, p.z], dir: 0 });
      }
      // 봉오리: 끝 (t=0.95)
      const bp = curve.getPoint(0.95);
      buds.push([bp.x, bp.y, bp.z]);
    });

    return { stemMeshes: meshes, flowerInfos: flowers, budPositions: buds };
  }, [baseY, stemMat]);

  // 기부 넓은 잎 (아랫부분 좌우로 펼쳐짐)
  const baseLeaves: [number,number,number,number,number,number][] = [
    // [x, y, z, rotX, rotZ, h]
    [-0.14, baseY + 0.04, 0.02,  0.15, -0.5, 0.18],
    [ 0.14, baseY + 0.04, 0.02,  0.15,  0.5, 0.18],
    [-0.18, baseY + 0.03, -0.02, 0.10, -0.7, 0.16],
    [ 0.18, baseY + 0.03, -0.02, 0.10,  0.7, 0.16],
    [-0.08, baseY + 0.05,  0.04, 0.05, -0.3, 0.20],
    [ 0.08, baseY + 0.05,  0.04, 0.05,  0.3, 0.20],
  ];

  return (
    <group>
      {/* 가지 */}
      {stemMeshes.map((m, i) => <primitive key={i} object={m} />)}

      {/* 꽃 (가지 아치 구간) */}
      {flowerInfos.map((f, i) => (
        <OrchidFlower key={i} position={f.pos} faceDir={f.dir} />
      ))}

      {/* 녹색 봉오리 */}
      {budPositions.map((pos, i) => (
        <mesh key={`bud-${i}`} position={pos}>
          <sphereGeometry args={[0.012, 6, 5]} />
          <meshStandardMaterial color="#8ab040" roughness={0.6} />
        </mesh>
      ))}

      {/* 기부 넓은 타원 잎 */}
      {baseLeaves.map(([x, y, z, rx, rz, h], i) => (
        <mesh key={`leaf-${i}`} position={[x, y, z]} rotation={[rx, 0, rz]}>
          <planeGeometry args={[h * 0.55, h]} />
          <meshStandardMaterial color="#2e6030" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/** 산세베리아 — 칼잎 여러 장 */
function SansevieriaPlant({ baseY }: { baseY: number }) {
  const leafTex = useMemo(() => makeSansLeafTex(), []);

  const leaves: [number, number, number, number, number][] = [
    [ 0.00,  0.00,  0.00,  0.00, 0.56],
    [-0.07,  0.03, -0.22,  0.07, 0.48],
    [ 0.07,  0.03,  0.22,  0.07, 0.48],
    [-0.11, -0.02, -0.42,  0.12, 0.40],
    [ 0.11, -0.02,  0.42,  0.12, 0.40],
    [ 0.00, -0.05,  0.00, -0.26, 0.46],
  ];

  return (
    <group>
      {leaves.map(([x, z, rz, rx, h], i) => (
        <mesh key={i} position={[x, baseY + h / 2, z]} rotation={[rx, 0, rz]}>
          <planeGeometry args={[0.07, h]} />
          <meshStandardMaterial
            map={leafTex}
            transparent alphaTest={0.05}
            roughness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/** 사틴 리본 보우 + 흰 텍스트 태그 */
function RibbonBow({
  nickname,
  message,
  bowColor,
  potH,
}: {
  nickname: string;
  message: string;
  bowColor: string;
  potH: number;
}) {
  const bowY = potH * 0.52;
  const bowZ = 0.225; // 화분 앞면 (+Z)

  const leftTex  = useMemo(() => makeTagTex(nickname, bowColor), [nickname, bowColor]);
  const rightTex = useMemo(() => makeTagTex(message,  bowColor), [message,  bowColor]);
  const col = useMemo(() => new THREE.Color(bowColor), [bowColor]);

  return (
    <group>
      {/* 왼쪽 보우 루프 */}
      <mesh position={[-0.058, bowY + 0.018, bowZ]} rotation={[0.18, 0, Math.PI / 6]}>
        <torusGeometry args={[0.044, 0.011, 6, 12, Math.PI]} />
        <meshStandardMaterial color={col} roughness={0.22} metalness={0.08} />
      </mesh>
      {/* 오른쪽 보우 루프 */}
      <mesh position={[0.058, bowY + 0.018, bowZ]} rotation={[0.18, 0, -Math.PI / 6 + Math.PI]}>
        <torusGeometry args={[0.044, 0.011, 6, 12, Math.PI]} />
        <meshStandardMaterial color={col} roughness={0.22} metalness={0.08} />
      </mesh>
      {/* 중심 매듭 */}
      <mesh position={[0, bowY + 0.018, bowZ + 0.012]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color={col} roughness={0.2} />
      </mesh>
      {/* 왼쪽 꼬리 */}
      <mesh position={[-0.018, bowY - 0.048, bowZ]} rotation={[0, 0, -0.14]}>
        <boxGeometry args={[0.015, 0.068, 0.006]} />
        <meshStandardMaterial color={col} roughness={0.25} />
      </mesh>
      {/* 오른쪽 꼬리 */}
      <mesh position={[0.018, bowY - 0.048, bowZ]} rotation={[0, 0, 0.14]}>
        <boxGeometry args={[0.015, 0.068, 0.006]} />
        <meshStandardMaterial color={col} roughness={0.25} />
      </mesh>

      {/* 왼쪽 태그 — 닉네임 */}
      <mesh position={[-0.072, bowY - 0.215, bowZ + 0.004]}>
        <planeGeometry args={[0.095, 0.3]} />
        <meshStandardMaterial
          map={leftTex}
          transparent alphaTest={0.05}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* 오른쪽 태그 — 축하 문구 */}
      <mesh position={[0.072, bowY - 0.215, bowZ + 0.004]}>
        <planeGeometry args={[0.095, 0.3]} />
        <meshStandardMaterial
          map={rightTex}
          transparent alphaTest={0.05}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/** 화분 하나 (백자 본체 + 식물 + 리본) */
function FlowerPot({
  position,
  plantType,
  nickname,
  message,
}: {
  position: [number, number, number];
  plantType: PlantType;
  nickname: string;
  message: string;
}) {
  const potH    = 0.31;   // LatheGeometry 프로필 최대 y
  const soilY   = potH + 0.008;

  const potGeo   = usePotGeo();
  const bowColor = BOW_COLORS[plantType];

  return (
    <group position={position} rotation={POT_ROT}>
      {/* 백자 화분 — VaseDecor와 동일 재질 */}
      <mesh castShadow receiveShadow>
        <primitive object={potGeo} attach="geometry" />
        <meshStandardMaterial
          color="#f2ede6"
          roughness={0.3}
          metalness={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 흙 */}
      <mesh position={[0, potH, 0]}>
        <cylinderGeometry args={[0.195, 0.195, 0.016, 16]} />
        <meshStandardMaterial color="#5c4030" roughness={0.96} />
      </mesh>

      {/* 식물 */}
      {plantType === "orchid"
        ? <OrchidPlant baseY={soilY} />
        : <SansevieriaPlant baseY={soilY} />}

      {/* 리본 보우 + 태그 */}
      <RibbonBow
        nickname={nickname}
        message={message}
        bowColor={bowColor}
        potH={potH}
      />
    </group>
  );
}

/** 갤러리 내 모든 축하 화분 렌더링 — 최근 6개 */
export default function CelebrationFlowers({
  celebrations,
}: {
  celebrations: CelebrationEntry[];
}) {
  const visible = celebrations.slice(-SLOT_POSITIONS.length);
  return (
    <group>
      {visible.map((entry, i) => (
        <FlowerPot
          key={entry.id}
          position={SLOT_POSITIONS[i]}
          plantType={entry.plantType}
          nickname={entry.nickname}
          message={entry.message}
        />
      ))}
    </group>
  );
}
