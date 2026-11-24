/**
 * EntranceScreen
 * 갤러리 최초 입장 화면 — 게스트/관리자 선택
 */

import "./EntranceScreen.css";

interface Props {
  /** 게스트 관람 버튼 클릭 시 호출 */
  onGuestEnter: () => void;
  /** 관리자 입장 버튼 클릭 시 호출 */
  onAdminEnter: () => void;
}

export default function EntranceScreen({ onGuestEnter, onAdminEnter }: Props) {
  return (
    <div className="entrance">
      {/* 배경 장식 — 먹색 번짐 효과 (aria-hidden: 장식용이므로 스크린리더 무시) */}
      <div className="entrance-bg" aria-hidden="true">
        <div className="entrance-bg__blob entrance-bg__blob--tl" />
        <div className="entrance-bg__blob entrance-bg__blob--br" />
      </div>

      {/* 메인 콘텐츠 */}
      <main className="entrance-main">
        {/* 갤러리 로고 — 한국 인장(도장) 스타일 */}
        <div className="entrance-logo">
          {/* 붉은 원형 인장 — 갤러리 심볼 */}
          <div className="entrance-logo__seal" aria-hidden="true">
            순
          </div>

          <div className="entrance-logo__text">
            {/* 영문 갤러리명 */}
            <span className="entrance-logo__en">SOON GALLERY</span>
            {/* 한글 부제 */}
            <span className="entrance-logo__ko">순 갤러리</span>
          </div>
        </div>

        {/* 장식 구분선 */}
        <div className="entrance-divider" aria-hidden="true" />

        {/* 갤러리 소개 문구 */}
        <div className="entrance-desc">
          <p className="entrance-desc__main">먹과 여백이 머무는 공간</p>
          <p className="entrance-desc__sub">
            한국 전통 문인화 작품을 감상할 수 있는
            <br />
            3D 메타버스 온라인 전시관
          </p>
        </div>

        {/* 입장 버튼 그룹 */}
        <div className="entrance-actions">
          {/* 게스트 — 로그인 없이 바로 입장 */}
          <button
            className="btn btn-primary entrance-actions__btn"
            onClick={onGuestEnter}
          >
            게스트 관람 시작
          </button>

          {/* 관리자 — 인증 후 작품 등록·관리 가능 */}
          <button
            className="btn btn-outline entrance-actions__btn"
            onClick={onAdminEnter}
          >
            관리자 입장
          </button>
        </div>

        {/* 게스트 안내 문구 */}
        <p className="entrance-hint">로그인 없이 누구나 자유롭게 관람할 수 있습니다</p>
      </main>

      {/* 하단 갤러리 슬로건 */}
      <footer className="entrance-footer">
        <p>SOON GALLERY &middot; Art in Every Brushstroke</p>
      </footer>
    </div>
  );
}
