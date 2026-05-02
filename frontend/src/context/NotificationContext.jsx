import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

// Must exactly match the Spring Boot server origin
const WS_URL = import.meta.env.WS_URL || "http://localhost:8080/ws";
// console.log(WS_URL);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  const stompClientRef = useRef(null);
  const toastTimerRefs = useRef({});

  // ── Keep unreadCount in sync ──────────────────────────────────────────────
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // ── Toast helpers — defined before useEffect that references them ─────────
  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
    clearTimeout(toastTimerRefs.current[toastId]);
    delete toastTimerRefs.current[toastId];
  }, []);

  const showToast = useCallback(
    (notification) => {
      const toastId = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id: toastId, notification }]);
      toastTimerRefs.current[toastId] = setTimeout(() => {
        dismissToast(toastId);
      }, 5000);
    },
    [dismissToast]
  );

  // ── Fetch notification history from REST ──────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || user?.role === "LAB_OWNER") return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.warn("[Notifications] Failed to fetch history:", err);
    }
  }, [isAuthenticated, user?.role]);

  // ── WebSocket connection lifecycle ────────────────────────────────────────
  useEffect(() => {
    // Only connect for authenticated regular users
    if (!isAuthenticated || user?.role === "LAB_OWNER") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Capture stable references for the STOMP callbacks
    const onNewNotification = (notification) => {
      console.log("[Notifications] Real-time push received:", notification);
      setNotifications((prev) => {
        // Avoid duplicates in case of reconnect
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      showToast(notification);
    };

    const client = new Client({
      // SockJS factory — reconnects automatically use the same factory
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        // Spring's WebSocketAuthInterceptor reads this to set the STOMP principal
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,

      onConnect: (frame) => {
        console.log("[Notifications] STOMP connected:", frame);
        setConnected(true);

        // /user/queue/notifications resolves to the authenticated user's queue.
        // The broker prepends the user-destination prefix (/user) and routes
        // to the session whose principal.getName() matches the JWT email.
        client.subscribe("/user/queue/notifications", (frame) => {
          try {
            const notification = JSON.parse(frame.body);
            onNewNotification(notification);
          } catch (e) {
            console.warn("[Notifications] Failed to parse frame:", e);
          }
        });

        // Load notification history after the socket is ready
        fetchNotifications();
      },

      onDisconnect: () => {
        console.log("[Notifications] STOMP disconnected");
        setConnected(false);
      },

      onStompError: (frame) => {
        console.warn("[Notifications] STOMP error:", frame.headers?.message);
      },

      onWebSocketError: (evt) => {
        console.warn("[Notifications] WebSocket error:", evt);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      console.log("[Notifications] Deactivating STOMP client");
      client.deactivate();
      stompClientRef.current = null;
      setConnected(false);
      Object.values(toastTimerRefs.current).forEach(clearTimeout);
    };
    // Re-connect if the user identity changes (e.g. re-login)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.userId, user?.role]);

  // ── Mark all as read ──────────────────────────────────────────────────────
  const markAllRead = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("[Notifications] Failed to mark all read:", err);
    }
  }, []);

  // ── Clear state on logout ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setToasts([]);
    }
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    connected,
    toasts,
    markAllRead,
    dismissToast,
    refetch: fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

export default NotificationContext;
