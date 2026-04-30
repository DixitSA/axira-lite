"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Users,
  Bell,
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

  return (
    <aside className="bg-white border-r border-gray-200 flex flex-col w-14 md:w-60 h-screen flex-shrink-0">
      <div className="px-3 md:px-6 py-5 border-b border-gray-200 flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-900 md:inline hidden">
          Axira
        </span>
        <span className="text-lg font-semibold text-gray-900 md:hidden">A</span>
      </div>
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
