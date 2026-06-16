"use client";

type PdfJsLib = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (params: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (page: number) => Promise<{
        getTextContent: () => Promise<{
          items: Array<{ str?: string }>;
        }>;
      }>;
    }>;
  };
};

const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

let pdfJsPromise: Promise<PdfJsLib> | null = null;

function loadPdfJs(): Promise<PdfJsLib> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PDF parsing is only available in the browser."));
  }

  if (pdfJsPromise) {
    return pdfJsPromise;
  }

  pdfJsPromise = new Promise((resolve, reject) => {
    const existing = (window as Window & { pdfjsLib?: PdfJsLib }).pdfjsLib;
    if (existing) {
      resolve(existing);
      return;
    }

    const script = document.createElement("script");
    script.src = `${PDFJS_CDN}/pdf.min.js`;
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as Window & { pdfjsLib?: PdfJsLib }).pdfjsLib;
      if (!pdfjsLib) {
        reject(new Error("PDF.js failed to load."));
        return;
      }

      pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error("PDF.js failed to load."));
    document.head.appendChild(script);
  });

  return pdfJsPromise;
}

async function extractPdfText(blob: Blob) {
  const pdfjsLib = await loadPdfJs();
  const buffer = await blob.arrayBuffer();
  const document = await pdfjsLib.getDocument({ data: buffer }).promise;
  const chunks: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => item.str ?? "")
      .join(" ")
      .trim();

    if (pageText) {
      chunks.push(pageText);
    }
  }

  return chunks.join("\n");
}

export async function extractContractText(
  file: Blob,
  mimeType: string,
  fileName: string
) {
  const lowerName = fileName.toLowerCase();

  if (mimeType === "text/plain" || lowerName.endsWith(".txt")) {
    return file.text();
  }

  if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
    return extractPdfText(file);
  }

  return "";
}
