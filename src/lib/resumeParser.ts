/** Client-only resume text extraction. Import lazily from event handlers. */

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .concat("\n");
  }
  return text.replace(/\s{3,}/g, "\n").trim();
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = (await import(
    /* @vite-ignore */ "mammoth/mammoth.browser.js"
  )) as unknown as {
    extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    default?: { extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> };
  };
  const api = mammoth.default ?? mammoth;
  const buffer = await file.arrayBuffer();
  const result = await api.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

/** Very light structural parse so the optimizer starts with real content. */
export function guessSections(text: string) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";
  const phone = text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() ?? "";
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,]+/i)?.[0] ?? "";
  const portfolio = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,]+/i)?.[0] ?? "";
  const fullName = lines[0] && lines[0].length < 48 ? lines[0] : "";

  const summaryIndex = lines.findIndex((l) => /^(professional\s+)?summary|profile|objective/i.test(l));
  const summary =
    summaryIndex >= 0
      ? lines
          .slice(summaryIndex + 1, summaryIndex + 5)
          .filter((l) => !/^(experience|education|skills)/i.test(l))
          .join(" ")
      : lines.slice(1, 4).join(" ");

  return { fullName, email, phone, linkedin, portfolio, summary };
}
