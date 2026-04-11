import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationToastLayer } from "./components/NotificationBell";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LabDetails from "./pages/LabDetails";
import OwnerDashboard from "./pages/OwnerDashboard";
import MyBookings from "./pages/MyBookings";
import OwnerRoute from "./components/OwnerRoute";
import AdminRoute from "./components/AdminRoute";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import MyProfile from "./pages/MyProfile";
import { HomeRedirectGuard } from "./pages/HomeRedirectGuard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {/* Global toast layer — rendered outside page scroll context */}
          <NotificationToastLayer />
          <Routes>
            <Route
              path="/"
              element={
                <HomeRedirectGuard>
                  <Home />
                </HomeRedirectGuard>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/lab/:labId" element={<LabDetails />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route
              path="/owner/dashboard"
              element={
                <OwnerRoute>
                  <OwnerDashboard />
                </OwnerRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
