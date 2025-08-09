import { useState } from "react";
import FeedbackModal from "./FeedbackModal";
import { captureScreenshot } from "../utils/captureScreenshot";
import bugIcon from "../assets/bug.svg";

const Widget = ({ apiKey: propKey }) => {
  const [open, setOpen] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_KEY =
    propKey ||
    (typeof window !== "undefined" && window?.ZenBug?.apiKey) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_KEY) ||
    "";

  // Don't render the widget if no API key
  if (!API_KEY) {
    console.warn(
      "ZenBug API key is missing. Widget will not render. Provide it via prop, window.ZenBug.apiKey, or VITE_API_KEY."
    );
    return null;
  }

  const handleOpen = async () => {
    try {
      setLoading(true);
      const shot = await captureScreenshot();
      if (shot) {
        setScreenshot(shot);
        setOpen(true);
      } else {
        console.error("Screenshot capture failed.");
      }
    } catch (err) {
      console.error("Error capturing screenshot:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        id="zenbug-feedback-btn"
        onClick={handleOpen}
        disabled={loading}
        aria-label="Open feedback form"
        title="Report a bug"
        className={`${
          loading
            ? "hidden"
            : "fixed font-montserrat bottom-4 right-4 z-50 flex items-center cursor-pointer glow-btn disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-3"
        }`}
      >
        <img src={bugIcon} alt="bug" className="size-5 mr-1" /> Feedback
      </button>

      {open && (
        <FeedbackModal
          apiKey={API_KEY}
          screenshot={screenshot}
          setScreenshot={setScreenshot}
          onClose={() => {
            setOpen(false);
            setScreenshot(null);
          }}
        />
      )}
    </>
  );
};

export default Widget;
