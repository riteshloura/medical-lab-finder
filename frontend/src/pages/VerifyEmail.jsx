import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { verifyEmailToken } from "../api/auth";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const run = async () => {
      try {
        const res = await verifyEmailToken(token);
        setStatus("success");
        setMessage(res?.message || "Email verified successfully.");
      } catch (err) {
        const errMsg =
          err?.response?.data?.message ||
          err?.response?.data ||
          "Verification failed. The link may be invalid or expired.";
        setStatus("error");
        setMessage(errMsg);
      }
    };

    run();
  }, [searchParams]);

  const isSuccess = status === "success";
  const isError = status === "error";
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-4">
          {isLoading && (
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          )}
          {isSuccess && <CheckCircle2 className="w-12 h-12 text-emerald-500" />}
          {isError && <AlertCircle className="w-12 h-12 text-red-500" />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Email Verification
        </h1>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg transition"
          >
            Go to Login
          </Link>
          <Link
            to="/register"
            className="block w-full py-3 rounded-xl font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition"
          >
            Back to Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyEmail;
