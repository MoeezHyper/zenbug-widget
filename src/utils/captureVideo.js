// Screen recording helper: captures the current tab only (no audio),
// shows a fixed bottom Stop button, and returns { blob, url, mimeType }.

const pickMimeType = () => {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const type of candidates) {
    if (window.MediaRecorder && MediaRecorder.isTypeSupported(type))
      return type;
  }
  return undefined; // Let browser decide
};

const createStopOverlay = () => {
  const btn = document.createElement("button");
  btn.id = "zenbug-stop-recording";
  btn.textContent = "Stop Recording";
  Object.assign(btn.style, {
    position: "fixed",
    left: "50%",
    bottom: "16px",
    transform: "translateX(-50%)",
    zIndex: "2147483647",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#111",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
    cursor: "pointer",
    fontFamily: "Montserrat, sans-serif",
  });
  document.body.appendChild(btn);
  return btn;
};

export async function startWebpageRecording() {
  // Hide any existing feedback button to keep it out of the capture
  const feedbackBtn = document.getElementById("zenbug-feedback-btn");
  const prevDisplay = feedbackBtn?.style?.display;
  if (feedbackBtn) feedbackBtn.style.display = "none";

  // Request tab capture (no audio)
  const constraints = {
    video: {
      displaySurface: "browser",
      // Chrome specific hints
      preferCurrentTab: true,
      logicalSurface: true,
      cursor: "always",
    },
    audio: false,
  };

  let stream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia(constraints);
  } catch (err) {
    if (feedbackBtn) feedbackBtn.style.display = prevDisplay || "";
    throw err;
  }

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType } : undefined
  );
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const stopButton = createStopOverlay();

  // Allow stopping via overlay or if user stops sharing via browser UI
  const stopRecording = () => {
    if (recorder.state !== "inactive") recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
  };
  stopButton.addEventListener("click", stopRecording);
  stream
    .getVideoTracks()
    .forEach((t) => t.addEventListener("ended", stopRecording));

  const done = new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      resolve({ blob, url, mimeType: blob.type || mimeType || "video/webm" });
    };
  });

  recorder.start();

  const result = await done;

  // Cleanup overlay and restore feedback button
  stopButton.remove();
  if (feedbackBtn) feedbackBtn.style.display = prevDisplay || "";

  return result;
}

export default startWebpageRecording;
