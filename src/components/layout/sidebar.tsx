"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Bell,
  Menu,
  X
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/reminders", label: "Reminders", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-md shadow-sm text-gray-600 hover:text-gray-900"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0
        transition-transform duration-200 ease-in-out
        w-64 md:w-14 lg:w-60
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="px-4 md:px-3 lg:px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 md:hidden lg:inline">
              Axira
            </span>
            <span className="text-lg font-semibold text-gray-900 hidden md:inline lg:hidden">
              A
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex flex-col gap-1 p-3 md:p-2 flex-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 md:py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="md:hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 md:p-2 border-t border-gray-200 space-y-2">
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 group-hover:text-gray-600">
              ?
            </div>
            <span className="md:hidden lg:inline">Help & Docs</span>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7",
                },
              }}
            />
            <span className="md:hidden lg:inline text-sm text-gray-600 font-medium">Account</span>
          </div>
        </div>
      </aside>
    </>
  );
}
