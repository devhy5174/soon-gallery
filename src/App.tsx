/**
 * App
 * 앱 루트 — 화면 상태 관리
 * entrance → gallery / media-room / admin-login
 */

import { useState } from "react";
import type { AppScreen } from "./types";
import EntranceScreen from "./components/entrance";
import Gallery from "./components/gallery";
import MediaRoom from "./components/mediaroom";
import "./App.css";

function App() {
  const [screen, setScreen] = useState<AppScreen>("entrance");

  return (
    <div className="app">
      {screen === "entrance" && (
        <EntranceScreen
          onGuestEnter={() => setScreen("gallery")}
          onMediaEnter={() => setScreen("media-room")}
          onAdminEnter={() => setScreen("admin-login")}
        />
      )}

      {screen === "gallery" && (
        <Gallery
          onExit={() => setScreen("entrance")}
          onEnterMediaRoom={() => setScreen("media-room")}
        />
      )}

      {screen === "media-room" && (
        <MediaRoom onExit={() => setScreen("entrance")} />
      )}

      {screen === "admin-login" && (
        <div className="screen-placeholder">
          <p>관리자 인증은 다음 단계에서 구현됩니다.</p>
          <button className="btn btn-outline" onClick={() => setScreen("entrance")}>
            ← 입장 화면으로
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
