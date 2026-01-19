import { router, publicProcedure } from "./trpc";
import { documentRouter } from "./routers/document";
import { billingRouter } from "./routers/billing";

export const appRouter = router({
    hello: publicProcedure.query(() => {
        return "Hello from tRPC - UPDATED";
    }),
    document: documentRouter,
    billing: billingRouter,
});

export type AppRouter = typeof appRouter;
