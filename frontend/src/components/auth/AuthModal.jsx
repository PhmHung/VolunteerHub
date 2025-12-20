import { useState, useEffect, memo } from "react";
import { 
  Eye, EyeOff, X, ArrowLeft, Mail, Shield, User, 
  Upload, CheckCircle2, AlertCircle, Loader2, 
  Heart, Globe, Users, FileText
} from "lucide-react"; 
import api from "../../api.js"; 
import FirebaseLogin from "./FirebaseLogin.jsx"; 

const SIDE_IMAGE_URL = "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070&auto=format&fit=crop";

// --- CSS STYLES ---
const GLOBAL_STYLES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
`;

// --- COMPONENT: SIDEBAR (Giữ nguyên để tránh giật) ---
const InspirationalSidebar = memo(({ mode }) => (
  <div className="hidden md:flex md:w-5/12 bg-blue-700 relative overflow-hidden flex-col justify-between text-white p-10 select-none">
    <div className="absolute inset-0 z-0 pointer-events-none">
      <img src={SIDE_IMAGE_URL} alt="Volunteers" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-blue-900/70 to-gray-900/40 mix-blend-multiply" />
    </div>

    <div className="relative z-10 h-full flex flex-col justify-between pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
        </div>
        <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-lg">
          VolunteerHub
        </span>
      </div>

      <div key={mode} className="space-y-4 animate-fade-in-up">
        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white drop-shadow-md">
          {mode === "login" 
            ? "Kết nối trái tim, lan tỏa yêu thương." 
            : "Đâu cần thanh niên có, đâu khó có thanh niên."}
        </h1>
        <p className="text-gray-100 text-base lg:text-lg font-medium italic opacity-90 drop-shadow">
          {mode === "login"
            ? "\"Hạnh phúc không phải là nhận lại, mà là cho đi.\""
            : "Cùng nhau, chúng ta kiến tạo một Việt Nam nhân ái."}
        </p>
      </div>

      <div className="flex gap-4 text-xs font-bold text-white uppercase tracking-wider">
        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
          <Globe className="w-3 h-3" /> 63 Tỉnh thành
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
          <Users className="w-3 h-3" /> Cộng đồng trẻ
        </div>
      </div>
    </div>
  </div>
));

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegisteredPicture(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

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

              <div className="space-y-5">
                
                {/* Alerts */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-start gap-3 border border-red-100 font-medium animate-[fadeIn_0.2s]">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                  </div>
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
        </div>
      </div>
    </>
  );
}