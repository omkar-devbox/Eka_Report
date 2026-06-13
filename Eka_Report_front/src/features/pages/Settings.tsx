import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  FileText,
  MessageSquare,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Info,
  Server,
  Key,
  Shield,
  Send
} from "lucide-react";
import { apiClient } from "../../app/api/api-client";

interface SmtpSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_secure: string;
  sender_email: string;
  sender_name: string;
  subject_template: string;
  body_template: string;
}

const DEFAULT_MAIL_TEMPLATE = {
  senderName: "Eka Operations Hub",
  subjectTemplate: "[Eka Studio] {ReportType} - {Date}",
  bodyTemplate: `Dear Team,

Please find attached the compiled {ReportType} for the date {Date} (Shift: {Shift}).

This is an automated dispatch from Eka Report Studio. Please do not reply directly to this email.

Best Regards,
Eka Operations Hub`,
};

const resolvePlaceholders = (text: string) => {
  if (!text) return "";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return text
    .replace(/{Date}/g, dateStr)
    .replace(/{ReportType}/g, "Production Report (R3)")
    .replace(/{Shift}/g, "A")
    .replace(/{UserName}/g, "John Doe");
};

export default function SettingsPage() {
  // Settings states
  const [smtpHost, setSmtpHost] = useState("smtp.office365.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpSecure, setSmtpSecure] = useState("tls");
  const [senderEmail, setSenderEmail] = useState("reports@ekareport.com");
  const [senderName, setSenderName] = useState("");
  const [subjectTemplate, setSubjectTemplate] = useState("");
  const [bodyTemplate, setBodyTemplate] = useState("");

  // UI feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load configuration from API
  useEffect(() => {
    const fetchSmtpSettings = async () => {
      try {
        const data = await apiClient<SmtpSettings>("/api/settings/smtp");
        setSmtpHost(data.smtp_host || "smtp.office365.com");
        setSmtpPort(data.smtp_port || 587);
        setSmtpUsername(data.smtp_username || "");
        setSmtpPassword(data.smtp_password || "");
        setSmtpSecure(data.smtp_secure || "tls");
        setSenderEmail(data.sender_email || "reports@ekareport.com");
        setSenderName(data.sender_name || DEFAULT_MAIL_TEMPLATE.senderName);
        setSubjectTemplate(data.subject_template || DEFAULT_MAIL_TEMPLATE.subjectTemplate);
        setBodyTemplate(data.body_template || DEFAULT_MAIL_TEMPLATE.bodyTemplate);
      } catch (err: any) {
        console.error("Failed to load settings:", err);
        setToast({
          type: "error",
          message: err.message || "Failed to load SMTP settings from backend.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSmtpSettings();
  }, []);

  // Toast Auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle Save Configuration
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await apiClient("/api/settings/smtp", {
        method: "PUT",
        body: {
          smtp_host: smtpHost.trim(),
          smtp_port: smtpPort,
          smtp_username: smtpUsername.trim(),
          smtp_password: smtpPassword,
          smtp_secure: smtpSecure.trim(),
          sender_email: senderEmail.trim(),
          sender_name: senderName.trim(),
          subject_template: subjectTemplate.trim(),
          body_template: bodyTemplate,
        },
      });

      setToast({
        type: "success",
        message: "Configuration saved successfully!",
      });
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to save configuration. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Send Test Email
  const handleTestConnection = async () => {
    if (!testRecipient.trim()) {
      setToast({
        type: "error",
        message: "Please enter a test recipient email address.",
      });
      return;
    }

    setIsTesting(true);
    try {
      // Automatically save first so test operates on the newest values
      await apiClient("/api/settings/smtp", {
        method: "PUT",
        body: {
          smtp_host: smtpHost.trim(),
          smtp_port: smtpPort,
          smtp_username: smtpUsername.trim(),
          smtp_password: smtpPassword,
          smtp_secure: smtpSecure.trim(),
          sender_email: senderEmail.trim(),
          sender_name: senderName.trim(),
          subject_template: subjectTemplate.trim(),
          body_template: bodyTemplate,
        },
      });

      const res = await apiClient<{ status: string; message: string }>("/api/settings/smtp/test", {
        method: "POST",
        body: { recipient_email: testRecipient.trim() },
      });

      setToast({
        type: "success",
        message: res.message || "Test email dispatched successfully!",
      });
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "SMTP test connection failed. Verify settings.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-slate-500 font-bold text-sm">Loading System Configuration...</span>
      </div>
    );
  }

  return (
    <div className="relative font-sans text-text-primary select-none max-w-7xl mx-auto py-2 flex flex-col gap-8">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${toast.type === "success"
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
              : "bg-rose-50/95 border-rose-200 text-rose-800"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5.5 h-5.5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          System Settings
        </h2>
        <p className="text-sm text-text-secondary max-w-3xl">
          Configure backend SMTP server credentials for mailing dispatches and customize default automated email formats.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8 w-full">
        {/* Main Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: SMTP and Templates */}
          <div className="flex flex-col gap-8">
            {/* SMTP Configuration Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-1.5 flex items-center gap-2">
                  <Server className="w-5 h-5 text-primary" />
                  Test Mailing Gateway (SMTP)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Test SMTP server configuration for dispatching compiled operational sheets automatically.
                </p>
              </div>



              {/* Test Connection Row */}
              <div className="border-t border-slate-100 pt-4 mt-2 flex flex-col md:flex-row gap-3 items-end justify-between">
                <div className="flex flex-col gap-2 flex-grow w-full">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Test Recipient Address</label>
                  <input
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="Enter recipient email address for SMTP test"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full md:w-auto px-4 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Test Email
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mail Formatting Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-1.5 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Default Email Templates
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Customize default layouts, titles, and body texts for automated reports emails. Placeholders are dynamically resolved during dispatch.
                </p>
              </div>

              {/* Sender Display Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="mail-sender-name" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Sender Display Name
                </label>
                <input
                  id="mail-sender-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  placeholder="e.g., Eka Automated Reports"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-full"
                />
              </div>

              {/* Subject Template */}
              <div className="flex flex-col gap-2">
                <label htmlFor="mail-subject" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  Subject Format
                </label>
                <input
                  id="mail-subject"
                  type="text"
                  value={subjectTemplate}
                  onChange={(e) => setSubjectTemplate(e.target.value)}
                  required
                  placeholder="[Eka Studio] {ReportType} - {Date}"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-full"
                />
              </div>

              {/* Body Template */}
              <div className="flex flex-col gap-2">
                <label htmlFor="mail-body" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  Email Body Format
                </label>
                <textarea
                  id="mail-body"
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  required
                  rows={5}
                  placeholder="Write template message here..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-full resize-none font-sans"
                />
              </div>

              {/* Template Variables Helper Panel */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Placeholders Variable Guide
                </span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  You can insert dynamic placeholders in the Subject and Body. The email engine replaces them automatically before mailing:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <code className="bg-slate-200 px-1 py-0.5 rounded font-bold font-mono text-primary">{`{Date}`}</code>
                    <span className="text-slate-600">Active calendar date</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <code className="bg-slate-200 px-1 py-0.5 rounded font-bold font-mono text-primary">{`{ReportType}`}</code>
                    <span className="text-slate-600">R2 / R3 description</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <code className="bg-slate-200 px-1 py-0.5 rounded font-bold font-mono text-primary">{`{Shift}`}</code>
                    <span className="text-slate-600">Target shift letters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <code className="bg-slate-200 px-1 py-0.5 rounded font-bold font-mono text-primary">{`{UserName}`}</code>
                    <span className="text-slate-600">Sender user name</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Live Preview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm h-full justify-between">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-1.5 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Live Preview
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time visualization of the sent report dispatch email using dynamic values.
                </p>
              </div>

              {/* Styled Mock Email Client Box */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner flex flex-col bg-slate-50/50">
                {/* Email Window Header */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex flex-col gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-bold w-12 text-slate-400">From:</span>
                    <span className="text-slate-800 font-semibold">{senderName || "Eka Operations Hub"} <code className="bg-slate-200/60 font-mono px-1 rounded text-[10px]">&lt;{senderEmail || "reports@ekareport.com"}&gt;</code></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold w-12 text-slate-400">To:</span>
                    <span className="text-slate-700 font-mono">recipient@example.com</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-200/50">
                    <span className="font-bold w-12 text-slate-400">Subject:</span>
                    <span className="text-slate-800 font-bold tracking-tight">
                      {resolvePlaceholders(subjectTemplate || "[Eka Studio] {ReportType} - {Date}")}
                    </span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-5 bg-white min-h-[220px] max-h-[440px] overflow-y-auto font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {resolvePlaceholders(bodyTemplate || "Message body will render here...")}

                  {/* Styled Mock Excel File Attachment Badge */}
                  <div className="mt-8 border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50/70 p-3 rounded-xl flex items-center gap-3 w-fit select-none transition-colors border-dashed">
                    <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="font-bold text-emerald-800 text-[10px] tracking-tight">ProductionReport_ShiftA_2026-06-13.xlsx</span>
                      <span className="text-[9px] text-emerald-600 font-medium">Excel Spreadsheet Attachment (48.8 KB)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hint Badge */}
            <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1.5 mt-2 bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Subject</strong> and <strong>Body</strong> fields update in real-time as you write. Placeholders like <code>{`{Date}`}</code> resolve dynamically.
              </span>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Default template formats will be used as a fallback in automated email schedules.</span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
