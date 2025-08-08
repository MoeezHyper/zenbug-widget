import { useState } from "react";
import { getBrowserMetadata } from "../utils/getBrowserMetadata";
import ScreenshotEditor from "./ScreenshotEditor";

const FeedbackModal = ({ apiKey, screenshot, setScreenshot, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [severity, setSeverity] = useState("low");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);

  const browserInfo = getBrowserMetadata();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Attach plain fields
      formData.append("title", title);
      formData.append("description", description);
      formData.append("severity", severity);
      formData.append("status", "open");
      formData.append(
        "metadata",
        JSON.stringify({
          url: window.location.href,
          ...browserInfo,
        })
      );
      if (email.trim()) formData.append("email", email);

      // Attach screenshot (convert base64 to Blob)
      if (screenshot) {
        const blob = await (await fetch(screenshot)).blob();
        formData.append("screenshot", blob, `screenshot-${Date.now()}.png`);
      }

      const apiUrl = "https://zenbug-admin-panel.vercel.app/api";
      const res = await fetch(`${apiUrl}/feedback`, {
        method: "POST",
        headers: {
          Authorization: `ApiKey ${apiKey}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Submission failed");

      console.log("✅ Submitted:", result);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("❌ Submission error:", err.message);
      alert("Failed to submit feedback: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-color-black50 overflow-auto min-h-screen py-8 px-4">
      <div className="bg-color-w w-full max-w-md p-4 sm:p-6 rounded-xl shadow-xl relative self-start">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-lg cursor-pointer scale-150 px-2 text-black"
        >
          ×
        </button>

        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
            <div className="loader border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}

        {success && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
            <div className="text-green-400 font-semibold text-base sm:text-lg bg-gray-800/70 rounded-full px-5 py-4">
              ✅ Feedback submitted!
            </div>
          </div>
        )}

        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-black">
          Submit Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded text-sm sm:text-base text-black placeholder:text-gray-400"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-2 border rounded min-h-[100px] text-sm sm:text-base text-black placeholder:text-gray-400"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-sm sm:text-base text-black placeholder:text-gray-400"
          />
          {email && !/\S+@\S+\.\S+/.test(email) && (
            <p className="text-red-600 text-sm -mt-3">
              Please enter a valid email.
            </p>
          )}
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full p-2 border rounded text-sm sm:text-base text-black"
          >
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
          </select>

          {editing ? (
            <ScreenshotEditor
              screenshot={screenshot}
              onSave={(editedDataUrl) => {
                setScreenshot(editedDataUrl);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            screenshot && (
              <div>
                <label className="block mb-1 font-medium text-sm sm:text-base text-black">
                  Screenshot Preview
                </label>
                <img
                  src={screenshot}
                  alt="Screenshot"
                  className="w-full rounded border"
                />
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm border border-gray-400 cursor-pointer text-black"
                >
                  Edit Screenshot
                </button>
              </div>
            )
          )}

          <div className="text-xs sm:text-sm text-color-gray600 mt-2">
            <p>
              <strong>URL:</strong> {window.location.href}
            </p>
            <p>
              <strong>Browser:</strong> {browserInfo.browser}
            </p>
            <p>
              <strong>OS:</strong> {browserInfo.os}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-2 rounded text-white submit-button bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base cursor-pointer"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
