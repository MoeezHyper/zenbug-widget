import React from "react";
import ReactDOM from "react-dom/client";
import ZenBugApp from "./components/Widget";
import cssText from "./tailwind.css?raw";

let container = document.getElementById("zenbug-widget-container");
if (!container) {
  container = document.createElement("div");
  container.id = "zenbug-widget-container";
  document.body.appendChild(container);
}

if (!container.shadowRoot) {
  const shadow = container.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.setAttribute("id", "zenbug-tailwind");
  style.textContent = cssText;
  shadow.appendChild(style);

  const rootEl = document.createElement("div");
  rootEl.id = "zenbug-root";
  shadow.appendChild(rootEl);

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ZenBugApp />
    </React.StrictMode>
  );
}
