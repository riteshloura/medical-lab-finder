import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../api/user";
import Navbar from "../components/Navbar";

export default function MyProfile() {
  const navigate = useNavigate();
  const {
    user,
    updateUserContext,
    isAuthenticated,
    loading: authLoading,
    logout,
  } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(user.userId);
        setProfile(data);
        setFormData({ name: data.name || "" });
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchProfile();
    }
  }, [user?.userId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.name.trim()) {
      setError("Name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateUserProfile(user.userId, formData);
      setProfile({ ...profile, name: updatedUser.name });
      updateUserContext({ name: updatedUser.name });
      setSuccessMsg("Profile updated successfully!");

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      await deleteUserProfile(user.userId);
      logout();
    } catch (err) {
      console.error(err);
      setError("Failed to delete account.");
      setDeleting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col pt-24">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-5">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Profile
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your personal information and preferences
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden"
          >
            <div className="p-8">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                <div
                  className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-xl ${
                    user?.role === "ADMIN"
                      ? "bg-gradient-to-br from-violet-600 to-purple-500 shadow-violet-500/20"
                      : "bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/20"
                  }`}
                >
                  {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        profile?.role === "ADMIN"
                          ? "bg-violet-50 text-violet-700 ring-1 ring-violet-600/10"
                          : profile?.role === "LAB_OWNER"
                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10"
                            : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {profile?.role?.replace("_", " ")}
                    </span>
                    {profile?.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-600/10">
                        <XCircle className="w-3 h-3" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={profile?.email || ""}
                      readOnly
                      className="block w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Email address cannot be changed.
                  </p>
                </div>

                {/* Messages */}
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-600 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}

                {/* Submit */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      deleting ||
                      !formData.name.trim() ||
                      formData.name === profile?.name
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-95"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Danger Zone */}
              {user?.role === "USER" && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
