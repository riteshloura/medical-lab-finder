import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCheck,
  TestTube2,
  Home,
  RefreshCw,
  Filter,
  User,
  CalendarDays,
  FileText,
  Pencil,
  Trash2,
  Plus,
  BadgeCheck,
  Ban,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const REQUEST_TYPE_CONFIG = {
  CREATE_LAB: {
    label: "Create Lab",
    icon: Plus,
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dotColor: "#10b981",
  },
  UPDATE_LAB: {
    label: "Update Lab",
    icon: Pencil,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dotColor: "#3b82f6",
  },
  DELETE_LAB: {
    label: "Delete Lab",
    icon: Trash2,
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    dotColor: "#ef4444",
  },
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: Clock3,
  },
  APPROVED: {
    label: "Approved",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: XCircle,
  },
};

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function TypePill({ type }) {
  const cfg = REQUEST_TYPE_CONFIG[type] || REQUEST_TYPE_CONFIG.CREATE_LAB;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + "18" }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ── Payload Preview ───────────────────────────────────────────────────────────

function PayloadPreview({ payload }) {
  const [open, setOpen] = useState(false);
  if (!payload) return <span className="text-gray-400 text-xs italic">No payload</span>;
  let parsed = null;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return <span className="text-xs text-gray-500">{payload}</span>;
  }
  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {parsed.name && (
          <span className="text-xs font-semibold text-gray-800">📋 {parsed.name}</span>
        )}
        {parsed.city && parsed.state && (
          <span className="text-xs text-gray-500">📍 {parsed.city}, {parsed.state}</span>
        )}
        {parsed.contactNumber && (
          <span className="text-xs text-gray-500">📞 {parsed.contactNumber}</span>
        )}
      </div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {open ? "Hide" : "Show"} full details
      </button>
      {open && (
        <pre className="mt-2 text-[11px] bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-gray-700 overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Request Card ──────────────────────────────────────────────────────────────

function RequestCard({ request, onAction, actionLoading }) {
  const [remark, setRemark] = useState("");
  const [remarkOpen, setRemarkOpen] = useState(false);
  const isPending = request.requestStatus === "PENDING";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{request.requestedBy?.name || "Unknown"}</p>
            <p className="text-xs text-gray-400">{request.requestedBy?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TypePill type={request.requestType} />
          <StatusPill status={request.requestStatus} />
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {formatDate(request.createdAt)}
          </span>
        </div>
      </div>

      {/* Payload */}
      <div className="px-5 py-4 border-b border-gray-50">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText className="w-3 h-3" /> Change Details
        </p>
        <PayloadPreview payload={request.changePayload} />
      </div>

      {/* Admin Remark (if reviewed) */}
      {request.adminRemark && request.requestStatus !== "PENDING" && (
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Remark</p>
          <p className="text-xs text-gray-700">{request.adminRemark}</p>
          {request.reviewedAt && (
            <p className="text-[11px] text-gray-400 mt-1">Reviewed: {formatDate(request.reviewedAt)}</p>
          )}
        </div>
      )}

      {/* Actions (only for PENDING) */}
      {isPending && (
        <div className="px-5 py-4 flex flex-col gap-3">
          {remarkOpen && (
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Optional remark (required for rejection)..."
              className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {!remarkOpen && (
              <button
                onClick={() => setRemarkOpen(true)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
              >
                <Pencil className="w-3 h-3" /> Add Remark
              </button>
            )}
            <button
              disabled={!!actionLoading}
              onClick={() =>
                onAction(request.id, "APPROVED", request.requestType, remark)
              }
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
            >
              {actionLoading === request.id + "_APPROVED" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BadgeCheck className="w-3.5 h-3.5" />
              )}
              Approve
            </button>
            <button
              disabled={!!actionLoading}
              onClick={() => {
                if (!remarkOpen) {
                  setRemarkOpen(true);
                  return;
                }
                onAction(request.id, "REJECTED", request.requestType, remark);
              }}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-50 text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              {actionLoading === request.id + "_REJECTED" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Ban className="w-3.5 h-3.5" />
              )}
              Reject
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // "reqId_STATUS"
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [message, setMessage] = useState(null);
  const { user } = useAuth();

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/lab-requests", {
        params: statusFilter !== "ALL" ? { status: statusFilter } : {},
      });
      setRequests(res.data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || err?.response?.data || "Failed to load requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleAction = async (reqId, status, requestType, adminRemark = "") => {
    if (status === "REJECTED" && !adminRemark.trim()) {
      setMessage({ type: "error", text: "Please provide a remark when rejecting a request." });
      return;
    }
    setActionLoading(reqId + "_" + status);
    setMessage(null);
    try {
      await api.put(`/lab-request/${reqId}/updateStatus`, {
        status,
        requestType,
        adminRemark,
      });
      setMessage({
        type: "success",
        text: `Request ${status === "APPROVED" ? "approved" : "rejected"} successfully.`,
      });
      await loadRequests();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || err?.response?.data || "Action failed. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.requestStatus === "PENDING").length,
    approved: requests.filter((r) => r.requestStatus === "APPROVED").length,
    rejected: requests.filter((r) => r.requestStatus === "REJECTED").length,
  }), [requests]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-500/30 group-hover:scale-105 transition-transform">
              <TestTube2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[14px] font-bold text-gray-900">Lab</span>
              <span className="text-[14px] font-bold text-violet-600">Locator</span>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-violet-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wide">{user?.name}</p>
              <p className="text-[11px] text-violet-600 truncate">Admin workspace</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white shadow-sm shadow-violet-500/30">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            Lab Requests
            {stats.pending > 0 && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/25 text-white">
                {stats.pending}
              </span>
            )}
          </div>
        </nav>

        <div className="px-4 pb-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-violet-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Back to map
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">Lab Requests</h1>
            <p className="text-xs text-gray-400">
              {stats.pending} pending · {stats.approved} approved · {stats.rejected} rejected
            </p>
          </div>
          <button
            onClick={loadRequests}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-violet-600 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-200 px-3 py-2 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </header>

        <main className="flex-1 px-8 py-7 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="Total Requests" value={stats.total} color="#7c3aed" />
            <StatCard icon={Clock3} label="Pending" value={stats.pending} color="#d97706" />
            <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} color="#059669" />
            <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="#dc2626" />
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all ${
                  statusFilter === f
                    ? "bg-violet-600 text-white border-transparent shadow-sm shadow-violet-500/20"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Message banner */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold ${
                  message.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCheck className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                {message.text}
                <button
                  onClick={() => setMessage(null)}
                  className="ml-auto text-xs underline opacity-70 hover:opacity-100"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Request list */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <p className="text-sm font-semibold text-gray-400">Loading requests…</p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-500">No {statusFilter !== "ALL" ? statusFilter.toLowerCase() : ""} requests</p>
              <p className="text-xs text-gray-400 mt-1">All clear! Come back later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {requests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
