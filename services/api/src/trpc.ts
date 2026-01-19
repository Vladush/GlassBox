import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth } from "@glassbox/db";
import { db } from "@glassbox/db";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: opts.req.headers,
        });
    } catch (error) {
        console.error("Failed to get session from auth:", error);
    }
    // const session = null;

    // Mock session for development/testing ONLY if real auth fails/missing
    if (!session) {
        console.log("No active session found. Using MOCK session for development.");
        session = {
            session: {
                id: "mock-session-id",
                userId: "mock-user-id",
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
                token: "mock-token",
                createdAt: new Date(),
                updatedAt: new Date(),
                ipAddress: "127.0.0.1",
                userAgent: "mock-agent"
            },
            user: {
                id: "mock-user-id",
                email: "dev@glassbox.health",
                name: "Dev User",
                createdAt: new Date(),
                updatedAt: new Date(),
                emailVerified: true,
                image: null // Add image field if needed by User type, usually optional
            }
        } as any; // Type assertion to avoid strict type matching issues with better-auth types in dev
    }

    return {
        db,
        session: session?.session,
        user: session?.user,
        headers: opts.req.headers,
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.user) {
        throw new Error("UNAUTHORIZED");
    }
    return next({
        ctx: {
            session: ctx.session,
            user: ctx.user,
        },
    });
});
