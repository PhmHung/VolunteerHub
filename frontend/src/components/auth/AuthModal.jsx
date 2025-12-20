import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Icons để show/hide password
import api from "../../api.js"; // centralized API client
import FirebaseLogin from "./FirebaseLogin.jsx"; // Component login bằng Firebase
import ForgotPasswordModal from "./ForgotPasswordModal.jsx";


export default function AuthModal({ mode, onClose, onSuccess }) {
  const [activeMode, setActiveMode] = useState(mode); 
  
  // States Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("volunteer");
  const [biography, setBiography] = useState(""); // Đã sử dụng ở dưới
  const [registeredPicture, setRegisteredPicture] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [code, setCode] = useState("");
  const [step, setStep] = useState(activeMode === "login" ? 1 : 0);
  
  // States UI
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setActiveMode(mode);
    setStep(mode === "login" ? 1 : 0);
  }, [mode]);

  useEffect(() => {
    return () => { if (previewAvatar) URL.revokeObjectURL(previewAvatar); };
  }, [previewAvatar]);

  const toggleMode = () => {
    setError(""); setSuccess("");
    const newMode = activeMode === "login" ? "register" : "login";
    setActiveMode(newMode);
    setStep(newMode === "login" ? 1 : 0);
  };

  // States cho UI
  const [loading, setLoading] = useState(false); // Trạng thái đang load
  const [show, setShow] = useState(false); // Show/hide password
  const [showForgot, setShowForgot] = useState(false);


  const handleBack = () => {
    setError(""); setSuccess("");
    if (step > 0) setStep(step - 1);
  };

  // --- API HANDLERS ---
  const sendVerificationCode = async () => {
    setLoading(true); setError("");
    try {
      if (!email) throw new Error("Vui lòng nhập Email.");
      await api.post("/api/auth/sendVerificationCode", { email });
      setStep(1); setSuccess("Mã xác thực đã được gửi!");
    } catch (err) { setError(err.response?.data?.message || "Gửi mã thất bại."); } 
    finally { setLoading(false); }
  };

  const verifyCode = async () => {
    setLoading(true); setError("");
    try {
      if (!code) throw new Error("Vui lòng nhập mã.");
      const res = await api.post("/api/auth/verifyCode", { email, code });
      localStorage.setItem("verifyToken", res.data.verifyToken);
      setStep(2); setSuccess(""); 
    } catch (err) { setError(err.response?.data?.message || "Mã sai."); } 
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setLoading(true); setError("");
    const missing = [];
    if (!password) missing.push("Mật khẩu");
    if (!name) missing.push("Tên");
    if (missing.length) { setError("Thiếu: " + missing.join(", ")); setLoading(false); return; }

    try {
        const formData = new FormData();
        formData.append("verifyToken", localStorage.getItem("verifyToken"));
        formData.append("password", password);
        formData.append("userName", name);
        formData.append("biography", biography); // Gửi biography lên server
        formData.append("role", "volunteer");
        if (registeredPicture) formData.append("picture", registeredPicture);
        if (role === 'admin' || role === 'manager') formData.append("adminRequest", "true");
        
        const res = await api.post("/api/auth/register", formData, { headers: { "Content-Type": "multipart/form-data" }});
        setSuccess("Đăng ký thành công!");
        setTimeout(() => onSuccess(res.data), 2000);
    } catch (err) { setError(err.response?.data?.message || "Lỗi đăng ký."); } 
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    setLoading(true); setError("");
    if (!email || !password) { setError("Nhập đủ thông tin."); setLoading(false); return; }
    try {
      const res = await api.post("/api/auth/login", { userEmail: email, password });
      setSuccess("Chào mừng trở lại!");
      setTimeout(() => onSuccess(res.data), 1500);
    } catch (err) { setError(err.response?.data?.message || "Đăng nhập thất bại."); } 
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
        
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-5xl min-h-[600px] flex flex-row relative ring-1 ring-white/20">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <InspirationalSidebar mode={activeMode} />

          <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 overflow-y-auto max-h-[90vh] bg-white custom-scrollbar relative flex flex-col justify-center">
            
            <div className="w-full max-w-sm mx-auto space-y-6">
              
              {/* Mobile Header */}
              <div className="md:hidden text-center mb-6">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-200">
                    <Heart fill="currentColor" className="w-6 h-6" />
                 </div>
                 <h2 className="text-2xl font-extrabold text-gray-900">VolunteerHub</h2>
              </div>

              {/* Title Section */}
              <div key={activeMode} className="animate-fade-in-up">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {activeMode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
                </h2>
                <p className="mt-2 text-gray-500 font-medium">
                  {activeMode === "login" 
                    ? "Đăng nhập để tiếp tục hành trình." 
                    : step === 0 
                      ? "Nhập email của bạn để bắt đầu." 
                      : step === 1 
                        ? "Kiểm tra mã xác thực trong email." 
                        : "Hoàn tất hồ sơ cá nhân."}
                </p>
              </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="block text-sm font-medium text-text-main">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs sm:text-sm text-secondary-500 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>

                )}
                {success && (
                  <div className="p-4 rounded-xl bg-green-50 text-green-700 text-sm flex items-start gap-3 border border-green-100 font-medium animate-[fadeIn_0.2s]">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
                  </div>
                )}

                {/* --- INPUT FIELDS --- */}
                
                {((activeMode === "register" && step === 0) || activeMode === "login") && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={activeMode === "register" && step > 0}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-colors outline-none bg-gray-50 focus:bg-white text-gray-900 font-medium"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                )}

                {activeMode === "register" && step === 1 && (
                  <div className="space-y-4 animate-fade-in-up">
                    <button onClick={handleBack} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Quay lại
                    </button>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Mã xác thực</label>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-3.5 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none uppercase bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {((activeMode === "register" && step === 2) || activeMode === "login") && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                        {activeMode === "login" && <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Quên mật khẩu?</a>}
                      </div>
                      <div className="relative group">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-colors outline-none bg-gray-50 focus:bg-white text-gray-900 font-medium"
                          placeholder="••••••••"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Register Fields */}
                    {activeMode === "register" && (
                      <div className="space-y-4 animate-fade-in-up">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Họ và tên</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-colors outline-none bg-gray-50 focus:bg-white text-gray-900 font-medium"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Vai trò</label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { id: 'volunteer', label: 'Tình nguyện', icon: Heart },
                              { id: 'manager', label: 'Quản lý', icon: Users },
                              { id: 'admin', label: 'Admin', icon: Shield },
                            ].map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setRole(item.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                                  role === item.id 
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600' 
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                <item.icon className={`w-5 h-5 mb-1.5 ${role === item.id ? 'fill-current' : ''}`} />
                                <span className="text-xs font-bold">{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 py-2">
                           <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                             {previewAvatar ? <img src={previewAvatar} className="w-full h-full object-cover" /> : <User className="text-gray-400 w-7 h-7" />}
                           </div>
                           <label className="flex-1 cursor-pointer group">
                             <div className="px-4 py-2.5 border border-dashed border-gray-300 rounded-xl group-hover:border-blue-600 group-hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm text-gray-600 group-hover:text-blue-700 font-medium">
                                <Upload className="w-4 h-4" /> Tải ảnh đại diện
                             </div>
                             <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                           </label>
                        </div>
                        
                        {/* --- BIOGRAPHY SECTION ADDED HERE --- */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Giới thiệu bản thân (Tùy chọn)</label>
                          <div className="relative">
                            <textarea
                              value={biography}
                              onChange={(e) => setBiography(e.target.value)}
                              rows="3"
                              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-colors outline-none bg-gray-50 focus:bg-white text-gray-900 font-medium resize-none placeholder:font-normal"
                              placeholder="Chia sẻ ngắn gọn về kinh nghiệm, sở thích..."
                            />
                          </div>
                        </div>
                        {/* ------------------------------------- */}
                        
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={activeMode === "login" ? handleLogin : (step === 0 ? sendVerificationCode : (step === 1 ? verifyCode : handleRegister))}
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-gray-200 hover:shadow-xl active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Đang xử lý..." : (
                    activeMode === "login" ? "Đăng nhập ngay" : 
                    step === 0 ? "Gửi mã xác thực" : 
                    step === 1 ? "Xác nhận mã" : "Hoàn tất đăng ký"
                  )}
                </button>

                {/* Social & Switch Logic */}
                <div className="text-center pt-2">
                  {activeMode === "login" && (
                     <div className="mb-4">
                        <div className="relative flex py-2 items-center mb-4">
                          <div className="flex-grow border-t border-gray-100"></div>
                          <span className="flex-shrink-0 mx-4 text-xs text-gray-400 font-bold">HOẶC</span>
                          <div className="flex-grow border-t border-gray-100"></div>
                        </div>
                        <div className="transform transition-transform active:scale-[0.99] hover:scale-[1.01]">
                           <FirebaseLogin onSuccess={onSuccess} />
                        </div>
                     </div>
                  )}
                  
                  <div className="text-sm font-medium text-gray-600 mt-5 flex items-center justify-center gap-2">
                    {activeMode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                    
                    <button 
                      onClick={toggleMode} 
                      className="font-bold text-blue-700 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                    >
                      {activeMode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-error-50 border border-error-200 text-error-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {mode === "login" && (
          <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-text-secondary">
            Don't have an account?{" "}
            <button 
              onClick={() => window.location.reload()} 
              className="text-secondary-500 font-semibold hover:text-secondary-600 hover:underline"
            >
              Sign up
            </button>
          </div>
        )}

        {showForgot && (
          <ForgotPasswordModal onClose={() => setShowForgot(false)} />
        )}
        </div>
      </div>
    </>
  );
}