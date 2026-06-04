"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import {
  Home, Briefcase, Users, FileText, Bell,
  MessageSquare, Search, Menu, X, ChevronDown,
  Settings, LogOut, User, Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/feed", label: "Feed", icon: MessageSquare },
  { href: "/network", label: "Network", icon: Users },
  { href: "/resume/build", label: "Resume", icon: FileText },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isAdmin = user?.role_id === 3;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--color-border)] shadow-sm">
      <div className="max-w-[1128px] mx-auto px-4 flex items-center h-[52px] gap-2">

        {/* Logo + Search */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Chitransh Tech"
              width={34}
              height={34}
              className="h-[34px] w-auto object-contain"
              priority
            />
          </Link>

          <div className={`hidden md:flex items-center bg-[#eef3f8] rounded-md px-3 py-[6px] transition-all ${searchFocused ? "ring-2 ring-[var(--color-primary)] bg-white w-[280px]" : "w-[220px]"}`}>
            <Search size={16} className="text-[var(--color-text-secondary)] mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search jobs, people, companies"
              className="bg-transparent text-sm w-full focus:outline-none placeholder:text-[var(--color-text-muted)]"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-0 ml-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-4 py-1 min-w-[80px] border-b-2 transition-colors ${
                  active
                    ? "border-[var(--color-text)] text-[var(--color-text)]"
                    : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[11px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex flex-col items-center justify-center px-4 py-1 min-w-[80px] border-b-2 transition-colors ${
                pathname.startsWith("/admin")
                  ? "border-[var(--color-text)] text-[var(--color-text)]"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              }`}
            >
              <Shield size={20} strokeWidth={pathname.startsWith("/admin") ? 2.2 : 1.8} />
              <span className="text-[11px] mt-0.5">Admin</span>
            </Link>
          )}

          {/* Notification bell */}
          <button className="flex flex-col items-center justify-center px-4 py-1 min-w-[60px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
            <Bell size={20} strokeWidth={1.8} />
            <span className="text-[11px] mt-0.5">Alerts</span>
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative ml-1">
            {user ? (
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex flex-col items-center justify-center px-3 py-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[11px] font-semibold">
                  {user.full_name[0].toUpperCase()}
                </div>
                <span className="text-[11px] mt-0.5 flex items-center gap-0.5">
                  Me <ChevronDown size={12} />
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-[var(--color-primary)] text-white px-4 py-[6px] rounded-full text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Dropdown */}
            {profileOpen && user && (
              <div className="absolute right-0 top-full mt-1 w-[280px] bg-white border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-lg font-semibold">
                      {user.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{user.full_name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block mt-3 text-center text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-full py-1 hover:bg-[var(--color-primary-light)] transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
                  >
                    <User size={16} /> My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors"
                    >
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                </div>
                <div className="border-t border-[var(--color-border)] py-1">
                  <button
                    onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-gray-50 transition-colors w-full"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden ml-auto p-2 text-[var(--color-text-secondary)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white px-4 py-3 shadow-lg">
          {/* Mobile search */}
          <div className="flex items-center bg-[#eef3f8] rounded-md px-3 py-2 mb-3">
            <Search size={16} className="text-[var(--color-text-secondary)] mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent text-sm w-full focus:outline-none"
            />
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 py-2.5 text-sm transition-colors ${
                  active ? "text-[var(--color-primary)] font-medium" : "text-[var(--color-text-secondary)]"
                }`}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-2.5 text-sm text-[var(--color-text-secondary)]"
            >
              <Shield size={18} /> Admin Panel
            </Link>
          )}

          <div className="border-t border-[var(--color-border)] mt-2 pt-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-semibold">
                    {user.full_name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.full_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 py-2.5 text-sm text-red-600"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium border border-[var(--color-primary)] text-[var(--color-primary)] rounded-full"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium bg-[var(--color-primary)] text-white rounded-full"
                >
                  Join now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
