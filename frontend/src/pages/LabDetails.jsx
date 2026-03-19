import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Clock,
  Shield,
  TestTube2,
  Star,
  Search,
  ChevronRight,
  AlertCircle,
  FlaskConical,
  IndianRupee,
  Tag,
  CalendarCheck,
  CalendarDays,
  ShoppingCart,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  Timer,
  Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

/* ─────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────── */
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function LabDetails() {
  const { labId } = useParams();
  const navigate = useNavigate();

  /* lab + tests state */
  const [lab, setLab] = useState(null);
  const [tests, setTests] = useState([]);
  const [isLoadingLab, setIsLoadingLab] = useState(true);
  const [isLoadingTests, setIsLoadingTests] = useState(true);
  const [labError, setLabError] = useState("");
  const [testsError, setTestsError] = useState("");

  /* filter state */
  const [searchTest, setSearchTest] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  /* cart state */
  const [cart, setCart] = useState([]); // array of test objects
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* booking state */
  const [timeSlot, setTimeSlot] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  /* ── fetch lab ── */
  useEffect(() => {
    const fetchLab = async () => {
      try {
        setIsLoadingLab(true);
        const res = await api.get(`/labs/${labId}`);
        setLab(res.data);
      } catch (err) {
        console.error("Error fetching lab:", err);
        setLabError("Could not load lab details.");
      } finally {
        setIsLoadingLab(false);
      }
    };
    fetchLab();
  }, [labId]);

  /* ── fetch tests ── */
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoadingTests(true);
        const res = await api.get(`/labs/${labId}/tests`);
        setTests(res.data);
      } catch (err) {
        console.error("Error fetching tests:", err);
        setTestsError("Could not load tests for this lab.");
      } finally {
        setIsLoadingTests(false);
      }
    };
    fetchTests();
  }, [labId]);

  /* ── cart helpers ── */
  // Use object-reference as fallback when id is absent (prevents undefined === undefined matching all)
  const sameTest = (a, b) => (a.id != null ? a.id === b.id : a === b);

  const toggleCart = useCallback((test) => {
    setCart((prev) =>
      prev.find((t) => sameTest(t, test))
        ? prev.filter((t) => !sameTest(t, test))
        : [...prev, test]
    );
  }, []);

  const removeFromCart = (test) =>
    setCart((prev) => prev.filter((t) => !sameTest(t, test)));

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, t) => sum + (t.price ?? 0), 0);
  const isInCart = (test) => cart.some((t) => sameTest(t, test));

  /* ── submit booking ── */
  const handleBooking = async () => {
    if (!timeSlot) {
      setBookingError("Please select a time slot.");
      return;
    }
    if (cart.length === 0) {
      setBookingError("Please add at least one test.");
      return;
    }
    try {
      setIsBooking(true);
      setBookingError("");
      // Java LocalTime expects "HH:MM:SS"
      const formattedTime = timeSlot.length === 5 ? `${timeSlot}:00` : timeSlot;
      await api.post(`/labs/${labId}/booking`, {
        testIds: cart.map((t) => t.id),
        timeSlot: formattedTime,
      });
      setBookingSuccess(true);
      setCart([]);
    } catch (err) {
      console.error("Booking failed:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Booking failed. Please try again.";
      setBookingError(typeof msg === "string" ? msg : "Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setBookingError("");
    if (bookingSuccess) {
      setBookingSuccess(false);
      setTimeSlot("");
    }
  };

  /* ── filters ── */
  const categories = ["All", ...new Set(tests.map((t) => t.category).filter(Boolean))];
  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      !searchTest ||
      t.name?.toLowerCase().includes(searchTest.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTest.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 pt-24 pb-32">

        {/* ── Back button ── */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to map
        </motion.button>

        {/* ── Lab Hero Card ── */}
        {isLoadingLab ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <Sk className="w-16 h-16 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk className="w-2/3 h-6" />
                <Sk className="w-1/3 h-4" />
              </div>
            </div>
            <Sk className="w-full h-4" />
            <Sk className="w-3/4 h-4" />
            <Sk className="w-28 h-10 rounded-xl" />
          </div>
        ) : labError ? (
          <ErrorState message={labError} onBack={() => navigate(-1)} />
        ) : lab ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8"
          >
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{lab.name}</h1>
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                      <Shield className="w-3 h-3" />Verified
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{lab.city}</p>
                </div>
                {lab.rating && (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-xl font-bold text-sm flex-shrink-0">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {lab.rating}
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {lab.address && <InfoRow icon={<MapPin className="w-4 h-4 text-emerald-500" />} label={lab.address} />}
                {lab.contactNumber && <InfoRow icon={<Phone className="w-4 h-4 text-emerald-500" />} label={lab.contactNumber} />}
                {lab.openingTime && lab.closingTime && (
                  <InfoRow icon={<Clock className="w-4 h-4 text-emerald-500" />} label={`${lab.openingTime} – ${lab.closingTime}`} />
                )}
                {lab.slotCapacityOnline > 0 && (
                  <InfoRow icon={<CalendarCheck className="w-4 h-4 text-emerald-500" />} label={`${lab.slotCapacityOnline} online slots available`} highlight />
                )}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-emerald-200 transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                Book Appointment
                {cart.length > 0 && (
                  <span className="ml-1 bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : null}

        {/* ── Tests Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Available Tests</h2>
                {!isLoadingTests && (
                  <p className="text-xs text-gray-400">{filteredTests.length} of {tests.length} tests</p>
                )}
              </div>
            </div>
          </div>

          {/* Search + category */}
          {!isLoadingTests && !testsError && tests.length > 0 && (
            <div className="space-y-3 mb-5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTest}
                  onChange={(e) => setSearchTest(e.target.value)}
                  placeholder="Search tests by name or description…"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all placeholder-gray-400"
                />
              </div>
              {categories.length > 2 && (
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${activeCategory === cat
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200"
                          : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skeleton */}
          {isLoadingTests && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Sk className="w-10 h-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2"><Sk className="w-3/4 h-4" /><Sk className="w-1/2 h-3" /></div>
                  </div>
                  <Sk className="w-full h-3" /><Sk className="w-2/3 h-3" />
                  <div className="flex justify-between pt-1"><Sk className="w-16 h-6 rounded-full" /><Sk className="w-20 h-8 rounded-xl" /></div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoadingTests && testsError && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Failed to load tests</p>
              <p className="text-xs text-gray-400">{testsError}</p>
            </div>
          )}

          {/* Empty */}
          {!isLoadingTests && !testsError && tests.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                <TestTube2 className="w-7 h-7 text-violet-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">No tests listed yet</p>
              <p className="text-xs text-gray-400">This lab hasn't added any tests.</p>
            </div>
          )}

          {/* No results */}
          {!isLoadingTests && !testsError && tests.length > 0 && filteredTests.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">No matching tests</p>
              <p className="text-xs text-gray-400 mt-0.5">Try a different search or category</p>
            </div>
          )}

          {/* Tests grid */}
          {!isLoadingTests && !testsError && filteredTests.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredTests.map((test, idx) => (
                  <TestCard
                    key={test.id ?? idx}
                    test={test}
                    idx={idx}
                    inCart={isInCart(test)}
                    onToggle={() => toggleCart(test)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Floating Cart Button ── */}
      <AnimatePresence>
        {cart.length > 0 && !isDrawerOpen && (
          <motion.button
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            onClick={() => setIsDrawerOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{cart.length} test{cart.length > 1 ? "s" : ""} selected</span>
            <span className="bg-white/20 text-white text-sm font-extrabold px-2 py-0.5 rounded-lg">
              ₹{totalPrice}
            </span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Booking Drawer ── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <CalendarCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Book Tests</h2>
                    <p className="text-xs text-gray-400">{lab?.name}</p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Success State */}
                {bookingSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-10"
                  >
                    {/* Animated checkmark ring */}
                    <div className="relative w-20 h-20 mb-5">
                      <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30" />
                      <div className="relative w-20 h-20 bg-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                      </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Your appointment has been booked at
                    </p>
                    <p className="text-sm font-bold text-emerald-600 mb-6">{lab?.name}</p>

                    {/* Info box */}
                    <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-left space-y-1">
                      <p className="text-xs font-bold text-emerald-700">What happens next?</p>
                      <p className="text-xs text-emerald-600">The lab will review and confirm your appointment. You can track the status in My Bookings.</p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-2.5 w-full">
                      <Link
                        to="/my-bookings"
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
                      >
                        <CalendarDays className="w-4 h-4" />
                        View My Bookings
                      </Link>
                      <button
                        onClick={closeDrawer}
                        className="w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Back to Lab
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Selected tests */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-700">Selected Tests</h3>
                        {cart.length > 0 && (
                          <button
                            onClick={clearCart}
                            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear all
                          </button>
                        )}
                      </div>

                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                          <TestTube2 className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="text-sm font-semibold text-gray-500">No tests selected</p>
                          <p className="text-xs text-gray-400 mt-0.5">Go back and click + on any test to add it</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cart.map((test) => (
                            <motion.div
                              key={test.id}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5"
                            >
                              <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FlaskConical className="w-3.5 h-3.5 text-violet-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{test.name}</p>
                                {test.price != null && (
                                  <p className="text-xs text-emerald-600 font-bold">₹{test.price}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeFromCart(test)}
                                className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors"
                              >
                                <X className="w-3 h-3 text-red-400" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Time slot picker */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Timer className="w-4 h-4 text-emerald-500" />
                        Select Time Slot
                      </label>
                      <input
                        type="time"
                        value={timeSlot}
                        onChange={(e) => { setTimeSlot(e.target.value); setBookingError(""); }}
                        className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-gray-800 font-semibold"
                      />
                      {lab?.openingTime && lab?.closingTime && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Lab hours: {lab.openingTime} – {lab.closingTime}
                        </p>
                      )}
                    </div>

                    {/* Error */}
                    {bookingError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {bookingError}
                      </motion.div>
                    )}

                    {/* Summary */}
                    {cart.length > 0 && (
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Tests</span>
                          <span className="font-semibold text-gray-800">{cart.length}</span>
                        </div>
                        {totalPrice > 0 && (
                          <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-gray-200 pt-2">
                            <span>Total</span>
                            <span className="text-emerald-600">₹{totalPrice}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer CTA */}
              {!bookingSuccess && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBooking}
                    disabled={isBooking || cart.length === 0 || !timeSlot}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-200 transition-all"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="w-5 h-5" />
                        Confirm Booking
                        {cart.length > 0 && totalPrice > 0 && (
                          <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-lg text-sm">₹{totalPrice}</span>
                        )}
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function InfoRow({ icon, label, highlight }) {
  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl ${highlight ? "bg-emerald-50 border border-emerald-100" : "bg-gray-50"}`}>
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <span className={`text-sm ${highlight ? "text-emerald-700 font-semibold" : "text-gray-600"} leading-relaxed`}>{label}</span>
    </div>
  );
}

function TestCard({ test, idx, inCart, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.04, duration: 0.3 }}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${inCart
          ? "border-emerald-400 shadow-md shadow-emerald-50"
          : "border-gray-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50"
        }`}
    >
      {/* Selected badge */}
      {inCart && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {/* Accent bar */}
      <div className={`h-0.5 bg-gradient-to-r transition-opacity ${inCart ? "from-emerald-400 to-teal-400 opacity-100" : "from-violet-400 to-indigo-400 opacity-0 group-hover:opacity-100"
        }`} />

      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${inCart ? "bg-emerald-50" : "bg-violet-50 group-hover:bg-violet-100"
            }`}>
            <FlaskConical className={`w-5 h-5 ${inCart ? "text-emerald-500" : "text-violet-500"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 pr-5">{test.name}</h3>
            {test.category && (
              <span className="inline-flex items-center gap-1 text-[10px] text-violet-500 font-semibold bg-violet-50 px-2 py-0.5 rounded-full mt-1">
                <Tag className="w-2.5 h-2.5" />
                {test.category}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {test.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{test.description}</p>
        )}

        {/* Footer: price + add/remove */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          {test.price != null ? (
            <div className="flex items-center gap-0.5 text-emerald-600 font-extrabold text-base">
              <IndianRupee className="w-3.5 h-3.5 stroke-[2.5]" />
              {test.price}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Price N/A</span>
          )}

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onToggle}
            className={`flex items-center gap-1 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${inCart
                ? "bg-red-400 hover:bg-red-500"
                : "bg-gray-900 hover:bg-emerald-500"
              }`}
          >
            {inCart ? (
              <><Minus className="w-3 h-3" /> Remove</>
            ) : (
              <><Plus className="w-3 h-3" /> Add</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ErrorState({ message, onBack }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center mb-8">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">Oops! Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go back
      </button>
    </div>
  );
}