import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import { motion } from "framer-motion";
import {
  TestTube2,
  User,
  LogOut,
  Settings,
  FileText,
  Building2,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLabOwner, logout } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="px-5 pt-5">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="pointer-events-auto"
          >
            <Link
              to={isAdmin ? "/admin/dashboard" : "/"}
              className="flex items-center gap-2.5 group"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-200" />
                <TestTube2 className="relative w-5 h-5 text-white" />
              </div>
              <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-lg border border-white/60">
                <span className="text-[15px] font-bold tracking-tight text-gray-900">
                  Lab
                </span>
                <span className="text-[15px] font-bold tracking-tight text-emerald-600">
                  Locator
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Right side */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="pointer-events-auto flex items-center gap-2"
          >
            {isAuthenticated ? (
              <>
                {/* Notification bell — regular users only */}
                {!isLabOwner && !isAdmin && <NotificationBell />}

                {/* Admin pill badge */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-400/30 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
                    <span className="text-xs font-bold text-violet-200">
                      Admin
                    </span>
                  </div>
                )}

                {/* User dropdown */}
                <Dropdown
                  placement="bottom-end"
                  classNames={{
                    content:
                      "p-2 min-w-[240px] bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl",
                  }}
                >
                  <DropdownTrigger>
                    <button className="flex items-center gap-2 bg-white/95 backdrop-blur-sm pl-1 pr-3 py-1 rounded-xl shadow-lg border border-white/60 hover:bg-white transition-all duration-200 hover:scale-[1.03] active:scale-95">
                      <Avatar
                        size="sm"
                        name={user?.name || "U"}
                        className={`w-8 h-8 text-white text-xs font-bold ${isAdmin ? "bg-gradient-to-br from-violet-600 to-purple-500" : "bg-gradient-to-br from-emerald-500 to-teal-400"}`}
                      />
                      <span className="text-sm font-semibold text-gray-800 max-w-[80px] truncate">
                        {user?.name?.split(" ")[0] || "User"}
                      </span>
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="User menu"
                    itemClasses={{
                      base: [
                        "rounded-xl",
                        "text-gray-700",
                        "transition-all",
                        "duration-200",
                        isAdmin
                          ? "data-[hover=true]:text-violet-700 data-[hover=true]:bg-violet-50"
                          : "data-[hover=true]:text-emerald-700 data-[hover=true]:bg-emerald-50",
                        "py-2.5",
                        "px-3",
                      ],
                      title: "text-sm font-semibold",
                    }}
                  >
                    {/* User info */}
                    <DropdownItem
                      key="user-info"
                      className="h-auto py-3 mb-2 opacity-100 data-[hover=true]:bg-transparent pb-4 border-b border-gray-100/80 rounded-none px-2"
                      isReadOnly
                      textValue="User info"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="md"
                          name={user?.name || "U"}
                          className={`w-10 h-10 border text-white flex-shrink-0 shadow-sm ${isAdmin ? "bg-gradient-to-br from-violet-600 to-purple-500 border-violet-100" : "bg-gradient-to-br from-emerald-500 to-teal-400 border-emerald-100"}`}
                        />
                        <div className="flex flex-col min-w-0">
                          <p className="font-bold text-sm text-gray-900 leading-tight truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email || ""}
                          </p>
                          {isAdmin && (
                            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full w-fit mt-0.5">
                              Administrator
                            </span>
                          )}
                        </div>
                      </div>
                    </DropdownItem>

                    {/* Admin dashboard — admin only */}
                    {isAdmin && (
                      <DropdownItem
                        key="admin-dashboard"
                        startContent={
                          <LayoutDashboard className="w-4.5 h-4.5 text-violet-500 mr-2" />
                        }
                        onClick={() => navigate("/admin/dashboard")}
                      >
                        Admin Dashboard
                      </DropdownItem>
                    )}

                    {/* Profile — all users */}
                    <DropdownItem
                      key="profile"
                      startContent={
                        <User
                          className={`w-4.5 h-4.5 ${isAdmin ? "text-violet-500" : "text-emerald-500"} mr-2`}
                        />
                      }
                      onClick={() => navigate("/profile")}
                    >
                      My Profile
                    </DropdownItem>

                    {/* Owner dashboard — lab owners only */}
                    {isLabOwner && !isAdmin && (
                      <DropdownItem
                        key="dashboard"
                        startContent={
                          <Building2 className="w-4.5 h-4.5 text-emerald-500 mr-2" />
                        }
                        onClick={() => navigate("/owner/dashboard")}
                      >
                        Owner Dashboard
                      </DropdownItem>
                    )}

                    {/* My Bookings — regular users only */}
                    {!isLabOwner && !isAdmin && (
                      <DropdownItem
                        key="bookings"
                        startContent={
                          <FileText className="w-4.5 h-4.5 text-emerald-500 mr-2" />
                        }
                        onClick={() => navigate("/my-bookings")}
                      >
                        My Bookings
                      </DropdownItem>
                    )}

                    {/* Settings — non-admin only */}
                    {!isAdmin && (
                      <DropdownItem
                        key="settings"
                        startContent={
                          <Settings className="w-4.5 h-4.5 text-emerald-500 mr-2" />
                        }
                      >
                        Settings
                      </DropdownItem>
                    )}

                    {/* Logout */}
                    <DropdownItem
                      key="logout"
                      className="text-red-500 data-[hover=true]:text-red-600 data-[hover=true]:bg-red-50 mt-2 pt-3 border-t border-gray-100 rounded-t-none"
                      color="danger"
                      startContent={
                        <LogOut className="w-4.5 h-4.5 text-red-500 mr-2" />
                      }
                      onClick={handleLogout}
                    >
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </>
            ) : (
              <Link to="/login">
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm pl-2.5 pr-3.5 py-2 rounded-xl shadow-lg border border-white/60 hover:bg-white transition-colors cursor-pointer">
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    Sign in
                  </span>
                </div>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
