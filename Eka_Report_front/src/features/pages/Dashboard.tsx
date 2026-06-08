import React, { useState } from "react";
import { 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileCheck,
  Building2,
  FolderOpen,
  ExternalLink
} from "lucide-react";
import { apiClient } from "@/app/api/api-client";

export default function Dashboard() {
  // Input fields state initialized with user specified default values
  const [reportDate, setReportDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [startDate, setStartDate] = useState("2026-04-01");
  const [lastDate, setLastDate] = useState("2027-03-31");

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // File access states
  const [lastGeneratedFile, setLastGeneratedFile] = useState<{ filepath: string; filename: string } | null>(null);
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const [isOpeningFolder, setIsOpeningFolder] = useState(false);

  // Auto-clear toast after 4 seconds
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle report generation and file download
  const handleDownloadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);
    setLastGeneratedFile(null);

    try {
      // API payload schema: MgmtProdReportRequest
      const payload = {
        ReportDate: reportDate,
        StartDate: startDate,
        LastDate: lastDate
      };

      // Call the API backend which returns JSON file info
      interface GenerateReportResponse {
        status: string;
        filepath: string;
        filename: string;
      }
      const response = await apiClient<GenerateReportResponse>("/api/mgmt-production-report", {
        body: payload
      });

      setLastGeneratedFile({
        filepath: response.filepath,
        filename: response.filename
      });

      setToast({
        type: "success",
        message: `Management report generated successfully!`
      });
    } catch (err: any) {
      console.error("Download error:", err);
      setToast({
        type: "error",
        message: err.message || "Failed to download the production report. Ensure the database connection and template are ready."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFile = async () => {
    if (!lastGeneratedFile) return;
    setIsOpeningFile(true);
    try {
      await apiClient("/api/open-file", {
        body: { filepath: lastGeneratedFile.filepath }
      });
      setToast({
        type: "success",
        message: "File opened successfully!"
      });
    } catch (err: any) {
      console.error("Open file error:", err);
      setToast({
        type: "error",
        message: err.message || "Failed to open the generated file."
      });
    } finally {
      setIsOpeningFile(false);
    }
  };

  const handleOpenFolder = async () => {
    if (!lastGeneratedFile) return;
    setIsOpeningFolder(true);
    try {
      await apiClient("/api/open-folder", {
        body: { filepath: lastGeneratedFile.filepath }
      });
      setToast({
        type: "success",
        message: "Folder opened successfully!"
      });
    } catch (err: any) {
      console.error("Open folder error:", err);
      setToast({
        type: "error",
        message: err.message || "Failed to open the directory."
      });
    } finally {
      setIsOpeningFolder(false);
    }
  };

  return (
    <div className="relative font-sans text-text-primary select-none max-w-7xl mx-auto py-2 flex flex-col gap-8">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
            toast.type === "success" 
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-800" 
              : "bg-rose-50/95 border-rose-200 text-rose-800"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5.5 h-5.5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Dashboard Top Banner */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Management Production Hub
        </h2>
        <p className="text-sm text-text-secondary max-w-3xl">
          Generate consolidated Microsoft Excel spreadsheets with production stats, targets, daily planning variables, achievement analytics, and fiscal year calculations.
        </p>
      </div>

      {/* Quick Summary Cards (Management parameters context) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-300 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-primary/10 group-hover:text-primary/20 transition-all duration-300">
            <Building2 className="w-16 h-16" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Target Audience</p>
          <h3 className="text-xl font-bold text-slate-900 mt-2">Saarthi &amp; Micky Lines</h3>
          <p className="text-xs text-slate-400 mt-1">Updates SQL Work sheets for TCF &amp; BIW lines.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-300 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-indigo-500/10 group-hover:text-indigo-500/20 transition-all duration-300">
            <TrendingUp className="w-16 h-16" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Metrics Scopes</p>
          <h3 className="text-xl font-bold text-slate-900 mt-2">MTD, YTD, &amp; FY Plans</h3>
          <p className="text-xs text-slate-400 mt-1">Calculates achievements and variances dynamically.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-300 transition-all duration-300 shadow-sm">
          <div className="absolute top-0 right-0 p-3 text-violet-500/10 group-hover:text-violet-500/20 transition-all duration-300">
            <FileCheck className="w-16 h-16" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Template Source</p>
          <h3 className="text-xl font-bold text-slate-900 mt-2">EKA Production Report_R2</h3>
          <p className="text-xs text-slate-400 mt-1">Standardized Excel binary skeleton structure.</p>
        </div>
      </div>

      {/* Main Form & Parameter Guide Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Date Form Parameters Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-md relative">
          <form onSubmit={handleDownloadReport} className="flex flex-col gap-6 w-full">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900 mb-1.5 flex items-center gap-2">
                <FileSpreadsheet className="w-5.5 h-5.5 text-primary" />
                Configure Date Parameters
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Fill in the report details below to compile the spreadsheet. The backend will fetch corresponding historical records from SQL Server and populate the Excel template worksheets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* ReportDate Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="ReportDate" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Report Date
                </label>
                <input
                  id="ReportDate"
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-full"
                />
              </div>

              {/* StartDate Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="StartDate" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Start Date (FY)
                </label>
                <input
                  id="StartDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-full"
                />
              </div>

              {/* LastDate Field */}
              <div className="flex flex-col gap-2">
                <label htmlFor="LastDate" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  End Date (FY)
                </label>
                <input
                  id="LastDate"
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                  required
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all w-full"
                />
              </div>

            </div>

            {/* Action Download Button and File Operations */}
            <div className="mt-4 border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              {lastGeneratedFile ? (
                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50/50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span className="truncate max-w-[280px] md:max-w-md">Saved to Downloads: <code className="font-mono text-[10px] bg-white border border-emerald-200/50 px-1 py-0.5 rounded">{lastGeneratedFile.filename}</code></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isOpeningFile}
                      onClick={handleOpenFile}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {isOpeningFile ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      Open Report
                    </button>
                    <button
                      type="button"
                      disabled={isOpeningFolder}
                      onClick={handleOpenFolder}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {isOpeningFolder ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FolderOpen className="w-3.5 h-3.5" />
                      )}
                      Show in Folder
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden md:block text-xs text-slate-400">
                  Click generate to compile and save to Downloads directory.
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg active:scale-98 transition-all w-full md:w-auto ${
                  isLoading 
                    ? "bg-primary-hover/75 cursor-not-allowed" 
                    : "bg-primary hover:bg-primary-hover shadow-primary/20 cursor-pointer"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Parameter Guide / Help Box */}
        <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Parameter Guide
            </h3>
            
            <ul className="flex flex-col gap-4 text-xs text-slate-600">
              <li className="flex gap-2">
                <span className="h-5 w-5 bg-teal-50 text-primary border border-teal-200/50 rounded flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Report Date</strong>
                  The main target date. It updates daily plan figures, actual units, achievements, and formats day-specific headings (e.g. <code className="bg-slate-200/60 font-mono px-1 rounded">25-Apr-2026</code>).
                </div>
              </li>
              <li className="flex gap-2">
                <span className="h-5 w-5 bg-teal-50 text-primary border border-teal-200/50 rounded flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Start Date &amp; End Date</strong>
                  These define the fiscal boundaries used in YTD and FY calculations. The worksheet automatically labels the fiscal year (e.g. <code className="bg-slate-200/60 font-mono px-1 rounded">FY 26-27</code>).
                </div>
              </li>
              <li className="flex gap-2">
                <span className="h-5 w-5 bg-teal-50 text-primary border border-teal-200/50 rounded flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Excel Output format</strong>
                  A customized, formatted spreadsheet is outputted containing sheets such as <code className="bg-slate-200/60 font-mono px-1 rounded">SQL Work</code> with automated formulas.
                </div>
              </li>
            </ul>
          </div>

          <div className="border-t border-slate-200/80 pt-4 mt-6 text-[10px] text-slate-400 text-center leading-relaxed">
            FastAPI handles date parsing dynamically. Ensure your formats match <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">YYYY-MM-DD</code>.
          </div>
        </div>

      </div>
    </div>
  );
}
