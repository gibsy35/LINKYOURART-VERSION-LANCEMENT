import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LanguageProvider } from "./context/LanguageContext";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Auto-reload when a new service worker is installed and waiting.
// Combined with skipWaiting+clientsClaim in vite.config.ts, this ensures
// new deploys take effect eventually without needing all tabs closed.
//
// IMPORTANT: no longer force-reloading immediately on detection. During
// a burst of frequent deploys, an immediate reload() was firing a few
// seconds into every session (new SW detected almost right away),
// restarting the whole app — including the boot loader — which looked
// like a broken double-loader. The new SW still takes over silently
// (skipWaiting+clientsClaim), the user just gets the fresh version on
// their next natural navigation/reload instead of a surprise mid-session one.
registerSW({
  onNeedRefresh() {
    console.log("[LYA PWA] New version available — will apply on next page load.");
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