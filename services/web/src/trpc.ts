import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@glassbox/api/src/router";

export const trpc = createTRPCReact<AppRouter>();
