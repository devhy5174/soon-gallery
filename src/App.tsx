/**
 * App
 * 앱 루트 컴포넌트 — 현재 화면 상태를 관리하고 해당 화면을 렌더링한다
 */

import { useState } from "react";
import type { AppScreen } from "./types";
import EntranceScreen from "./components/entrance";
import Gallery from "./components/gallery";
import "./App.css";

function App() {
  /** 현재 표시할 화면 — 기본값은 입장 화면 */
  const [screen, setScreen] = useState<AppScreen>("entrance");

  return (
    <div className="app">
      {/* 입장 화면 */}
      {screen === "entrance" && (
        <EntranceScreen
          onGuestEnter={() => setScreen("gallery")}
          onAdminEnter={() => setScreen("admin-login")}
        />
      )}

      {/* 3D 갤러리 (게스트 모드) */}
      {screen === "gallery" && (
        <Gallery onExit={() => setScreen("entrance")} />
      )}

      {/* 관리자 로그인 — Stage 5에서 Supabase Auth와 함께 구현 */}
      {screen === "admin-login" && (
        <div className="screen-placeholder">
          <p>관리자 인증은 다음 단계에서 구현됩니다.</p>
          <button
            className="btn btn-outline"
            onClick={() => setScreen("entrance")}
          >
            ← 입장 화면으로
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
