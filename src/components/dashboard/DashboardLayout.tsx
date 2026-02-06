import React, { Suspense, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

const RouteLoader: React.FC = () => {
  // ✅ Delay loader to avoid 1-2 frame flicker on fast chunk loads
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 250);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div className="w-full py-14 flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {mobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar collapsed={false} setCollapsed={() => {}} />
          </div>
        </>
      )}

      {/* Top Bar */}
      <TopBar
        onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="p-4 lg:p-6">
          {/* ✅ CONTENT-ONLY suspense: no full-screen overlay on route change */}
          <Suspense fallback={<RouteLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;