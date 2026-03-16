import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

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
};

const bookingStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.message === "string") return data.message;
  return fallback;
};

function OwnerDashboard() {
  const [labs, setLabs] = useState([]);
  const [masterTests, setMasterTests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(null);
  const [selectedLabTests, setSelectedLabTests] = useState([]);
  const [labForm, setLabForm] = useState(emptyLabForm);
  const [editingLabId, setEditingLabId] = useState(null);
  const [testForm, setTestForm] = useState({
    testId: "",
    price: "",
    homeCollectionAvailable: false,
  });
  const [statusDrafts, setStatusDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [testsLoading, setTestsLoading] = useState(false);
  const [labMessage, setLabMessage] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [savingLab, setSavingLab] = useState(false);
  const [savingTest, setSavingTest] = useState(false);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  const selectedLab = useMemo(
    () => labs.find((lab) => lab.id === selectedLabId) || null,
    [labs, selectedLabId]
  );

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
      setSelectedLabId((current) => current ?? labsRes.data[0]?.id ?? null);
      setStatusDrafts(
        Object.fromEntries(
          bookingsRes.data.map((booking) => [booking.id, booking.status])
        )
      );
    } catch (error) {
      setBookingMessage(getErrorMessage(error, "Failed to load owner dashboard."));
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
      const response = await api.get(`/labs/${labId}/tests`);
      setSelectedLabTests(response.data);
    } catch (error) {
      setTestMessage(getErrorMessage(error, "Failed to load lab tests."));
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

  const resetLabForm = () => {
    setLabForm(emptyLabForm);
    setEditingLabId(null);
    setLabMessage("");
  };

  const startEditingLab = (lab) => {
    setEditingLabId(lab.id);
    setSelectedLabId(lab.id);
    setLabMessage("");
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
    });
  };

  const handleLabInput = (field, value) => {
    setLabForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitLabForm = async (event) => {
    event.preventDefault();
    setSavingLab(true);
    setLabMessage("");

    const payload = {
      ...labForm,
      latitude: Number(labForm.latitude),
      longitude: Number(labForm.longitude),
      slotCapacityOnline: Number(labForm.slotCapacityOnline),
    };

    try {
      if (editingLabId) {
        await api.put(`/labs/${editingLabId}`, payload);
        setLabMessage("Lab updated successfully.");
      } else {
        await api.post("/labs", payload);
        setLabMessage("Lab created successfully.");
      }

      await loadOwnerData();
      resetLabForm();
    } catch (error) {
      setLabMessage(getErrorMessage(error, "Failed to save lab."));
    } finally {
      setSavingLab(false);
    }
  };

  const submitTestForm = async (event) => {
    event.preventDefault();
    if (!selectedLabId) return;

    setSavingTest(true);
    setTestMessage("");

    try {
      await api.post(`/labs/${selectedLabId}/tests`, {
        testId: Number(testForm.testId),
        price: Number(testForm.price),
        homeCollectionAvailable: testForm.homeCollectionAvailable,
      });

      setTestForm({
        testId: "",
        price: "",
        homeCollectionAvailable: false,
      });
      setTestMessage("Test added to lab.");
      await loadSelectedLabTests(selectedLabId);
    } catch (error) {
      setTestMessage(getErrorMessage(error, "Failed to add test."));
    } finally {
      setSavingTest(false);
    }
  };

  const updateBookingStatus = async (bookingId) => {
    setUpdatingBookingId(bookingId);
    setBookingMessage("");

    try {
      await api.put(`/booking/${bookingId}/status`, {
        status: statusDrafts[bookingId],
      });
      setBookingMessage("Booking status updated.");
      await loadOwnerData();
    } catch (error) {
      setBookingMessage(getErrorMessage(error, "Failed to update booking status."));
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const availableTests = masterTests.filter(
    (test) => !selectedLabTests.some((labTest) => labTest.id === test.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading owner workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,_#0f172a,_#111827_35%,_#f8fafc_35%,_#f8fafc)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] bg-white shadow-2xl shadow-slate-900/10 overflow-hidden border border-white/60"
        >
          <div className="px-6 py-8 md:px-8 bg-slate-900 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-300 border border-emerald-400/20">
                  <ShieldCheck className="w-4 h-4" />
                  Lab owner workspace
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl font-black tracking-tight">
                  Run your lab operations from one dashboard
                </h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-300">
                  Create labs, publish test catalogs, review incoming bookings, and update appointment status.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={Building2} label="Labs" value={labs.length} />
                <StatCard icon={FlaskConical} label="Live Tests" value={selectedLabTests.length} />
                <StatCard icon={CalendarDays} label="Bookings" value={bookings.length} />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.25fr_0.95fr] gap-0">
            <div className="p-6 md:p-8 space-y-8 bg-slate-50">
              <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Your labs</h2>
                    <p className="text-sm text-slate-500">Select a lab to manage its tests and bookings.</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetLabForm}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New lab
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {labs.length === 0 && (
                    <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                      No labs yet. Create your first lab to start taking bookings.
                    </div>
                  )}

                  {labs.map((lab) => (
                    <button
                      key={lab.id}
                      type="button"
                      onClick={() => setSelectedLabId(lab.id)}
                      className={`text-left rounded-2xl border p-5 transition-all ${
                        selectedLabId === lab.id
                          ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{lab.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{lab.city}, {lab.state}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            startEditingLab(lab);
                          }}
                          className="rounded-lg bg-white p-2 text-slate-500 border border-slate-200 hover:text-emerald-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        <InfoLine icon={MapPin} text={lab.address} />
                        <InfoLine icon={Phone} text={lab.contactNumber} />
                        <InfoLine icon={Clock3} text={`${lab.slotCapacityOnline} online slots`} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {editingLabId ? "Edit lab" : "Create a lab"}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Keep your lab profile accurate so patients can find and book it.
                    </p>
                  </div>
                </div>

                <form onSubmit={submitLabForm} className="grid md:grid-cols-2 gap-4">
                  <Field label="Lab name" value={labForm.name} onChange={(value) => handleLabInput("name", value)} />
                  <Field label="Contact number" value={labForm.contactNumber} onChange={(value) => handleLabInput("contactNumber", value)} />
                  <Field label="City" value={labForm.city} onChange={(value) => handleLabInput("city", value)} />
                  <Field label="State" value={labForm.state} onChange={(value) => handleLabInput("state", value)} />
                  <Field label="Latitude" type="number" step="any" value={labForm.latitude} onChange={(value) => handleLabInput("latitude", value)} />
                  <Field label="Longitude" type="number" step="any" value={labForm.longitude} onChange={(value) => handleLabInput("longitude", value)} />
                  <Field label="Online slots" type="number" value={labForm.slotCapacityOnline} onChange={(value) => handleLabInput("slotCapacityOnline", value)} />
                  <Field label="Address" value={labForm.address} onChange={(value) => handleLabInput("address", value)} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <textarea
                      value={labForm.description}
                      onChange={(event) => handleLabInput("description", event.target.value)}
                      className="w-full min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white"
                      placeholder="What makes this lab trustworthy or convenient?"
                    />
                  </div>

                  {labMessage && (
                    <div className="md:col-span-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                      {labMessage}
                    </div>
                  )}

                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={savingLab}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {savingLab ? "Saving..." : editingLabId ? "Update lab" : "Create lab"}
                    </button>
                    {editingLabId && (
                      <button
                        type="button"
                        onClick={resetLabForm}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                </form>
              </section>
            </div>

            <div className="p-6 md:p-8 space-y-8 bg-white border-l border-slate-200">
              <section className="rounded-3xl bg-slate-950 text-white p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedLab ? `${selectedLab.name} tests` : "Choose a lab"}
                    </h2>
                    <p className="text-sm text-slate-300">
                      Add diagnostic tests and pricing for the selected lab.
                    </p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
                    {selectedLabTests.length} listed
                  </div>
                </div>

                {selectedLab ? (
                  <>
                    <form onSubmit={submitTestForm} className="grid gap-3 md:grid-cols-[1.5fr_1fr_auto] items-end">
                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-2">Test</label>
                        <select
                          value={testForm.testId}
                          onChange={(event) => setTestForm((prev) => ({ ...prev, testId: event.target.value }))}
                          className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                        >
                          <option value="">Select a test</option>
                          {availableTests.map((test) => (
                            <option key={test.id} value={test.id} className="text-slate-900">
                              {test.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-200 mb-2">Price</label>
                        <input
                          type="number"
                          value={testForm.price}
                          onChange={(event) => setTestForm((prev) => ({ ...prev, price: event.target.value }))}
                          className="w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                          placeholder="e.g. 499"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={savingTest || !testForm.testId || !testForm.price}
                        className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                      >
                        {savingTest ? "Adding..." : "Add"}
                      </button>

                      <label className="md:col-span-3 inline-flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={testForm.homeCollectionAvailable}
                          onChange={(event) =>
                            setTestForm((prev) => ({
                              ...prev,
                              homeCollectionAvailable: event.target.checked,
                            }))
                          }
                          className="rounded border-white/20"
                        />
                        Home collection available
                      </label>
                    </form>

                    {testMessage && (
                      <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm">
                        {testMessage}
                      </div>
                    )}

                    <div className="mt-6 space-y-3">
                      {testsLoading && <p className="text-sm text-slate-300">Loading tests...</p>}
                      {!testsLoading && selectedLabTests.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-white/15 px-4 py-6 text-sm text-slate-300">
                          No tests added yet for this lab.
                        </div>
                      )}

                      {selectedLabTests.map((test) => (
                        <div
                          key={test.id}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{test.name}</h3>
                              <p className="mt-1 text-sm text-slate-300">{test.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                                <IndianRupee className="w-4 h-4" />
                                {test.price}
                              </div>
                              <p className="mt-1 text-xs text-slate-400">
                                {test.homeCollectionAvailable ? "Home collection" : "Walk-in only"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-sm text-slate-300">
                    Create or select a lab to manage its test catalog.
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-slate-900">Bookings</h2>
                  <p className="text-sm text-slate-500">
                    Review incoming appointments and move them through each stage.
                  </p>
                </div>

                {bookingMessage && (
                  <div className="mb-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                    {bookingMessage}
                  </div>
                )}

                <div className="space-y-3">
                  {bookings.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                      No bookings yet.
                    </div>
                  )}

                  {bookings.map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <BookingStatusPill status={booking.status} />
                            <span className="text-xs font-semibold text-slate-400">Booking #{booking.id}</span>
                          </div>
                          <h3 className="mt-3 font-bold text-slate-900">{booking.lab?.name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-slate-600">
                            <InfoLine icon={UserRound} text={booking.user?.name || "Patient"} />
                            <InfoLine icon={Clock3} text={booking.timeSlot || "No slot selected"} />
                            <InfoLine
                              icon={TestTube2}
                              text={
                                booking.bookingTests?.map((item) => item.labTest?.test?.name).filter(Boolean).join(", ") ||
                                "No tests"
                              }
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-40">
                          <select
                            value={statusDrafts[booking.id] || booking.status}
                            onChange={(event) =>
                              setStatusDrafts((prev) => ({
                                ...prev,
                                [booking.id]: event.target.value,
                              }))
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-emerald-400"
                          >
                            {bookingStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(booking.id)}
                            disabled={updatingBookingId === booking.id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {updatingBookingId === booking.id ? "Saving..." : "Update"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-3 border border-white/10 min-w-24">
      <div className="flex items-center gap-2 text-emerald-300">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function InfoLine({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400" />
      <span className="line-clamp-1">{text}</span>
    </div>
  );
}

function BookingStatusPill({ status }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED: "bg-sky-50 text-sky-700 border-sky-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {status}
    </span>
  );
}

function Field({ label, value, onChange, type = "text", step }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white"
      />
    </div>
  );
}

export default OwnerDashboard;
