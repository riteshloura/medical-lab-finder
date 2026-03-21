import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FlaskConical,
  IndianRupee,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  TestTube2,
  UserRound,
  Home,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  CheckCheck,
  Beaker,
  Trash2,
  Upload,
  FileText,
  ExternalLink,
  CalendarCheck,
  Ban,
  CircleCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Constants ──────────────────────────────────────────────────────────────────

const emptyLabForm = {
  name: "",
  description: "",
  address: "",
  city: "",
  state: "",
  latitude: "",
  longitude: "",
  contactNumber: "",
  slotCapacityOnline: "",
  openingTime: "",
  closingTime: "",
};

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const STATUS_CONFIG = {
  PENDING: {
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  CONFIRMED: {
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  COMPLETED: {
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dot: "#10b981",
  },
  CANCELLED: {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    dot: "#ef4444",
  },
};

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "labs", label: "My Labs", icon: Building2 },
  { id: "tests", label: "Test Catalog", icon: Beaker },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;
  return fallback;
};

/**
 * bookingDate in the DTO is the actual appointment LocalDateTime (booking_date column).
 * createdAt is when the record was created.
 * Display appointment date from bookingDate; show createdAt as "booked on".
 */
const formatDate = (dt) => {
  if (!dt) return "—";
  const d = new Date(dt);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (t) => {
  if (!t) return "—";
  // t might be "HH:mm:ss" string or [H, m] array from Jackson
  let str = Array.isArray(t)
    ? `${String(t[0]).padStart(2, "0")}:${String(t[1]).padStart(2, "0")}`
    : String(t).substring(0, 5);
  const [hStr, mStr] = str.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

// ── Main Component ─────────────────────────────────────────────────────────────

function OwnerDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [labs, setLabs] = useState([]);
  const [masterTests, setMasterTests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [labForm, setLabForm] = useState(emptyLabForm);
  const [editingLabId, setEditingLabId] = useState(null);
  const [showLabForm, setShowLabForm] = useState(false);
  const [testForm, setTestForm] = useState({
    testId: "",
    price: "",
    homeCollectionAvailable: false,
  });
  const [loading, setLoading] = useState(true);
  const [testsLoading, setTestsLoading] = useState(false);
  const [labMessage, setLabMessage] = useState(null);
  const [testMessage, setTestMessage] = useState(null);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [savingLab, setSavingLab] = useState(false);
  const [savingTest, setSavingTest] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [deletingTestId, setDeletingTestId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [labFilter, setLabFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  // Per-booking cancel reason input state
  const [cancelReasons, setCancelReasons] = useState({});
  // Per-booking: whether the cancel reason input is open
  const [cancelOpen, setCancelOpen] = useState({});

  const { user } = useAuth();

  const selectedLab = useMemo(
    () => labs.find((l) => l.id === selectedLabId) || null,
    [labs, selectedLabId],
  );

  const availableTests = masterTests.filter(
    (t) => !selectedLabTests.some((lt) => lt.id === t.id),
  );

  const bookingStats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    return { total: bookings.length, pending, confirmed, completed };
  }, [bookings]);

  const labFilterOptions = useMemo(() => {
    const seen = new Map();
    bookings.forEach((b) => {
      if (b.lab?.id && !seen.has(b.lab.id)) {
        seen.set(b.lab.id, b.lab.name || `Lab ${b.lab.id}`);
      }
    });
    return [
      { id: "ALL", name: "All labs" },
      ...Array.from(seen.entries()).map(([id, name]) => ({ id, name })),
    ];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const text = searchQuery.trim().toLowerCase();
    const sorted = [...bookings].sort((a, b) => {
      const aDate = a.bookingDate || a.createdAt || "";
      const bDate = b.bookingDate || b.createdAt || "";
      return sortBy === "oldest"
        ? String(aDate).localeCompare(String(bDate))
        : String(bDate).localeCompare(String(aDate));
    });
    return sorted.filter((b) => {
      const statusOk = statusFilter === "ALL" || b.status === statusFilter;
      const labOk = labFilter === "ALL" || b.lab?.id === labFilter;
      const textOk =
        !text ||
        b.user?.name?.toLowerCase().includes(text) ||
        b.lab?.name?.toLowerCase().includes(text) ||
        (b.bookingTests || []).some((t) =>
          t.name?.toLowerCase().includes(text),
        );
      return statusOk && labOk && textOk;
    });
  }, [bookings, statusFilter, labFilter, searchQuery, sortBy]);

  // ── Data loading ─────────────────────────────────────────────────────────────

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      const [labsRes, testsRes, bookingsRes] = await Promise.all([
        api.get("/labs/me"),
        api.get("/tests"),
        api.get("/booking"),
      ]);
      setLabs(labsRes.data);
      setMasterTests(testsRes.data);
      setBookings(bookingsRes.data);
      setSelectedLabId((cur) => cur ?? labsRes.data[0]?.id ?? null);
    } catch (err) {
      setBookingMessage({
        type: "error",
        text: getErrorMessage(err, "Failed to load dashboard."),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedLabTests = async (labId) => {
    if (!labId) {
      setSelectedLabTests([]);
      return;
    }
    try {
      setTestsLoading(true);
      const res = await api.get(`/labs/${labId}/tests`);
      setSelectedLabTests(res.data);
    } catch (err) {
      setTestMessage({
        type: "error",
        text: getErrorMessage(err, "Failed to load tests."),
      });
    } finally {
      setTestsLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);
  useEffect(() => {
    loadSelectedLabTests(selectedLabId);
  }, [selectedLabId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const resetLabForm = () => {
    setLabForm(emptyLabForm);
    setEditingLabId(null);
    setShowLabForm(false);
    setLabMessage(null);
  };

  const startEditingLab = (lab) => {
    setEditingLabId(lab.id);
    setSelectedLabId(lab.id);
    setLabMessage(null);
    setLabForm({
      name: lab.name ?? "",
      description: lab.description ?? "",
      address: lab.address ?? "",
      city: lab.city ?? "",
      state: lab.state ?? "",
      latitude: lab.latitude ?? "",
      longitude: lab.longitude ?? "",
      contactNumber: lab.contactNumber ?? "",
      slotCapacityOnline: lab.slotCapacityOnline ?? "",
      openingTime: lab.openingTime ?? "",
      closingTime: lab.closingTime ?? "",
    });
    setShowLabForm(true);
  };

  const submitLabForm = async (e) => {
    e.preventDefault();
    setSavingLab(true);
    setLabMessage(null);
    const payload = {
      ...labForm,
      latitude: Number(labForm.latitude),
      longitude: Number(labForm.longitude),
      slotCapacityOnline: Number(labForm.slotCapacityOnline),
    };
    try {
      if (editingLabId) {
        await api.put(`/labs/${editingLabId}`, payload);
        setLabMessage({ type: "success", text: "Lab updated successfully." });
      } else {
        await api.post("/labs", payload);
        setLabMessage({ type: "success", text: "Lab created successfully." });
      }
      await loadOwnerData();
      resetLabForm();
    } catch (err) {
      setLabMessage({
        type: "error",
        text: getErrorMessage(err, "Failed to save lab."),
      });
    } finally {
      setSavingLab(false);
    }
  };

  const submitTestForm = async (e) => {
    e.preventDefault();
    if (!selectedLabId) return;
    setSavingTest(true);
    setTestMessage(null);
    try {
      await api.post(`/labs/${selectedLabId}/tests`, {
        testId: Number(testForm.testId),
        price: Number(testForm.price),
        homeCollectionAvailable: testForm.homeCollectionAvailable,
      });
      setTestForm({ testId: "", price: "", homeCollectionAvailable: false });
      setTestMessage({ type: "success", text: "Test added to catalog." });
      await loadSelectedLabTests(selectedLabId);
    } catch (err) {
      setTestMessage({
        type: "error",
        text: getErrorMessage(err, "Failed to add test."),
      });
    } finally {
      setSavingTest(false);
    }
  };

  /**
   * Directly transition a booking to a new status.
   * For CANCELLED, requires a non-empty reason.
   */
  const applyStatus = async (bookingId, nextStatus, reason = "") => {
    if (nextStatus === "CANCELLED" && !reason.trim()) {
      setBookingMessage({
        type: "error",
        text: "Cancellation reason is required.",
      });
      return false;
    }
    setUpdatingBookingId(bookingId);
    setBookingMessage(null);
    try {
      await api.put(`/booking/${bookingId}/status`, {
        status: nextStatus,
        cancellationReason: reason.trim(),
      });
      setBookingMessage({
        type: "success",
        text: `Booking marked as ${nextStatus.toLowerCase()}.`,
      });
      await loadOwnerData();
      // Close cancel input after success
      setCancelOpen((p) => ({ ...p, [bookingId]: false }));
      setCancelReasons((p) => ({ ...p, [bookingId]: "" }));
      return true;
    } catch (err) {
      setBookingMessage({
        type: "error",
        text: getErrorMessage(err, "Failed to update booking."),
      });
      return false;
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const deleteTest = async (testId) => {
    if (!selectedLabId) return;
    setDeletingTestId(testId);
    setTestMessage(null);
    try {
      await api.delete(`/labs/${selectedLabId}/tests/${testId}`);
      setTestMessage({ type: "success", text: "Test removed from catalog." });
      await loadSelectedLabTests(selectedLabId);
    } catch (err) {
      setTestMessage({
        type: "error",
        text: getErrorMessage(err, "Failed to delete test."),
      });
    } finally {
      setDeletingTestId(null);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            Loading your workspace…
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Fixed Sidebar ── */}
      <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-500/30 group-hover:scale-105 transition-transform">
              <TestTube2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[14px] font-bold text-gray-900">Lab</span>
              <span className="text-[14px] font-bold text-emerald-600">
                Locator
              </span>
            </div>
          </Link>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                {user?.name}
              </p>
              <p className="text-[11px] text-emerald-600 truncate">
                Owner workspace
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {item.id === "bookings" &&
                  bookings.filter((b) => b.status === "PENDING").length > 0 && (
                    <span
                      className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"}`}
                    >
                      {bookings.filter((b) => b.status === "PENDING").length}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>

        {selectedLab && (
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Active Lab
            </p>
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
              <p className="text-xs font-bold text-gray-900 truncate">
                {selectedLab.name}
              </p>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {selectedLab.city}, {selectedLab.state}
              </p>
            </div>
          </div>
        )}

        <div className="px-4 pb-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Back to map
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-900">
              {NAV_ITEMS.find((n) => n.id === activeView)?.label}
            </h1>
            <p className="text-xs text-gray-400">
              {labs.length} lab{labs.length !== 1 ? "s" : ""} ·{" "}
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {labs.length > 0 && (
              <select
                value={selectedLabId || ""}
                onChange={(e) => setSelectedLabId(Number(e.target.value))}
                className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-400 hover:border-gray-300 transition-colors cursor-pointer"
              >
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </header>

        <main className="flex-1 px-8 py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {/* ── OVERVIEW ── */}
              {activeView === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={Building2}
                      label="Total Labs"
                      value={labs.length}
                      accent="emerald"
                    />
                    <StatCard
                      icon={Beaker}
                      label="Tests Listed"
                      value={selectedLabTests.length}
                      accent="teal"
                    />
                    <StatCard
                      icon={CalendarDays}
                      label="Total Bookings"
                      value={bookings.length}
                      accent="blue"
                    />
                    <StatCard
                      icon={Clock3}
                      label="Pending"
                      value={
                        bookings.filter((b) => b.status === "PENDING").length
                      }
                      accent="amber"
                    />
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">
                          Recent Bookings
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Latest appointments across all your labs
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveView("bookings")}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        View all <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {bookings.length === 0 && (
                        <div className="px-6 py-10 text-center text-sm text-gray-400">
                          No bookings yet.
                        </div>
                      )}
                      {bookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/60 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <UserRound className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {booking.user?.name || "Patient"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {booking.bookingTests
                                ?.map((i) => i.name)
                                .filter(Boolean)
                                .join(", ") || "No tests"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400">
                              {formatTime(booking.timeSlot)}
                            </span>
                            <BookingStatusPill status={booking.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">
                          Your Labs
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Quick overview of registered labs
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveView("labs")}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                      {labs.length === 0 && (
                        <div className="col-span-3 py-8 text-center text-sm text-gray-400">
                          No labs yet.{" "}
                          <button
                            onClick={() => setActiveView("labs")}
                            className="text-emerald-600 font-semibold"
                          >
                            Create your first lab →
                          </button>
                        </div>
                      )}
                      {labs.map((lab) => (
                        <div
                          key={lab.id}
                          className="rounded-xl border border-gray-100 p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {lab.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lab.city}, {lab.state}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock3 className="w-3 h-3" />
                            {lab.slotCapacityOnline} online slots
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── LABS ── */}
              {activeView === "labs" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">
                          Registered Labs
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Select a lab to set it as active for test management
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          resetLabForm();
                          setShowLabForm(true);
                        }}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" /> New Lab
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                      {labs.length === 0 && (
                        <div className="col-span-3 border border-dashed border-gray-200 rounded-xl py-12 text-center">
                          <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-gray-500">
                            No labs yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Create your first lab to start receiving bookings
                          </p>
                        </div>
                      )}
                      {labs.map((lab) => (
                        <motion.div
                          key={lab.id}
                          whileHover={{ y: -2 }}
                          onClick={() => setSelectedLabId(lab.id)}
                          className={`rounded-xl border p-5 cursor-pointer transition-all ${
                            selectedLabId === lab.id
                              ? "border-emerald-400 bg-emerald-50/60 shadow-md shadow-emerald-100"
                              : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedLabId === lab.id ? "bg-emerald-500" : "bg-gray-100"}`}
                              >
                                <Building2
                                  className={`w-5 h-5 ${selectedLabId === lab.id ? "text-white" : "text-gray-500"}`}
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                  {lab.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {lab.city}, {lab.state}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingLab(lab);
                              }}
                              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-emerald-600 hover:border-emerald-300 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <InfoRow icon={MapPin} text={lab.address} />
                            <InfoRow icon={Phone} text={lab.contactNumber} />
                            <InfoRow
                              icon={Clock3}
                              text={`${lab.slotCapacityOnline} online slots`}
                            />
                          </div>
                          {selectedLabId === lab.id && (
                            <div className="mt-3 pt-3 border-t border-emerald-200">
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCheck className="w-3 h-3" /> Active lab
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {showLabForm && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                      >
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">
                              {editingLabId ? "Edit Lab" : "Create New Lab"}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Keep your profile accurate so patients can find
                              you
                            </p>
                          </div>
                          <button
                            onClick={resetLabForm}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <form onSubmit={submitLabForm} className="p-6">
                          <div className="grid sm:grid-cols-2 gap-4 mb-4">
                            <Field
                              label="Lab name"
                              value={labForm.name}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, name: v }))
                              }
                            />
                            <Field
                              label="Contact number"
                              value={labForm.contactNumber}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, contactNumber: v }))
                              }
                            />
                            <Field
                              label="City"
                              value={labForm.city}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, city: v }))
                              }
                            />
                            <Field
                              label="State"
                              value={labForm.state}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, state: v }))
                              }
                            />
                            <Field
                              label="Latitude"
                              value={labForm.latitude}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, latitude: v }))
                              }
                              type="number"
                              step="any"
                            />
                            <Field
                              label="Longitude"
                              value={labForm.longitude}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, longitude: v }))
                              }
                              type="number"
                              step="any"
                            />
                            <Field
                              label="Online slots"
                              value={labForm.slotCapacityOnline}
                              onChange={(v) =>
                                setLabForm((p) => ({
                                  ...p,
                                  slotCapacityOnline: v,
                                }))
                              }
                              type="number"
                            />
                            <Field
                              label="Address"
                              value={labForm.address}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, address: v }))
                              }
                            />
                            <TimePicker
                              label="Opening Time"
                              value={labForm.openingTime}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, openingTime: v }))
                              }
                            />
                            <TimePicker
                              label="Closing Time"
                              value={labForm.closingTime}
                              onChange={(v) =>
                                setLabForm((p) => ({ ...p, closingTime: v }))
                              }
                            />
                          </div>
                          <div className="mb-5">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">
                              Description
                            </label>
                            <textarea
                              value={labForm.description}
                              onChange={(e) =>
                                setLabForm((p) => ({
                                  ...p,
                                  description: e.target.value,
                                }))
                              }
                              rows={3}
                              placeholder="What makes this lab trustworthy or convenient?"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors resize-none"
                            />
                          </div>
                          {labMessage && (
                            <Toast
                              msg={labMessage}
                              onClose={() => setLabMessage(null)}
                            />
                          )}
                          <div className="flex gap-3 mt-2">
                            <button
                              type="submit"
                              disabled={savingLab}
                              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
                            >
                              {savingLab ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              {savingLab
                                ? "Saving…"
                                : editingLabId
                                  ? "Update Lab"
                                  : "Create Lab"}
                            </button>
                            {editingLabId && (
                              <button
                                type="button"
                                onClick={resetLabForm}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── TESTS ── */}
              {activeView === "tests" && (
                <div className="space-y-6">
                  {!selectedLab ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
                      <Beaker className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-600">
                        No lab selected
                      </p>
                      <p className="text-xs text-gray-400 mt-1 mb-5">
                        Select or create a lab first to manage its test catalog
                      </p>
                      <button
                        onClick={() => setActiveView("labs")}
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mx-auto"
                      >
                        Go to Labs <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                          <div>
                            <h2 className="text-sm font-bold text-gray-900">
                              Add Test — {selectedLab.name}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Add diagnostic tests and set pricing
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                            <Beaker className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-xs font-bold text-gray-700">
                              {selectedLabTests.length} listed
                            </span>
                          </div>
                        </div>
                        <form onSubmit={submitTestForm} className="p-6">
                          <div className="grid sm:grid-cols-3 gap-4 items-end mb-4">
                            <div className="sm:col-span-1">
                              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Test
                              </label>
                              <select
                                value={testForm.testId}
                                onChange={(e) =>
                                  setTestForm((p) => ({
                                    ...p,
                                    testId: e.target.value,
                                  }))
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                              >
                                <option value="">Select a test…</option>
                                {availableTests.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Price (₹)
                              </label>
                              <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                  type="number"
                                  value={testForm.price}
                                  onChange={(e) =>
                                    setTestForm((p) => ({
                                      ...p,
                                      price: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g. 499"
                                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={
                                savingTest ||
                                !testForm.testId ||
                                !testForm.price
                              }
                              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold h-10 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
                            >
                              {savingTest ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                              {savingTest ? "Adding…" : "Add Test"}
                            </button>
                          </div>
                          <label className="inline-flex items-center gap-2.5 cursor-pointer group">
                            <div
                              onClick={() =>
                                setTestForm((p) => ({
                                  ...p,
                                  homeCollectionAvailable:
                                    !p.homeCollectionAvailable,
                                }))
                              }
                              className={`relative w-9 h-5 rounded-full transition-colors ${testForm.homeCollectionAvailable ? "bg-emerald-500" : "bg-gray-200"}`}
                            >
                              <div
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${testForm.homeCollectionAvailable ? "translate-x-4" : ""}`}
                              />
                            </div>
                            <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                              Home collection available
                            </span>
                          </label>
                          {testMessage && (
                            <div className="mt-4">
                              <Toast
                                msg={testMessage}
                                onClose={() => setTestMessage(null)}
                              />
                            </div>
                          )}
                        </form>
                      </div>

                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                          <h2 className="text-sm font-bold text-gray-900">
                            Current Test Catalog
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            All tests currently listed for {selectedLab.name}
                          </p>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {testsLoading && (
                            <div className="py-10 flex items-center justify-center gap-2 text-sm text-gray-400">
                              <Loader2 className="w-4 h-4 animate-spin" />{" "}
                              Loading tests…
                            </div>
                          )}
                          {!testsLoading && selectedLabTests.length === 0 && (
                            <div className="py-12 text-center">
                              <TestTube2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm font-semibold text-gray-500">
                                No tests added yet
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Add tests above to populate the catalog
                              </p>
                            </div>
                          )}
                          {!testsLoading &&
                            selectedLabTests.map((test) => (
                              <div
                                key={test.id}
                                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FlaskConical className="w-4 h-4 text-teal-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                      {test.name}
                                    </p>
                                    {test.description && (
                                      <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {test.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {test.homeCollectionAvailable && (
                                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                      Home
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                                    <IndianRupee className="w-3.5 h-3.5" />
                                    {test.price}
                                  </div>
                                  <button
                                    onClick={() => deleteTest(test.id)}
                                    disabled={deletingTestId === test.id}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-400 hover:text-red-600 disabled:opacity-50 transition-all"
                                  >
                                    {deletingTestId === test.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── BOOKINGS ── */}
              {activeView === "bookings" && (
                <div className="space-y-5">
                  {/* Stat cards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                        Total
                      </p>
                      <p className="text-2xl font-black text-gray-900 mt-1">
                        {bookingStats.total}
                      </p>
                    </div>
                    <div className="bg-white border border-amber-200/60 rounded-2xl p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide">
                        Pending
                      </p>
                      <p className="text-2xl font-black text-amber-600 mt-1">
                        {bookingStats.pending}
                      </p>
                    </div>
                    <div className="bg-white border border-blue-200/60 rounded-2xl p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                        Confirmed
                      </p>
                      <p className="text-2xl font-black text-blue-700 mt-1">
                        {bookingStats.confirmed}
                      </p>
                    </div>
                    <div className="bg-white border border-emerald-200/60 rounded-2xl p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                        Completed
                      </p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">
                        {bookingStats.completed}
                      </p>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex flex-col lg:flex-row gap-3">
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search patient, lab, or test…"
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors"
                      />
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={labFilter}
                          onChange={(e) =>
                            setLabFilter(
                              e.target.value === "ALL"
                                ? "ALL"
                                : Number(e.target.value),
                            )
                          }
                          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-400"
                        >
                          {labFilterOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-emerald-400"
                        >
                          <option value="recent">Newest first</option>
                          <option value="oldest">Oldest first</option>
                        </select>
                      </div>
                    </div>
                    {/* Status pill filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {["ALL", ...BOOKING_STATUSES].map((s) => {
                        const count =
                          s === "ALL"
                            ? bookings.length
                            : bookings.filter((b) => b.status === s).length;
                        const active = statusFilter === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`flex items-center gap-1.5 text-[11px] font-bold rounded-full px-3 py-1.5 border transition-all ${
                              active
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-200"
                            }`}
                          >
                            {s !== "ALL" && (
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: STATUS_CONFIG[s]?.dot }}
                              />
                            )}
                            {s}
                            <span className="text-gray-400 font-bold">
                              ({count})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {bookingMessage && (
                    <Toast
                      msg={bookingMessage}
                      onClose={() => setBookingMessage(null)}
                    />
                  )}

                  {filteredBookings.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
                      <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-600">
                        No bookings match your filters
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Adjust filters or clear search to see more
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {filteredBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        isUpdating={updatingBookingId === booking.id}
                        cancelReason={cancelReasons[booking.id] || ""}
                        cancelOpen={!!cancelOpen[booking.id]}
                        onCancelReasonChange={(val) =>
                          setCancelReasons((p) => ({ ...p, [booking.id]: val }))
                        }
                        onToggleCancelInput={() =>
                          setCancelOpen((p) => ({
                            ...p,
                            [booking.id]: !p[booking.id],
                          }))
                        }
                        onApplyStatus={applyStatus}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── BookingCard ────────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  isUpdating,
  cancelReason,
  cancelOpen,
  onCancelReasonChange,
  onToggleCancelInput,
  onApplyStatus,
}) {
  const cfg = STATUS_CONFIG[booking.status] || {};
  const tests = booking.bookingTests || [];
  const isTerminal =
    booking.status === "COMPLETED" || booking.status === "CANCELLED";
  const showReports =
    booking.status === "CONFIRMED" || booking.status === "COMPLETED";

  // Appointment date comes from bookingDate (the actual booked appointment LocalDateTime)
  const appointmentDate = formatDate(booking.bookingDate);
  // "Booked on" comes from createdAt
  const bookedOn = formatDate(booking.createdAt);
  const appointmentTime = formatTime(booking.timeSlot);

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* ── Card header ── */}
      <div
        className="px-5 py-3 flex items-center gap-3 flex-wrap"
        style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}
      >
        <BookingStatusPill status={booking.status} />
        <span className="text-xs font-bold text-gray-500">#{booking.id}</span>
        <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5 text-gray-400" />
          {booking.lab?.name || "Lab"}
        </span>

        {/* Appointment date + time — the actual scheduled slot */}
        <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-white/70 border border-gray-200 rounded-lg px-2 py-0.5 ml-auto">
          <CalendarCheck className="w-3 h-3 text-gray-400" />
          {appointmentDate} · {appointmentTime}
        </span>
      </div>

      {/* ── Card body ── */}
      <div className="px-5 py-4 space-y-4">
        {/* Patient + booked-on row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserRound className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {booking.user?.name || "Patient"}
              </p>
              <p className="text-[11px] text-gray-400 font-semibold">
                Booked on {bookedOn}
              </p>
            </div>
          </div>
          {booking.cancellationReason && (
            <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2 max-w-xs">
              <Ban className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-red-600 leading-snug">
                {booking.cancellationReason}
              </p>
            </div>
          )}
        </div>

        {/* Tests table */}
        {tests.length > 0 && (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {tests.length} test{tests.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Price
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {tests.map((bt) => (
                <div
                  key={bt.id}
                  className="px-3 py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {bt.name || "Test"}
                    </p>
                  </div>
                  {bt.price != null && (
                    <span className="flex items-center gap-0.5 text-sm font-bold text-emerald-700 flex-shrink-0">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {bt.price}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Status actions (inline buttons only) ── */}
        {!isTerminal && (
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Actions
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {/* PENDING → CONFIRMED */}
              {booking.status === "PENDING" && (
                <button
                  onClick={() => onApplyStatus(booking.id, "CONFIRMED")}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold disabled:opacity-50 transition-all"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CalendarCheck className="w-3.5 h-3.5" />
                  )}
                  Confirm booking
                </button>
              )}

              {/* CONFIRMED → COMPLETED */}
              {booking.status === "CONFIRMED" && (
                <button
                  onClick={() => onApplyStatus(booking.id, "COMPLETED")}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold disabled:opacity-50 transition-all"
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CircleCheck className="w-3.5 h-3.5" />
                  )}
                  Mark completed
                </button>
              )}

              {/* Cancel toggle */}
              <button
                onClick={onToggleCancelInput}
                disabled={isUpdating}
                className={`flex items-center gap-1.5 h-9 px-4 rounded-xl border text-xs font-bold disabled:opacity-50 transition-all ${
                  cancelOpen
                    ? "bg-red-100 border-red-300 text-red-700"
                    : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                {cancelOpen ? "Hide cancel" : "Cancel booking"}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${cancelOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {/* Inline cancel reason */}
            <AnimatePresence>
              {cancelOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 pt-1">
                    <input
                      value={cancelReason}
                      onChange={(e) => onCancelReasonChange(e.target.value)}
                      placeholder="Reason for cancellation (required)…"
                      className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm outline-none focus:border-red-400 focus:bg-white transition-colors placeholder:text-red-300"
                    />
                    <button
                      onClick={() =>
                        onApplyStatus(booking.id, "CANCELLED", cancelReason)
                      }
                      disabled={isUpdating || !cancelReason.trim()}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold transition-colors flex-shrink-0"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      Confirm cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Terminal state badge */}
        {isTerminal && (
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-xs font-bold ${
              booking.status === "COMPLETED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
          >
            {booking.status === "COMPLETED" ? (
              <>
                <CircleCheck className="w-3.5 h-3.5" /> Booking completed — no
                further changes allowed
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" /> Booking cancelled — status
                locked
              </>
            )}
          </div>
        )}

        {/* ── Report Panel: CONFIRMED or COMPLETED ── */}
        {showReports && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Reports
            </p>
            {tests.map((bt) => (
              <ReportPanel key={bt.id} bookingTest={bt} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const STAT_ACCENTS = {
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    value: "text-emerald-700",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    icon: "text-teal-600",
    value: "text-teal-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    value: "text-blue-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    value: "text-amber-700",
  },
};

function StatCard({ icon: Icon, label, value, accent = "emerald" }) {
  const a = STAT_ACCENTS[accent];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 ${a.bg} border ${a.border} rounded-xl flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-5 h-5 ${a.icon}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      <span className="text-xs text-gray-600 truncate">{text}</span>
    </div>
  );
}

function BookingStatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    dot: "#9ca3af",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {status}
    </span>
  );
}

function Field({ label, value, onChange, type = "text", step }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors"
      />
    </div>
  );
}

function Toast({ msg, onClose }) {
  const isSuccess = msg.type === "success";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 border text-sm font-semibold ${
        isSuccess
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="flex-1">{msg.text}</span>
      <button
        onClick={onClose}
        className="opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function ReportPanel({ bookingTest }) {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingReportId, setDeletingReportId] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  const testName = bookingTest?.name || `Test #${bookingTest?.id}`;

  const fetchReports = async () => {
    try {
      const res = await api.get(`/booking/${bookingTest.id}/reports`);
      setReports(res.data);
    } catch {
      // silently ignore
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [bookingTest.id]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      await api.post(`/booking/${bookingTest.id}/reports/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      setMessage({ type: "success", text: "Report uploaded." });
      await fetchReports();
    } catch (err) {
      const data = err?.response?.data;
      setMessage({
        type: "error",
        text:
          typeof data === "string" ? data : data?.message || "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    setDeletingReportId(reportId);
    try {
      await api.delete(`/booking/reports/${reportId}`);
      setMessage({ type: "success", text: "Report deleted." });
      await fetchReports();
    } catch (err) {
      const data = err?.response?.data;
      setMessage({
        type: "error",
        text:
          typeof data === "string" ? data : data?.message || "Delete failed.",
      });
    } finally {
      setDeletingReportId(null);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3 space-y-2.5">
      {/* Test header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-violet-50 border border-violet-200 rounded-md flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-3.5 h-3.5 text-violet-500" />
        </div>
        <span className="text-xs font-bold text-gray-800 flex-1 truncate">
          {testName}
        </span>
        {!loadingReports && (
          <span className="text-[10px] font-semibold text-gray-400">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Report list */}
      {loadingReports ? (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading…
        </div>
      ) : reports.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {reports.map((r, i) => (
            <div
              key={r.id ?? i}
              className="inline-flex items-center gap-0 bg-white border border-blue-200 rounded-lg overflow-hidden shadow-sm"
            >
              <a
                href={r.reportURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 transition-colors"
              >
                <FileText className="w-3 h-3" />
                Report {i + 1}
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <button
                onClick={() => handleDelete(r.id)}
                disabled={deletingReportId === r.id}
                className="px-1.5 py-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors border-l border-blue-100"
              >
                {deletingReportId === r.id ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <X className="w-2.5 h-2.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400">No reports yet.</p>
      )}

      {/* Upload row */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="cursor-pointer">
          <span className="text-[11px] font-semibold text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors inline-block">
            {file ? file.name : "Choose file…"}
          </span>
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files[0] || null);
              setMessage(null);
            }}
          />
        </label>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
          )}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

function TimePicker({ label, value, onChange }) {
  const normalize = (v) => {
    if (!v) return "";
    if (Array.isArray(v))
      return `${String(v[0]).padStart(2, "0")}:${String(v[1]).padStart(2, "0")}`;
    return v.substring(0, 5);
  };

  const toparts = (v) => {
    const str = normalize(v);
    if (!str) return { h: "", m: "", ampm: "AM" };
    const [hStr, mStr] = str.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr?.padStart(2, "0") ?? "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return { h: String(h), m, ampm };
  };

  const initial = toparts(value);
  const [h, setH] = useState(initial.h);
  const [m, setM] = useState(initial.m);
  const [ampm, setAmpm] = useState(initial.ampm);

  useEffect(() => {
    const parsed = toparts(value);
    setH(parsed.h);
    setM(parsed.m);
    setAmpm(parsed.ampm);
  }, [normalize(value)]);

  const emit = (nh, nm, na) => {
    if (!nh || !nm) return;
    let hour = parseInt(nh, 10);
    if (na === "PM" && hour !== 12) hour += 12;
    if (na === "AM" && hour === 12) hour = 0;
    onChange([hour, parseInt(nm, 10)]);
  };

  const selectCls =
    "rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors cursor-pointer";

  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          value={h}
          onChange={(e) => {
            setH(e.target.value);
            emit(e.target.value, m, ampm);
          }}
          className={`${selectCls} w-20`}
        >
          <option value="">hh</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {String(n).padStart(2, "0")}
            </option>
          ))}
        </select>
        <select
          value={m}
          onChange={(e) => {
            setM(e.target.value);
            emit(h, e.target.value, ampm);
          }}
          className={`${selectCls} w-20`}
        >
          <option value="">mm</option>
          {["00", "15", "30", "45"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={ampm}
          onChange={(e) => {
            setAmpm(e.target.value);
            emit(h, m, e.target.value);
          }}
          className={`${selectCls} w-20`}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}

export default OwnerDashboard;
