import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { mockMode } from "./api";
import { makeQueryClient } from "./query";
import "./styles.css";
async function start() {
  if (mockMode) {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  } else {
    // Remove only this app's mock worker when switching an existing origin to live.
    const registrations =
      (await navigator.serviceWorker?.getRegistrations()) ?? [];
    for (const registration of registrations) {
      if (registration.active?.scriptURL.endsWith("/mockServiceWorker.js"))
        await registration.unregister();
    }
  }
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={makeQueryClient()}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
start().catch((error) => {
  document.getElementById("root")!.textContent =
    "Startup failed. Inspect the browser console and confirm the mock worker exists.";
  console.error(error);
});
