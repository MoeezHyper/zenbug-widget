import html2canvas from "html2canvas";

export const captureScreenshot = async () => {
  const feedbackBtn = document.querySelector("#zenbug-feedback-btn");
  if (feedbackBtn) feedbackBtn.style.display = "none";

  const canvas = await html2canvas(document.body);
  const dataUrl = canvas.toDataURL("image/png");

  if (feedbackBtn) feedbackBtn.style.display = "";

  return dataUrl;
};
