import { motion } from "framer-motion";
import { Sparkles, LogOut, LogIn, Menu, X, Home as HomeIcon, Info as InfoIcon } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Header now expects `user` (object) instead of separate token/picture props.
// App.jsx passes `user` and `setAuthModal` and `handleLogout`.
export default function Header({ setAuthModal, user, handleLogout, PAGES }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  // Derive token/picture from user object for backward compatibility
  const token = !!user;
  const picture = user?.personalInformation?.picture || user?.picture || null;

  // Provide default pages if parent doesn't pass PAGES
  const defaultPages = [
    { key: "Home", path: "/", icon: HomeIcon },
    { key: "Information", path: "/information", icon: InfoIcon },
  ];
  PAGES = PAGES && PAGES.length ? PAGES : defaultPages;
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 bg-white/50 border-white/40">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="relative">
              <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-[#FFC107]" />
              <img 
                src="/logo.svg" 
                alt="VolunteerHub Logo" 
                className="h-9 w-9 drop-shadow-lg"
              />
            </div>
          </motion.div>
          <div>
            <p className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#005A9C] via-[#0077CC] to-[#F4A261]">
              VolunteerHub
            </p>
            <h1 className="text-sm uppercase tracking-widest text-slate-600">for community</h1>
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          {/* Desktop Navigation - giữa logo và auth buttons */}
          <nav className="hidden md:flex items-center gap-1">
            {PAGES.map((page) => {
              const isActive = location.pathname === page.path;
              const Icon = page.icon;
              return (
                <Link
                  key={page.key}
                  to={page.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#A8D0E6]/70 to-[#A8D0E6]/50 text-[#005A9C]"
                      : "text-slate-700 hover:bg-white/60"
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
            className="md:hidden p-2 rounded-lg hover:bg-white/60"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          {token ? (
            <>
              <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-300 bg-white">
                {picture ? (
                  <img src={picture.startsWith("http") ? picture : `http://localhost:5000${picture}`} alt="Picture" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <button
                onClick={handleLogout}
                className={`px-3 py-2 flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-2xl transition-colors duration-200 text-base border border-red-200`}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setAuthModal("login")}
                className={`px-3 py-2 flex items-center gap-1 bg-[#A8D0E6] hover:bg-[#8CBCD9] text-[#005A9C] rounded-2xl transition-colors duration-200 text-base font-medium`}
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>

              <button
                onClick={() => setAuthModal("register")}
                className={`px-3 py-2 flex items-center gap-1 bg-gradient-to-r from-[#F4A261] to-[#FFC107] hover:from-[#E08B3E] hover:to-[#FFB300] text-white rounded-2xl transition-colors duration-200 text-base font-medium shadow-md`}
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/40 shadow-lg">
          <nav className="px-4 py-3 space-y-2">
            {PAGES.map((page) => {
              const isActive = location.pathname === page.path;
              const Icon = page.icon;
              return (
                <Link
                  key={page.key}
                  to={page.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#A8D0E6]/70 to-[#A8D0E6]/50 text-[#005A9C]"
                      : "text-slate-700 hover:bg-white/80"
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
