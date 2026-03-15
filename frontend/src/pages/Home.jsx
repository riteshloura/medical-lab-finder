import { Button, Input, Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Search, Building2, Phone, Navigation,
  Shield, X, List, Layers, ChevronRight,
  Clock, Star, TestTube2, SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useEffect, useState } from "react";
import LabsMap from "../components/LabsMap";

const QUICK_FILTERS = ["CBC", "Thyroid", "Diabetes", "Lipid", "Urine", "X-Ray"];

function Home() {
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

  const getNearbyLabs = async (lat, lng) => {
    try {
      setIsLoadingLabs(true);
      const response = await api.get(`/labs/nearby?lat=${lat}&lng=${lng}&radius=1000`);
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
      }
    );
  };

  const handleSearch = async () => {
    if (!searchTest && !searchLocation) return;
    try {
      setIsSearching(true);
      setLocationError("");
      const response = await api.get(`/labs/search?test=${searchTest}&&location=${searchLocation}`);
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
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Popular</span>
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

        {/* ── Sidebar Toggle (Top-Right, below navbar) ── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-20 right-5 z-30 bg-white rounded-xl shadow-lg px-3 h-10 flex items-center gap-2 border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
        >
          <List className="w-4 h-4" />
          {isSidebarOpen ? "Hide list" : `${nearbyLabs.length} labs`}
          <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarOpen ? "rotate-0" : "rotate-180"}`} />
        </motion.button>

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
              <p className="text-xl font-bold text-gray-900 leading-none">{nearbyLabs.length}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Labs found</p>
            </div>
          </div>
        </motion.div>

        {/* ── Map Controls (Bottom-Right) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-6 right-5 z-30 flex flex-col gap-2"
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

        {/* ── Labs Sidebar ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="absolute top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-20 flex flex-col"
            >
              {/* Sidebar header */}
              <div className="px-5 pt-20 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Nearby Labs</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isLoadingLabs || isSearching
                        ? "Fetching labs…"
                        : `${nearbyLabs.length} result${nearbyLabs.length !== 1 ? "s" : ""} near you`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">

                {/* Loading skeletons */}
                {(isLoadingLabs || isSearching) &&
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 p-4 space-y-2.5">
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

                {/* Location error */}
                {!isLoadingLabs && !isSearching && locationError && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                      <MapPin className="w-7 h-7 text-orange-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 mb-1">Location needed</h3>
                    <p className="text-xs text-gray-500 mb-5 max-w-[220px]">{locationError}</p>
                    <button
                      onClick={getUserLocation}
                      className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-600 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Enable location
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {!isLoadingLabs && !isSearching && !locationError && nearbyLabs.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                      <Building2 className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 mb-1">No labs found</h3>
                    <p className="text-xs text-gray-400">Try a different test or location</p>
                  </div>
                )}

                {/* Lab cards */}
                {!isLoadingLabs && !isSearching && !locationError &&
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
                        {/* Top row */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            selectedLab?.id === lab.id
                              ? "bg-emerald-500"
                              : "bg-gray-100"
                          }`}>
                            <Building2 className={`w-5 h-5 ${selectedLab?.id === lab.id ? "text-white" : "text-gray-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{lab.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{lab.city}</p>
                          </div>
                          {/* Verified badge */}
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-semibold px-2 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                            <Shield className="w-3 h-3" />
                            Verified
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-2 mb-2.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{lab.address}</p>
                        </div>

                        {/* Meta row */}
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
                              <span>{lab.slotCapacityOnline} slots open</span>
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        <Link to={`/lab/${lab.id}`} onClick={(e) => e.stopPropagation()}>
                          <div className="w-full h-8 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors">
                            View details
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Home;