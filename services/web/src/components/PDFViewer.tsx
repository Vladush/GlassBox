import type { IHighlight } from "react-pdf-highlighter";
import { PdfLoader, PdfHighlighter, Popup, AreaHighlight } from "react-pdf-highlighter";


import workerUrl from 'pdfjs-dist/build/pdf.worker?url';
import { GlobalWorkerOptions } from "pdfjs-dist";
import { useTranslation } from "react-i18next";

GlobalWorkerOptions.workerSrc = workerUrl;

interface EvidenceRect {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
}

interface BillingItem {
    id: string;
    description: string;
    goeCode: string;
    evidence: {
        pageNumber: number;
        rects: EvidenceRect[];
    };
}

interface Props {
    url: string;
    highlights: BillingItem[];
}

export function PDFViewer({ url, highlights }: Props) {
    // We need to map our backend "Evidence" to react-pdf-highlighter "Highlight" format
    // The backend returns: { items: [ { id, evidence: { pageNumber, rects: [] } } ] }
    // We need to transform this.

    const mappedHighlights: Array<IHighlight> = highlights.map(h => ({
        id: h.id,
        position: {
            boundingRect: h.evidence.rects[0], // Simplified: demo uses 1 rect
            rects: h.evidence.rects,
            pageNumber: h.evidence.pageNumber,
        },
        content: { text: h.description }, // Mock content
        comment: { text: h.goeCode, emoji: "💶" },
    }));

    const { t } = useTranslation();

    return (
        <div className="h-full w-full relative" style={{ height: "calc(100vh - 200px)" }}>
            <PdfLoader url={url} beforeLoad={<div className="p-4">{t("common.loading")}</div>}>
                {(pdfDocument) => (
                    <PdfHighlighter
                        pdfDocument={pdfDocument}
                        enableAreaSelection={(event) => event.target === document}
                        onScrollChange={() => { }}
                        scrollRef={() => { }}
                        onSelectionFinished={() => null}
                        highlightTransform={(highlight, index, setTip, hideTip, _viewportToScaled, _screenshot, isScrolledTo) => {

                            const component = (
                                <AreaHighlight
                                    isScrolledTo={isScrolledTo}
                                    highlight={highlight}
                                    onChange={() => { }}
                                />
                            );

                            return (
                                <Popup
                                    popupContent={<div>{highlight.comment.text}</div>}
                                    onMouseOver={(popupContent) => setTip(highlight, () => popupContent)}
                                    onMouseOut={hideTip}
                                    key={index}
                                    children={component}
                                />
                            );
                        }}
                        highlights={mappedHighlights}
                    />
                )}
            </PdfLoader>
        </div>
    );
}
