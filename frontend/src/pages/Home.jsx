import { Skeleton } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Building2,
  Phone,
  Navigation,
  Shield,
  X,
  List,
  Layers,
  ChevronRight,
  Clock,
  TestTube2,
  SlidersHorizontal,
  CalendarDays,
  IndianRupee,
  FlaskConical,
  Loader2,
  Download,
  ExternalLink,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useEffect, useState } from "react";
import LabsMap from "../components/LabsMap";
import { useAuth } from "../context/AuthContext";

const QUICK_FILTERS = ["CBC", "Thyroid", "Diabetes", "Lipid", "Urine", "X-Ray"];

const BOOKING_STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dot: "#3b82f6",
  },
  COMPLETED: {
    label: "Completed",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dot: "#10b981",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    dot: "#ef4444",
  },
};

function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  // console.log("user: ", user)

  const [nearbyLabs, setNearbyLabs] = useState([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [searchTest, setSearchTest] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedLab, setSelectedLab] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  // sidebar tab: "labs" | "bookings"
  const [sidebarTab, setSidebarTab] = useState("labs");

  // bookings state
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  const getNearbyLabs = async (lat, lng) => {
    try {
      setIsLoadingLabs(true);
      const response = await api.get(
        `/labs/nearby?lat=${lat}&lng=${lng}&radius=1000`,
      );
      setNearbyLabs(response.data);
    } catch (error) {
      console.error("Error fetching nearby labs:", error);
      setLocationError("Failed to fetch nearby labs");
    } finally {
      setIsLoadingLabs(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      setIsLoadingLabs(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        getNearbyLabs(lat, lng);
      },
      (error) => {
        console.error(error);
        setLocationError("Please enable location access to find nearby labs");
        setIsLoadingLabs(false);
      },
    );
  };

  const handleSearch = async () => {
    if (!searchTest && !searchLocation) return;
    try {
      setIsSearching(true);
      setLocationError("");
      const response = await api.get(
        `/labs/search?test=${searchTest}&&location=${searchLocation}`,
      );
      setNearbyLabs(response.data);
    } catch (error) {
      console.error("Error searching labs:", error);
      setLocationError("Failed to search labs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickFilter = (tag) => {
    setActiveFilter(activeFilter === tag ? null : tag);
    setSearchTest(activeFilter === tag ? "" : tag);
  };

  const fetchRecentBookings = async () => {
    if (!isAuthenticated) return;

    if (user.role === "LAB_OWNER") {
      navigate("/owner/dashboard");
      return;
    }

    try {
      setIsLoadingBookings(true);
      setBookingsError("");
      const res = await api.get("/booking/me");
      // Most recent 6 only
      setRecentBookings(res.data.slice(0, 6));
      console.log(res);
    } catch (err) {
      setBookingsError("Failed to load bookings.");
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleBookingsTab = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user.role === "LAB_OWNER") {
      navigate("/owner/dashboard");
      return;
    }
    setSidebarTab("bookings");
    setIsSidebarOpen(true);
    // Only fetch if we haven't yet
    if (recentBookings.length === 0 && !isLoadingBookings) {
      fetchRecentBookings();
    }
  };

  const handleLabsTab = () => {
    setSidebarTab("labs");
    setIsSidebarOpen(true);
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <Navbar />

      <div className="h-full relative">
        {/* Full Screen Map */}
        <div className="absolute inset-0">
          <LabsMap
            userLocation={userLocation}
            labs={nearbyLabs}
            selectedLab={selectedLab}
            className="h-full w-full rounded-none border-0"
          />
        </div>

        {/* ── Search Panel (Top-Left) ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="absolute top-20 left-5 z-30 w-[360px]"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Search inputs */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 h-11 border border-transparent focus-within:border-emerald-400 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  placeholder="Search tests, e.g. CBC, Thyroid…"
                  value={searchTest}
                  onChange={(e) => setSearchTest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {searchTest && (
                  <button onClick={() => setSearchTest("")}>
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 h-11 border border-transparent focus-within:border-emerald-400 focus-within:bg-white transition-all">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  placeholder="Area, city or pincode…"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {searchLocation && (
                  <button onClick={() => setSearchLocation("")}>
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={isSearching || (!searchTest && !searchLocation)}
                className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-emerald-500/30"
              >
                {isSearching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching…
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search Labs
                  </>
                )}
              </button>
            </div>

            {/* Divider + Quick tags */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Popular
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_FILTERS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleQuickFilter(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                      activeFilter === tag
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Sidebar Tab Pills (Top-Right, below navbar) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-20 right-5 z-30 flex items-center gap-1 bg-white rounded-xl shadow-lg border border-gray-100 p-1"
        >
          {/* Labs tab */}
          <button
            onClick={handleLabsTab}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-all ${
              isSidebarOpen && sidebarTab === "labs"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            {nearbyLabs.length} Labs
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200 flex-shrink-0" />

          {/* Bookings tab */}
          <button
            onClick={handleBookingsTab}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold transition-all relative ${
              isSidebarOpen && sidebarTab === "bookings"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {isAuthenticated
              ? isLoadingBookings
                ? "…"
                : `${recentBookings.length === 0 ? "" : recentBookings.length} Bookings`
              : "Bookings"}
            {/* Pending badge — only when tab is inactive */}
            {isAuthenticated &&
              !(isSidebarOpen && sidebarTab === "bookings") &&
              recentBookings.filter((b) => b.status === "PENDING").length >
                0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {recentBookings.filter((b) => b.status === "PENDING").length}
                </span>
              )}
          </button>

          {/* Close — only when sidebar is open */}
          {isSidebarOpen && (
            <>
              <div className="w-px h-4 bg-gray-200 flex-shrink-0" />
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </motion.div>

        {/* ── Stats Pill (Bottom-Left) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 left-5 z-30"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 leading-none">
                {nearbyLabs.length}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Labs found</p>
            </div>
          </div>
        </motion.div>

        {/* ── Map Controls (Bottom-Right) — shift left when sidebar open ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 z-30 flex flex-col gap-2"
          style={{
            right: isSidebarOpen ? "405px" : "20px",
            transition: "right 0.3s ease",
          }}
        >
          <button className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <Layers className="w-4.5 h-4.5 text-gray-600" />
          </button>
          <button
            onClick={getUserLocation}
            className="w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Go to my location"
          >
            <Navigation className="w-4.5 h-4.5 text-emerald-600" />
          </button>
        </motion.div>

        {/* ── Sidebar ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute top-[88px] right-5 z-20 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{ width: "380px", height: "calc(100% - 104px)" }}
            >
              {/* ── Sidebar header ── */}
              <div className="px-5 pt-4 pb-0 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center">
                      {sidebarTab === "labs" ? (
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {sidebarTab === "labs" ? "Nearby Labs" : "My Bookings"}
                      </p>
                      <p className="text-[11px] text-gray-400 leading-none mt-0.5">
                        {sidebarTab === "labs"
                          ? isLoadingLabs || isSearching
                            ? "Fetching…"
                            : `${nearbyLabs.length} near you`
                          : isLoadingBookings
                            ? "Fetching…"
                            : `${recentBookings.length} recent`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sidebarTab === "labs" && (
                      <button
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                        title="Filter"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    )}
                    {sidebarTab === "bookings" && (
                      <button
                        onClick={fetchRecentBookings}
                        disabled={isLoadingBookings}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
                        title="Refresh"
                      >
                        <Loader2
                          className={`w-3.5 h-3.5 text-gray-600 ${isLoadingBookings ? "animate-spin" : ""}`}
                        />
                      </button>
                    )}
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Underline tab switcher — both emerald when active */}
                <div className="flex -mb-px">
                  <button
                    onClick={() => setSidebarTab("labs")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      sidebarTab === "labs"
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Labs
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        sidebarTab === "labs"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {nearbyLabs.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSidebarTab("bookings");
                      if (recentBookings.length === 0 && !isLoadingBookings)
                        fetchRecentBookings();
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      sidebarTab === "bookings"
                        ? "border-emerald-500 text-emerald-600"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Bookings
                    {recentBookings.length > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          sidebarTab === "bookings"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {recentBookings.length}
                      </span>
                    )}
                    {recentBookings.filter((b) => b.status === "PENDING")
                      .length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* ── Tab content ── */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <AnimatePresence mode="wait">
                  {/* ── LABS TAB ── */}
                  {sidebarTab === "labs" && (
                    <motion.div
                      key="labs"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-2"
                    >
                      {(isLoadingLabs || isSearching) &&
                        [1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="rounded-2xl border border-gray-100 p-4 space-y-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <Skeleton className="w-3/4 h-4 rounded-lg" />
                                <Skeleton className="w-1/2 h-3 rounded-lg" />
                              </div>
                            </div>
                            <Skeleton className="w-full h-3 rounded-lg" />
                            <Skeleton className="w-2/3 h-3 rounded-lg" />
                          </div>
                        ))}

                      {!isLoadingLabs && !isSearching && locationError && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                            <MapPin className="w-7 h-7 text-orange-400" />
                          </div>
                          <h3 className="text-sm font-bold text-gray-800 mb-1">
                            Location needed
                          </h3>
                          <p className="text-xs text-gray-500 mb-5 max-w-[220px]">
                            {locationError}
                          </p>
                          <button
                            onClick={getUserLocation}
                            className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-600 transition-colors"
                          >
                            <Navigation className="w-4 h-4" /> Enable location
                          </button>
                        </div>
                      )}

                      {!isLoadingLabs &&
                        !isSearching &&
                        !locationError &&
                        nearbyLabs.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                              <Building2 className="w-7 h-7 text-gray-300" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">
                              No labs found
                            </h3>
                            <p className="text-xs text-gray-400">
                              Try a different test or location
                            </p>
                          </div>
                        )}

                      {!isLoadingLabs &&
                        !isSearching &&
                        !locationError &&
                        nearbyLabs.map((lab, idx) => (
                          <motion.div
                            key={lab.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => setSelectedLab(lab)}
                            className={`rounded-2xl border cursor-pointer transition-all duration-200 ${
                              selectedLab?.id === lab.id
                                ? "border-emerald-400 bg-emerald-50/60 shadow-md"
                                : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm"
                            }`}
                          >
                            <div className="p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedLab?.id === lab.id ? "bg-emerald-500" : "bg-gray-100"}`}
                                >
                                  <Building2
                                    className={`w-5 h-5 ${selectedLab?.id === lab.id ? "text-white" : "text-gray-500"}`}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
                                    {lab.name}
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {lab.city}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                                  <Shield className="w-3 h-3" /> Verified
                                </div>
                              </div>
                              <div className="flex items-start gap-2 mb-2.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                  {lab.address}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 mb-3">
                                {lab.contactNumber && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Phone className="w-3 h-3" />
                                    <span>{lab.contactNumber}</span>
                                  </div>
                                )}
                                {lab.slotCapacityOnline > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      {lab.slotCapacityOnline} slots open
                                    </span>
                                  </div>
                                )}
                              </div>
                              <Link
                                to={`/lab/${lab.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="w-full h-8 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                                  View details{" "}
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                              </Link>
                            </div>
                          </motion.div>
                        ))}
                    </motion.div>
                  )}

                  {/* ── BOOKINGS TAB ── */}
                  {sidebarTab === "bookings" && (
                    <motion.div
                      key="bookings"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-2"
                    >
                      {/* Loading skeletons */}
                      {isLoadingBookings &&
                        [1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="rounded-2xl border border-gray-100 p-4 space-y-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <Skeleton className="w-2/3 h-4 rounded-lg" />
                                <Skeleton className="w-1/3 h-3 rounded-lg" />
                              </div>
                              <Skeleton className="w-16 h-5 rounded-full flex-shrink-0" />
                            </div>
                            <Skeleton className="w-full h-3 rounded-lg" />
                            <Skeleton className="w-1/2 h-3 rounded-lg" />
                          </div>
                        ))}

                      {/* Error */}
                      {!isLoadingBookings && bookingsError && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
                            <CalendarDays className="w-6 h-6 text-red-400" />
                          </div>
                          <p className="text-sm font-bold text-gray-700 mb-1">
                            Couldn't load bookings
                          </p>
                          <p className="text-xs text-gray-400 mb-4">
                            {bookingsError}
                          </p>
                          <button
                            onClick={fetchRecentBookings}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                          >
                            Try again
                          </button>
                        </div>
                      )}

                      {/* Empty */}
                      {!isLoadingBookings &&
                        !bookingsError &&
                        recentBookings.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-4">
                              <CalendarDays className="w-7 h-7 text-emerald-400" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-700 mb-1">
                              No bookings yet
                            </h3>
                            <p className="text-xs text-gray-400 mb-4 max-w-[180px]">
                              Find a lab and book your first test
                            </p>
                            <button
                              onClick={() => setSidebarTab("labs")}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <Building2 className="w-3.5 h-3.5" /> Browse labs
                            </button>
                          </div>
                        )}

                      {/* Booking cards */}
                      {!isLoadingBookings &&
                        !bookingsError &&
                        recentBookings.map((booking, idx) => {
                          const cfg =
                            BOOKING_STATUS_CONFIG[booking.status] || {};
                          const totalPrice =
                            booking.bookingTests?.reduce(
                              (sum, bt) => sum + (bt.price ?? 0),
                              0,
                            ) ?? 0;
                          const testNames =
                            booking.bookingTests
                              ?.map((bt) => bt.name)
                              .filter(Boolean) ?? [];
                          // console.log("Total price: ", booking.bookingTests);
                          console.log("Test names: ", testNames);
                          return (
                            <motion.div
                              key={booking.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.045 }}
                              className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-sm transition-shadow"
                            >
                              {/* Left-side status accent bar */}
                              <div className="flex min-w-0">
                                <div
                                  className="w-1 rounded-l-2xl flex-shrink-0"
                                  style={{ background: cfg.dot || "#e5e7eb" }}
                                />

                                <div className="flex-1 min-w-0 p-4">
                                  {/* Top row */}
                                  <div className="flex items-start gap-3 mb-2.5">
                                    <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                      <Building2 className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                                        {booking.lab?.name || "Lab"}
                                      </p>
                                      <p className="text-[11px] text-gray-400 mt-0.5">
                                        #{booking.id}
                                      </p>
                                    </div>
                                    <span
                                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border flex-shrink-0"
                                      style={{
                                        color: cfg.color,
                                        background: cfg.bg,
                                        borderColor: cfg.border,
                                      }}
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: cfg.dot }}
                                      />
                                      {cfg.label || booking.status}
                                    </span>
                                  </div>

                                  {/* Timeslot + price */}
                                  <div className="flex items-center gap-3 mb-2.5">
                                    {booking.timeSlot && (
                                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        {booking.timeSlot}
                                      </div>
                                    )}
                                    {totalPrice > 0 && (
                                      <div className="flex items-center gap-0.5 text-xs font-black text-gray-800 ml-auto">
                                        <IndianRupee className="w-3 h-3" />
                                        {totalPrice}
                                      </div>
                                    )}
                                  </div>

                                  {/* Test name chips */}
                                  {testNames.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {testNames.map((name, i) => (
                                        <span
                                          key={i}
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                                        >
                                          <FlaskConical className="w-2.5 h-2.5 text-gray-400" />
                                          {name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Reports — only for COMPLETED */}
                                  {booking.status === "COMPLETED" && (
                                    <BookingReportLinks
                                      bookingTests={booking.bookingTests}
                                    />
                                  )}

                                  {/* Footer: Details → /my-bookings | Book again → /lab/:id */}
                                  <div className="pt-2.5 border-t border-gray-50 flex items-center justify-between">
                                    <Link
                                      to="/my-bookings"
                                      className="text-[11px] font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                                    >
                                      <CalendarDays className="w-3 h-3" />{" "}
                                      Details
                                    </Link>
                                    {booking.lab?.id && (
                                      <Link
                                        to={`/lab/${booking.lab.id}`}
                                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                                      >
                                        Book again{" "}
                                        <ChevronRight className="w-3 h-3" />
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                      {/* See all */}
                      {!isLoadingBookings &&
                        !bookingsError &&
                        recentBookings.length > 0 && (
                          <Link
                            to="/my-bookings"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 text-xs font-bold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                          >
                            <CalendarDays className="w-3.5 h-3.5" />
                            View all bookings
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── BookingReportLinks — lazy fetches reports per bookingTest ─────────────────

function BookingReportLinks({ bookingTests }) {
  const [reportMap, setReportMap] = useState({});
  const [loadingIds, setLoadingIds] = useState(new Set());
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (fetched || !bookingTests?.length) return;
    setFetched(true);
    bookingTests.forEach((bt) => {
      setLoadingIds((prev) => new Set([...prev, bt.id]));
      api
        .get(`/booking/${bt.id}/reports`)
        .then((r) => setReportMap((prev) => ({ ...prev, [bt.id]: r.data })))
        .catch(() => setReportMap((prev) => ({ ...prev, [bt.id]: [] })))
        .finally(() =>
          setLoadingIds((prev) => {
            const n = new Set(prev);
            n.delete(bt.id);
            return n;
          }),
        );
    });
  }, [fetched, bookingTests]);

  const allReports = Object.values(reportMap).flat();
  const isLoading = loadingIds.size > 0;

  if (isLoading)
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2.5">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading reports…
      </div>
    );

  if (allReports.length === 0)
    return (
      <div className="text-[11px] text-gray-400 italic mb-2.5">
        No reports yet
      </div>
    );

  return (
    <div className="flex flex-wrap gap-1.5 mb-2.5">
      {allReports.map((r, i) => (
        <a
          key={r.id ?? i}
          href={r.reportURI}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
        >
          <Download className="w-2.5 h-2.5" />
          Report {allReports.length > 1 ? i + 1 : ""}
          <ExternalLink className="w-2 h-2 opacity-60" />
        </a>
      ))}
    </div>
  );
}

export default Home;
