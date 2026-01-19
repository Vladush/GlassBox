import { db } from "./db";
import { organizations, ssoProviders, users } from "./schema";
import { nanoid } from "nanoid";
async function main() {
    console.log("Seeding database...");
    // Create Mock Organization
    const orgId = nanoid();
    await db.insert(organizations).values({
        id: orgId,
        name: "Charité - Universitätsmedizin Berlin",
        slug: "charite",
        createdAt: new Date(),
        metadata: JSON.stringify({ verified: true }),
    }).onConflictDoNothing();
    console.log("Created Organization: Charité");
    // Create Mock SSO Provider
    await db.insert(ssoProviders).values({
        id: nanoid(),
        providerId: "mock-saml",
        organizationId: orgId,
        name: "Charité Login (SAML)",
        type: "saml",
        domain: "charite.de",
        issuer: "https://sts.windows.net/mock-charite",
        // In a real scenario, certs would be valid PEMs. For mock, we skip validation logic in our demo if possible or provide dummy.
        certs: "[]",
        createdAt: new Date(),
        updatedAt: new Date(),
    }).onConflictDoNothing();
    console.log("Created SSO Provider for charite.de");
    // Create a default user just in case
    await db.insert(users).values({
        id: nanoid(),
        name: "Dr. House",
        email: "greg@charite.de",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }).onConflictDoNothing();
    console.log("Seeding complete.");
}
main().catch(console.error);
