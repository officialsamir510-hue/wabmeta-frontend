import React, { createContext, useContext, useEffect, useMemo, useCallback, useState } from "react";
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
  refreshStats: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({
  user: null,
  setUser: async () => {},
  unreadCount: 0,
  totalContacts: 0,
  refreshStats: async () => {},
});

const isJwtLike = (t: string) => typeof t === "string" && t.split(".").length === 3;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);

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

  // ✅ Stable function reference (prevents useEffect loops)
  const refreshStats = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("wabmeta_token");

      // If token missing or invalid, don't call APIs
      if (!token || !isJwtLike(token)) return;

      // ✅ Parallel calls (faster)
      const [contactsRes, inboxStatsRes] = await Promise.all([
        contacts.stats(),
        // Prefer inbox.stats (lighter than conversations list)
        inbox.stats ? inbox.stats() : Promise.resolve({ data: {} }),
      ]);

      const contactsStats = contactsRes.data?.data;

      // Try multiple possible fields (depends on your backend response)
      const inboxStats = inboxStatsRes.data?.data || {};
      const unread =
        inboxStats.unreadCount ??
        inboxStats.unread ??
        inboxStats.totalUnread ??
        inboxStats.unreadTotal ??
        0;

      setTotalContacts(Number(contactsStats?.total || 0));
      setUnreadCount(Number(unread || 0));
    } catch (error) {
      console.error("Failed to update global stats", error);
      // ✅ Important: no infinite loading here; just keep old values
    }
  }, []);

  // Initial load once
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // ✅ Memoize context value to avoid unnecessary re-renders
  const value = useMemo(
    () => ({ user, setUser, unreadCount, totalContacts, refreshStats }),
    [user, unreadCount, totalContacts, refreshStats]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);