import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Send,
  FileText,
  Inbox,
  Bot,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  CreditCard,
  UserCircle,
  Lock,
} from "lucide-react";
import Logo from "../common/Logo";
import { useApp } from "../../context/AppContext";
import { usePlanAccess } from "../../hooks/usePlanAccess";
import type { User } from "../../types/auth";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  featureKey?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ------------------------------
// Prefetch route chunks on hover (reduces first-click delay)
// ------------------------------
const prefetched = new Set<string>();

const prefetchRouteChunk = (href: string) => {
  if (prefetched.has(href)) return;
  prefetched.add(href);

  switch (href) {
    case "/dashboard":
      import("../../pages/Dashboard");
      break;
    case "/dashboard/inbox":
      import("../../pages/Inbox");
      break;
    case "/dashboard/contacts":
      import("../../pages/Contacts");
      break;
    case "/dashboard/templates":
      import("../../pages/Templates");
      break;
    case "/dashboard/campaigns":
      import("../../pages/Campaigns");
      break;
    case "/dashboard/billing":
      import("../../pages/Billing");
      break;
    case "/dashboard/team":
      import("../../pages/Team");
      break;
    case "/dashboard/settings":
      import("../../pages/Settings");
      break;
    case "/dashboard/reports":
      import("../../pages/Reports");
      break;
    case "/dashboard/chatbot":
      import("../../pages/ChatbotList");
      break;
    case "/dashboard/automation":
      import("../../pages/Automation");
      break;
    default:
      // no-op
      break;
  }
};

// helper
const getDisplayName = (u: User | null): string => {
  if (!u) return "Guest";
  // @ts-ignore - legacy support for firstName/lastName if not in User type yet, or just name
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (u.name && u.name.trim()) return u.name.trim();
  if (u.email && u.email.trim()) return u.email.trim();
  return "User";
};

const getEmail = (u: User | null): string => {
  if (!u) return "";
  if (u.email) return u.email;
  return "";
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { unreadCount, totalContacts } = useApp();
  const { hasAccess } = usePlanAccess();

  const [user] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("wabmeta_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const displayName = getDisplayName(user);
  const email = getEmail(user);
  const initial = (displayName?.charAt(0) || "G").toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("metaConnection");
    localStorage.removeItem("wabmeta_connection");
    localStorage.removeItem("wabmeta_user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("token");
    localStorage.removeItem("wabmeta_token");
    sessionStorage.clear();
    navigate("/login");
  };

  const navigation: NavGroup[] = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        {
          name: "Inbox",
          href: "/dashboard/inbox",
          icon: Inbox,
          badge: unreadCount > 0 ? unreadCount : undefined,
          badgeColor: "bg-red-500",
        },
        {
          name: "Contacts",
          href: "/dashboard/contacts",
          icon: Users,
          badge:
            totalContacts > 0
              ? totalContacts > 1000
                ? `${(totalContacts / 1000).toFixed(1)}k`
                : totalContacts.toLocaleString()
              : undefined,
        },
      ],
    },
    {
      title: "Messaging",
      items: [
        { name: "Campaigns", href: "/dashboard/campaigns", icon: Send },
        { name: "Templates", href: "/dashboard/templates", icon: FileText },
        { name: "Chatbot", href: "/dashboard/chatbot", icon: Bot, featureKey: "chatbot" },
        { name: "Automation", href: "/dashboard/automation", icon: Zap, featureKey: "automation" },
      ],
    },
    {
      title: "Analytics",
      items: [
        { name: "Reports", href: "/dashboard/reports", icon: BarChart3, featureKey: "analytics" },
      ],
    },
    {
      title: "Settings",
      items: [
        { name: "Team", href: "/dashboard/team", icon: UserCircle },
        { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div
          className={`flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-800 ${collapsed ? "justify-center" : "justify-between"
            }`}
        >
          <Link to="/dashboard" className="flex items-center" onMouseEnter={() => prefetchRouteChunk("/dashboard")}>
            <Logo variant={collapsed ? "icon" : "full"} />
          </Link>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mt-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-slate-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navigation.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex > 0 ? "mt-6" : ""}>
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const isLocked = !!(item.featureKey && !hasAccess(item.featureKey));

                  return (
                    <div
                      key={item.name}
                      className="relative group"
                      onMouseEnter={() => {
                        setHoveredItem(item.name);
                        if (!isLocked) prefetchRouteChunk(item.href);
                      }}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        to={isLocked ? "#" : item.href}
                        aria-disabled={isLocked}
                        onClick={(e) => {
                          if (isLocked) e.preventDefault();
                        }}
                        className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${active
                          ? "bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-300"
                          : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                          } ${collapsed ? "justify-center" : ""} ${isLocked ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                      >
                        <item.icon
                          className={`w-5 h-5 shrink-0 ${active
                            ? "text-primary-500"
                            : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-slate-200"
                            }`}
                        />

                        {!collapsed && (
                          <>
                            <span className="ml-3 font-medium">{item.name}</span>

                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5 ml-auto text-gray-400" />
                            ) : item.badge ? (
                              <span
                                className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full text-white ${item.badgeColor || "bg-gray-500"
                                  }`}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        )}
                      </Link>

                      {/* Tooltip (Collapsed Sidebar) */}
                      {collapsed && hoveredItem === item.name && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap z-50 shadow-lg">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                          </div>
                          {isLocked && (
                            <span className="block text-xs text-gray-400 mt-1 font-normal">
                              Upgrade to unlock
                            </span>
                          )}
                          {!isLocked && item.badge && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${item.badgeColor || "bg-gray-600"
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200 dark:border-slate-800">
          <div
            className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("help")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link
              to="/dashboard/help"
              onMouseEnter={() => prefetchRouteChunk("/dashboard/help")}
              className={`flex items-center px-3 py-2.5 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors ${collapsed ? "justify-center" : ""
                }`}
            >
              <HelpCircle className="w-5 h-5 text-gray-400" />
              {!collapsed && <span className="ml-3 font-medium">Help & Support</span>}
            </Link>

            {collapsed && hoveredItem === "help" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap z-50 shadow-lg">
                Help & Support
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => collapsed && setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2.5 text-gray-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-xl transition-colors mt-1 ${collapsed ? "justify-center" : ""
                }`}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="ml-3 font-medium">Logout</span>}
            </button>

            {collapsed && hoveredItem === "logout" && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg whitespace-nowrap z-50 shadow-lg">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>

          {/* User Card */}
          {!collapsed && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-whatsapp-teal rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {initial}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{email}</p>
                </div>
              </div>
            </div>
          )}

          {/* User Avatar - Collapsed */}
          {collapsed && (
            <div
              className="relative mt-3 flex justify-center"
              onMouseEnter={() => setHoveredItem("user")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="w-10 h-10 bg-linear-to-br from-primary-500 to-whatsapp-teal rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all">
                {initial}
              </div>

              {hoveredItem === "user" && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-gray-400 text-xs">{email}</p>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;