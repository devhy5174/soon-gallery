/**
 * ArtworkModal
 * 작품 확대 감상 모달 — E 키 또는 닫기 버튼으로 토글
 * 고해상도(600×750)로 먹화를 재렌더링하여 선명한 감상 제공
 */

import { useEffect, useRef } from "react";
import { drawInkArt } from "./artDrawings";
import type { ArtworkData } from "./artworkData";

interface Props {
  artwork: ArtworkData;
  onClose: () => void;
}

export default function ArtworkModal({ artwork, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 작품 변경 시 고해상도로 재렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawInkArt(ctx, canvas.width, canvas.height, artwork.artType);
  }, [artwork]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // 배경 클릭으로 닫기
    <div className="artwork-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="artwork-modal__card"
        onClick={(e) => e.stopPropagation()} // 카드 내부 클릭은 닫히지 않음
      >
        {/* 닫기 버튼 */}
        <button className="artwork-modal__close" onClick={onClose} aria-label="닫기">
          ✕
        </button>

        {/* 작품 이미지 */}
        <div className="artwork-modal__frame">
          <div className="artwork-modal__frame-inner">
            <canvas
              ref={canvasRef}
              width={480}
              height={600}
              className="artwork-modal__canvas"
            />
          </div>
        </div>

        {/* 작품 정보 — 모바일에서 이 영역만 스크롤됨 */}
        <div className="artwork-modal__info">
          {/* 모바일 드래그 핸들 — 스크롤 가능 영역 시각 힌트 */}
          <div className="artwork-modal__drag-handle" aria-hidden="true" />

          {/* 한국 인장 장식 */}
          <div className="artwork-modal__seal" aria-hidden="true">순</div>

          <h2 className="artwork-modal__title">{artwork.title}</h2>
          <p className="artwork-modal__title-en">{artwork.titleEn}</p>

          <div className="artwork-modal__divider" aria-hidden="true" />

          <p className="artwork-modal__desc">{artwork.description}</p>

          <p className="artwork-modal__hint">ESC 또는 배경 클릭으로 돌아가기</p>
        </div>
      </div>
    </div>
  );
}
