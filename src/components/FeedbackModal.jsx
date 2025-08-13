import { useState, useEffect } from "react";
import { getBrowserMetadata } from "../utils/getBrowserMetadata";
import ScreenshotEditor from "./ScreenshotEditor";

const FeedbackModal = ({
  apiKey,
  screenshot,
  setScreenshot,
  video,
  setVideo,
  onRecordVideo,
  isRecording = false,
  onClose,
}) => {
  // Derive a project name from the current hostname (not shown to user)
  const deriveProjectName = () => {
    try {
      const host = (window.location.hostname || "").toLowerCase();
      if (!host) return "";
      if (host === "localhost") return "local host"; // as requested example
      // If it's an IP, just return it
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
      // Split into parts; prefer the second-level label (last non-TLD)
      const parts = host.split(".").filter(Boolean);
      if (parts.length === 1) return parts[0].replace(/-/g, " ");
      // Common case like google.com or app.example.com -> pick example or google
      const candidate = parts[parts.length - 2] || parts[0];
      return candidate.replace(/-/g, " ");
    } catch {
      return "";
    }
  };
  // Feedback form states
  const [name, setName] = useState(""); // ✅ New name field
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [severity, setSeverity] = useState("low");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [shouldRenderEditor, setShouldRenderEditor] = useState(false);
  const [error, setError] = useState("");

  // Browser info state + loading flag
  const [browserInfo, setBrowserInfo] = useState(null);
  const [browserInfoLoading, setBrowserInfoLoading] = useState(true);

  // Load browser metadata on mount
  useEffect(() => {
    (async () => {
      try {
        const info = await getBrowserMetadata();
        setBrowserInfo(info);
      } catch (err) {
        console.error("Failed to fetch browser metadata:", err);
        setBrowserInfo({
          ip: "Unknown",
          location: "Unknown",
          browser: "Unknown",
          os: "Unknown",
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        });
      } finally {
        setBrowserInfoLoading(false);
      }
    })();
  }, []);

  // Handle screenshot editor animations
  useEffect(() => {
    if (editing) {
      setShouldRenderEditor(true);
      // Start fade-in animation after render
      setTimeout(() => setAnimationClass("animate-fade-in"), 10);
    } else if (shouldRenderEditor) {
      // Start fade-out animation
      setAnimationClass("animate-fade-out");
      // Remove from DOM after animation completes
      setTimeout(() => {
        setShouldRenderEditor(false);
        setAnimationClass("");
      }, 400); // Match animation duration
    }
  }, [editing, shouldRenderEditor]);

  // Disable body scrolling when modal is open, but restore when recording
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isRecording) {
      // Restore scrolling during recording
      document.body.style.overflow = originalOverflow;
    } else {
      // Disable scrolling when modal is visible
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isRecording]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    // Require either a screenshot or a video
    if (!screenshot && !video) {
      setError("Attach a screenshot or record a video.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("severity", severity);
      formData.append("status", "open");
      // Auto project name (not displayed to user)
      const projectName = deriveProjectName();
      if (projectName) formData.append("projectName", projectName);
      formData.append(
        "metadata",
        JSON.stringify({
          url: window.location.href,
          browser: browserInfo?.browser,
          os: browserInfo?.os,
          viewport: browserInfo?.viewport,
          ip: browserInfo?.ip || "",
          location: browserInfo?.location || "",
        })
      );
      if (name.trim()) formData.append("name", name.trim());
      if (email.trim()) formData.append("email", email);

      if (video?.blob) {
        // Attach video if available
        formData.append(
          "video",
          video.blob,
          `recording.${
            (video.mimeType || "video/webm").split("/")[1] || "webm"
          }`
        );
      } else if (screenshot) {
        // Convert screenshot data URL to blob
        const response = await fetch(screenshot);
        const blob = await response.blob();
        formData.append("screenshot", blob, "screenshot.png");
      }
      const apiUrl = "https://zenbug-admin-panel.vercel.app/api";
      const res = await fetch(`${apiUrl}/feedback`, {
        method: "POST",
        headers: { Authorization: `ApiKey ${apiKey}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Submission failed");

      setLoading(false);
      setSuccess(true);

      // Wait 2000ms then close
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(error.message || "Failed to submit feedback. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 frosted-backdrop flex items-center justify-center z-50 ${
        isRecording ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Show loading overlay when submitting */}
      {loading && !success && (
        <div className="absolute inset-0 frosted-backdrop flex items-center justify-center z-10">
          <div className="text-center flex flex-col items-center justify-center">
            <div className="loader-large mx-auto"></div>
            <p className="text-white mt-4 ">Submitting feedback...</p>
          </div>
        </div>
      )}

      {/* Show success message */}
      {success && (
        <div className="absolute inset-0 frosted-backdrop flex items-center justify-center z-10">
          <div className="text-white text-center flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-xl">Feedback submitted successfully!</p>
          </div>
        </div>
      )}

      <div
        className={`bg-neutral-900 w-full max-w-[90%] h-full max-h-[87%] lg:max-h-[88%] lg:h-[88%] p-6 sm:p-8 rounded-2xl shadow-2xl border border-neutral-700 relative flex flex-col overflow-hidden ${
          loading || success ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white transition text-2xl cursor-pointer"
        >
          ×
        </button>
        <div className="flex max-lg:flex-col flex-row relative overflow-hidden max-lg:overflow-auto">
          {/* Form - Animated with translateX */}
          <div
            className={`flex flex-col lg:w-[20%] lg:min-w-[300px] lg:max-w-[400px] mr-8 flex-shrink transition-all duration-500 ease-in-out lg:absolute lg:top-0 lg:left-0 lg:h-full ${
              editing
                ? "lg:-translate-x-[120%] opacity-0 pointer-events-none"
                : "lg:translate-x-0 lg:relative opacity-100"
            }`}
          >
            <h2 className="text-xl sm:text-2xl text-center font-bold mb-6 text-white tracking-tight">
              Submit Feedback
            </h2>
            {/* Form Section - smaller */}
            <form
              onSubmit={handleSubmit}
              className="w-full space-y-6 overflow-hidden p-1"
            >
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />

              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 min-h-[120px] text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />

              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />

              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="low">Low Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="high">High Severity</option>
              </select>

              {/* Browser Info */}
              <div className="text-xs sm:text-sm text-gray-400 py-6">
                {browserInfoLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading browser info...</span>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong className="text-gray-300">URL:</strong>{" "}
                      {window.location.href}
                    </p>
                    <p>
                      <strong className="text-gray-300">Browser:</strong>{" "}
                      {browserInfo.browser}
                    </p>
                    <p>
                      <strong className="text-gray-300">OS:</strong>{" "}
                      {browserInfo.os}
                    </p>
                    <p>
                      <strong className="text-gray-300">IP:</strong>{" "}
                      {browserInfo.ip}
                    </p>
                    <p>
                      <strong className="text-gray-300">Location:</strong>{" "}
                      {browserInfo.location}
                    </p>
                  </>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 rounded-lg text-white font-medium bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 transition cursor-pointer"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Media Section */}
          <div
            className={`flex flex-col flex-1 ${!editing ? "items-center" : ""}`}
          >
            {shouldRenderEditor && screenshot && (
              <div className={animationClass}>
                {/* Large Screenshot Editor */}
                <div className="flex-1 overflow-auto">
                  <ScreenshotEditor
                    screenshot={screenshot}
                    onSave={(editedDataUrl) => {
                      setScreenshot(editedDataUrl);
                      setEditing(false);
                    }}
                    onCancel={() => setEditing(false)}
                  />
                </div>
              </div>
            )}
            {!editing && video && (
              <>
                <label className="block mb-3 text-center font-medium text-sm sm:text-base text-gray-300">
                  Video Preview
                </label>
                <video
                  controls
                  className="w-[87%] h-auto max-h-[70vh] rounded-lg border border-neutral-700 mx-auto"
                  src={video.url}
                />
                <div className="flex justify-center mt-4 gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        if (video?.url) URL.revokeObjectURL(video.url);
                      } catch {}
                      setVideo(null);
                    }}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm border border-neutral-600 text-white cursor-pointer"
                  >
                    Remove Video
                  </button>
                </div>
              </>
            )}
            {!editing && !video && screenshot && (
              <>
                <label className="block mb-9 text-center font-medium text-sm sm:text-base text-gray-300">
                  Screenshot Preview
                </label>
                <img
                  src={screenshot}
                  alt="Screenshot"
                  className="w-[96%] max-h-[66vh] object-contain rounded-lg border border-neutral-700"
                />
                <div className="flex justify-center mt-4 gap-6">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm border border-neutral-600 text-white cursor-pointer"
                  >
                    Edit Screenshot
                  </button>
                  <button
                    type="button"
                    onClick={onRecordVideo}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-sm border border-neutral-600 text-white cursor-pointer"
                  >
                    Record Video
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
