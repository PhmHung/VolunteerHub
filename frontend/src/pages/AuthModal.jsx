import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Icons để show/hide password
import axios from "axios"; // HTTP client
import FirebaseLogin from "../components/FirebaseLogin"; // Component login bằng Firebase

export default function AuthModal({ mode, onClose, onSuccess }) {
  // ========== STATE MANAGEMENT ==========
  // States cho form fields
  const [email, setEmail] = useState(""); // Email người dùng
  const [password, setPassword] = useState(""); // Password
  const [name, setName] = useState(""); // Tên đầy đủ (chỉ dùng khi register)
  const [role, setRole] = useState("volunteer"); // Vai trò: "volunteer" hoặc "admin"
  const [biography, setBiography] = useState(""); // Tiểu sử (optional)
  const [registeredPicture, setRegisteredPicture] = useState(null); // File ảnh đại diện

  // States cho flow đăng ký (3 bước)
  // Step 0: Nhập email → Gửi mã xác thực
  // Step 1: Nhập mã xác thực → Verify
  // Step 2: Hoàn tất thông tin (password, name, etc.)
  const [code, setCode] = useState(""); // Mã xác thực 6 số
  const [step, setStep] = useState(mode === "login" ? 1 : 0); // Login bỏ qua step 0,1

  // States cho UI
  const [loading, setLoading] = useState(false); // Trạng thái đang load
  const [show, setShow] = useState(false); // Show/hide password

  // Local UI messages (AuthModal manages its own error/success state now)
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");



  // ========== FUNCTION: GỬI MÃ XÁC THỰC ==========
  // Được gọi ở Step 0 của Register
  // Gửi email đến backend → Backend gửi code qua email
  const sendVerification = async () => {
    setLoading(true); // Bật loading spinner
    setError(""); // Clear error cũ
    try {
      // Validation: Kiểm tra email có được nhập chưa
      if (!email) {
        setError("Email is required");
        setLoading(false);
        return;
      }
      // Gọi API gửi verification code
      await axios.post("http://localhost:5000/auth/sendVerificationCode", { email });
      setStep(1); // Chuyển sang step 1 (nhập code)
      setError(""); // Clear error
    } catch (err) {
      // Hiển thị error từ server hoặc message mặc định
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  // ========== FUNCTION: XÁC THỰC MÃ ==========
  // Được gọi ở Step 1 của Register
  // Gửi code user nhập đến backend để verify
  const verifyCode = async () => {
    setLoading(true);
    try {
      // Validation: Kiểm tra code có được nhập chưa
      if (!code) {
        setError("Verification code is required");
        setLoading(false);
        return;
      }
      // Gọi API verify code
      await axios.post("http://localhost:5000/auth/verifyCode", { email, code });
      setStep(2); // Chuyển sang step 2 (hoàn tất profile)
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCTION: ĐĂNG KÝ TÀI KHOẢN ==========
  // Được gọi ở Step 2 của Register
  // Gửi toàn bộ thông tin user đến backend để tạo account
  const handleRegister = async () => {
    setLoading(true);

    // Validation: Kiểm tra các trường bắt buộc
    const missingFields = [];
    if (!password) missingFields.push("Password");
    if (!name) missingFields.push("Name");

    if (missingFields.length > 0) {
        setError("Please fill in: " + missingFields.join(", "));
        setLoading(false);
        return;
    }

    try {
        // Tạo FormData để gửi file ảnh
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("name", name);
        formData.append("biography", biography);
        formData.append("picture", registeredPicture); // File object
        formData.append("role", "volunteer"); // Mặc định là volunteer
        
        // Nếu chọn admin, thêm flag adminRequest
        if (role === 'admin') {
          formData.append("adminRequest", "true");
        }
        
        // Gọi API register với multipart/form-data header
        const res = await axios.post("http://localhost:5000/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        });

        // Xác định success message dựa trên role
        const successMessage = role === 'admin' 
          ? "Đăng ký thành công! Yêu cầu làm Quản trị viên của bạn đã được gửi và đang chờ xét duyệt."
          : "Register successful!";
        
        // Hiển thị success message NGAY LẬP TỨC
        setSuccess(successMessage);
        setError(""); // Clear error nếu có

        // Đợi user đọc message (3-4s) rồi mới gọi onSuccess (đóng modal)
        setTimeout(() => {
          onSuccess(res.data);
        }, role === 'admin' ? 4000 : 3000);

    } catch (err) {
        setError(err.response?.data?.message || "Register failed");
        setSuccess(""); // Clear success message khi có lỗi
    } finally {
        setLoading(false);
    }
    };


  // ========== FUNCTION: ĐĂNG NHẬP ==========
  // Gửi email + password đến backend để xác thực
  const handleLogin = async () => {
    setLoading(true);

    // Validation: Kiểm tra email và password
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      // Gọi API login
      const res = await axios.post("http://localhost:5000/auth/login", { email, password });
      
      // Hiển thị success message NGAY LẬP TỨC
      setSuccess("Login successful!");
      setError(""); // Clear error nếu có

      // Đợi 3 giây để user đọc message, sau đó mới gọi onSuccess (đóng modal)
      setTimeout(() => {
        onSuccess(res.data);
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setSuccess(""); // Clear success message khi có lỗi
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER UI ==========
  return (
    // Overlay toàn màn hình
    // fixed inset-0: Position fixed, top/right/bottom/left = 0 (full screen)
    // z-50: Z-index cao để hiện trên tất cả
    // flex items-center justify-center: Flexbox, căn giữa theo cả 2 chiều
    // bg-black/60: Background đen với opacity 60%
    // backdrop-blur-sm: Làm mờ nội dung phía sau
    // p-4: Padding 1rem (16px) tất cả các cạnh
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] relative shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
      
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 backdrop-blur-sm rounded-full p-1"
        >
          {/* SVG icon X để đóng */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5 sm:p-6 md:p-8 overflow-y-auto flex-1">
          <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#005A9C] to-[#0077CC] rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-blue-200">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {mode === "login" ? "Welcome back" : "Join VolunteerHub"}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              {mode === "login" 
                ? "Login to your account to continue" 
                : "Create an account to start volunteering"}
            </p>
          </div>

        {/* Register Step 0 */}
        {mode === "register" && step === 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email</label>
              <input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all outline-none text-sm sm:text-base"
              />
            </div>
            <button
              onClick={sendVerification}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#005A9C] to-[#0077CC] hover:from-[#004A82] hover:to-[#0066B3] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {/* Register Step 1 */}
        {mode === "register" && step === 1 && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all outline-none text-sm sm:text-base"
              />
            </div>
            <button
              onClick={verifyCode}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#005A9C] to-[#0077CC] hover:from-[#004A82] hover:to-[#0066B3] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        )}

        {/* Register Step 2 & Login */}
        {((mode === "register" && step === 2) || mode === "login") && (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email</label>
              <input
                type="email"
                placeholder="m@example.com"
                value={email}
                readOnly={mode === "register" && step === 2}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all outline-none text-sm sm:text-base ${
                  mode === "register" && step === 2 ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {mode === "login" && (
                  <a href="#" className="text-xs sm:text-sm text-[#F4A261] hover:text-[#E08B3E] hover:underline font-medium">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all outline-none text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {mode === "register" && step === 2 && (
              <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all outline-none text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setRegisteredPicture(e.target.files[0])}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all outline-none file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-[#A8D0E6] file:text-[#005A9C] hover:file:bg-[#8CBCD9] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Biography (Optional)</label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all outline-none resize-none text-sm sm:text-base"
                  />
                </div>
                {/* === BƯỚC 2: Thêm UI chọn vai trò === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Vai trò của bạn</label>
              <div className="flex items-center gap-x-6">
                <label className="flex items-center gap-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="volunteer"
                    checked={role === "volunteer"}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-4 w-4 text-[#005A9C] focus:ring-[#0077CC] border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Tình nguyện viên</span>
                </label>
                <label className="flex items-center gap-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-4 w-4 text-[#005A9C] focus:ring-[#0077CC] border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Quản trị viên</span>
                </label>
              </div>
            </div>
              </div>
            )}

            <button
              onClick={mode === "login" ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F4A261] to-[#FFC107] hover:from-[#E08B3E] hover:to-[#FFB300] text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading 
                ? "Processing..." 
                : mode === "login" 
                  ? "Login" 
                  : "Complete Registration"}
            </button>

            {mode === "login" && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-2 sm:px-3 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* FirebaseLogin now returns auth result via onSuccess callback */}
                <FirebaseLogin onSuccess={(data) => {
                  // data should contain { token, picture, user }
                  if (data?.token) {
                    // reuse onSuccess provided by App to finalize login
                    onSuccess(data);
                  }
                }} />
              </>
            )}
          </div>
        )}

        {success && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}
        
        {error && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-start gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {mode === "login" && (
          <div className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
            Don't have an account?{" "}
            <button 
              onClick={() => window.location.reload()} 
              className="text-[#F4A261] font-semibold hover:text-[#E08B3E] hover:underline"
            >
              Sign up
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
