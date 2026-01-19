import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { trpc } from "../trpc";
import { UploadCloud, CheckCircle, AlertCircle, Minimize2, Maximize2, FileText, Activity, LogOut } from "lucide-react";
import { PDFViewer } from "../components/PDFViewer";
import { authClient } from "../lib/auth-client";
import clsx from "clsx";

type ProcessingStep = "UPLOADED" | "OCR_PROCESSING" | "ENTITY_EXTRACTION" | "RULE_APPLICATION" | "COMPLETED" | "FAILED";

interface StatusUpdate {
    fileId: string;
    status: ProcessingStep;
    message: string;
    progress: number;
}

interface Job {
    fileId: string;
    filename: string;
    status: StatusUpdate | null;
    logs: StatusUpdate[];
    isCompleted: boolean;
    hasError: boolean;
}

export default function Dashboard() {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [focusedJobId, setFocusedJobId] = useState<string | null>(null);
    const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

    const getUploadUrl = trpc.document.getUploadUrl.useMutation();

    // Active job is the one currently focused in the main view
    const focusedJob = jobs.find(j => j.fileId === focusedJobId);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { uploadUrl, fileId } = await getUploadUrl.mutateAsync({ filename: file.name });

            // Create new job
            const newJob: Job = {
                fileId,
                filename: file.name,
                status: null,
                logs: [],
                isCompleted: false,
                hasError: false
            };

            setJobs(prev => [...prev, newJob]);
            setFocusedJobId(fileId); // Auto-focus the new job

            // Start upload
            await fetch(uploadUrl, { method: "POST", body: file });

            // Connect SSE
            startSSE(fileId);

        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed");
        }
    };

    const startSSE = (fileId: string) => {
        if (eventSourcesRef.current.has(fileId)) return;

        const eventSource = new EventSource(`http://localhost:3001/api/status/${fileId}`);
        eventSourcesRef.current.set(fileId, eventSource);

        eventSource.addEventListener("update", (event) => {
            const data = JSON.parse(event.data) as StatusUpdate;

            setJobs(prevJobs => prevJobs.map(job => {
                if (job.fileId !== fileId) return job;

                const isCompleted = data.status === "COMPLETED";
                const hasError = data.status === "FAILED";

                if (isCompleted || hasError) {
                    eventSource.close();
                    eventSourcesRef.current.delete(fileId);
                }

                return {
                    ...job,
                    status: data,
                    logs: [...job.logs, data],
                    isCompleted,
                    hasError
                };
            }));
        });
    };

    // Cleanup SSE on unmount
    useEffect(() => {
        return () => {
            eventSourcesRef.current.forEach(es => es.close());
            eventSourcesRef.current.clear();
        };
    }, []);

    const toggleMinimize = () => {
        setFocusedJobId(null); // Just clear focus, job keeps running
    };

    const { data: session } = authClient.useSession();

    // Helper to get display name and org from session
    const getUserDisplay = () => {
        if (!session?.user) return null;

        const email = session.user.email;
        const domain = email.split("@")[1];
        let orgName = "GlassBox";

        if (domain === "charite.de") orgName = "Charité";
        else if (domain === "helios-kliniken.de") orgName = "Helios Kliniken";

        return {
            name: session.user.name || email.split("@")[0],
            org: orgName
        };
    };

    const userDisplay = getUserDisplay();

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            <nav className="bg-white shadow z-20 shrink-0 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Activity className="text-indigo-600 h-6 w-6" />
                            <span className="font-bold text-xl text-gray-900">GlassBox</span>
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">BETA</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {userDisplay && (
                                <div className="text-sm text-gray-500 hidden sm:block">
                                    {userDisplay.name} <span className="text-gray-400">({userDisplay.org})</span>
                                </div>
                            )}
                            <LanguageSwitcher />
                            <button
                                onClick={async () => {
                                    await authClient.signOut();
                                    window.location.href = "/login";
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                                title={t("common.logout")}
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">{t("common.logout")}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {focusedJob ? (
                        <div className="h-full w-full flex flex-col animate-in fade-in zoom-in-95 duration-200">
                            {/* Unified Job Header */}
                            <div className="bg-white border-b border-gray-100 p-4 px-8 flex justify-between items-center shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <div className={clsx("p-2 rounded-lg", focusedJob.isCompleted ? "bg-green-50" : "bg-indigo-50")}>
                                        <FileText className={clsx("h-5 w-5", focusedJob.isCompleted ? "text-green-600" : "text-indigo-600")} />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-gray-900">{focusedJob.filename}</h2>
                                        <p className="text-xs text-gray-500">
                                            {focusedJob.isCompleted ? t("dashboard.status_completed") : t("common.processing")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {focusedJob.isCompleted && (
                                        <button className="px-3 py-1.5 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-md transition-colors">
                                            {t("common.export")}
                                        </button>
                                    )}
                                    <button
                                        onClick={toggleMinimize}
                                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-md transition-all flex items-center gap-2"
                                        title={t("common.close_minimize")}
                                    >
                                        <Minimize2 className="h-5 w-5" />
                                        <span className="text-sm font-medium hidden sm:inline">
                                            {focusedJob.isCompleted ? t("common.close") : t("common.minimize")}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Job Body */}
                            <div className="flex-1 overflow-hidden relative">
                                {focusedJob.isCompleted ? (
                                    <ResultView key={focusedJob.fileId} job={focusedJob} />
                                ) : (
                                    <ProcessingView key={focusedJob.fileId} job={focusedJob} />
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Empty State / Upload Area */
                        <div className="h-full w-full flex items-center justify-center p-8 bg-gray-50">
                            <div className="w-full max-w-xl">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.welcome")}</h1>
                                    <p className="text-gray-500">{t("dashboard.welcome_subtitle")}</p>
                                </div>

                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 transition-all hover:shadow-2xl">
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer relative group">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="group-hover:scale-110 transition-transform duration-300 inline-block bg-white p-4 rounded-full shadow-sm mb-4">
                                            <UploadCloud className="h-10 w-10 text-indigo-500" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 mb-1">
                                            {t("dashboard.upload.title")}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {t("dashboard.upload.limit")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar for Background Jobs */}
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            {t("common.activity")}
                            <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                {jobs.length}
                            </span>
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {jobs.length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-8 italic">
                                {t("dashboard.no_active_jobs")}
                            </div>
                        )}
                        {jobs.map(job => (
                            <div
                                key={job.fileId}
                                onClick={() => setFocusedJobId(job.fileId)}
                                className={clsx(
                                    "p-3 rounded-lg border transition-all cursor-pointer group hover:shadow-md",
                                    focusedJobId === job.fileId ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-gray-200 bg-white hover:border-indigo-300"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {job.isCompleted ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                        ) : job.hasError ? (
                                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                                        ) : (
                                            <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
                                        )}
                                        <span className="text-sm font-medium text-gray-900 truncate" title={job.filename}>
                                            {job.filename}
                                        </span>
                                    </div>
                                    {focusedJobId !== job.fileId && (
                                        <Maximize2 className="h-3 w-3 text-gray-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>

                                {!job.isCompleted && !job.hasError && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{job.status?.message || t("common.initializing")}</span>
                                            <span>{job.status?.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-indigo-500 h-full transition-all duration-300"
                                                style={{ width: `${job.status?.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {job.isCompleted && (
                                    <p className="text-xs text-green-600">{t("dashboard.processing_finished")}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// -- Sub Components --

function ProcessingView({ job }: { job: Job }) {
    const status = job.status;
    const { t } = useTranslation();

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
            <div className="w-full max-w-2xl space-y-8">
                {/* Big Progress Circle or Bar */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 mb-6 relative">
                        {/* Spinner Ring */}
                        <svg className="absolute inset-0 w-full h-full text-indigo-100 transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="45" fill="none" stroke="#4F46E5" strokeWidth="8"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * (status?.progress || 0) / 100)}
                                className="transition-all duration-500 ease-out"
                            />
                        </svg>
                        <span className="text-2xl font-bold text-indigo-600">{status?.progress || 0}%</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 animate-pulse">
                        {status?.message || t("common.preparing")}
                    </h2>
                    <p className="text-gray-500 mt-2">{t("dashboard.processing_started")}</p>
                </div>

                {/* Logs */}
                <div className="bg-gray-900 rounded-xl p-6 h-64 overflow-y-auto font-mono text-xs text-green-400 shadow-2xl ring-1 ring-gray-900/5">
                    {job.logs.map((log, i) => (
                        <div key={i} className="mb-2 opacity-90">
                            <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            <span className="font-semibold text-green-300">{log.status}</span>: {log.message}
                        </div>
                    ))}
                    {/* Blinking Cursor */}
                    <div className="animate-pulse text-green-500">_</div>
                </div>
            </div>
        </div>
    );
}

function ResultView({ job }: { job: Job }) {
    const { t } = useTranslation();
    const billingQuery = trpc.billing.getBill.useQuery(
        { fileId: job.fileId! },
        { enabled: !!job.fileId }
    );

    if (billingQuery.isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!billingQuery.data) return <div className="p-8 text-center text-red-500">{t("dashboard.error_loading")}</div>;

    return (
        <div className="flex h-full">
            <div className="w-1/2 bg-gray-100 border-r border-gray-200 overflow-hidden relative">
                <PDFViewer
                    url={billingQuery.data.documentUrl}
                    highlights={billingQuery.data.items}
                />
            </div>

            <div className="w-1/2 flex flex-col bg-white overflow-y-auto">
                <div className="p-6 space-y-4">
                    {billingQuery.data.items.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                        {item.goeCode}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">{item.description}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">
                                                {Math.round(item.confidence * 100)}%
                                            </span>
                                            <span className="text-xs text-gray-400">{t("dashboard.results.factor")}: {item.factor.toFixed(1)}x</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-gray-900">{item.amount.toFixed(2)} €</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="mt-8 border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                            <span>{t("dashboard.results.total")}</span>
                            <span>
                                {billingQuery.data.items.reduce((acc: number, item) => acc + item.amount, 0).toFixed(2)} €
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
