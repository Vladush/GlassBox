import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Define the content and layout rigidly
export const MOCK_CONTENT = [
    { text: "MEDICAL REPORT", x: 50, y: 750, size: 20 },
    { text: "Patient: John Doe", x: 50, y: 700, size: 12 },
    { text: "Date: 2023-10-27", x: 50, y: 680, size: 12 },
    { text: "Diagnosis:", x: 50, y: 640, size: 14, bold: true },
    { text: "Acute Appendicitis (K35.8)", x: 50, y: 620, size: 12 },
    { text: "Procedure:", x: 50, y: 580, size: 14, bold: true },
    { text: "Laparoscopic Appendectomy performed under general anesthesia.", x: 50, y: 560, size: 12, id: "proc_1" },
    { text: "Verification of situs inversus not required.", x: 50, y: 540, size: 12 },
    { text: "Material Usage:", x: 50, y: 500, size: 14, bold: true },
    { text: "Suture material (Vicryl), Trocar set.", x: 50, y: 480, size: 12, id: "mat_1" },
];

// Define logical bounding boxes for highlighting
// PDF coordinate system: (0,0) is bottom-left. react-pdf-highlighter might expect different.
// standard PDF structure: 
// We will generate the PDF and corresponding "Area" data.
// For simplicity in demo, we return the "Highlight" compatible data structure.

export const MOCK_BILL_ITEMS_DEFAULT = [
    {
        id: "bill_1",
        goeCode: "3182",
        description: "Laparoskopische Appendektomie",
        factor: 2.3,
        amount: 120.50,
        confidence: 0.98,
        evidence: {
            pageNumber: 1,
            rects: [{ x1: 50 / 595, y1: (842 - 575) / 842, x2: 400 / 595, y2: (842 - 555) / 842, width: 595, height: 842 }]
        }
    }
];

export const MOCK_BILL_ITEMS_MUELLER = [
    {
        id: "mueller_1",
        goeCode: "1",
        description: "Beratung - 2,3 fach",
        factor: 2.3,
        amount: 10.72,
        confidence: 0.99,
        evidence: { pageNumber: 1, rects: [{ x1: 0.1, y1: 0.2, x2: 0.5, y2: 0.25, width: 595, height: 842 }] }
    },
    {
        id: "mueller_2",
        goeCode: "7",
        description: "Untersuchung - 2,3 fach",
        factor: 2.3,
        amount: 21.46,
        confidence: 0.95,
        evidence: { pageNumber: 1, rects: [{ x1: 0.1, y1: 0.15, x2: 0.5, y2: 0.18, width: 595, height: 842 }] }
    }
];

export const MOCK_BILL_ITEMS_SCHMIDT = [
    {
        id: "schmidt_1",
        goeCode: "3560",
        description: "Laborwerte - 1,0 fach",
        factor: 1.0,
        amount: 40.22,
        confidence: 0.92,
        evidence: { pageNumber: 1, rects: [{ x1: 0.1, y1: 0.1, x2: 0.6, y2: 0.15, width: 595, height: 842 }] }
    }
];

export const MOCK_BILL_ITEMS_MALLORCA = [
    {
        id: "mallorca_1",
        goeCode: "HOTEL",
        description: "Nicht erstattungsfähig (Privatvergnügen)",
        factor: 1.0,
        amount: 0.00,
        confidence: 0.10,
        evidence: { pageNumber: 1, rects: [{ x1: 0.1, y1: 0.5, x2: 0.8, y2: 0.6, width: 595, height: 842 }] }
    }
];


export async function generateMockPDF(): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    MOCK_CONTENT.forEach(item => {
        page.drawText(item.text, {
            x: item.x,
            y: item.y,
            size: item.size,
            font: item.bold ? fontBold : font,
            color: rgb(0, 0, 0),
        });
    });

    return await pdfDoc.save();
}
