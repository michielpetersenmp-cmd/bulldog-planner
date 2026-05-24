"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Star, Bell, User } from "lucide-react";

const navItems = [
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/evenementen", label: "Evenementen", icon: Star },
  { href: "/notificaties", label: "Meldingen", icon: Bell },
  { href: "/profiel", label: "Profiel", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 bottom-nav shadow-[0_-4px_24px_rgba(26,46,90,0.08)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-3 px-4 transition-all duration-200 ${
                active ? "text-primary" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                active ? "bg-accent/20" : ""
              }`}>
                <item.icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? "text-primary" : ""}
                />
              </div>
              <span className={`text-xs font-medium ${active ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
