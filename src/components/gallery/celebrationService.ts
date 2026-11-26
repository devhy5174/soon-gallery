/**
 * celebrationService
 * 축하 화분 데이터 관리 — Supabase 연동 전 로컬 상태로 동작
 *
 * [Supabase 연동 시 교체 포인트]
 * - CelebrationEntry: DB 테이블 스키마와 맞추면 됨
 * - saveCelebration: supabase.from('celebrations').insert(...) 로 교체
 * - loadCelebrations: supabase.from('celebrations').select('*') 로 교체
 * - 테이블 예시:
 *   CREATE TABLE celebrations (
 *     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *     nickname text NOT NULL,
 *     message text NOT NULL,
 *     plant_type text NOT NULL,  -- 'orchid' | 'sansevieria'
 *     created_at timestamptz DEFAULT now()
 *   );
 */

export type PlantType = "orchid" | "sansevieria";

export interface CelebrationEntry {
  id: string;
  nickname: string;    // 리본 한쪽에 표시될 닉네임
  message: string;     // 리본 다른 쪽에 표시될 축하 문구
  plantType: PlantType;
  createdAt: string;   // ISO 날짜 문자열
}

/** 선택 가능한 축하 문구 3가지 */
export const CELEBRATION_MESSAGES = [
  "전시를 축하합니다",
  "앞날을 응원합니다",
  "항상 행복하세요",
] as const;

/** 화분 종류 표시 이름 */
export const PLANT_LABELS: Record<PlantType, string> = {
  orchid: "호접란",
  sansevieria: "산세베리아",
};

// ── 로컬 스토리지 키 (Supabase 연동 전 임시 저장) ──────────────
const STORAGE_KEY = "soon-gallery-celebrations";

/** 저장된 축하 목록 불러오기 */
export function loadCelebrations(): CelebrationEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CelebrationEntry[]) : [];
  } catch {
    return [];
  }
}

/** 새 축하 항목 저장 — 성공 시 전체 목록 반환 */
export function saveCelebration(
  data: Omit<CelebrationEntry, "id" | "createdAt">,
): CelebrationEntry[] {
  const existing = loadCelebrations();
  const newEntry: CelebrationEntry = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const updated = [...existing, newEntry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
