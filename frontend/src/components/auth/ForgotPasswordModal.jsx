import { useState } from "react";
import api from "../../api.js";

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(0); // 0=email, 1=code+new pass
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Gửi mã reset
  const sendResetCode = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      localStorage.setItem("resetToken", response.data.resetToken);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  // Reset mật khẩu
  const resetPassword = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/api/auth/reset-password", {
        resetToken: localStorage.getItem("resetToken"),
        code,
        newPassword,
      });
      setSuccess("Password reset successful!");
      localStorage.removeItem("resetToken");
      localStorage.setItem("token", response.data.token);
      setTimeout(onClose, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-muted hover:text-text-main"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          Quên mật khẩu
        </h2>

        {step === 0 && (
          <>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mb-3"
            />
            <button
              onClick={sendResetCode}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Sending..." : "Gửi mã xác nhận"}
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Mã xác nhận"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field mb-2"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field mb-3"
            />
            <button
              onClick={resetPassword}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Processing..." : "Đặt lại mật khẩu"}
            </button>
          </>
        )}

        {success && (
          <p className="mt-3 text-success-600 text-sm text-center">
            {success}
          </p>
        )}
        {error && (
          <p className="mt-3 text-error-600 text-sm text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
