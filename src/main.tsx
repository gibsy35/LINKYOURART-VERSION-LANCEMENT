import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Auto-reload when a new service worker is installed and waiting.
// Combined with skipWaiting+clientsClaim in vite.config.ts, this ensures
// new deploys take effect immediately instead of waiting for the user
// to close all tabs — prevents the stale-SW-blocking-new-code issue.
registerSW({
  onNeedRefresh() {
    // New content available — reload immediately since skipWaiting means
    // the new SW is already active, we just need a fresh page load.
    window.location.reload();
  },
  onOfflineReady() {
    console.log("[LYA PWA] App ready for offline use.");
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </LanguageProvider>
  </React.StrictMode>
);