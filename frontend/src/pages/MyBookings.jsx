import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock3,
  FlaskConical,
  Building2,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  TestTube2,
  CheckCircle2,
  ArrowLeft,
  IndianRupee,
  Home,
  MapPin,
  Phone,
  ChevronRight,
  Download,
  RefreshCw,
  Search,
  Star,
  MessageSquare,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

// ── Status config — single source of truth ───────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "#f59e0b",
    leftBar: "#f59e0b",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dot: "#3b82f6",
    leftBar: "#3b82f6",
  },
  COMPLETED: {
    label: "Completed",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dot: "#10b981",
    leftBar: "#10b981",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    dot: "#ef4444",
    leftBar: "#ef4444",
  },
};

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

// ── StatusPill ────────────────────────────────────────────────────────────────

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    dot: "#9ca3af",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border flex-shrink-0"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}

const formatTime = (time) => {
  if (!time) return "—";

  const [hour, minute] = time.split(":");
  const h = Number(hour);

  const formattedHour = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";

  return `${formattedHour}:${minute} ${ampm}`;
};

// ── ReportSection — lazy loads only when card is expanded ────────────────────

function ReportSection({ bookingTests }) {
  const [reportMap, setReportMap] = useState({}); // { [bookingTestId]: Report[] }
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || !bookingTests?.length) return;
    setLoaded(true);

    // Fetch all in parallel — one request per bookingTest
    bookingTests.forEach((bt) => {
      setLoadingIds((prev) => new Set([...prev, bt.id]));
      api
        .get(`/booking/${bt.id}/reports`)
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
                    {bt.name || `Test #${bt.id}`}
                  </p>
                  {bt.labTest?.price != null && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                      <IndianRupee className="w-2.5 h-2.5" />
                      {bt.price}
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

function BookingCard({
  booking,
  index,
  onReviewClick,
  onCancelClick,
  hasReview,
  reviewLoading,
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[booking.status] || {};

  const totalPrice =
    booking.bookingTests?.reduce((sum, bt) => sum + (bt.price ?? 0), 0) ?? 0;

  const testNames =
    booking.bookingTests?.map((bt) => bt.name).filter(Boolean) ?? [];

  const hasReports = booking.status === "COMPLETED";
  const isCancelable =
    booking.status === "PENDING" || booking.status === "CONFIRMED";
  const reviewLabel = hasReview ? "Edit review" : "Write review";

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
                Booking{" "}
                {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
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
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* ── Info strip — always visible ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-5 pb-4 border-b border-gray-50">
            {/* Timeslot */}
            <InfoChip
              icon={Clock3}
              label="Slot"
              value={formatTime(booking.timeSlot) || "—"}
            />

            {/* Tests count */}
            <InfoChip
              icon={TestTube2}
              label="Tests"
              value={`${booking.bookingTests?.length ?? 0} selected`}
            />

            {/* Lab city */}
            {booking.lab?.city && (
              <InfoChip
                icon={MapPin}
                label="Location"
                value={booking.lab.city}
              />
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
            <div className="flex items-center gap-4">
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

              {/* Cancel button for pending/confirmed */}
              {isCancelable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelClick(booking);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              )}

              {/* Review button for completed bookings */}
              {booking.status === "COMPLETED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReviewClick(booking);
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                  disabled={reviewLoading}
                >
                  {reviewLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Star className="w-3 h-3 fill-amber-500" />
                  )}
                  {reviewLabel}
                </button>
              )}
            </div>

            {/* Expand toggle hint */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="ml-auto text-[11px] font-semibold text-gray-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              {expanded ? (
                <>
                  Hide details <ChevronUp className="w-3 h-3" />
                </>
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
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">
          {label}
        </p>
        <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">
          {value}
        </p>
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
        {activeTab === "ALL"
          ? "No bookings yet"
          : `No ${activeTab.toLowerCase()} bookings`}
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

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] =
    useState(null);
  const [reviewCache, setReviewCache] = useState({}); // { [bookingId]: BookingReviewResponse | null }
  const [reviewLoadingId, setReviewLoadingId] = useState(null);
  const [reviewFetchError, setReviewFetchError] = useState(null);

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    setError(null);
    api
      .get("/booking/me")
      .then((r) => setBookings(r.data))
      .catch((err) => {
        const data = err?.response?.data;
        setError(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load bookings.",
        );
      })
      .finally(() => setLoading(false));
    console.log("Booking: ", bookings);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setCancelReason("");
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const submitCancellation = async () => {
    if (!bookingToCancel) return;
    const trimmed = cancelReason.trim();
    if (!trimmed) {
      setCancelError("Please provide a cancellation reason.");
      return;
    }

    setCancelSubmitting(true);
    setCancelError(null);
    try {
      const res = await api.post(`/booking/${bookingToCancel.id}/cancel`, {
        cancellationReason: trimmed,
      });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingToCancel.id ? res.data : b)),
      );
      setCancelModalOpen(false);
      setBookingToCancel(null);
      setCancelReason("");
    } catch (err) {
      const data = err?.response?.data;
      setCancelError(
        typeof data === "string"
          ? data
          : data?.message || "Failed to cancel booking.",
      );
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleReviewClick = async (booking) => {
    setSelectedBookingForReview(booking);
    setReviewModalOpen(true);
    setReviewFetchError(null);
    setReviewLoadingId(booking.id);
    try {
      const res = await api.get(`/booking/${booking.id}/review`);
      setReviewCache((prev) => ({ ...prev, [booking.id]: res.data }));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setReviewCache((prev) => ({ ...prev, [booking.id]: null }));
      } else {
        const data = err?.response?.data;
        setReviewFetchError(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load review.",
        );
      }
    } finally {
      setReviewLoadingId(null);
    }
  };

  const handleReviewSaved = (bookingId, savedReview) => {
    setReviewCache((prev) => ({ ...prev, [bookingId]: savedReview }));
    setReviewModalOpen(false);
    setSelectedBookingForReview(null);
  };

  // Filter by tab + search
  const tabFiltered =
    activeTab === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);

  const filtered = searchQuery.trim()
    ? tabFiltered.filter((b) => {
        const q = searchQuery.toLowerCase();

        const labName = b.lab?.name?.toLowerCase() || "";
        const testMatch = b.bookingTests?.some((bt) =>
          bt.name?.toLowerCase().includes(q),
        );

        return labName.includes(q) || testMatch;
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
                <h1 className="text-lg font-black text-gray-900 leading-tight">
                  My Bookings
                </h1>
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
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* Status tabs */}
          {!loading && !error && (
            <div className="flex items-center gap-1.5 flex-wrap -mb-px">
              {STATUS_TABS.map((tab) => {
                const count =
                  tab === "ALL"
                    ? bookings.length
                    : bookings.filter((b) => b.status === tab).length;
                const active = activeTab === tab;
                const dot = STATUS_CONFIG[tab]?.dot;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                      active
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {dot && (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{
                          background: active
                            ? STATUS_CONFIG[tab]?.dot
                            : "#9ca3af",
                        }}
                      />
                    )}
                    {tab}
                    <span
                      className={`${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"} text-[10px] font-bold px-1.5 py-0.5 rounded-full`}
                    >
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
            <p className="text-sm font-semibold text-gray-500">
              Fetching your bookings…
            </p>
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
              <button
                onClick={fetchBookings}
                className="text-xs text-red-500 hover:text-red-700 font-semibold mt-0.5 underline"
              >
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
        {!loading &&
          !error &&
          filtered.map((booking, i) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              index={i}
              hasReview={reviewCache[booking.id] != null}
              reviewLoading={reviewLoadingId === booking.id}
              onReviewClick={handleReviewClick}
              onCancelClick={handleCancelClick}
            />
          ))}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && selectedBookingForReview && (
          <ReviewModal
            booking={selectedBookingForReview}
            initialReview={reviewCache[selectedBookingForReview.id]}
            loadingExisting={reviewLoadingId === selectedBookingForReview.id}
            fetchError={reviewFetchError}
            onClose={() => {
              setReviewModalOpen(false);
              setSelectedBookingForReview(null);
              setReviewFetchError(null);
              setReviewLoadingId(null);
            }}
            onSuccess={(saved) =>
              handleReviewSaved(selectedBookingForReview.id, saved)
            }
          />
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelModalOpen && bookingToCancel && (
          <CancelModal
            booking={bookingToCancel}
            reason={cancelReason}
            onReasonChange={setCancelReason}
            onClose={() => {
              setCancelModalOpen(false);
              setBookingToCancel(null);
              setCancelReason("");
              setCancelError(null);
            }}
            onSubmit={submitCancellation}
            submitting={cancelSubmitting}
            error={cancelError}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ReviewModal ───────────────────────────────────────────────────────────────

function ReviewModal({
  booking,
  initialReview,
  loadingExisting,
  fetchError,
  onClose,
  onSuccess,
}) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialReview?.review || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(fetchError || "");

  useEffect(() => {
    setRating(initialReview?.rating || 0);
    setComment(initialReview?.review || "");
    setError(fetchError || "");
  }, [initialReview, fetchError]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short review.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload = { rating, review: comment.trim() };
    const hasExisting = Boolean(initialReview);

    try {
      const res = hasExisting
        ? await api.put(`/booking/${booking.id}/review`, payload)
        : await api.post(`/booking/${booking.id}/review`, payload);
      onSuccess(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to submit review. You may have already reviewed this booking.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden z-10"
      >
        <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />

        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                Rate your visit
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {booking.lab?.name || "Lab"}
              </p>
              {initialReview && (
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Editing your previous review
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loadingExisting && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading your review…
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Star Selection */}
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-sm font-bold text-gray-700">
              How was your experience?
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-100"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                {rating} out of 5 stars
              </span>
            )}
          </div>

          {/* Comment input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Write a review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience at this lab..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[120px] outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" /> Submit Review
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CancelModal({
  booking,
  reason,
  onReasonChange,
  onClose,
  onSubmit,
  submitting,
  error,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden z-10"
      >
        <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />

        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                Cancel booking
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {booking.lab?.name || "Lab"} ·{" "}
                {booking.bookingDate?.slice(0, 10)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm font-semibold text-gray-700">
            Please share a reason for cancelling. This helps labs keep slots
            available.
          </p>

          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Reason for cancellation"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[120px] outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none"
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Keep booking
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-xl shadow-md shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Cancelling…
              </>
            ) : (
              <>
                <X className="w-4 h-4" /> Cancel booking
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
