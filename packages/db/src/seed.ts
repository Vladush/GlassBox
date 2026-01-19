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

    // Create Mock SSO Provider with SAML config
    // Note: This is a mock config - real SAML would need valid certs and IdP metadata
    const samlConfig = {
        entryPoint: "https://login.microsoftonline.com/mock-charite/saml2",
        cert: "MIIDdzCCAl+gAwIBAgIJANn7l/9qD0mUMA0GCSqGSIb3DQEBCwUAMFIxCzAJBgNVBAYTAkRFMRMwEQYDVQQIDApTb21lLVN0YXRlMQ4wDAYDVQQKDAVDaGFyaTEeMBwGA1UEAwwVbW9jay1jaGFyaXRlLmF6dXJlLmNvbTAeFw0yNDAzMTUxMjAwMDBaFw0zNDAzMTMxMjAwMDBaMFIxCzAJBgNVBAYTAkRFMRMwEQYDVQQIDApTb21lLVN0YXRlMQ4wDAYDVQQKDAVDaGFyaTEeMBwGA1UEAwwVbW9jay1jaGFyaXRlLmF6dXJlLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALdummyBadSHA=",
        callbackUrl: "http://localhost:3001/api/auth/sso/saml2/sp/acs",
        idpMetadata: {
            entityID: "https://sts.windows.net/mock-charite",
            singleSignOnService: [{
                Binding: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
                Location: "https://login.microsoftonline.com/mock-charite/saml2"
            }]
        },
        spMetadata: {},
    };

    await db.insert(ssoProviders).values({
        id: nanoid(),
        providerId: "mock-saml",
        organizationId: orgId,
        issuer: "https://sts.windows.net/mock-charite",
        domain: "charite.de",
        samlConfig: JSON.stringify(samlConfig),
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
