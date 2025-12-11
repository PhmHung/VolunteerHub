/** @format */

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
import EventDetail from "./pages/EventDetail.jsx"; // Đảm bảo đã import
import About from "./pages/AboutUs.jsx";
import Media from "./pages/Media.jsx";
import VolunteerHistory from "./pages/VolunteerHistory.jsx";
import { fetchUserProfile, userLogout } from "./features/user/userSlice";

export default function App() {
  const dispatch = useDispatch();
  const { profile: user, profileLoading: loadingUser } = useSelector(
    (state) => state.user
  );
  const [authModal, setAuthModal] = useState(null);

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

  const handleCloseModal = () => {
    setAuthModal(null);
  };

  if (loadingUser) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gray-100'>
        Đang tải...
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-b from-[#A8D0E6]/20 via-white to-[#F0F0F0] transition-colors'>
      <div className='min-h-screen w-full bg-[#F0F0F0]/30 transition-colors flex flex-col'>
        <Header
          setAuthModal={setAuthModal}
          user={user}
          handleLogout={handleLogout}
        />

        <main className='w-full flex-1'>
          <Routes>
            {/* 1. Public route: Cho Volunteer/Guest xem chi tiết */}
            <Route path='/events/:id' element={<EventDetail />} />

            <Route
              path='/'
              element={
                user ? (
                  <Navigate
                    to={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "manager"
                        ? "/manager/dashboard"
                        : "/dashboard"
                    }
                    replace
                  />
                ) : (
                  <HomePage user={user} openAuth={setAuthModal} />
                )
              }
            />
            <Route
              path='/about'
              element={<About user={user} openAuth={setAuthModal} />}
            />
            <Route
              path='/events'
              element={<Events user={user} openAuth={setAuthModal} />}
            />

            {/* Admin routes */}
            <Route
              element={
                <ProtectedRoute
                  user={user}
                  loading={loadingUser}
                  requiredRole='admin'
                  redirectTo='/dashboard'
                />
              }>
              <Route
                path='/admin/dashboard'
                element={<AdminDashboard user={user} />}
              />
              {/* 2. THÊM ROUTE NÀY CHO ADMIN */}
              <Route path='/admin/events/:id' element={<EventDetail />} />
            </Route>

            {/* Manager routes */}
            <Route
              element={
                <ProtectedRoute
                  user={user}
                  loading={loadingUser}
                  requiredRole='manager'
                  redirectTo='/dashboard'
                />
              }>
              <Route
                path='/manager/dashboard'
                element={<ManagerDashboard user={user} />}
              />
              {/* 3. THÊM ROUTE NÀY CHO MANAGER */}
              <Route path='/manager/events/:id' element={<EventDetail />} />
            </Route>

            {/* Volunteer/authenticated user routes */}
            <Route
              element={<ProtectedRoute user={user} loading={loadingUser} />}>
              <Route path='/dashboard' element={<Dashboard user={user} />} />
              <Route path='/information' element={<Information />} />
              <Route
                path='/history'
                element={<VolunteerHistory user={user} />}
              />
              <Route
                path='/media'
                element={<Media user={user} openAuth={setAuthModal} />}
              />
            </Route>
            <Route path='*' element={<Navigate to='/' />} />
          </Routes>
        </main>

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
