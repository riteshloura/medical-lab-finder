import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function HomeRedirectGuard({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user?.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    // if (user?.role === "LAB_OWNER") return <Navigate to="/owner/dashboard" replace />;
    return children;
}
