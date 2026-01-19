import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { sso } from "@better-auth/sso";
import { db } from "./db";
import * as schema from "./schema";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // Postgres
        schema: {
            ...schema,
            ssoProvider: schema.ssoProviders
        },
    }),
    plugins: [
        organization(),
        sso(),
    ],
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: ["http://localhost:5173", "http://localhost:3001"],
});
