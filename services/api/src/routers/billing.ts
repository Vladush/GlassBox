import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
    MOCK_BILL_ITEMS_DEFAULT,
    MOCK_BILL_ITEMS_MUELLER,
    MOCK_BILL_ITEMS_SCHMIDT,
    MOCK_BILL_ITEMS_MALLORCA
} from "../ai/mock";
import { fileMetadata } from "../worker";

export const billingRouter = router({
    getBill: protectedProcedure
        .input(z.object({ fileId: z.string() }))
        .query(async ({ input }) => {
            const metadata = fileMetadata.get(input.fileId);
            const filename = metadata?.filename || "";

            let items = MOCK_BILL_ITEMS_DEFAULT;
            if (filename.includes("Müller")) items = MOCK_BILL_ITEMS_MUELLER;
            if (filename.includes("Schmidt")) items = MOCK_BILL_ITEMS_SCHMIDT;
            if (filename.includes("Mallorca")) items = MOCK_BILL_ITEMS_MALLORCA;

            return {
                items,
                documentUrl: `http://localhost:3001/api/documents/${input.fileId}/pdf`
            };
        }),
});
