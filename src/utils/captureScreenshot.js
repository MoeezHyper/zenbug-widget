import html2canvas from "html2canvas";

export const captureScreenshot = async () => {
  const feedbackBtn = document.getElementById("zenbug-feedback-btn");

  // Hide the button temporarily
  if (feedbackBtn) feedbackBtn.style.display = "none";

  // Wait a tick to allow DOM to update
  await new Promise((resolve) => setTimeout(resolve, 50));

  let dataUrl;
  try {
    // Prefer the visual viewport (handles zoom/OS scaling) when available
    const vv = window.visualViewport;
    const x = vv ? vv.pageLeft : window.scrollX;
    const y = vv ? vv.pageTop : window.scrollY;
    const vw = vv ? vv.width : document.documentElement.clientWidth;
    const vh = vv ? vv.height : document.documentElement.clientHeight;

    // Render and crop directly using html2canvas to the visible viewport.
    // Use scale=1 so CSS px map 1:1 to canvas to avoid off-by-some scaling.
    const canvas = await html2canvas(document.documentElement, {
      x,
      y,
      width: Math.round(vw),
      height: Math.round(vh) - 5,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
      scrollX: x,
      scrollY: y - 18,
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 1,
    });
    dataUrl = canvas.toDataURL("image/png");
  } finally {
    // Restore the button even if capture throws
    if (feedbackBtn) feedbackBtn.style.display = "";
  }

  return dataUrl;
};
