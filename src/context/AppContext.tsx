import React, { createContext, useContext, useState, useEffect } from "react";
import { contacts, inbox } from "../services/api";

export interface UserType {
  role: string;
  phone: string;
  name: string;
  email: string;
}

export interface AppContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  unreadCount: number;
  totalContacts: number;
  refreshStats: () => void;
}

const AppContext = createContext<AppContextType>({
  user: {
    name: "John Doe",
    email: "john@company.com",
    phone: "",
    role: "",
  },
  setUser: () => {},
  unreadCount: 0,
  totalContacts: 0,
  refreshStats: async () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);

  // You can update this user object as needed, or fetch from API/localStorage
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const stored = localStorage.getItem("wabmeta_user");
      if (stored) {
        const u = JSON.parse(stored);
        return {
          name: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email,
          email: u.email,
          phone: u.phone || "",
          role: u.role || "",
        };
      }
    } catch {}
    return {
      name: "John Doe",
      email: "john@company.com",
      phone: "",
      role: "",
    };
  });

  const refreshStats = async () => {
    try {
      // ✅ Contacts stats
      const contactsRes = await contacts.stats(); // { success, data: { total, active, ... } }
      const contactsStats = contactsRes.data?.data;

      // ✅ Unread count - from inbox conversations meta
      const unreadRes = await inbox.conversations({
        page: 1,
        limit: 1, // we only need meta
        isRead: false,
        isArchived: false,
      });

      const unreadTotal = unreadRes.data?.meta?.unreadTotal ?? 0;

      setTotalContacts(contactsStats?.total || 0);
      setUnreadCount(unreadTotal);
    } catch (error) {
      console.error("Failed to update global stats", error);
    }
  };

  // Initial load
  useEffect(() => {
    // ✅ new key (we still keep token fallback for compatibility)
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, unreadCount, totalContacts, refreshStats }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);