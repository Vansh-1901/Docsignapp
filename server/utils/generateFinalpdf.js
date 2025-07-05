import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { fileURLToPath } from "url";
import Signature from "../models/Signature.js";
import Document from "../models/Document.js";

// Fix ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateFinalPdf = async (documentId) => {
  const doc = await Document.findById(documentId);
  const signatures = await Signature.find({ document: documentId });

  const pdfPath = path.join(__dirname, "..", doc.path);
  const existingPdfBytes = fs.readFileSync(pdfPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const sig of signatures) {
    const page = pdfDoc.getPage(sig.signatureData.page || 0);
    page.drawText(sig.signatureData.name || "Signature", {
      x: sig.signatureData.x || 100,
      y: sig.signatureData.y || 100,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  }

  const finalPdfBytes = await pdfDoc.save();
  const outputDir = path.join(__dirname, "..", "signed");

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const finalPath = path.join(outputDir, `signed-${doc.filename}`);
  fs.writeFileSync(finalPath, finalPdfBytes);

  return `/signed/signed-${doc.filename}`; // URL path, served statically
};

export default generateFinalPdf;
