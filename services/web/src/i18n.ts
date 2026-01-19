import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "de",
        debug: true,
        resources: {
            en: {
                translation: {
                    common: {
                        cancel: "Cancel",
                        export: "Export",
                        close: "Close",
                        minimize: "Minimize",
                        close_minimize: "Close / Minimize",
                        logout: "Logout",
                        loading: "Loading...",
                        initializing: "Initializing...",
                        authenticating: "Authenticating...",
                        success: "Success",
                        error: "Error",
                        activity: "Activity",
                        processing: "Processing...",
                        preparing: "Preparing..."
                    },
                    login: {
                        title: "Sign in to GlassBox",
                        subtitle: "Enterprise Medical Billing",
                        sso: "Sign in with Clinic SSO",
                        demo_credentials: "Demo Credentials",
                        demo_hint: "Use <strong>{{email}}</strong> to test {{org}} SSO.",
                        email_label: "Email / Organization Domain",
                        redirecting: "Redirecting...",
                        failed: "Login Failed",
                        error_sso_domain: "Domain not recognized for SSO."
                    },
                    dashboard: {
                        title: "Dashboard",
                        new_billing: "New Billing Process",
                        welcome: "Welcome to the Dashboard",
                        welcome_subtitle: "Upload new documents for processing. You can let the processing run in the background.",
                        no_active_jobs: "No active jobs",
                        processing_started: "Processing file... You can minimize this window.",
                        processing_finished: "Processing finished",
                        status_completed: "Analysis completed",
                        error_loading: "Error loading results",
                        upload: {
                            title: "Document Upload",
                            dropzone: "Drop PDF here or click to select",
                            instructions: "Upload Medical Report / OR Report",
                            limit: "PDF, max 50MB (Medical Reports)"
                        },
                        preview: {
                            title: "Billing Preview",
                            placeholder: "Results will appear here after processing"
                        },
                        results: {
                            title: "Billing Proposal",
                            subtitle: "Based on GOÄ Rules (Validated)",
                            total: "Total Amount",
                            evidence: "Evidence: Text reference on page {{page}} (See Highlight)",
                            confidence: "Confidence",
                            factor: "Factor"
                        }
                    },
                    mock_idp: {
                        login_to: "Sign in to {{org}}",
                        subtitle_default: "Evidence Collection & Billing",
                        footer: "Secure Federated Login Service",
                        alert_failed: "SSO Simulation Failed: {{message}}"
                    }
                }
            },
            de: {
                translation: {
                    common: {
                        cancel: "Abbrechen",
                        export: "Exportieren",
                        close: "Schließen",
                        minimize: "Minimieren",
                        close_minimize: "Schließen / Minimieren",
                        logout: "Abmelden",
                        loading: "Laden...",
                        initializing: "Initialisiere...",
                        authenticating: "Authentifizierung...",
                        success: "Erfolgreich",
                        error: "Fehler",
                        activity: "Aktivitäten",
                        processing: "Verarbeite...",
                        preparing: "Vorbereitung..."
                    },
                    login: {
                        title: "Anmelden bei GlassBox",
                        subtitle: "Enterprise Medizinische Abrechnung",
                        sso: "Anmelden mit Klinik-SSO",
                        demo_credentials: "Demo Zugangsdaten",
                        demo_hint: "Benutzen Sie <strong>{{email}}</strong> für {{org}} SSO.",
                        email_label: "Email / Organisations-Domain",
                        redirecting: "Leite weiter...",
                        failed: "Anmeldung fehlgeschlagen",
                        error_sso_domain: "Domain nicht für SSO erkannt."
                    },
                    dashboard: {
                        title: "Übersicht",
                        new_billing: "Neue Abrechnung",
                        welcome: "Willkommen im Dashboard",
                        welcome_subtitle: "Laden Sie neue Dokumente hoch. Die Verarbeitung läuft im Hintergrund weiter.",
                        no_active_jobs: "Keine aktiven Jobs",
                        processing_started: "Datei wird verarbeitet... Sie können das Fenster minimieren.",
                        processing_finished: "Verarbeitung abgeschlossen",
                        status_completed: "Analyse abgeschlossen",
                        error_loading: "Fehler beim Laden der Ergebnisse",
                        upload: {
                            title: "Dokument Upload",
                            dropzone: "PDF hier ablegen oder klicken",
                            instructions: "Arztbrief / OP-Bericht hochladen",
                            limit: "PDF, max 50MB (Medical Reports)"
                        },
                        preview: {
                            title: "Abrechnungsvorschau",
                            placeholder: "Ergebnisse erscheinen hier nach der Verarbeitung"
                        },
                        results: {
                            title: "Abrechnungsvorschlag",
                            subtitle: "Basierend auf GOÄ-Regelwerk (Validiert)",
                            total: "Gesamtbetrag",
                            evidence: "Begründung: Textstelle auf Seite {{page}} (Siehe Markierung)",
                            confidence: "Konfidenz",
                            factor: "Faktor"
                        }
                    },
                    mock_idp: {
                        login_to: "Anmeldung an {{org}}",
                        subtitle_default: "Beweiserhebung & Abrechnung",
                        footer: "Sicherer Föderierter Anmeldedienst",
                        alert_failed: "SSO Simulation Fehlgeschlagen: {{message}}"
                    }
                }
            }
        },
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;
