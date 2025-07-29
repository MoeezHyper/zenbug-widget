import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import Widget from "./components/Widget";

function initZenBug() {
  const config = window.ZenBug || {};
  const apiKey = config.apiKey || "";

  let mountPoint = document.getElementById("zenbug-root");
  if (!mountPoint) {
    mountPoint = document.createElement("div");
    mountPoint.id = "zenbug-root";
    document.body.appendChild(mountPoint);
  }

  const root = createRoot(mountPoint);
  root.render(<Widget apiKey={apiKey} />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initZenBug);
} else {
  initZenBug();
}
