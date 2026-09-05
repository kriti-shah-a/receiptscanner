"use client";

import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Receipt } from "@/lib/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

function pdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function safeFilename(value: string) {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return cleaned || "receipt";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function downloadReceiptFolder(
  receipts: Receipt[],
  reportName: string,
  onProgress: (message: string) => void,
) {
  const sorted = [...receipts].sort(
    (a, b) =>
      new Date(a.transactionDate).getTime() -
      new Date(b.transactionDate).getTime(),
  );
  const zip = new JSZip();
  const imageFolder = zip.folder("receipts");
  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  pdf.setTitle(`${reportName} receipt report`);
  pdf.setAuthor("Receipt Book");
  pdf.setSubject("Combined receipt images and transaction details");

  for (let index = 0; index < sorted.length; index += 1) {
    const receipt = sorted[index];
    onProgress(`Adding receipt ${index + 1} of ${sorted.length}…`);
    const response = await fetch(`/api/receipts/${receipt.id}/image`);
    if (!response.ok) {
      throw new Error(`Could not retrieve the receipt from ${receipt.merchant}.`);
    }

    const imageBytes = new Uint8Array(await response.arrayBuffer());
    const date = receipt.transactionDate.slice(0, 10);
    const imageName = `${String(index + 1).padStart(3, "0")}-${date}-${safeFilename(receipt.merchant)}.jpg`;
    imageFolder?.file(imageName, imageBytes);

    const embeddedImage = await pdf.embedJpg(imageBytes);
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    const card = receipt.cardName
      ? `${receipt.cardName} ending ${receipt.cardLastFour}`
      : "Card not recorded";

    page.drawText(pdfText(receipt.merchant), {
      x: 36,
      y: 750,
      size: 19,
      font: boldFont,
      color: rgb(0.09, 0.14, 0.12),
      maxWidth: 540,
    });
    page.drawText(`${date}  |  $${Number(receipt.amount).toFixed(2)}`, {
      x: 36,
      y: 725,
      size: 11,
      font: regularFont,
      color: rgb(0.28, 0.36, 0.32),
    });
    page.drawText(pdfText(`${card}  |  ${receipt.category}`), {
      x: 36,
      y: 707,
      size: 10,
      font: regularFont,
      color: rgb(0.28, 0.36, 0.32),
      maxWidth: 540,
    });
    page.drawLine({
      start: { x: 36, y: 694 },
      end: { x: 576, y: 694 },
      thickness: 1,
      color: rgb(0.88, 0.9, 0.88),
    });

    const scale = Math.min(
      540 / embeddedImage.width,
      600 / embeddedImage.height,
    );
    const width = embeddedImage.width * scale;
    const height = embeddedImage.height * scale;
    page.drawImage(embeddedImage, {
      x: (PAGE_WIDTH - width) / 2,
      y: 75 + (600 - height) / 2,
      width,
      height,
    });
    page.drawText(`Receipt ${index + 1} of ${sorted.length}`, {
      x: 36,
      y: 35,
      size: 9,
      font: regularFont,
      color: rgb(0.4, 0.45, 0.42),
    });
  }

  onProgress("Preparing your download…");
  const pdfBytes = await pdf.save();
  zip.file(`${reportName}.pdf`, pdfBytes);
  const archive = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  downloadBlob(archive, `${reportName}-with-photos.zip`);
}
