import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useState } from "react";
import { Building2 } from "lucide-react";

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSSOLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const allowedEmails = ["greg@charite.de", "dr.house@helios-kliniken.de"];

        if (allowedEmails.includes(email)) {
            // Redirect to Mock SSO for visual simulation
            // We let the Mock IDP handle the actual session creation
            const redirectUrl = `/auth/sso-mock?email=${encodeURIComponent(email)}`;
            window.location.href = redirectUrl;
            return;
        } else {
            setError(t("login.error_sso_domain"));
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Building2 className="text-white w-8 h-8" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {t("login.title")}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {t("login.subtitle")}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSSOLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                {t("login.email_label")}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError(null);
                                    }}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="name@clinic.com"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{t("login.failed")}</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isLoading ? t("login.redirecting") : t("login.sso")}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    {t("login.demo_credentials")}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <div className="text-center text-sm text-gray-500 mb-2 space-y-1">
                                <div>
                                    <span dangerouslySetInnerHTML={{ __html: t("login.demo_hint", { email: "greg@charite.de", org: "Charité" }) }} />
                                </div>
                                <div>
                                    <span dangerouslySetInnerHTML={{ __html: t("login.demo_hint", { email: "dr.house@helios-kliniken.de", org: "Helios" }) }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
