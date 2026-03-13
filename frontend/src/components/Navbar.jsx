import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { motion } from "framer-motion";
import { TestTube, User, LogOut, Settings, FileText } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                <TestTube className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                LabLocator
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`transition-colors ${
                isActive("/") ? "text-emerald-600 font-medium" : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              Home
            </Link>
            <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Find Labs
            </a>
            <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Tests
            </a>
            <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Health Packages
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              // Logged in state
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:inline font-medium">{user?.name || "User"}</span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem key="profile" startContent={<User className="w-4 h-4" />}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem key="bookings" startContent={<FileText className="w-4 h-4" />}>
                    My Bookings
                  </DropdownItem>
                  <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
                    Settings
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    startContent={<LogOut className="w-4 h-4" />}
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              // Logged out state
              <>
                <Link to="/login">
                  <Button
                    variant="light"
                    className={`hidden sm:flex ${
                      isActive("/login") ? "text-emerald-600" : ""
                    }`}
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
