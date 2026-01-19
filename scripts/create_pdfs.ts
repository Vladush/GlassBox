import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createPDF(filename: string, title: string, content: string[], isMedical: boolean) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    let y = height - 50;

    // Header
    page.drawText(isMedical ? "Charité - Universitätsmedizin Berlin" : "Privatdokument", {
        x: 50,
        y,
        size: 20,
        font: boldFont,
        color: isMedical ? rgb(0, 0.2, 0.6) : rgb(0.2, 0.2, 0.2),
    });
    y -= 40;

    page.drawText(title, {
        x: 50,
        y,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
    });
    y -= 30;

    // Content
    for (const line of content) {
        page.drawText(line, {
            x: 50,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });
        y -= 20;
    }

    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(process.cwd(), 'test_data', filename);
    fs.writeFileSync(outputPath, pdfBytes);
    console.log(`Created ${outputPath}`);
}

async function main() {
    const testDataDir = path.join(process.cwd(), 'test_data');
    if (!fs.existsSync(testDataDir)) {
        fs.mkdirSync(testDataDir);
    }

    // 1. Real Medical PDF 1
    await createPDF(
        'Befundbericht_Müller.pdf',
        'Arztbrief / Befundbericht',
        [
            'Patient: Hans Müller, Geb. 12.04.1965',
            'Datum: 18.01.2025',
            'Diagnose: J01.9 Akute Sinusitis, nicht näher bezeichnet',
            '',
            'Anamnese:',
            'Der Patient stellt sich mit seit 3 Tagen bestehenden Kopfschmerzen',
            'und eitrigem Nasensekret vor. Kein Fieber.',
            '',
            'Therapie:',
            '- Amoxicillin 1000mg 1-1-1 für 7 Tage',
            '- Nasenspray',
            '',
            'Abrechnungshinweis:',
            'GOÄ 1 (Beratung) - 2,3 fach',
            'GOÄ 7 (Untersuchung) - 2,3 fach'
        ],
        true
    );

    // 2. Real Medical PDF 2
    await createPDF(
        'Laborergebnisse_Schmidt.pdf',
        'Laborbefund',
        [
            'Patientin: Maria Schmidt, Geb. 03.11.1982',
            'Datum: 19.01.2025',
            'Probenmaterial: Serum',
            '',
            'Parameter       Ergebnis    Einheit     Referenz',
            '------------------------------------------------',
            'Hämoglobin      13.5        g/dl        12.0-16.0',
            'Leukozyten      7.2         /nl         4.0-10.0',
            'CRP             <0.5        mg/dl       <0.5',
            'TSH             2.4         mU/l        0.27-4.2',
            '',
            'Beurteilung:',
            'Unauffälliger Laborbefund. Keine Entzündungszeichen.',
            '',
            'GOÄ 3560 (Laborwerte) - 1,0 fach'
        ],
        true
    );

    // 3. Non-Real PDF
    await createPDF(
        'Urlaub_Rechnung_Mallorca.pdf',
        'Rechnung Nr. 2025-992',
        [
            'Kunde: Vlad',
            'Datum: 05.08.2024',
            'Leistung: Hotelaufenthalt Mallorca',
            '',
            'Positionen:',
            '1. 7x Übernachtung inkl. Frühstück   1.400,00 EUR',
            '2. Minibar Konsumation                  45,50 EUR',
            '3. Spa-Behandlung                      120,00 EUR',
            '',
            'Gesamtbetrag:                        1.565,50 EUR',
            '',
            'Vielen Dank für Ihren Besuch!',
            'Dies ist KEIN medizinisches Dokument.'
        ],
        false
    );
}

main().catch(console.error);
