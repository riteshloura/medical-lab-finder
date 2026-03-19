import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react";
import { motion } from "framer-motion";
import { TestTube2, User, LogOut, Settings, FileText, Bell, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLabOwner, logout } = useAuth();

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
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-200" />
                <TestTube2 className="relative w-5 h-5 text-white" />
              </div>
              <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-lg border border-white/60">
                <span className="text-[15px] font-bold tracking-tight text-gray-900">Lab</span>
                <span className="text-[15px] font-bold tracking-tight text-emerald-600">Locator</span>
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
                {/* Notification bell */}
                <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/60 flex items-center justify-center hover:bg-white transition-colors relative">
                  <Bell className="w-4.5 h-4.5 text-gray-600" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                </button>

                {/* User dropdown */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <button className="flex items-center gap-2 bg-white/95 backdrop-blur-sm pl-1 pr-3 py-1 rounded-xl shadow-lg border border-white/60 hover:bg-white transition-colors">
                      <Avatar
                        size="sm"
                        name={user?.name || "U"}
                        className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 text-white text-xs font-bold"
                      />
                      <span className="text-sm font-semibold text-gray-800 max-w-[80px] truncate">
                        {user?.name?.split(" ")[0] || "User"}
                      </span>
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User menu" className="w-52">
                    <DropdownItem key="user-info" className="h-14 gap-2" textValue="User info">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          name={user?.name || "U"}
                          className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-400 text-white"
                        />
                        <div className="flex flex-col">
                          <p className="font-semibold text-sm leading-tight">{user?.name || "User"}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[110px]">{user?.email || ""}</p>
                        </div>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="profile" startContent={<User className="w-4 h-4" />}>My Profile</DropdownItem>
                    {isLabOwner ? (
                      <DropdownItem
                        key="dashboard"
                        startContent={<Building2 className="w-4 h-4" />}
                        onClick={() => navigate("/owner/dashboard")}
                      >
                        Owner Dashboard
                      </DropdownItem>
                    ) : (
                      <DropdownItem key="bookings" startContent={<FileText className="w-4 h-4" />} onClick={() => navigate("/my-bookings")}>My Bookings</DropdownItem>
                    )}
                    <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>Settings</DropdownItem>
                    <DropdownItem key="logout" color="danger" startContent={<LogOut className="w-4 h-4" />} onClick={handleLogout}>
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
                  <span className="text-sm font-semibold text-gray-800">Sign in</span>
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
