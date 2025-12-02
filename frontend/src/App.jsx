import Information from "./Information.jsx";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthModal from "./pages/AuthModal.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./pages/Home.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManagerDashboard from "./pages/ManagerDashboard.jsx";
import Events from "./pages/events.jsx";
import About from "./pages/AboutUs.jsx";
import Media from "./pages/Media.jsx";
import VolunteerHistory from "./pages/VolunteerHistory.jsx";
import { fetchUserProfile, userLogout } from "./features/user/userSlice";

export default function App() {
  const dispatch = useDispatch();
  const { profile: user, profileLoading: loadingUser } = useSelector((state) => state.user);
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null

  // Lấy thông tin người dùng từ token khi load trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  const handleSuccess = async (data) => {
    if (data?.token) {
      localStorage.setItem("token", data.token);
      dispatch(fetchUserProfile());
    }
    setAuthModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(userLogout());
    window.location.href = "/";
  };

  // Hàm này đảm bảo thông báo lỗi được xóa khi người dùng tự đóng modal
  const handleCloseModal = () => {
    setAuthModal(null);
  };

  if (loadingUser) {
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
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <HomePage user={user} openAuth={setAuthModal} />
                )
              }
            />
            <Route
              path="/information"
              element={
                <ProtectedRoute user={user}>
                  <Information />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={<About user={user} openAuth={setAuthModal} />}
            />
            <Route
              path="/media"
              element={
                <ProtectedRoute user={user}>
                  <Media user={user} openAuth={setAuthModal} />
                </ProtectedRoute>
              }
            />
             <Route element={<ProtectedRoute user={user} requiredRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />
            </Route>
            <Route element={<ProtectedRoute user={user} requiredRole="manager" />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard user={user} />} />
            </Route>

            <Route path="/events" element={<Events user={user} openAuth={setAuthModal} />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute user={user}>
                  <VolunteerHistory user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard user={user} />
                </ProtectedRoute>
              }
            />
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
