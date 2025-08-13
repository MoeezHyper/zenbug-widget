// ZenBug page script
export const captureScreenshot = async () => {
  const feedbackBtn = document.getElementById("zenbug-feedback-btn");

  // Hide the button temporarily
  if (feedbackBtn) feedbackBtn.style.display = "none";

  // Wait a tick for DOM update
  await new Promise((resolve) => setTimeout(resolve, 50));

  let dataUrl;
  try {
    dataUrl = await new Promise((resolve, reject) => {
      function handler(event) {
        if (event.source !== window) return;
        if (event.data?.type === "ZENBUG_SCREENSHOT_RESPONSE") {
          window.removeEventListener("message", handler);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.data);
          }
        }
      }

      window.addEventListener("message", handler);

      // Trigger content script
      window.postMessage({ type: "ZENBUG_SCREENSHOT_REQUEST" }, "*");
    });
  } catch (error) {
    console.error("Chrome API screenshot failed:", error);
    throw new Error(
      "Screenshot capture failed. Please ensure the extension has proper permissions."
    );
  } finally {
    if (feedbackBtn) feedbackBtn.style.display = "";
  }

  return dataUrl;
};
