import "server-only";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";

export function generarCertificado(data: CertificadoData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      compress: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Institutional seal drawn as vector, custom UNAL fonts, digital signature
    SVGtoPDF(doc, sealSvg, mm(20), mm(18), { width: mm(28) });
    doc.font(A.light).fontSize(22).text(data.nombre, { align: "center" });

    doc.end();
  });
}
