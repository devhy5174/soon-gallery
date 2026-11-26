/**
 * CelebrationForm
 * 축하 화분 등록 모달 — 닉네임 입력 + 축하문구 선택 + 화분 선택
 *
 * [Supabase 연동 시]
 * - onSubmit 콜백에서 celebrationService.saveCelebration() 대신
 *   supabase.from('celebrations').insert(...) 로 교체하면 됨
 */

import { useState } from "react";
import {
  CELEBRATION_MESSAGES,
  PLANT_LABELS,
  type PlantType,
  type CelebrationEntry,
} from "./celebrationService";
import "./CelebrationForm.css";

interface Props {
  onSubmit: (entry: Omit<CelebrationEntry, "id" | "createdAt">) => void;
  onClose: () => void;
}

/** 화분 미리보기 SVG — 간단한 아이콘 형태 */
function PlantPreview({ type }: { type: PlantType }) {
  if (type === "orchid") {
    return (
      <svg className="cf-plant-icon" viewBox="0 0 64 72" fill="none">
        {/* 화분 */}
        <ellipse cx="32" cy="62" rx="16" ry="5" fill="#e8e0d5" />
        <path d="M18 48 Q16 62 20 67 Q32 70 44 67 Q48 62 46 48Z" fill="#f0ebe2" stroke="#c8bfb0" strokeWidth="1" />
        <path d="M20 48 Q32 44 44 48" stroke="#c8bfb0" strokeWidth="1" fill="none" />
        {/* 줄기 */}
        <path d="M32 48 Q28 36 24 24" stroke="#6b8f5e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M32 48 Q36 32 38 18" stroke="#6b8f5e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M32 48 Q30 30 28 10" stroke="#6b8f5e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* 꽃 — 흰색/연분홍 */}
        {[
          [24, 22], [38, 16], [28, 8],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx="5" ry="3.5" fill="white" stroke="#e8c8d8" strokeWidth="0.8" transform={`rotate(${i * 60} ${cx} ${cy})`} />
            <ellipse cx={cx} cy={cy} rx="5" ry="3.5" fill="white" stroke="#e8c8d8" strokeWidth="0.8" transform={`rotate(${i * 60 + 30} ${cx} ${cy})`} />
            <circle cx={cx} cy={cy} r="2.5" fill="#f8d8e8" />
          </g>
        ))}
        {/* 잎 */}
        <ellipse cx="22" cy="38" rx="6" ry="2.5" fill="#5a8050" transform="rotate(-30 22 38)" />
        <ellipse cx="42" cy="34" rx="6" ry="2.5" fill="#5a8050" transform="rotate(20 42 34)" />
        {/* 리본 */}
        <path d="M24 54 Q28 50 32 52 Q36 50 40 54" stroke="#d4a0b8" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="52" r="2" fill="#d4a0b8" />
      </svg>
    );
  }

  return (
    <svg className="cf-plant-icon" viewBox="0 0 64 72" fill="none">
      {/* 화분 */}
      <ellipse cx="32" cy="62" rx="16" ry="5" fill="#e8e0d5" />
      <path d="M18 48 Q16 62 20 67 Q32 70 44 67 Q48 62 46 48Z" fill="#f0ebe2" stroke="#c8bfb0" strokeWidth="1" />
      <path d="M20 48 Q32 44 44 48" stroke="#c8bfb0" strokeWidth="1" fill="none" />
      {/* 산세베리아 잎 */}
      <path d="M28 48 Q26 32 27 10 Q28 8 29 10 Q30 32 30 48Z" fill="#4a7a3a" />
      <path d="M28 48 Q26 32 27 10 Q28 8 29 10 Q30 32 30 48Z" fill="none" stroke="#c8d870" strokeWidth="0.8" />
      <path d="M34 48 Q32 28 33 6 Q34 4 35 6 Q36 28 36 48Z" fill="#4a7a3a" />
      <path d="M34 48 Q32 28 33 6 Q34 4 35 6 Q36 28 36 48Z" fill="none" stroke="#c8d870" strokeWidth="0.8" />
      <path d="M24 48 Q24 36 25 18 Q26 16 27 18 Q26 36 26 48Z" fill="#3d6830" />
      <path d="M38 48 Q38 32 39 16 Q40 14 41 16 Q40 32 40 48Z" fill="#3d6830" />
      {/* 노란 테두리 줄 */}
      <line x1="27" y1="12" x2="29" y2="46" stroke="#d4c850" strokeWidth="0.6" opacity="0.7" />
      <line x1="33" y1="8" x2="35" y2="46" stroke="#d4c850" strokeWidth="0.6" opacity="0.7" />
      {/* 리본 */}
      <path d="M24 54 Q28 50 32 52 Q36 50 40 54" stroke="#b8c870" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="52" r="2" fill="#b8c870" />
    </svg>
  );
}

export default function CelebrationForm({ onSubmit, onClose }: Props) {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [plantType, setPlantType] = useState<PlantType | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = nickname.trim().length > 0 && message !== null && plantType !== null;

  const handleSubmit = () => {
    if (!canSubmit || !message || !plantType) return;
    onSubmit({ nickname: nickname.trim(), message, plantType });
    setSubmitted(true);
  };

  return (
    <div className="cf-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cf-modal">
        {/* 헤더 */}
        <div className="cf-header">
          <div>
            <h2 className="cf-title">🌸 축하하기</h2>
            <p className="cf-subtitle">화분을 전시관에 선물하세요</p>
          </div>
          <button className="cf-close-btn" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {submitted ? (
          /* 완료 화면 */
          <div className="cf-success">
            <span className="cf-success__icon">🎉</span>
            <p className="cf-success__text">감사합니다!</p>
            <p className="cf-success__sub">
              {nickname}님의 화분이<br />전시관에 놓여졌습니다
            </p>
            <button className="cf-submit-btn" onClick={onClose} style={{ marginTop: 8 }}>
              닫기
            </button>
          </div>
        ) : (
          <>
            {/* 닉네임 */}
            <div className="cf-section">
              <label className="cf-label">닉네임</label>
              <input
                className="cf-input"
                type="text"
                placeholder="이름 또는 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={12}
              />
            </div>

            {/* 축하 문구 선택 */}
            <div className="cf-section">
              <label className="cf-label">축하 문구</label>
              <div className="cf-messages">
                {CELEBRATION_MESSAGES.map((msg) => (
                  <button
                    key={msg}
                    className={`cf-message-btn ${message === msg ? "cf-message-btn--selected" : ""}`}
                    onClick={() => setMessage(msg)}
                  >
                    <span className="cf-radio-dot" />
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* 화분 종류 선택 */}
            <div className="cf-section">
              <label className="cf-label">화분 선택</label>
              <div className="cf-plants">
                {(["orchid", "sansevieria"] as PlantType[]).map((type) => (
                  <button
                    key={type}
                    className={`cf-plant-btn ${plantType === type ? "cf-plant-btn--selected" : ""}`}
                    onClick={() => setPlantType(type)}
                  >
                    <PlantPreview type={type} />
                    <span className="cf-plant-name">{PLANT_LABELS[type]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 제출 */}
            <button className="cf-submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
              화분 선물하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
