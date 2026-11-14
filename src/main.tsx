import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Set this before React mounts so browser history cannot restore a saved
// scroll position (or a #eventos fragment) over the landing hero on refresh.
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const resetLandingScroll = () => {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path !== "/landingpage" && path !== "") return;

  if (window.location.hash) {
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
  }

  const forceTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  forceTop();
  requestAnimationFrame(() => requestAnimationFrame(forceTop));
  window.setTimeout(forceTop, 180);
};

window.addEventListener("pageshow", resetLandingScroll);
window.addEventListener("load", resetLandingScroll, { once: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
