import { useState } from "react";
import { Button, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  TestTube,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resendVerificationEmail } from "../api/auth";

function Login() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent | error
  const [resendMessage, setResendMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const redirect = params.get("redirect");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsUnverified(false);
    setResendStatus("idle");
    setResendMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      if (redirect) {
        navigate(decodeURIComponent(redirect));
      } else {
        navigate(result.user?.role === "LAB_OWNER" ? "/owner/dashboard" : "/");
      }
    } else {
      const msg = result.error || "";
      if (msg.toLowerCase().includes("verify your email")) {
        setIsUnverified(true);
      } else {
        setErrorMessage(msg);
      }
      console.error("Error in login: ", result);
    }

    setIsSubmitting(false);
  };

  const handleResend = async () => {
    setResendStatus("sending");
    setResendMessage("");
    try {
      const res = await resendVerificationEmail(email);
      setResendStatus("sent");
      setResendMessage(
        res?.message || "Verification email sent! Check your inbox.",
      );
    } catch (err) {
      setResendStatus("error");
      setResendMessage(
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to send email. Please try again.",
      );
    }
  };

  //   const getLabs = async(e) => {
  //     e.preventDefault();

  //     const response = await api.get("/labs");
  //     const data = await response.data;
  //     console.log(data);
  //   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
              <TestTube className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-emerald-100 text-lg max-w-md">
              Access your health reports, track bookings, and find the best labs
              near you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid grid-cols-3 gap-8 text-center"
          >
            {/* <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-emerald-100 text-sm">Partner Labs</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-emerald-100 text-sm">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.8</div>
              <div className="text-emerald-100 text-sm">User Rating</div>
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
              <TestTube className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              LabLocator
            </span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600 mt-2">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Unverified email banner */}
            {isUnverified && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2 text-amber-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email not verified</p>
                    <p className="text-sm mt-0.5">
                      Please check <strong>{email}</strong> for a verification
                      link.
                    </p>
                    {resendStatus === "sent" && (
                      <div className="flex items-center gap-1 mt-2 text-emerald-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{resendMessage}</span>
                      </div>
                    )}
                    {resendStatus === "error" && (
                      <p className="text-sm mt-2 text-red-600">
                        {resendMessage}
                      </p>
                    )}
                    {resendStatus !== "sent" && (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendStatus === "sending"}
                        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 disabled:opacity-50"
                      >
                        {resendStatus === "sending" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" /> Resend
                            verification email
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    console.log(isUnverified);
                    setIsUnverified(false);
                    return setEmail(e.target.value);
                  }}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={isVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {isVisible ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              isDisabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* <div className="mt-8">
            <Divider className="my-4" />
            <p className="text-center text-gray-600 text-sm">
              Or continue with
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Button
                variant="bordered"
                size="lg"
                className="border-gray-200 hover:border-emerald-400 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google</span>
              </Button>
              <Button
                variant="bordered"
                size="lg"
                className="border-gray-200 hover:border-emerald-400 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </Button>
            </div>
          </div> */}

          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign Up
            </Link>
          </p>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
