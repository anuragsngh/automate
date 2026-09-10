"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { LinkButton } from "./buttons/LinkButton";
import { Zap, LogOut, LayoutDashboard, Plus } from "lucide-react";

export function Appbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 text-2xl font-extrabold tracking-tight">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff4f00] text-white shadow-sm">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-slate-900">
            automate<span className="text-[#ff4f00]">.</span>
          </span>
        </Link>

        {/* Center / Navigation items */}
        <nav className="hidden md:flex items-center space-x-2">
          {isLoggedIn && (
            <>
              <Link href="/dashboard">
                <span className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  pathname === "/dashboard"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  Dashboard
                </span>
              </Link>
              <Link href="/zap/create">
                <span className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  pathname === "/zap/create"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                  Create Automation
                </span>
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth state */}
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              <PrimaryButton
                size="small"
                onClick={() => router.push("/zap/create")}
                className="hidden sm:inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create
              </PrimaryButton>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <LinkButton onClick={() => router.push("/login")}>
                Log in
              </LinkButton>
              <PrimaryButton size="small" onClick={() => router.push("/signup")}>
                Sign up
              </PrimaryButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
