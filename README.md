# 🧩 ZenBug – Chrome Extension

ZenBug Chrome Extension makes it simple for users to capture screenshots, record videos, annotate issues, and submit bug reports directly from the browser. Reports are sent to the ZenBug backend with optional metadata (browser, OS, viewport, current URL).

## 🚀 Features
- 📸 **Screenshot Capture** – Capture the active tab using Chrome APIs.  
- 🎥 **Video Recording** – Record screen/tab using `chrome.tabCapture` & `MediaRecorder`.  
- ✏️ **Annotation Tools** – Highlight, crop, and draw on captured images (powered by `Fabric.js`).  
- 📝 **Feedback Form** – Collect title, description, severity, and optional email.  
- 🌍 **Metadata Capture** – Automatically includes browser, OS, viewport size, and current URL.  
- ☁️ **Backend Integration** – Uploads stored in Supabase Storage, report data in MongoDB.  
