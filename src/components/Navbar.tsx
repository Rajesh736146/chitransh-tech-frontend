"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { toast } from "sonner";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/jobs", label: "Find Jobs" },
  { href: "/resume/build", label: "Resume Builder" },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Chitransh Tech"
            width={80}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors hover:text-black ${
                pathname === l.href ? "text-black font-medium" : "text-gray-500"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-600">{user.full_name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-black transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-black transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-black text-white px-4 py-1.5 rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-600 text-xl leading-none"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-2 text-sm bg-white">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-1 text-gray-600 hover:text-black"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            {user ? (
              <>
                <p className="text-gray-600 py-1">{user.full_name}</p>
                <button
                  onClick={handleLogout}
                  className="block text-gray-500 hover:text-black py-1"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-1 text-gray-600 hover:text-black"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block py-1 text-gray-600 hover:text-black"
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
