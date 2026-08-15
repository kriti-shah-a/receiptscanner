"use client";

import { useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import { compressReceipt } from "@/lib/ocr/compress";
import { parseReceiptText, type ParsedReceipt } from "@/lib/ocr/parser";
import { ReceiptForm } from "./ReceiptForm";
import { PageHeader } from "./PageHeader";

export function ReceiptUpload() {
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<Blob>();
  const [preview, setPreview] = useState("");
  const [parsed, setParsed] = useState<ParsedReceipt>();
  const [ocrText, setOcrText] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function choose(file?: File) {
    if (!file) return;
    setError("");
    setParsed(undefined);
    setProgress(2);
    setStatus("Preparing your photo…");
    try {
      const compressed = await compressReceipt(file);
      setPhoto(compressed);
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(compressed);
      });
      setStatus("Reading the receipt…");
      const worker = await createWorker("eng", 1, {
        logger: (message) => {
          if (message.status === "recognizing text") {
            setProgress(Math.max(8, Math.round(message.progress * 100)));
          }
        },
      });
      const result = await worker.recognize(compressed);
      await worker.terminate();
      const text = result.data.text;
      setOcrText(text);
      setParsed(parseReceiptText(text));
      setProgress(100);
      setStatus("");
    } catch {
      setError(
        "We couldn't read that photo. Try a clearer, well-lit picture.",
      );
      setStatus("");
      setProgress(0);
    }
  }

  function reset() {
    setPhoto(undefined);
    setParsed(undefined);
    setOcrText("");
    setPreview("");
    setProgress(0);
    if (cameraInput.current) cameraInput.current.value = "";
    if (galleryInput.current) galleryInput.current.value = "";
  }

  if (photo && parsed) {
    return (
      <div>
        <PageHeader
          eyebrow="Step 2 of 2"
          title="Check the details"
          description="Please correct anything that doesn't look right."
        />
        <ReceiptForm
          photo={photo}
          preview={preview}
          initial={parsed}
          rawOcrText={ocrText}
          onStartOver={reset}
        />
      </div>
    );
  }

  return (
    <div className="narrow-page">
      <PageHeader
        eyebrow="Step 1 of 2"
        title="Add a receipt"
        description="Take a clear photo of the whole receipt. We'll fill in the details for you."
      />
      <section className="upload-panel">
        <input
          ref={cameraInput}
          className="visually-hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => choose(event.target.files?.[0])}
        />
        <input
          ref={galleryInput}
          className="visually-hidden"
          type="file"
          accept="image/*"
          onChange={(event) => choose(event.target.files?.[0])}
        />
        <div className="upload-options">
          <button
            className="upload-option primary-option"
            onClick={() => cameraInput.current?.click()}
            disabled={!!status}
          >
            <span className="upload-icon" aria-hidden="true">⌾</span>
            <strong>Take Photo</strong>
            <small>Open your phone camera</small>
          </button>
          <button
            className="upload-option"
            onClick={() => galleryInput.current?.click()}
            disabled={!!status}
          >
            <span className="upload-icon gallery-icon" aria-hidden="true">▧</span>
            <strong>Choose From Gallery</strong>
            <small>Select an existing photo</small>
          </button>
        </div>
        {status && (
          <div className="ocr-progress" role="status">
            <div className="progress-label">
              <strong>{status}</strong>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>This stays on your device and may take a moment.</p>
          </div>
        )}
        {error && <div className="notice error">{error}</div>}
        <div className="photo-tips">
          <strong>For the best result</strong>
          <ul>
            <li>Place the receipt on a dark, flat surface</li>
            <li>Make sure all four corners are visible</li>
            <li>Avoid shadows and glare</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
