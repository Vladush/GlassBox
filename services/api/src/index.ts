import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { auth } from "@glassbox/db";
import { createContext } from "./trpc";
import { appRouter } from "./router";
import { streamSSE } from "hono/streaming";
import { eventBus, startProcessing, StatusUpdate } from "./worker";
import { generateMockPDF } from "./ai/mock";

const app = new Hono();

app.use(
    "*",
    cors({
        origin: ["http://localhost:5173", "http://localhost:3001"],
        allowHeaders: ["Content-Type", "Authorization", "x-trpc-source"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        credentials: true,
    })
);

import { serveStatic } from "@hono/node-server/serve-static";
import path from "path";

// robustly find the web/dist folder regardless of CWD
const webDistPath = path.resolve(__dirname, "../../web/dist");



app.on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

app.use(
    "/trpc/*",
    trpcServer({
        router: appRouter,
        endpoint: "/trpc",
        createContext,
    })
);

app.get("/", (c) => {
    return c.text("GlassBox API is running");
});

// Mock Upload Endpoint
app.post("/api/upload/:fileId", async (c) => {
    const fileId = c.req.param("fileId");
    // In a real app, we would stream the body to GCS here.
    // For demo, we just trigger the processing.
    startProcessing(fileId);
    return c.json({ success: true });
});

// SSE Status Endpoint
app.get("/api/status/:fileId", async (c) => {
    const fileId = c.req.param("fileId");

    return streamSSE(c, async (stream) => {
        const listener = (update: StatusUpdate) => {
            stream.writeSSE({
                data: JSON.stringify(update),
                event: "update",
            });
            if (update.status === "COMPLETED" || update.status === "FAILED") {
                // End stream after completion? Or keep open?
                // Usually we might close, but for demo we can leave it or let client close.
            }
        };

        eventBus.on(`status:${fileId}`, listener);

        stream.onAbort(() => {
            eventBus.off(`status:${fileId}`, listener);
        });

        // Convert sleep to Promise to keep connection open indefinitely until aborted
        await new Promise(() => { });
    });
});

app.get("/api/documents/:fileId/pdf", async (c) => {
    const pdfBytes = await generateMockPDF();
    c.header("Content-Type", "application/pdf");
    return c.body(pdfBytes as unknown as ArrayBuffer);
});

// Serve static files from web dist when not hitting API
app.use("/*", serveStatic({
    root: webDistPath,
    onNotFound: (path, c) => {
        // console.log(`${path} is not found, you access ${c.req.path}`);
    },
}));

// SPA Fallback for unknown routes (handle client-side routing)
app.get("*", serveStatic({
    path: path.join(webDistPath, "index.html"),
}));

// Force reload 2
const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});
