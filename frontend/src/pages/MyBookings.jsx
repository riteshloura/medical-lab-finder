import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Clock3, FlaskConical, Building2,
  FileText, ExternalLink, ChevronDown, ChevronUp,
  Loader2, AlertCircle, TestTube2, CheckCircle2,
  ArrowLeft, IndianRupee, Home, MapPin, Phone,
  ChevronRight, Download, RefreshCw, Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

// ── Status config — single source of truth ───────────────────────────────────

const STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", leftBar: "#f59e0b" },
  CONFIRMED: { label: "Confirmed", color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6", leftBar: "#3b82f6" },
  COMPLETED: { label: "Completed", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0", dot: "#10b981", leftBar: "#10b981" },
  CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", leftBar: "#ef4444" },
};

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

// ── StatusPill ────────────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status, color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", dot: "#9ca3af",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border flex-shrink-0"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ── ReportSection — lazy loads only when card is expanded ────────────────────

function ReportSection({ bookingTests }) {
  const [reportMap, setReportMap] = useState({});  // { [bookingTestId]: Report[] }
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || !bookingTests?.length) return;
    setLoaded(true);

    // Fetch all in parallel — one request per bookingTest
    bookingTests.forEach((bt) => {
      setLoadingIds((prev) => new Set([...prev, bt.id]));
      api.get(`/booking/${bt.id}/reports`)
        .then((r) => {
          setReportMap((prev) => ({ ...prev, [bt.id]: r.data }));
        })
        .catch(() => {
          setReportMap((prev) => ({ ...prev, [bt.id]: [] }));
        })
        .finally(() => {
          setLoadingIds((prev) => {
            const next = new Set(prev);
            next.delete(bt.id);
            return next;
          });
        });
    });
  }, [loaded, bookingTests]);

  if (!bookingTests?.length) return null;

  return (
    <div className="px-5 pb-5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        Tests &amp; Reports
      </p>
      <div className="space-y-2">
        {bookingTests.map((bt) => {
          const reports = reportMap[bt.id] || [];
          const isLoading = loadingIds.has(bt.id);

          return (
            <div
              key={bt.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
            >
              {/* Test info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FlaskConical className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {bt.labTest?.test?.name || `Test #${bt.id}`}
                  </p>
                  {bt.labTest?.price != null && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                      <IndianRupee className="w-2.5 h-2.5" />
                      {bt.labTest.price}
                    </p>
                  )}
                </div>
              </div>

              {/* Reports */}
              <div className="pl-11 sm:pl-0 flex-shrink-0">
                {isLoading ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading report…
                  </span>
                ) : reports.length === 0 ? (
                  <span className="text-[11px] text-gray-400 italic bg-white border border-gray-100 px-2.5 py-1 rounded-lg">
                    Report pending
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {reports.map((r, i) => (
                      <a
                        key={r.id ?? i}
                        href={r.reportURI}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <Download className="w-3 h-3" />
                        Report {reports.length > 1 ? i + 1 : ""}
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── BookingCard ───────────────────────────────────────────────────────────────

function BookingCard({ booking, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[booking.status] || {};

  const totalPrice = booking.bookingTests?.reduce(
    (sum, bt) => sum + (bt.labTest?.price ?? 0), 0
  ) ?? 0;

  const testNames = booking.bookingTests
    ?.map((bt) => bt.labTest?.test?.name)
    .filter(Boolean) ?? [];

  const hasReports = booking.status === "COMPLETED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.055 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* ── Coloured left-bar accent ── */}
      <div className="flex">
        <div
          className="w-1 flex-shrink-0 rounded-l-2xl"
          style={{ background: cfg.leftBar || "#e5e7eb" }}
        />

        <div className="flex-1 min-w-0">
          {/* ── Top row ── */}
          <div
            className="flex items-center gap-3 px-5 pt-4 pb-3 cursor-pointer select-none"
            onClick={() => setExpanded((v) => !v)}
          >
            {/* Lab icon */}
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Lab name + booking id */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {booking.lab?.name || "Lab"}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Booking #{booking.id}
              </p>
            </div>

            {/* Status + total + chevron */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <StatusPill status={booking.status} />
              {totalPrice > 0 && (
                <div className="flex items-center gap-0.5 text-sm font-black text-gray-800">
                  <IndianRupee className="w-3 h-3" />
                  {totalPrice}
                </div>
              )}
              <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                {expanded
                  ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                  : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                }
              </div>
            </div>
          </div>

          {/* ── Info strip — always visible ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-5 pb-4 border-b border-gray-50">
            {/* Timeslot */}
            <InfoChip icon={Clock3} label="Slot" value={booking.timeSlot || "—"} />

            {/* Tests count */}
            <InfoChip
              icon={TestTube2}
              label="Tests"
              value={`${booking.bookingTests?.length ?? 0} selected`}
            />

            {/* Lab city */}
            {booking.lab?.city && (
              <InfoChip icon={MapPin} label="Location" value={booking.lab.city} />
            )}
          </div>

          {/* ── Test names preview — always visible ── */}
          {testNames.length > 0 && (
            <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-gray-50">
              {testNames.map((name, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* ── Expandable: Reports ── */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                key="expanded"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div className="pt-4">
                  <ReportSection bookingTests={booking.bookingTests} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Footer ── */}
          <div className="px-5 py-3 flex items-center justify-between">
            {/* View lab link */}
            {booking.lab?.id && (
              <Link
                to={`/lab/${booking.lab.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Building2 className="w-3 h-3" />
                View Lab
                <ChevronRight className="w-3 h-3" />
              </Link>
            )}

            {/* Expand toggle hint */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="ml-auto text-[11px] font-semibold text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              {expanded ? (
                <>Hide details <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>
                  {hasReports ? "View reports" : "View tests"}
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── InfoChip ──────────────────────────────────────────────────────────────────

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">{label}</p>
        <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ activeTab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-4">
        <CalendarDays className="w-7 h-7 text-emerald-400" />
      </div>
      <p className="text-sm font-bold text-gray-700">
        {activeTab === "ALL" ? "No bookings yet" : `No ${activeTab.toLowerCase()} bookings`}
      </p>
      <p className="text-xs text-gray-400 mt-1 mb-6 max-w-[220px]">
        {activeTab === "ALL"
          ? "Find a lab near you and book your first test"
          : "Try a different filter to see other bookings"}
      </p>
      {activeTab === "ALL" && (
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-500/20 transition-colors"
        >
          <Home className="w-4 h-4" />
          Find a lab
        </Link>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    api.get("/booking/me")
      .then((r) => setBookings(r.data))
      .catch((err) => {
        const data = err?.response?.data;
        setError(typeof data === "string" ? data : data?.message || "Failed to load bookings.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  // Filter by tab + search
  const tabFiltered = activeTab === "ALL"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  const filtered = searchQuery.trim()
    ? tabFiltered.filter((b) => {
      const q = searchQuery.toLowerCase();
      return (
        b.lab?.name?.toLowerCase().includes(q) ||
        b.bookingTests?.some((bt) => bt.labTest?.test?.name?.toLowerCase().includes(q))
      );
    })
    : tabFiltered;

  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page header — matches app nav style ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-5 pt-5 pb-0">

          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to map
          </Link>

          {/* Title row */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/25">
                <CalendarDays className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900 leading-tight">My Bookings</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  {loading
                    ? "Loading…"
                    : `${bookings.length} appointment${bookings.length !== 1 ? "s" : ""}`}
                  {pendingCount > 0 && !loading && (
                    <span className="ml-2 text-amber-600 font-bold">
                      · {pendingCount} pending
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-emerald-600 transition-all disabled:opacity-40"
              title="Refresh bookings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Status tabs */}
          {!loading && !error && (
            <div className="flex items-center gap-1.5 flex-wrap -mb-px">
              {STATUS_TABS.map((tab) => {
                const count = tab === "ALL"
                  ? bookings.length
                  : bookings.filter((b) => b.status === tab).length;
                const active = activeTab === tab;
                const dot = STATUS_CONFIG[tab]?.dot;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${active
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {dot && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: active ? STATUS_CONFIG[tab]?.dot : "#9ca3af" }}
                      />
                    )}
                    {tab}
                    <span className={`${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-4">

        {/* Search bar — only when there are bookings */}
        {!loading && !error && bookings.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by lab name or test…"
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder-gray-400"
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-sm shadow-emerald-500/25">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Fetching your bookings…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <button onClick={fetchBookings} className="text-xs text-red-500 hover:text-red-700 font-semibold mt-0.5 underline">
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState activeTab={activeTab} />
        )}

        {/* Cards */}
        {!loading && !error && filtered.map((booking, i) => (
          <BookingCard key={booking.id} booking={booking} index={i} />
        ))}
      </div>
    </div>
  );
}