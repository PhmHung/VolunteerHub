import Information from "./Information.jsx";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "./pages/AuthModal.jsx";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  Home,
  Info,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  LogOut,
  LogIn,
} from "lucide-react";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [token, setToken] = useState(null);
  const [picture, setPicture] = useState(null); 

  // Lấy token và picture từ localStorage khi load trang
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedPicture = localStorage.getItem("picture");
    if (savedToken) setToken(savedToken);
    if (savedPicture) setPicture(savedPicture);
  }, []);

  const handleSuccess = (data) => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    }
    if (data.picture) {
      localStorage.setItem("picture", data.picture);
      setPicture(data.picture);
    }
    setAuthModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("picture");
    setToken(null);
    setPicture(null);
    window.location.reload(); 
  };


  const PAGES = [
    { key: "Home", icon: Home, path: "/" },
    { key: "Information", icon: Info, path: "/information", element: <Information setPicture={setPicture}/> },
  ];

  const location = useLocation();
  const active = useMemo(() => {
    if (location.pathname === "/") return "Home";
    const page = PAGES.find((p) => location.pathname.startsWith(p.path) && p.path !== "/");
    return page ? page.key : "";
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-green-50 transition-colors">
      <div className="min-h-screen w-full bg-green-200 transition-colors">
        {/* Top bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 bg-white/50 border-white/40">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <div className="relative">
                  <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-fuchsia-500" />
                  <div className="h-9 w-9 grid place-content-center rounded-2xl bg-gradient-to-br from-red-300 via-red-400 to-rose-300 text-white shadow-lg shadow-red-300/30">
                    VH
                  </div>
                </div>
              </motion.div>
              <div>
                <p className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-rose-600 to-amber-500">
                  VolunteerHub
                </p>
                <h1 className="text-sm uppercase tracking-widest text-slate-600">for community</h1>
              </div>
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen((s) => !s)}
                className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-base font-medium border border-white/40 bg-white/60 hover:bg-white/80 transition shadow-sm`}
              >
                {sidebarOpen ? (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span className="hidden sm:inline">Expand</span>
                  </>
                )}
              </button>

              {/* Kiểm tra token để biết đăng nhập chưa */}
              {token ? (
<>
            <div 
            className="h-10 w-10 rounded-full overflow-hidden border border-slate-300 bg-white"
            >
              
              {picture ? (
                <img
                  src={picture.startsWith("http") ? picture : `http://localhost:5000${picture}`}
                  alt="Picture"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>



                <button
                  onClick={handleLogout}
                  className={`px-3 py-2 flex items-center gap-1 bg-red-200 hover:bg-red-400 text-black rounded-2xl transition-colors duration-200 text-base`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAuthModal("login")}
                    className={`px-3 py-2 flex items-center gap-1 bg-red-200 hover:bg-red-400 text-black rounded-2xl transition-colors duration-200 text-base`}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>

                  <button
                    onClick={() => setAuthModal("register")}
                    className={`px-3 py-2 flex items-center gap-1 bg-red-200 hover:bg-red-400 text-black rounded-2xl transition-colors duration-200 text-base`}
                  >
                    Register
                  </button>

                </>
              )}
            </div>
          </div>
        </header>

        {/* Layout */}
        <main className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-4 py-3">
          <div className={`grid grid-cols-1 md:gap-3 ${sidebarOpen ? "md:grid-cols-[auto,1fr]" : "md:grid-cols-1"} gap-2`}>
            {/* Sidebar */}
            <AnimatePresence initial={false}>
              {sidebarOpen && (
                <motion.aside
                  key="sidebar"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ type: "tween", duration: 0, ease: "easeOut" }}
                  className="md:sticky md:top-24 h-max"
                >
                  <div
                    className={`w-full text-base md:w-56 rounded-3xl border border-slate-200/60 bg-slate-50/70 backdrop-blur-xl shadow-xl shadow-slate-300/20`}
                  >
                    <div className="p-3 sm:p-4">
                      <nav className="mt-3 sm:mt-4 flex flex-col gap-2">
                        {PAGES.map(({ key, icon: Icon, path }) => {
                          const selected = key === active;
                          return (
                            <Link key={key} to={path}>
                              <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                className={[
                                  "group w-full text-left rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 border transition",
                                  selected
                                    ? "border-red-300/60 bg-gradient-to-r from-red-200/70 via-red-300/70 to-rose-200/70 shadow-lg shadow-red-300/20"
                                    : "border-white/50 bg-white/60 hover:border-red-300/60 hover:bg-white/80",
                                ].join(" ")}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={[
                                      "grid place-content-center rounded-2xl p-2 border",
                                      selected
                                        ? "border-red-300/60 bg-white/70"
                                        : "border-grey/300 bg-white/60 group-hover:border-red-300/60",
                                    ].join(" ")}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold tracking-wide text-slate-800">{key}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.button>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Content */}
            <div className="w-full min-w-0">
              <Routes>
                {PAGES.map(({ path, element }) => element && <Route key={path} path={path} element={element} />)}
              </Routes>
            </div>
          </div>
        </main>

        <footer className={`py-8 text-center text-base text-slate-600/80`}>
          If you have any questions, suggestions, or feedback, please feel free to contact me at 23020655@vnu.edu.vn.
        </footer>

        {/* Modal */}
        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSuccess={handleSuccess}
            setToken={setToken}
            setPicture={setPicture}
          />
        )}
      </div>
    </div>
  );
}
