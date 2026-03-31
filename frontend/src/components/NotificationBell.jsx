import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  X,
  CheckCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";

// ── Status icon & color helpers ───────────────────────────────────────────────

const STATUS_META = {
  CONFIRMED: {
    Icon: ClipboardCheck,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    dot: "#3b82f6",
    label: "Confirmed",
  },
  COMPLETED: {
    Icon: CheckCircle2,
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    dot: "#10b981",
    label: "Completed",
  },
  CANCELLED: {
    Icon: XCircle,
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    dot: "#ef4444",
    label: "Cancelled",
  },
};

function getMeta(bookingStatus) {
  return STATUS_META[bookingStatus] || STATUS_META.CONFIRMED;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Individual notification row ───────────────────────────────────────────────

function NotificationRow({ notification }) {
  const meta = getMeta(notification.bookingStatus);
  const { Icon } = meta;

  return (
    <Link
      to="/my-bookings"
      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
      >
        <Icon style={{ color: meta.color }} className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs leading-relaxed ${notification.read ? "text-gray-500 font-medium" : "text-gray-800 font-semibold"}`}
        >
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-1.5 py-0.5"
            style={{
              color: meta.color,
              background: meta.bg,
              border: `1px solid ${meta.border}`,
            }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: meta.dot }}
            />
            {meta.label}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
      )}
    </Link>
  );
}

// ── Toast notification ─────────────────────────────────────────────────────────

export function NotificationToastLayer() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {toasts.map(({ id, notification }) => {
          const meta = getMeta(notification.bookingStatus);
          const { Icon } = meta;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="pointer-events-auto flex items-start gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 px-4 py-3 max-w-sm w-full"
              style={{ borderLeft: `3px solid ${meta.dot}` }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: meta.bg }}
              >
                <Icon style={{ color: meta.color }} className="w-4 h-4" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">
                  Booking {meta.label}
                </p>
                <p className="text-xs font-semibold text-gray-800 leading-relaxed">
                  {notification.message}
                </p>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismissToast(id)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── Main NotificationBell component ──────────────────────────────────────────

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, connected } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        id="notification-bell-btn"
        aria-label="Notifications"
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all border ${
          open
            ? "bg-emerald-50 border-emerald-300 text-emerald-600"
            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
        }`}
      >
        <Bell className="w-4.5 h-4.5" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}

        {/* Connection pulse dot */}
        <span
          className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-300"}`}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Connection indicator */}
                <span
                  className={`flex items-center gap-1 text-[10px] font-semibold ${connected ? "text-emerald-600" : "text-gray-400"}`}
                  title={connected ? "Real-time connected" : "Disconnected"}
                >
                  {connected ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                </span>

                {/* Mark all read */}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    All read
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-gray-200" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 mb-1">
                    You're all caught up
                  </p>
                  <p className="text-xs text-gray-400">
                    Notifications will appear here when your booking status changes
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationRow key={n.id ?? n.createdAt} notification={n} />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
                <Link
                  to="/my-bookings"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  View all bookings →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
