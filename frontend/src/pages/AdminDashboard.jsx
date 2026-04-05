import { useEffect, useState } from "react";
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
  User,
  CalendarDays,
  FileText,
  Pencil,
  Trash2,
  Plus,
  BadgeCheck,
  Ban,
  LogOut,
  Menu,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Config ────────────────────────────────────────────────────────────────────

const REQUEST_TYPE_CONFIG = {
  CREATE_LAB: { label: "Create Lab", icon: Plus, color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
  UPDATE_LAB: { label: "Update Lab", icon: Pencil, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  DELETE_LAB: { label: "Delete Lab", icon: Trash2, color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", icon: Clock3, leftBar: "#f59e0b" },
  APPROVED: { label: "Approved", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", dot: "#10b981", icon: CheckCircle2, leftBar: "#10b981" },
  REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", icon: XCircle, leftBar: "#ef4444" },
};

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

// ── Pills ─────────────────────────────────────────────────────────────────────

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

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, iconColor, iconBg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4"
    >
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
        style={{ background: iconBg, borderColor: iconColor + "40" }}
      >
        <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-black text-gray-900">{value}</p>
        <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Payload Preview ───────────────────────────────────────────────────────────

function PayloadPreview({ payload }) {
  const [open, setOpen] = useState(false);
  if (!payload) return <span className="text-gray-400 text-xs italic">No payload</span>;
  let parsed = null;
  try { parsed = JSON.parse(payload); } catch {
    return <span className="text-xs text-gray-500">{payload}</span>;
  }
  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {parsed.name && <span className="text-xs font-semibold text-gray-800">📋 {parsed.name}</span>}
        {parsed.city && parsed.state && <span className="text-xs text-gray-500">📍 {parsed.city}, {parsed.state}</span>}
        {parsed.contactNumber && <span className="text-xs text-gray-500">📞 {parsed.contactNumber}</span>}
      </div>
      <button
        onClick={() => setOpen((p) => !p)}
        className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
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

function RequestCard({ request, onAction, actionLoading, index }) {
  const [remark, setRemark] = useState("");
  const [remarkOpen, setRemarkOpen] = useState(false);
  const isPending = request.requestStatus === "PENDING";
  const cfg = STATUS_CONFIG[request.requestStatus] || STATUS_CONFIG.PENDING;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex">
        {/* Coloured left bar */}
        <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: cfg.leftBar || "#e5e7eb" }} />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="px-4 sm:px-5 py-4 border-b border-gray-50 flex flex-wrap items-start sm:items-center justify-between gap-3">
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
              <span className="text-[11px] text-gray-400 flex items-center gap-1 whitespace-nowrap">
                <CalendarDays className="w-3 h-3" />
                {formatDate(request.createdAt)}
              </span>
            </div>
          </div>

          {/* Payload */}
          <div className="px-4 sm:px-5 py-4 border-b border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Change Details
            </p>
            <PayloadPreview payload={request.changePayload} />
          </div>

          {/* Admin Remark */}
          {request.adminRemark && request.requestStatus !== "PENDING" && (
            <div className="px-4 sm:px-5 py-3 border-b border-gray-50 bg-gray-50/60">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Admin Remark</p>
              <p className="text-xs text-gray-700">{request.adminRemark}</p>
              {request.reviewedAt && (
                <p className="text-[11px] text-gray-400 mt-1">Reviewed: {formatDate(request.reviewedAt)}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {isPending && (
            <div className="px-4 sm:px-5 py-4 flex flex-col gap-3">
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
                  onClick={() => onAction(request.id, "APPROVED", request.requestType, remark)}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
                >
                  {actionLoading === request.id + "_APPROVED"
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <BadgeCheck className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  disabled={!!actionLoading}
                  onClick={() => {
                    if (!remarkOpen) { setRemarkOpen(true); return; }
                    onAction(request.id, "REJECTED", request.requestType, remark);
                  }}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 disabled:opacity-50 text-red-600 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  {actionLoading === request.id + "_REJECTED"
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Ban className="w-3.5 h-3.5" />}
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // ── Two separate states: all (for stats) + filtered (for list) ────────────
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [message, setMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch unfiltered list once (for accurate stats + tab counts)
  const loadAll = async () => {
    try {
      const res = await api.get("/admin/lab-requests");
      setAllRequests(res.data);
    } catch { /* stats stay at 0 gracefully */ }
  };

  // Fetch filtered list whenever the tab changes
  const loadFiltered = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/lab-requests", {
        params: statusFilter !== "ALL" ? { status: statusFilter } : {},
      });
      setFilteredRequests(res.data);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || err?.response?.data || "Failed to load requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => { loadAll(); loadFiltered(); };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadFiltered(); }, [statusFilter]);

  // Stats are ALWAYS derived from allRequests — never from filteredRequests
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter((r) => r.requestStatus === "PENDING").length,
    approved: allRequests.filter((r) => r.requestStatus === "APPROVED").length,
    rejected: allRequests.filter((r) => r.requestStatus === "REJECTED").length,
  };

  const tabCount = (f) =>
    f === "ALL" ? allRequests.length
      : allRequests.filter((r) => r.requestStatus === f).length;

  const handleAction = async (reqId, status, requestType, adminRemark = "") => {
    if (status === "REJECTED" && !adminRemark.trim()) {
      setMessage({ type: "error", text: "Please provide a remark when rejecting a request." });
      return;
    }
    setActionLoading(reqId + "_" + status);
    setMessage(null);
    try {
      await api.put(`/lab-request/${reqId}/updateStatus`, { status, requestType, adminRemark });
      setMessage({
        type: "success",
        text: `Request ${status === "APPROVED" ? "approved" : "rejected"} successfully.`,
      });
      await Promise.all([loadAll(), loadFiltered()]);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.response?.data?.message || err?.response?.data || "Action failed.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setSidebarOpen(false)}>
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform" />
              <TestTube2 className="relative w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-[14px] font-bold text-gray-900">Lab</span>
              <span className="text-[14px] font-bold text-emerald-600">Locator</span>
            </div>
          </Link>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide truncate">{user?.name}</p>
              <p className="text-[11px] text-emerald-600">Admin workspace</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            Lab Requests
            {stats.pending > 0 && (
              <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full bg-white/25 text-white">
                {stats.pending}
              </span>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 pb-5 space-y-1 border-t border-gray-100 pt-4">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-emerald-50"
          >
            <Home className="w-3.5 h-3.5" /> View site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            <div className="w-8 h-8 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                {stats.pending > 0
                  ? `${stats.pending} request${stats.pending !== 1 ? "s" : ""} awaiting review`
                  : "All requests reviewed"}
              </p>
            </div>
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 px-3 py-2 rounded-xl transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 space-y-5">

          {/* ── Stats — always from allRequests, never re-zero on filter change ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={FileText} label="Total Requests" value={stats.total} iconColor="#7c3aed" iconBg="#f5f3ff" delay={0} />
            <StatCard icon={Clock3} label="Pending Review" value={stats.pending} iconColor="#d97706" iconBg="#fffbeb" delay={0.05} />
            <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} iconColor="#059669" iconBg="#f0fdf4" delay={0.1} />
            <StatCard icon={XCircle} label="Rejected" value={stats.rejected} iconColor="#dc2626" iconBg="#fef2f2" delay={0.15} />
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => {
              const count = tabCount(f);
              const active = statusFilter === f;
              const dot = STATUS_CONFIG[f]?.dot;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${active
                      ? "bg-emerald-500 text-white border-transparent shadow-sm shadow-emerald-500/20"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900"
                    }`}
                >
                  {dot && !active && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />
                  )}
                  <span className="hidden sm:inline">{f.charAt(0) + f.slice(1).toLowerCase()}</span>
                  <span className="sm:hidden">{f === "ALL" ? "All" : f.slice(0, 3)}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Message banner ── */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold ${message.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-600"
                  }`}
              >
                {message.type === "success"
                  ? <CheckCheck className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {message.text}
                <button onClick={() => setMessage(null)} className="ml-auto text-xs underline opacity-70 hover:opacity-100">
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Request list ── */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-sm shadow-emerald-500/25">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <p className="text-sm font-semibold text-gray-400">Loading requests…</p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-gray-700">
                No {statusFilter !== "ALL" ? statusFilter.toLowerCase() : ""} requests
              </p>
              <p className="text-xs text-gray-400 mt-1">All clear — nothing to review right now.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredRequests.map((req, i) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    index={i}
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