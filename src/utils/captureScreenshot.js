import html2canvas from "html2canvas";

export const captureScreenshot = async () => {
  const feedbackBtn = document.getElementById("zenbug-feedback-btn");

  // Hide the button temporarily
  if (feedbackBtn) feedbackBtn.style.display = "none";

  // Wait a tick to allow DOM to update
  await new Promise((resolve) => setTimeout(resolve, 50));

  const canvas = await html2canvas(document.body);

  // Restore the button
  if (feedbackBtn) feedbackBtn.style.display = "";

  return canvas.toDataURL("image/png");
};
