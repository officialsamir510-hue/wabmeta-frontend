import React, { createContext, useContext, useState, useEffect } from 'react';
import { dashboard } from '../services/api';

export interface UserType {
  role: string;
  phone: string;
  name: string;
  email: string;
}

export interface AppContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void; // <-- Add this line
  unreadCount: number;
  totalContacts: number;
  refreshStats: () => void;
}

const AppContext = createContext<AppContextType>({
  user: {
    name: 'John Doe',
    email: 'john@company.com',
    phone: '',
    role: ''
  },
  setUser: () => {},
  unreadCount: 0,
  totalContacts: 0,
  refreshStats: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);

  const refreshStats = async () => {
    try {
      // Hum dashboard API use kar sakte hain kyunki usme contacts count hai
      // Future mein inbox unread count bhi add kar denge
      const { data } = await dashboard.getStats();
      
      setTotalContacts(data.contacts);
      setUnreadCount(0); // TODO: Add unread count to backend API later
    } catch (error) {
      console.error("Failed to update global stats");
    }
  };

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) refreshStats();
  }, []);

  // You can update this user object as needed, or fetch from API/localStorage
  const [user, setUser] = useState<UserType | null>({
    name: 'John Doe',
    email: 'john@company.com',
    phone: '',
    role: ''
  });

  return (
    <AppContext.Provider value={{ user, setUser, unreadCount, totalContacts, refreshStats }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);