import { EventEmitter } from "events";

export const eventBus = new EventEmitter();

export type ProcessingStep =
    | "UPLOADED"
    | "OCR_PROCESSING"
    | "ENTITY_EXTRACTION"
    | "RULE_APPLICATION"
    | "COMPLETED"
    | "FAILED";

export interface StatusUpdate {
    fileId: string;
    status: ProcessingStep;
    message: string; // German text
    progress: number;
}

// Basic in-memory store for demo purposes
export const fileMetadata = new Map<string, { filename: string }>();

export function startProcessing(fileId: string) {
    const metadata = fileMetadata.get(fileId);
    const isTestPdf = metadata?.filename === "test.pdf";

    // Simulate pipeline steps with varying delays
    emit(fileId, "UPLOADED", "PDF hochgeladen.", 10);

    if (isTestPdf) {
        // Happy path for test.pdf
        setTimeout(() => emit(fileId, "OCR_PROCESSING", "OCR-Verarbeitung läuft...", 30), 4000);
        setTimeout(() => emit(fileId, "ENTITY_EXTRACTION", "Extrahiere medizinische Entitäten...", 60), 8000);
        setTimeout(() => emit(fileId, "RULE_APPLICATION", "Wende GOÄ-Regelwerk an...", 80), 12000);
        setTimeout(() => emit(fileId, "COMPLETED", "Abrechnungsentwurf bereit.", 100), 16000);
    } else {
        // "Missing Date" scenario for other files
        setTimeout(() => emit(fileId, "OCR_PROCESSING", "OCR-Verarbeitung läuft...", 30), 4000);
        setTimeout(() => emit(fileId, "ENTITY_EXTRACTION", "Warnung: Rechnungsdatum fehlt oder unleserlich.", 60), 8000);
        setTimeout(() => emit(fileId, "RULE_APPLICATION", "Überspringe Datumsvalidierung...", 80), 12000);
        setTimeout(() => emit(fileId, "COMPLETED", "Verarbeitung abgeschlossen (mit Warnungen).", 100), 16000);
    }
}

function emit(fileId: string, status: ProcessingStep, message: string, progress: number) {
    const update: StatusUpdate = { fileId, status, message, progress };
    eventBus.emit(`status:${fileId}`, update);
}
