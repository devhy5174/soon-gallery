/**
 * GalleryArtworks
 * 갤러리 액자 및 임시 작품 — 좌우 벽 배치
 * 추후 Supabase 연동 시 실제 작품 데이터로 교체 예정
 */

import { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "./constants";

/** 임시 먹화 느낌의 canvas 텍스처 생성 */
function createInkArtTexture(type: "plum" | "bamboo" | "mountain" | "orchid" | "bird" | "chrysanthemum"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext("2d")!;

  // 배경 — 아이보리 한지 느낌
  ctx.fillStyle = "#f8f4ed";
  ctx.fillRect(0, 0, 400, 500);

  if (type === "plum") {
    // 매화 — 가지 + 꽃
    ctx.strokeStyle = "rgba(50, 40, 30, 0.75)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(80, 500);
    ctx.bezierCurveTo(100, 380, 160, 340, 200, 220);
    ctx.bezierCurveTo(230, 140, 260, 100, 300, 60);
    ctx.stroke();
    // 가지
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(200, 220);
    ctx.bezierCurveTo(240, 200, 280, 220, 320, 200);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(170, 310);
    ctx.bezierCurveTo(130, 290, 100, 300, 70, 280);
    ctx.stroke();
    // 매화 꽃 5개
    [[290, 70], [310, 110], [330, 55], [260, 85], [340, 85]].forEach(([fx, fy]) => {
      ctx.fillStyle = "rgba(195, 100, 110, 0.65)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const angle = (i * Math.PI * 2) / 5;
        ctx.ellipse(fx + Math.cos(angle) * 10, fy + Math.sin(angle) * 10, 7, 5, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(230, 190, 60, 0.9)";
      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    // 낙관 (붉은 도장)
    ctx.fillStyle = "rgba(166, 75, 60, 0.85)";
    ctx.fillRect(340, 440, 32, 32);
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("순", 356, 462);

  } else if (type === "bamboo") {
    // 대나무
    const drawBamboo = (x: number, lean: number) => {
      ctx.strokeStyle = "rgba(55, 75, 45, 0.7)";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      // 줄기
      let y = 500;
      for (let seg = 0; seg < 7; seg++) {
        ctx.beginPath();
        ctx.moveTo(x + lean * seg, y);
        ctx.lineTo(x + lean * (seg + 1), y - 60);
        ctx.stroke();
        // 마디
        ctx.beginPath();
        ctx.moveTo(x + lean * (seg + 1) - 6, y - 60);
        ctx.lineTo(x + lean * (seg + 1) + 6, y - 60);
        ctx.stroke();
        y -= 60;
      }
      // 잎
      ctx.lineWidth = 2;
      [[x + lean * 3, 320], [x + lean * 5, 200]].forEach(([lx, ly]) => {
        [[-1, -1], [1, -1], [0, -1.4]].forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.bezierCurveTo(lx + dx * 25, ly + dy * 20, lx + dx * 50, ly + dy * 40, lx + dx * 60, ly + dy * 10);
          ctx.stroke();
        });
      });
    };
    drawBamboo(120, 2);
    drawBamboo(220, -1.5);
    drawBamboo(300, 1);
    // 낙관
    ctx.fillStyle = "rgba(166, 75, 60, 0.85)";
    ctx.fillRect(340, 440, 32, 32);
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("순", 356, 462);

  } else if (type === "mountain") {
    // 수묵 산수
    // 원산 (먼 산)
    ctx.fillStyle = "rgba(80, 70, 60, 0.08)";
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.quadraticCurveTo(100, 150, 200, 260);
    ctx.quadraticCurveTo(300, 100, 400, 350);
    ctx.lineTo(400, 420);
    ctx.fill();
    // 근산 (가까운 산)
    ctx.fillStyle = "rgba(55, 45, 35, 0.18)";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.quadraticCurveTo(60, 300, 150, 360);
    ctx.quadraticCurveTo(200, 220, 260, 310);
    ctx.quadraticCurveTo(320, 240, 400, 420);
    ctx.lineTo(400, 500);
    ctx.fill();
    // 운무
    const mist = ctx.createLinearGradient(0, 310, 0, 390);
    mist.addColorStop(0, "rgba(248, 244, 237, 0)");
    mist.addColorStop(0.5, "rgba(248, 244, 237, 0.65)");
    mist.addColorStop(1, "rgba(248, 244, 237, 0)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, 310, 400, 80);
    // 소나무 실루엣
    ctx.fillStyle = "rgba(40, 35, 25, 0.5)";
    ctx.beginPath();
    ctx.moveTo(300, 420);
    ctx.lineTo(310, 300);
    ctx.lineTo(320, 420);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(310, 295, 25, 0, Math.PI * 2);
    ctx.fill();
    // 낙관
    ctx.fillStyle = "rgba(166, 75, 60, 0.85)";
    ctx.fillRect(340, 440, 32, 32);
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("순", 356, 462);

  } else if (type === "orchid") {
    // 난초
    ctx.strokeStyle = "rgba(50, 60, 40, 0.65)";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    // 잎
    [[160, 480, 80, 200], [200, 480, 300, 180], [220, 480, 350, 280], [140, 460, 50, 300]].forEach(
      ([sx, sy, ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo((sx + ex) / 2 + 30, (sy + ey) / 2, ex, ey);
        ctx.stroke();
      }
    );
    // 꽃
    [[250, 240], [290, 190], [230, 170]].forEach(([fx, fy]) => {
      ctx.fillStyle = "rgba(140, 100, 160, 0.5)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        ctx.ellipse(fx + Math.cos(angle) * 14, fy + Math.sin(angle) * 14, 10, 7, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(230, 190, 60, 0.9)";
      ctx.beginPath();
      ctx.arc(fx, fy, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    // 낙관
    ctx.fillStyle = "rgba(166, 75, 60, 0.85)";
    ctx.fillRect(340, 440, 32, 32);
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("순", 356, 462);

  } else if (type === "bird") {
    // 새 — 가지 + 참새
    ctx.strokeStyle = "rgba(50, 40, 30, 0.6)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.bezierCurveTo(100, 280, 200, 260, 320, 230);
    ctx.bezierCurveTo(360, 220, 400, 200, 400, 180);
    ctx.stroke();
    // 새 2마리
    [[250, 215], [310, 200]].forEach(([bx, by]) => {
      ctx.fillStyle = "rgba(60, 50, 40, 0.75)";
      ctx.beginPath();
      ctx.ellipse(bx, by, 18, 12, -0.2, 0, Math.PI * 2);
      ctx.fill();
      // 머리
      ctx.beginPath();
      ctx.arc(bx + 16, by - 4, 8, 0, Math.PI * 2);
      ctx.fill();
      // 꼬리
      ctx.beginPath();
      ctx.moveTo(bx - 14, by);
      ctx.lineTo(bx - 28, by - 8);
      ctx.lineTo(bx - 26, by + 2);
      ctx.fill();
    });
    // 낙관
    ctx.fillStyle = "rgba(166, 75, 60, 0.85)";
    ctx.fillRect(340, 440, 32, 32);
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("순", 356, 462);

  } else if (type === "chrysanthemum") {
    // 국화
    ctx.strokeStyle = "rgba(50, 60, 35, 0.6)";
    ctx.lineWidth = 2.5;
    // 줄기
    ctx.beginPath();
    ctx.moveTo(200, 500);
    ctx.bezierCurveTo(195, 400, 185, 340, 200, 250);
    ctx.stroke();
    // 잎
    [[175, 380], [215, 340]].forEach(([lx, ly]) => {
      ctx.fillStyle = "rgba(60, 85, 45, 0.45)";
      ctx.beginPath();
      ctx.ellipse(lx, ly, 25, 15, -0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    // 꽃 — 국화 꽃잎 24개
    const cx = 200, cy = 230;
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI * 2) / 24;
      const dist = 28;
      ctx.fillStyle = "rgba(210, 180, 80, 0.65)";
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(angle) * dist,
        cy + Math.sin(angle) * dist,
        10, 6, angle, 0, Math.PI * 2
      );
      ctx.fill();
    }
    // 꽃 중심
    ctx.fillStyle = "rgba(190, 140, 40, 0.9)";
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    // 낙관
    ctx.fillStyle = "rgba(166, 75, 60, 0.85)";
    ctx.fillRect(340, 440, 32, 32);
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 16px serif";
    ctx.textAlign = "center";
    ctx.fillText("순", 356, 462);
  }

  return new THREE.CanvasTexture(canvas);
}

/** 단일 액자 컴포넌트 */
function ArtFrame({
  position,
  rotation,
  artType,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  artType: "plum" | "bamboo" | "mountain" | "orchid" | "bird" | "chrysanthemum";
}) {
  const artW = 1.1;  // 작품 너비
  const artH = 1.4;  // 작품 높이
  const frameT = 0.055; // 액자 두께
  const frameD = 0.07;  // 액자 깊이

  const texture = useMemo(() => createInkArtTexture(artType), [artType]);

  return (
    <group position={position} rotation={rotation}>
      {/* 액자 외곽 — 원목 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[artW + frameT * 2, artH + frameT * 2, frameD]} />
        <meshStandardMaterial color={COLORS.frameWood} roughness={0.55} />
      </mesh>

      {/* 매트 (여백) — 아이보리 내부 보더 */}
      <mesh position={[0, 0, frameD / 2 + 0.001]}>
        <planeGeometry args={[artW + frameT * 0.6, artH + frameT * 0.6]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
      </mesh>

      {/* 작품 캔버스 */}
      <mesh position={[0, 0, frameD / 2 + 0.003]}>
        <planeGeometry args={[artW, artH]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** 뒷벽 갤러리 사인 (텍스트 + 산수화) */
export function BackWallSign() {
  const signTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, 1024, 320);

    // 영문 타이틀
    ctx.font = "500 78px Georgia, serif";
    ctx.fillStyle = "#292724";
    ctx.textAlign = "center";
    ctx.fillText("SOON  GALLERY", 490, 110);

    // 붉은 인장
    ctx.fillStyle = "#a64b3c";
    ctx.beginPath();
    ctx.arc(870, 78, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 26px serif";
    ctx.fillText("순", 870, 88);

    // 구분선
    ctx.strokeStyle = "#a0896e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(260, 148);
    ctx.lineTo(760, 148);
    ctx.stroke();

    // 한글 부제
    ctx.font = "400 44px sans-serif";
    ctx.fillStyle = "#8b7360";
    ctx.fillText("문인화  전시관", 512, 232);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const paintingTexture = useMemo(() => createInkArtTexture("mountain"), []);

  return (
    <group>
      {/* 갤러리 사인 텍스트 */}
      <mesh position={[0, 3.1, -12.97]}>
        <planeGeometry args={[5.8, 1.8]} />
        <meshBasicMaterial map={signTexture} transparent />
      </mesh>

      {/* 뒷벽 대형 산수화 */}
      <group position={[0, 1.85, -12.9]}>
        {/* 액자 */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.2 + 0.08, 2.0 + 0.08, 0.07]} />
          <meshStandardMaterial color={COLORS.frameWood} roughness={0.55} />
        </mesh>
        {/* 작품 */}
        <mesh position={[0, 0, 0.038]}>
          <planeGeometry args={[3.2, 2.0]} />
          <meshStandardMaterial map={paintingTexture} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** 양쪽 벽 작품 배치 */
export default function GalleryArtworks() {
  // 좌벽 (x = -6, 90° 회전): 3작품
  const leftWallArtworks: Array<{
    z: number;
    type: "plum" | "bamboo" | "mountain" | "orchid" | "bird" | "chrysanthemum";
  }> = [
    { z: 7, type: "plum" },
    { z: 1, type: "bamboo" },
    { z: -5, type: "mountain" },
  ];

  // 우벽 (x = +6, -90° 회전): 3작품
  const rightWallArtworks: Array<{
    z: number;
    type: "plum" | "bamboo" | "mountain" | "orchid" | "bird" | "chrysanthemum";
  }> = [
    { z: 7, type: "orchid" },
    { z: 1, type: "bird" },
    { z: -5, type: "chrysanthemum" },
  ];

  return (
    <group>
      {/* 왼쪽 벽 액자 */}
      {leftWallArtworks.map(({ z, type }) => (
        <ArtFrame
          key={`left-${z}`}
          position={[-5.93, 2.1, z]}
          rotation={[0, Math.PI / 2, 0]}
          artType={type}
        />
      ))}

      {/* 오른쪽 벽 액자 */}
      {rightWallArtworks.map(({ z, type }) => (
        <ArtFrame
          key={`right-${z}`}
          position={[5.93, 2.1, z]}
          rotation={[0, -Math.PI / 2, 0]}
          artType={type}
        />
      ))}

      {/* 뒷벽 갤러리 사인 + 대형 작품 */}
      <BackWallSign />
    </group>
  );
}
