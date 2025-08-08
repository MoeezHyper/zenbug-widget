import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

const ScreenshotEditor = ({ screenshot, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [cropMode, setCropMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(true);
  const [cropRect, setCropRect] = useState(null);

  // Initialize Fabric canvas with image
  useEffect(() => {
    if (!canvasRef.current || !screenshot) return;

    let isMounted = true;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      selection: true,
    });

    fabricCanvas.freeDrawingBrush.color = "red";

    const img = new Image();
    img.src = screenshot;

    img.onload = () => {
      if (!isMounted || !containerRef.current) return;

      const imgWidth = img.width;
      const imgHeight = img.height;

      const containerWidth = containerRef.current.offsetWidth;
      const maxCanvasHeight = 400;

      const scaleX = containerWidth / imgWidth;
      const scaleY = maxCanvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      // Confirm canvas still exists before setting dimensions
      if (!fabricCanvas || !fabricCanvas.getElement()) return;

      fabricCanvas.setWidth(scaledWidth);
      fabricCanvas.setHeight(scaledHeight);

      const fabricImg = new fabric.Image(img, {
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      fabricCanvas.setBackgroundImage(
        fabricImg,
        fabricCanvas.renderAll.bind(fabricCanvas)
      );
    };

    setCanvas(fabricCanvas);

    return () => {
      isMounted = false;
      fabricCanvas.dispose();
    };
  }, [screenshot]);

  // Crop mode logic
  useEffect(() => {
    if (!canvas) return;

    if (cropMode) {
      setDrawingMode(false);
      canvas.isDrawingMode = false;

      if (cropRect) {
        canvas.remove(cropRect);
        setCropRect(null);
      }

      const rect = new fabric.Rect({
        left: 100,
        top: 20,
        width: 200,
        height: 150,
        fill: "rgba(255,0,0,0.2)",
        stroke: "red",
        strokeWidth: 2,
        selectable: true,
        hasControls: true,
        lockRotation: true,
        lockScalingFlip: true,

        // 🟢 Add these to fix the origin
        originX: "left",
        originY: "top",
      });

      canvas.add(rect);
      canvas.setActiveObject(rect);
      setCropRect(rect);

      // Prevent moving outside
      canvas.on("object:moving", (e) => {
        const obj = e.target;
        if (obj === rect) {
          const maxLeft = canvas.getWidth() - obj.getScaledWidth();
          const maxTop = canvas.getHeight() - obj.getScaledHeight();
          if (obj.left < 0) obj.left = 0;
          if (obj.top < 0) obj.top = 0;
          if (obj.left > maxLeft) obj.left = maxLeft;
          if (obj.top > maxTop) obj.top = maxTop;
        }
      });

      canvas.on("object:scaling", (e) => {
        const obj = e.target;
        if (obj === rect) {
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();

          const originX = obj.originX || "left";
          const originY = obj.originY || "top";

          const scaledWidth = obj.width * obj.scaleX;
          const scaledHeight = obj.height * obj.scaleY;

          // LEFT edge: prevent scaling beyond 0
          if (originX === "left" && obj.left < 0) {
            obj.scaleX = (obj.scaleX * (obj.left + scaledWidth)) / scaledWidth;
            obj.left = 0;
          }

          // TOP edge: prevent scaling beyond 0
          if (originY === "top" && obj.top < 0) {
            obj.scaleY = (obj.scaleY * (obj.top + scaledHeight)) / scaledHeight;
            obj.top = 0;
          }

          // RIGHT edge
          const maxScaleX = (canvasWidth - obj.left) / obj.width;
          if (obj.scaleX > maxScaleX) {
            obj.scaleX = maxScaleX;
          }

          // BOTTOM edge
          const maxScaleY = (canvasHeight - obj.top) / obj.height;
          if (obj.scaleY > maxScaleY) {
            obj.scaleY = maxScaleY;
          }
        }
      });

      canvas.renderAll();
    } else {
      if (cropRect) {
        canvas.remove(cropRect);
        setCropRect(null);
      }
      canvas.isDrawingMode = drawingMode;
      canvas.renderAll();
    }
  }, [cropMode, canvas]);

  const toggleDrawing = () => {
    if (!canvas) return;
    const newMode = !drawingMode;
    canvas.isDrawingMode = newMode;
    setDrawingMode(newMode);
  };

  const handleClear = () => {
    if (!canvas) return;
    canvas.getObjects().forEach((obj) => {
      if (obj !== canvas.backgroundImage && obj !== cropRect) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  };

  const handleSave = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
    });
    onSave(dataUrl);
  };

  const handleCrop = () => {
    if (!canvas || !cropRect) return;

    const { left, top, width, height, scaleX, scaleY } = cropRect;

    // Hide the crop rectangle before capture
    cropRect.visible = false;
    canvas.renderAll();

    const fullCanvasDataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 3,
    });

    cropRect.visible = true;
    canvas.renderAll();

    const img = new Image();
    img.src = fullCanvasDataUrl;

    img.onload = () => {
      const offCanvas = document.createElement("canvas");
      const ctx = offCanvas.getContext("2d");
      const cropScale = 3;

      const cropW = width * scaleX * cropScale;
      const cropH = height * scaleY * cropScale;
      const cropL = left * cropScale;
      const cropT = top * cropScale;

      offCanvas.width = cropW;
      offCanvas.height = cropH;

      ctx.drawImage(img, cropL, cropT, cropW, cropH, 0, 0, cropW, cropH);

      const croppedUrl = offCanvas.toDataURL("image/png", 1.0);
      onSave(croppedUrl);
    };
  };

  return (
    <div className="mb-4">
      {/* First row */}
      <div className="mb-2 flex flex-wrap gap-2 justify-center px-4">
        <button
          type="button"
          onClick={toggleDrawing}
          className={`px-3 py-1 rounded cursor-pointer text-white ${
            drawingMode ? "bg-red-600" : "bg-blue-600"
          }`}
        >
          {drawingMode ? "Drawing: On" : "Drawing: Off"}
        </button>

        <button
          type="button"
          onClick={() => setCropMode(!cropMode)}
          className="px-3 py-1 cursor-pointer bg-yellow-500 text-white rounded"
        >
          {cropMode ? "Cancel Crop" : "Crop"}
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1 cursor-pointer bg-gray-600 text-white rounded"
        >
          Clear
        </button>
      </div>

      {/* Second row */}
      <div className="mb-4 flex gap-2 justify-center">
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 cursor-pointer bg-green-600 text-white rounded"
        >
          Save & Continue
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 cursor-pointer bg-red-500 text-white rounded"
        >
          Cancel
        </button>

        {cropMode && (
          <button
            type="button"
            onClick={handleCrop}
            className="px-3 py-1 bg-purple-600 text-white rounded"
          >
            Crop & Save
          </button>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full max-h-[400px] overflow-hidden rounded flex justify-center border-2"
      >
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
};

export default ScreenshotEditor;
