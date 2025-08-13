// Chrome Extension API screenshot capture
export const captureScreenshot = async () => {
  const feedbackBtn = document.getElementById("zenbug-feedback-btn");

  // Hide the button temporarily
  if (feedbackBtn) feedbackBtn.style.display = "none";

  // Wait a tick to allow DOM to update
  await new Promise((resolve) => setTimeout(resolve, 50));

  let dataUrl;
  try {
    // Use Chrome extension messaging to capture tab
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "captureTab" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.dataUrl);
        }
      });
    });
    dataUrl = response;
  } catch (error) {
    console.error("Chrome API screenshot failed:", error);
    throw new Error(
      "Screenshot capture failed. Please ensure the extension has proper permissions."
    );
  } finally {
    // Restore the button
    if (feedbackBtn) feedbackBtn.style.display = "";
  }

  return dataUrl;
};
