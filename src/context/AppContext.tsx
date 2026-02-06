import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { contacts, inbox } from "../services/api";

export interface UserType {
  role?: string;
  phone?: string;
  name: string;
  email: string;
}

export interface AppContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;

  unreadCount: number;
  totalContacts: number;

  // ✅ NEW
  responseRate: number;

  refreshStats: (force?: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},

  unreadCount: 0,
  totalContacts: 0,

  responseRate: 0,

  refreshStats: async () => {},
});

const isJwtLike = (t: string) => typeof t === "string" && t.split(".").length === 3;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);

  // ✅ NEW
  const [responseRate, setResponseRate] = useState(0);

  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const stored = localStorage.getItem("wabmeta_user");
      if (!stored) return null;

      const u = JSON.parse(stored);
      return {
        name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
        email: u.email,
        phone: u.phone || "",
        role: u.role || "",
      };
    } catch {
      return null;
    }
  });

  // ✅ Cooldown to avoid repeated requests
  const lastStatsFetchRef = useRef(0);

  const refreshStats = useCallback(async (force: boolean = false) => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("wabmeta_token");

      // If token missing or invalid, don't call APIs
      if (!token || !isJwtLike(token)) return;

      const now = Date.now();
      if (!force && now - lastStatsFetchRef.current < 30_000) {
        // 30s TTL/cooldown
        return;
      }
      lastStatsFetchRef.current = now;

      // Parallel calls
      const [contactsRes, inboxStatsRes] = await Promise.all([
        contacts.stats(),
        inbox.stats ? inbox.stats() : Promise.resolve({ data: {} }),
      ]);

      const contactsStats = contactsRes.data?.data || {};
      const inboxStats = inboxStatsRes.data?.data || {};

      // unread count (support multiple backends)
      const unread =
        inboxStats.unreadCount ??
        inboxStats.unread ??
        inboxStats.totalUnread ??
        inboxStats.unreadTotal ??
        0;

      // ✅ responseRate (support multiple shapes)
      const rr =
        inboxStats.responseRate ??
        inboxStats.response_rate ??
        inboxStats.avgResponseRate ??
        inboxStats.averageResponseRate ??
        0;

      setTotalContacts(Number(contactsStats?.total || 0));
      setUnreadCount(Number(unread || 0));
      setResponseRate(Number(rr || 0));
    } catch (error) {
      console.error("Failed to update global stats", error);
      // keep old values
    }
  }, []);

  // Initial load once
  useEffect(() => {
    refreshStats(true); // force first time
  }, [refreshStats]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      unreadCount,
      totalContacts,
      responseRate,
      refreshStats,
    }),
    [user, unreadCount, totalContacts, responseRate, refreshStats]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);