"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Zap,
  Navigation,
  Heart,
  CalendarDays,
  Settings,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import AryaChatbot from "@/components/AryaChatbot";

const NAV_ITEMS = [
  { href: "/app", label: "Overview", icon: BarChart3 },
  { href: "/app/map", label: "Map", icon: MapPin },
  { href: "/app/ev", label: "EV Network", icon: Zap },
  { href: "/app/routes", label: "Routes", icon: Navigation },
  { href: "/app/health", label: "Health & Safety", icon: Heart },
  { href: "/app/events", label: "Events", icon: CalendarDays },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface dark:bg-bg-dark">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-bg-dark-secondary border-r border-border-color dark:border-gray-700 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border-color dark:border-gray-700">
            <h1 className="text-2xl font-bold text-accent-warm">ARYA</h1>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              Mobility OS
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-accent-warm text-white"
                      : "text-text-secondary dark:text-gray-400 hover:bg-surface-dark dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border-color dark:border-gray-700">
            <div className="bg-surface-dark dark:bg-gray-700 rounded-lg p-4 text-sm">
              <p className="text-text-secondary dark:text-gray-300">
                Need help? Ask ARYA
              </p>
              <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">
                Use the chat button in the bottom right corner
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <header className="bg-white dark:bg-bg-dark-secondary border-b border-border-color dark:border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between p-4 md:p-6">
            <button
              className="lg:hidden p-2 hover:bg-surface dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <h2 className="text-xl font-semibold text-text-primary dark:text-white lg:block hidden">
              {NAV_ITEMS.find((item) => item.href === pathname)?.label ||
                "ARYA Mobility OS"}
            </h2>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-surface-dark dark:bg-gray-700 rounded-lg px-3 py-2">
                <span className="text-sm text-text-secondary dark:text-gray-400">
                  Dubai
                </span>
                <span className="text-lg">25.2° C</span>
              </div>

              <div className="w-10 h-10 rounded-full bg-accent-warm flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="container-app py-6 md:py-8">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* ARYA Chatbot */}
      <AryaChatbot />
    </div>
  );
}
