/**
 * @file App.jsx
 * @description Main application component with routing and authentication
 * @pattern Container Component Pattern
 */

// React core
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, userLogout } from "./features/user/userSlice";

// Layout components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Page components
import HomePage from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import Events from "./pages/Events.jsx";
import About from "./pages/AboutUs.jsx";
import Media from "./pages/Media.jsx";
import Information from "./pages/Information.jsx";
import VolunteerHistory from "./pages/VolunteerHistory.jsx";
import AuthModal from "./pages/AuthModal.jsx";

/**
 * Main App Component
 * Handles global routing, authentication state, and layout
 */
export default function App() {
  const dispatch = useDispatch();
  const { profile: user, profileLoading: loadingUser } = useSelector((state) => state.user);
  
  // Local state
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /**
   * Initialize user authentication on mount
   * Fetches user profile if token exists in localStorage
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserProfile()).finally(() => setIsCheckingAuth(false));
    } else {
      setIsCheckingAuth(false);
    }
  }, [dispatch]);

  /**
   * Handle successful authentication
   * @param {Object} data - Authentication response data
   */
  const handleSuccess = async (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
      dispatch(fetchUserProfile());
    }
    setAuthModal(null);
  };

  /**
   * Handle user logout
   * Clears token and redirects to home
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(userLogout());
    window.location.href = "/";
  };

  /**
   * Handle auth modal close
   */
  const handleCloseModal = () => {
    setAuthModal(null);
  };

  if (loadingUser || isCheckingAuth) {
    return <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#A8D0E6]/20 via-white to-[#F0F0F0] transition-colors">
      <div className="min-h-screen w-full bg-[#F0F0F0]/30 transition-colors">
        <Header
          setAuthModal={setAuthModal}
          user={user}
          handleLogout={handleLogout}
        />
      
        <main className="w-full">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? "/admin/dashboard" : user.role === 'manager' ? "/manager/dashboard" : "/dashboard"} replace /> : <HomePage user={user} openAuth={setAuthModal} />} />
            <Route path="/about" element={<About user={user} openAuth={setAuthModal} />} />
            <Route path="/events" element={<Events user={user} openAuth={setAuthModal} />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute user={user} loading={loadingUser} requiredRole="admin" redirectTo="/dashboard" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />
            </Route>

            {/* Manager routes */}
            <Route element={<ProtectedRoute user={user} loading={loadingUser} requiredRole="manager" redirectTo="/dashboard" />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard user={user} />} />
            </Route>

            {/* Volunteer/authenticated user routes */}
            <Route element={<ProtectedRoute user={user} loading={loadingUser} />}>
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/information" element={<Information />} />
              <Route path="/history" element={<VolunteerHistory user={user} />} />
              <Route path="/media" element={<Media user={user} openAuth={setAuthModal} />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className={`py-8 text-center text-base text-slate-600/80`}>
          If you have any questions, suggestions, or feedback, please feel free to contact us at Volunteerhub@
        </footer>
        <Footer />

        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}
