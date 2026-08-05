/** Client-only PDF export of a DOM node. */
export async function downloadElementAsPdf(element: HTMLElement, fileName: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * pageWidth) / canvas.width;
  const image = canvas.toDataURL("image/jpeg", 0.95);

  let remaining = imgHeight;
  let offset = 0;
  pdf.addImage(image, "JPEG", 0, 0, pageWidth, imgHeight);
  remaining -= pageHeight;
  while (remaining > 0) {
    offset -= pageHeight;
    pdf.addPage();
    pdf.addImage(image, "JPEG", 0, offset, pageWidth, imgHeight);
    remaining -= pageHeight;
  }
  pdf.save(fileName);
}

/** Simple text-based PDF report (used for the ATS report download). */
export async function downloadTextReport(title: string, lines: string[], fileName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin + 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(title, margin, y);
  y += 26;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  const width = pdf.internal.pageSize.getWidth() - margin * 2;

  for (const line of lines) {
    const isHeading = line.startsWith("## ");
    pdf.setFont("helvetica", isHeading ? "bold" : "normal");
    const wrapped = pdf.splitTextToSize(isHeading ? line.slice(3) : line, width) as string[];
    for (const part of wrapped) {
      if (y > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(part, margin, y);
      y += 16;
    }
    if (isHeading) y += 4;
  }

  pdf.save(fileName);
}
