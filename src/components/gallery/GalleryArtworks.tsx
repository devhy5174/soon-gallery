/**
 * GalleryArtworks
 * 갤러리 액자 배치 — 좌우 벽 작품 + 뒷벽 사인·산수화
 * 각 작품 평면에 userData.artworkId를 설정하여 레이캐스트 식별을 지원한다
 */

import { useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { createArtTexture, drawInkArt } from "./artDrawings";
import { ARTWORK_LIST } from "./artworkData";
import { COLORS } from "./constants";

/** 단일 액자 컴포넌트 */
function ArtFrame({
  artworkId,
  artType,
  position,
  rotation,
  imageUrl,
}: {
  artworkId: string;
  artType: Parameters<typeof createArtTexture>[0];
  position: [number, number, number];
  rotation: [number, number, number];
  imageUrl?: string;
}) {
  const artW = 1.1;
  const artH = 1.4;
  const frameT = 0.055;
  const frameD = 0.07;

  // 캔버스 드로잉 텍스처 (즉시 표시 — 이미지 로딩 전 폴백)
  const canvasTex = useMemo(() => createArtTexture(artType), [artType]);
  const [texture, setTexture] = useState<THREE.Texture>(canvasTex);

  useEffect(() => {
    if (imageUrl) {
      // 명시적 경로가 있으면 바로 로딩
      new THREE.TextureLoader().load(
        imageUrl,
        (tex) => { tex.colorSpace = THREE.SRGBColorSpace; setTexture(tex); },
        undefined,
        () => setTexture(canvasTex),
      );
      return;
    }
    // 확장자 순서대로 시도: jpg → png → webp
    const exts = ["jpg", "jpeg", "png", "webp"];
    let i = 0;
    const tryNext = () => {
      if (i >= exts.length) { setTexture(canvasTex); return; }
      new THREE.TextureLoader().load(
        `/artworks/${artType}.${exts[i++]}`,
        (tex) => { tex.colorSpace = THREE.SRGBColorSpace; setTexture(tex); },
        undefined,
        tryNext,
      );
    };
    tryNext();
  }, [artType, imageUrl, canvasTex]);

  return (
    <group position={position} rotation={rotation}>
      {/* 원목 액자 외곽 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[artW + frameT * 2, artH + frameT * 2, frameD]} />
        <meshStandardMaterial color={COLORS.frameWood} roughness={0.55} />
      </mesh>

      {/* 매트 (아이보리 여백) */}
      <mesh position={[0, 0, frameD / 2 + 0.001]}>
        <planeGeometry args={[artW + frameT * 0.6, artH + frameT * 0.6]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
      </mesh>

      {/* 작품 평면 — userData.artworkId 로 레이캐스트 식별 */}
      <mesh
        position={[0, 0, frameD / 2 + 0.003]}
        userData={{ artworkId }}
      >
        <planeGeometry args={[artW, artH]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** 뒷벽 갤러리 사인 + 산수화 */
export function BackWallSign() {
  const signTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 320);

    ctx.font = "500 78px Georgia, serif";
    ctx.fillStyle = "#292724";
    ctx.textAlign = "center";
    ctx.fillText("SOON  GALLERY", 490, 110);

    ctx.fillStyle = "#a64b3c";
    ctx.beginPath();
    ctx.arc(870, 78, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f8f4ed";
    ctx.font = "bold 26px serif";
    ctx.fillText("순", 870, 88);

    ctx.strokeStyle = "#a0896e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(260, 148);
    ctx.lineTo(760, 148);
    ctx.stroke();

    ctx.font = "400 44px sans-serif";
    ctx.fillStyle = "#8b7360";
    ctx.fillText("문인화  전시관", 512, 232);

    return new THREE.CanvasTexture(canvas);
  }, []);

  const paintingTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    drawInkArt(ctx, 640, 400, "mountain");
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group>
      {/* 갤러리 사인 */}
      <mesh position={[0, 3.1, -12.97]}>
        <planeGeometry args={[5.8, 1.8]} />
        <meshBasicMaterial map={signTexture} transparent />
      </mesh>

      {/* 대형 산수화 액자 */}
      <group position={[0, 1.85, -12.9]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.28, 2.08, 0.07]} />
          <meshStandardMaterial color={COLORS.frameWood} roughness={0.55} />
        </mesh>
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
  const leftArtworks = ARTWORK_LIST.filter((a) =>
    a.id.startsWith("left")
  );
  const rightArtworks = ARTWORK_LIST.filter((a) =>
    a.id.startsWith("right")
  );

  // 좌벽 Z 좌표 (입구→뒷벽 순)
  const leftZs = [7, 1, -5];
  // 우벽 Z 좌표
  const rightZs = [7, 1, -5];

  return (
    <group>
      {/* 왼쪽 벽 액자 */}
      {leftArtworks.map((artwork, i) => (
        <ArtFrame
          key={artwork.id}
          artworkId={artwork.id}
          artType={artwork.artType}
          imageUrl={artwork.imageUrl}
          position={[-5.93, 2.1, leftZs[i]]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}

      {/* 오른쪽 벽 액자 */}
      {rightArtworks.map((artwork, i) => (
        <ArtFrame
          key={artwork.id}
          artworkId={artwork.id}
          artType={artwork.artType}
          imageUrl={artwork.imageUrl}
          position={[5.93, 2.1, rightZs[i]]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      ))}

      {/* 뒷벽 사인 + 대형 산수화 */}
      <BackWallSign />
    </group>
  );
}
