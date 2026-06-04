"use client";

import Navbar from "@/components/Navbar";
import { Users, UserPlus } from "lucide-react";

export default function NetworkPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Navbar />
      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
              <h3 className="font-semibold text-sm mb-3">Manage my network</h3>
              <nav className="space-y-2">
                {[
                  { label: "Connections", count: 0, icon: Users },
                  { label: "People I Follow", count: 0, icon: UserPlus },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} className="flex items-center justify-between w-full py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                      <span className="flex items-center gap-2"><Icon size={16} /> {item.label}</span>
                      <span className="text-xs">{item.count}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="text-lg font-bold mb-1">People you may know</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Based on your profile and activity</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border border-[var(--color-border)] rounded-xl overflow-hidden card-hover">
                    <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-500" />
                    <div className="px-4 pb-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-white -mt-8 mx-auto flex items-center justify-center text-lg font-bold text-[var(--color-primary)] shadow">
                        U
                      </div>
                      <p className="font-semibold text-sm mt-2">Professional User</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Software Engineer</p>
                      <button className="mt-3 w-full border border-[var(--color-primary)] text-[var(--color-primary)] py-1.5 rounded-full text-sm font-medium hover:bg-[var(--color-primary-light)] transition-colors">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
