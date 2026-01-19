import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { ssoClient } from "@better-auth/sso/client";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3001",
    plugins: [
        organizationClient(),
        ssoClient(),
    ],
});
