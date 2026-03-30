import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  FlaskConical,
  Lightbulb,
  TestTube2,
  RefreshCw,
  ShieldCheck,
  Info,
} from "lucide-react";
import { analyzeReport, reanalyzeReport } from "../api/ai";

// ── Risk level config ─────────────────────────────────────────────────────────

const RISK_CONFIG = {
  Normal: {
    label: "Normal",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    iconBg: "bg-emerald-100",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    badge: "bg-emerald-500",
  },
  Borderline: {
    label: "Borderline",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    iconBg: "bg-amber-100",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    badge: "bg-amber-500",
  },
  Abnormal: {
    label: "Abnormal",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    iconBg: "bg-orange-100",
    icon: AlertCircle,
    iconColor: "text-orange-600",
    badge: "bg-orange-500",
  },
  Critical: {
    label: "Critical",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    iconBg: "bg-red-100",
    icon: AlertCircle,
    iconColor: "text-red-600",
    badge: "bg-red-500",
  },
};

// ── Status config for individual findings ─────────────────────────────────────

const STATUS_CONFIG = {
  Normal:   { icon: Minus,       color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200", label: "Normal"   },
  High:     { icon: TrendingUp,  color: "text-red-600",     bg: "bg-red-50",      border: "border-red-200",     label: "High"     },
  Low:      { icon: TrendingDown,color: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-200",    label: "Low"      },
  Critical: { icon: AlertTriangle,color: "text-red-700",   bg: "bg-red-100",     border: "border-red-300",     label: "Critical" },
};

// ── Severity badge ────────────────────────────────────────────────────────────

const SEVERITY_BADGE = {
  Mild:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  Moderate: "bg-orange-100 text-orange-700 border-orange-200",
  Severe:   "bg-red-100 text-red-700 border-red-200",
};

// ── FindingRow ────────────────────────────────────────────────────────────────

function FindingRow({ finding }) {
  const cfg = STATUS_CONFIG[finding.status] || STATUS_CONFIG.Normal;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 border ${cfg.bg} ${cfg.border}`}>
      <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800 truncate">{finding.name}</p>
        {finding.normalRange && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">Normal: {finding.normalRange}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-black ${cfg.color}`}>
          {finding.value} <span className="text-[10px] font-semibold text-gray-400">{finding.unit}</span>
        </p>
        <span className={`text-[9px] font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
      </div>
    </div>
  );
}

// ── AbnormalCard ──────────────────────────────────────────────────────────────

function AbnormalCard({ finding }) {
  const severityClass = SEVERITY_BADGE[finding.severity] || SEVERITY_BADGE.Moderate;
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <p className="text-xs font-bold text-gray-800">{finding.marker}</p>
          <span className="text-xs font-bold text-orange-600">→ {finding.value}</span>
        </div>
        {finding.severity && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityClass}`}>
            {finding.severity}
          </span>
        )}
      </div>
      <p className="px-4 py-2.5 text-xs text-gray-600 leading-relaxed">{finding.concern}</p>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ icon: Icon, title, iconColor = "text-gray-500", children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function ReportAnalysisModal({ reportId, reportName, onClose }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [analysis, setAnalysis] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalysis = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setStatus("loading");
    setErrorMsg("");

    try {
      const data = refresh
        ? await reanalyzeReport(reportId)
        : await analyzeReport(reportId);
      setAnalysis(data);
      setStatus("done");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "AI analysis failed. Please try again.";
      setErrorMsg(typeof msg === "string" ? msg : "AI analysis failed.");
      setStatus("error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const riskCfg = RISK_CONFIG[analysis?.riskLevel] || RISK_CONFIG.Normal;
  const RiskIcon = riskCfg.icon;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-gray-900 leading-tight">AI Report Analysis</h2>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{reportName || `Report #${reportId}`}</p>
          </div>
          <div className="flex items-center gap-2">
            {status === "done" && (
              <button
                onClick={() => fetchAnalysis(true)}
                disabled={isRefreshing}
                title="Re-analyse"
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── IDLE: call-to-action ── */}
          {status === "idle" && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="w-10 h-10 text-violet-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Understand Your Report</h3>
              <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
                Our AI will read your lab report and explain the results in plain language, highlight any concerns, and suggest next steps.
              </p>
              <button
                onClick={() => fetchAnalysis(false)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="w-4.5 h-4.5" />
                Analyse with AI
              </button>
            </div>
          )}

          {/* ── LOADING ── */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                </div>
                {/* Pulsing ring */}
                <div className="absolute -inset-2 rounded-[20px] border-2 border-violet-300/40 animate-ping" />
              </div>
              <h3 className="text-base font-black text-gray-800 mb-1">Analysing your report…</h3>
              <p className="text-sm text-gray-400">This usually takes 10–20 seconds</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">Analysis Failed</h3>
              <p className="text-sm text-gray-500 mb-7 max-w-xs">{errorMsg}</p>
              <button
                onClick={() => fetchAnalysis(false)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* ── DONE: analysis results ── */}
          {status === "done" && analysis && (
            <div className="p-5 space-y-6">

              {/* Risk banner */}
              <div className={`flex items-center gap-4 rounded-2xl border p-4 ${riskCfg.bg} ${riskCfg.border}`}>
                <div className={`w-12 h-12 ${riskCfg.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <RiskIcon className={`w-6 h-6 ${riskCfg.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${riskCfg.text}`}>
                      Overall Risk Level
                    </span>
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${riskCfg.badge}`}>
                      {analysis.riskLevel}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold leading-snug ${riskCfg.text}`}>
                    {analysis.patientSummary}
                  </p>
                </div>
              </div>

              {/* Abnormal findings */}
              {analysis.abnormalFindings?.length > 0 && (
                <Section icon={AlertTriangle} title="Abnormal Findings" iconColor="text-orange-500">
                  <div className="space-y-2">
                    {analysis.abnormalFindings.map((f, i) => (
                      <AbnormalCard key={i} finding={f} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Key findings table */}
              {analysis.keyFindings?.length > 0 && (
                <Section icon={Activity} title={`All Markers (${analysis.keyFindings.length})`} iconColor="text-blue-500">
                  <div className="space-y-1.5">
                    {analysis.keyFindings.map((f, i) => (
                      <FindingRow key={i} finding={f} />
                    ))}
                  </div>
                </Section>
              )}

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <Section icon={Lightbulb} title="Recommendations" iconColor="text-amber-500">
                  <div className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3">
                        <div className="w-5 h-5 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-black text-amber-600">{i + 1}</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Follow-up tests */}
              {analysis.followUpTests?.length > 0 && (
                <Section icon={FlaskConical} title="Suggested Follow-up Tests" iconColor="text-teal-500">
                  <div className="flex flex-wrap gap-2">
                    {analysis.followUpTests.map((t, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <TestTube2 className="w-3 h-3" />
                        {t}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Disclaimer */}
              <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {analysis.disclaimer ||
                    "This analysis is generated by AI and is for informational purposes only. Please consult a qualified doctor before making any health decisions."}
                </p>
              </div>

              {/* Re-analyse */}
              <button
                onClick={() => fetchAnalysis(true)}
                disabled={isRefreshing}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-violet-200 hover:border-violet-400 text-violet-600 hover:text-violet-700 font-semibold text-sm py-3 rounded-xl transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Re-analysing…" : "Re-analyse (fresh result)"}
              </button>

            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
