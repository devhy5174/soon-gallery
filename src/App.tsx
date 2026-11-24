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
import GalleryBgm from "./components/gallery/GalleryBgm";
import "./App.css";

function App() {
  const [screen, setScreen] = useState<AppScreen>("entrance");
  const [mediaSeated, setMediaSeated] = useState(false);

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
        <MediaRoom
          onExit={() => { setMediaSeated(false); setScreen("gallery"); }}
          onSeatChange={setMediaSeated}
        />
      )}

      {screen === "admin-login" && (
        <div className="screen-placeholder">
          <p>관리자 인증은 다음 단계에서 구현됩니다.</p>
          <button className="btn btn-outline" onClick={() => setScreen("entrance")}>
            ← 입장 화면으로
          </button>
        </div>
      )}

      {/* 갤러리·미디어룸 양쪽에서 음악이 유지되도록 App 레벨에서 마운트 */}
      {(screen === "gallery" || screen === "media-room") && (
        <GalleryBgm bottom={screen === "media-room"} mediaSeated={mediaSeated} />
      )}
    </div>
  );
}

export default App;
