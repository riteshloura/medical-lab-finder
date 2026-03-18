import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OwnerRoute({ children }) {
  const { loading, isAuthenticated, isLabOwner } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isLabOwner) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default OwnerRoute;
