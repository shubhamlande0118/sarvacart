import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Remove the boot/loading screen once React is ready to paint.
function removeBoot() {
  const boot = document.getElementById("boot");
  if (boot) {
    boot.style.opacity = "0";
    boot.style.transition = "opacity .4s ease";
    window.setTimeout(() => boot.remove(), 450);
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

removeBoot();
