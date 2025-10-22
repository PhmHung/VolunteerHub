import Information from "./Information.jsx";
import { useState, useEffect, useCallback } from "react";
import AuthModal from "./pages/AuthModal.jsx";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Events from "./pages/events.jsx";
import axios from "axios";

export default function App() {
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const decodeUserIdFromToken = useCallback((token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.userId ?? null;
    } catch (err) {
      console.error("Failed to decode token payload", err);
      return null;
    }
  }, []);

  const syncUserFromToken = useCallback(
    async (token) => {
      if (!token) {
        setUser(null);
        return null;
      }

      const userId = decodeUserIdFromToken(token);
      if (!userId) {
        setUser(null);
        return null;
      }

      try {
        const res = await fetch(`http://localhost:5000/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to fetch user profile", res.status);
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
          }
          setUser(null);
          return null;
        }

        const data = await res.json();
         // === BƯỚC CAN THIỆP: GÁN VAI TRÒ GIẢ ===
        const userWithMockedRole = {
          ...data, // Giữ nguyên thông tin từ backend
          role: 'admin' // <-- THAY ĐỔI Ở ĐÂY để test 'admin' hoặc 'volunteer'
        };
       setUser(userWithMockedRole); // Cập nhật state với vai trò đã gán
      return userWithMockedRole; // Trả về user đã gán vai trò

   //     setUser(data);
  //   return data;
      } catch (error)   {
        console.error("Error fetching user profile:", error);
        localStorage.removeItem("token");
        setUser(null);
        return null;
      }
    },
    [decodeUserIdFromToken]
  );

  // Lấy thông tin người dùng từ token khi load trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUser(false);
      setUser(null);
      return;
    }

    let isMounted = true;

    (async () => {
      await syncUserFromToken(token);
      if (isMounted) {
        setLoadingUser(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [syncUserFromToken]);

  const handleSuccess = async (data) => {
    let resetLoading = false;

    try {
      if (data?.token) {
        localStorage.setItem("token", data.token);
        setLoadingUser(true);
        resetLoading = true;
        await syncUserFromToken(data.token);
      } else if (data?.user) {
        const userWithMockedRole = {
          ...data.user,
          role: 'admin' // <-- GÁN VAI TRÒ GIẢ Ở ĐÂY NỮA
        };
        setUser(userWithMockedRole);
        //setUser(data.user);
        }
    } finally {
      if (resetLoading) {
        setLoadingUser(false);
      }
      setAuthModal(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
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
              element={<HomePage user={user} openAuth={setAuthModal} />}
            />
            <Route
              path="/information"
              element={
                <ProtectedRoute user={user}>
                  <Information onProfileUpdate={setUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={<div className="p-8">About Us Page Content</div>}
            />
             <Route element={<ProtectedRoute user={user} requiredRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />
            </Route>

            <Route path="/events" element={<Events user={user} openAuth={setAuthModal} />} />
            
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
