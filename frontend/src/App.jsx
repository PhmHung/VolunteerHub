import Information from "./Information.jsx";
import { useMemo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import AuthModal from "./pages/AuthModal.jsx";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import { Home, Info } from "lucide-react";
import HomePage from "./pages/Home.jsx";

export default function App() {
  const [authModal, setAuthModal] = useState(null); // "login" | "register" | null
  const [token, setToken] = useState(null);
  const [picture, setPicture] = useState(null);
  const [authSuccess, setAuthSuccess] = useState("");
  const [authError, setAuthError] = useState("");

  // Lấy token và picture từ localStorage khi load trang
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedPicture = localStorage.getItem("picture");
    if (savedToken) setToken(savedToken);
    if (savedPicture) setPicture(savedPicture);
  }, []);

  const handleSuccess = (data) => {
    // Cập nhật token và picture
    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    }
    if (data.picture) {
      localStorage.setItem("picture", data.picture);
      setPicture(data.picture);
    }
    
    // Đóng modal và reset messages
    setAuthModal(null);
    setAuthSuccess("");
    setAuthError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("picture");
    setToken(null);
    setPicture(null);
    window.location.reload(); 
  };
    // Hàm này đảm bảo thông báo lỗi được xóa khi người dùng tự đóng modal
  const handleCloseModal = () => {
      setAuthModal(null);
      setAuthError("");
      setAuthSuccess("");
  }


  const PAGES = useMemo(() => [
    { key: "Home", icon: Home, path: "/", element: <HomePage token={token} openAuth={setAuthModal} /> },
    { key: "Information", icon: Info, path: "/information", element: <Information setPicture={setPicture} /> },
  ], [token, setPicture]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#A8D0E6]/20 via-white to-[#F0F0F0] transition-colors">
      <div className="min-h-screen w-full bg-[#F0F0F0]/30 transition-colors">
        <Header
          setAuthModal={setAuthModal}
          token={token}
          picture={picture}
          handleLogout={handleLogout}
          PAGES={PAGES}
        />

        <main className="w-full">
          <Routes>
            {PAGES.map(({ path, element }) => element && <Route key={path} path={path} element={element} />)}
          </Routes>
        </main>

        <footer className={`py-8 text-center text-base text-slate-600/80`}>
          If you have any questions, suggestions, or feedback, please feel free to contact me at 23020655@vnu.edu.vn.
        </footer>

        {authModal && (
          <AuthModal
            mode={authModal}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
            success={authSuccess}
            error={authError}
            setError={setAuthError}
            setSuccess={setAuthSuccess}
            setToken={setToken}
            setPicture={setPicture}
          />
        )}
      </div>
    </div>
  );
}
