import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MockIdP() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    // const redirect = searchParams.get("redirect") || "/dashboard"; // Not used directly, hardcoded to dashboard for now
    const [status, setStatus] = useState("initializing");

    useEffect(() => {
        // Simulate a delay for "Checking credentials..."
        const timer = setTimeout(() => {
            setStatus("authenticating");
            performLogin();
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const performLogin = async () => {
        // Ensure strictly fresh session for this IDP logic
        await authClient.signOut();

        try {
            // First try to sign up (creates user if doesn't exist)
            await authClient.signUp.email({
                email: email,
                password: "demo-password-123",
                name: email.split("@")[0],
            });
        } catch {
            // User likely exists, continue to sign in
        }

        // Sign in with the demo credentials
        const result = await authClient.signIn.email({
            email: email,
            password: "demo-password-123",
        });

        if (result.error) {
            setStatus("error");
            alert("SSO Simulation Failed: " + result.error.message);
            window.location.href = "/login";
            return;
        }

        setStatus("redirecting");
        setTimeout(() => {
            window.location.href = "/dashboard";
        }, 800);
    };

    const getProviderConfig = () => {
        if (email.endsWith("@helios-kliniken.de")) {
            return {
                orgName: "Helios Kliniken",
                logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Helios_Kliniken_GmbH_Logo.svg/2560px-Helios_Kliniken_GmbH_Logo.svg.png",
                providerName: "Okta",
                providerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Okta_logo.svg/2560px-Okta_logo.svg.png",
                color: "text-[#00B4AF]"
            };
        }
        // Default to Charité
        return {
            orgName: "Charité - Universitätsmedizin Berlin",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Charit%C3%A9_Logo.svg/2560px-Charit%C3%A9_Logo.svg.png",
            providerName: "Entra ID",
            providerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
            color: "text-[#003B79]"
        };
    };

    const config = getProviderConfig();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-sans">
            <div className="bg-white p-10 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
                {/* Header with Logos */}
                <div className="flex flex-col items-center mb-8 space-y-6">
                    <img
                        src={config.logoUrl}
                        alt={`${config.orgName} Logo`}
                        className="h-16 object-contain"
                    />
                    <div className="w-full border-b border-gray-200"></div>
                    <div className="flex items-center gap-2 text-gray-600 font-semibold text-lg">
                        <img
                            src={config.providerLogo}
                            alt={config.providerName}
                            className="h-6"
                        />
                        <span>{config.providerName}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-6">

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {status === "initializing" && t("mock_idp.login_to", { org: config.orgName.split(" ")[0] })}
                            {status === "authenticating" && t("common.authenticating")}
                            {status === "redirecting" && t("common.success")}
                            {status === "error" && t("common.error")}
                        </h2>
                        <p className="text-gray-500">
                            {email || t("mock_idp.subtitle_default")}
                        </p>
                    </div>

                    <div className="flex justify-center py-4">
                        {status !== "error" && (
                            <Loader2 className="w-10 h-10 text-[#003B79] animate-spin" />
                        )}
                    </div>

                    <div className="text-xs text-gray-400 mt-8">
                        {t("mock_idp.footer")}<br />
                        &copy; 2024 {config.orgName}
                    </div>
                </div>
            </div>
        </div>
    );
}
