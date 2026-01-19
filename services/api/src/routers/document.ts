import { router, protectedProcedure } from "../trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { fileMetadata } from "../worker"; // Import the store

export const documentRouter = router({
    getUploadUrl: protectedProcedure
        .input(z.object({ filename: z.string() }))
        .mutation(async ({ input }) => {
            const fileId = nanoid();

            // Store the filename for the worker to use later
            fileMetadata.set(fileId, { filename: input.filename });

            // Emulate a signed URL pattern
            // In prod: `https://storage.googleapis.com/...`
            // In demo: Point to our local Hono endpoint
            const uploadUrl = `http://localhost:3001/api/upload/${fileId}`;

            return {
                uploadUrl,
                fileId,
            };
        }),
});
