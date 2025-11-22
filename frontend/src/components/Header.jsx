import { motion } from "framer-motion";
import {
  Users,
  Sparkles,
  LogOut,
  LogIn,
  Menu,
  X,
  Home as HomeIcon,
  Info as InfoIcon,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { fullUrl } from "../api.js";
import { Link, useLocation } from "react-router-dom";

// Header now expects `user` (object) instead of separate token/picture props.
// App.jsx passes `user` and `setAuthModal` and `handleLogout`.
export default function Header({ setAuthModal, user, handleLogout, PAGES }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  // Derive token/picture from user object for backward compatibility
  const token = !!user;
  const picture = user?.personalInformation?.picture || user?.profilePicture || user?.picture || null;
  const displayName = user?.personalInformation?.name || user?.userName || user?.name || "";
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  // Provide default pages if parent doesn't pass PAGES
  const defaultPages = [
    token
      ? { key: "Dashboard", path: "/dashboard", icon: HomeIcon }
      : { key: "Home", path: "/", icon: HomeIcon },
    { key: "Events", path: "/events", icon: Calendar },
    { key: "About Us", path: "/about", icon: InfoIcon },
    ...(token ? [{ key: "Social Media", path: "/media", icon: Users }] : []),
    ...(token && user?.role === 'admin' ? [{ key: "Admin", path: "/admin/dashboard", icon: ShieldCheck }] : []),
    ...(token && user?.role === 'manager' ? [{ key: "Manager", path: "/manager/dashboard", icon: ShieldCheck }] : []),
  ];
  PAGES = PAGES && PAGES.length ? PAGES : defaultPages;
  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-surface-base/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface-base/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="relative">
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-brand-accent" />
              <img 
                src="/logo.svg" 
                alt="VolunteerHub Logo" 
                className="h-9 w-9 drop-shadow-lg"
              />
            </div>
          </motion.div>
          <div>
            <p className="bg-gradient-to-r from-brand-primary via-brand-secondary/90 to-brand-accent bg-clip-text text-xl font-extrabold text-transparent">
              VolunteerHub
            </p>
            <h1 className="text-xs uppercase tracking-[0.4em] text-slate-600">for community</h1>
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          {/* Desktop Navigation - giữa logo và auth buttons */}
          <nav className="hidden md:flex items-center gap-1">
            {PAGES.map((page) => {
              if (page.requiresAuth && !token) {
                return null;
              }
              const isActive = location.pathname === page.path;
              const Icon = page.icon;
              return (
                <Link
                  key={page.key}
                  to={page.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                      : "text-slate-600 hover:bg-surface-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{page.key}</span>
                </Link>
              );
            })}
          </nav>
          {/* Check token to decide auth buttons */}
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-surface-muted md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          {token ? (
            <div className="flex items-center gap-3">
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-haspopup="true"
                  aria-expanded={profileOpen}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-brand-primary/20 bg-surface-base shadow-sm transition hover:border-brand-primary/60"
                >
                  {picture ? (
                    <img
                      src={fullUrl(picture)}
                      alt="Ảnh đại diện"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-slate-600">
                      {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-40 mt-3 w-64 rounded-2xl border border-brand-primary/10 bg-surface-base/95 p-4 shadow-xl backdrop-blur">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-brand-primary/20 bg-surface-muted">
                        {picture ? (
                          <img
                            src={fullUrl(picture)}
                            alt="Ảnh đại diện"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                            {displayName ? displayName.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{displayName || "Tài khoản"}</p>
                        {roleLabel ? (
                          <p className="text-xs font-medium text-brand-primary/80">{roleLabel}</p>
                        ) : null}
                        <p className="truncate text-xs text-slate-500">{user.userEmail || user.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <Link
                        to="/information"
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-xl bg-surface-muted px-3 py-2 font-medium text-slate-700 transition hover:bg-brand-primary/10 hover:text-brand-primary"
                      >
                        Xem thông tin cá nhân
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-feedback-danger/30 bg-feedback-danger/10 px-3 py-2 font-semibold text-feedback-danger transition hover:bg-feedback-danger/20"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAuthModal("login")}
                className="flex items-center gap-2 rounded-2xl border border-brand-primary/40 bg-surface-base px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>

              <button
                onClick={() => setAuthModal("register")}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-secondary via-brand-secondary to-brand-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-brand-secondary/90 hover:to-brand-accent/90"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-white/40 bg-surface-base/95 backdrop-blur-xl shadow-lg md:hidden">
          <nav className="px-4 py-3 space-y-2">
            {PAGES.map((page) => {
              if (page.requiresAuth && !token) {
                return null;
              }
              const isActive = location.pathname === page.path;
              const Icon = page.icon;
              return (
                <Link
                  key={page.key}
                  to={page.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                    isActive
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-slate-600 hover:bg-surface-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{page.key}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
