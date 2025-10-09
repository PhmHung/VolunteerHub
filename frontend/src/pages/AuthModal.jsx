import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import FirebaseLogin from "../components/FirebaseLogin";

export default function AuthModal({ mode, onClose, onSuccess, setToken, setPicture }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [biography, setBiography] = useState("");
  const [registeredPicture, setRegisteredPicture] = useState(null);


  const [code, setCode] = useState("");
  const [step, setStep] = useState(mode === "login" ? 1 : 0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false); //show password
  const [success, setSuccess] = useState(""); //show notifications


  const sendVerification = async () => {
    setLoading(true);
    try {
      if (!email) {
        setError("Email is required");
        setLoading(false);
        return;
      }
      await axios.post("http://localhost:5000/auth/sendVerificationCode", { email });
      setStep(1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      if (!code) {
        setError("Verification code is required");
        setLoading(false);
        return;
      }
      await axios.post("http://localhost:5000/auth/verifyCode", { email, code });
      setStep(2);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);

    const missingFields = [];
    if (!password) missingFields.push("Password");
    if (!name) missingFields.push("Name");

    if (missingFields.length > 0) {
        setError("Please fill in: " + missingFields.join(", "));
        setLoading(false);
        return;
    }

    try {
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("name", name);
        formData.append("biography", biography);
        formData.append("picture", registeredPicture); // file ảnh

        const res = await axios.post("http://localhost:5000/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        });

        onSuccess(res.data);
        setSuccess("Register successful!");
        setTimeout(() => {
        onClose();
        }, 3000);
    } catch (err) {
        setError(err.response?.data?.message || "Register failed");
    } finally {
        setLoading(false);
    }
    };


  const handleLogin = async () => {
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/auth/login", { email, password });
      
      onSuccess(res.data);
      setSuccess("Login successful!");

      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {/* Register Step 0 */}
        {mode === "register" && step === 0 && (
          <>
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mb-2 p-2 border rounded-2xl"
            />
            <button
              onClick={sendVerification}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-2xl"
            >
              Send Verification Code
            </button>
          </>
        )}

        {/* Register Step 1 */}
        {mode === "register" && step === 1 && (
          <>
            <label className="block mb-1 font-medium">Verification Code *</label>
            <input
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full mb-2 p-2 border rounded-2xl"
            />
            <button
              onClick={verifyCode}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-2xl"
            >
              Verify Code
            </button>
          </>
        )}

        {/* Register Step 2 & Login */}
        {((mode === "register" && step === 2) || mode === "login") && (
          <>
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              readOnly={mode === "register" && step === 2}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full mb-2 p-2 border rounded-2xl ${
                mode === "register" && step === 2 ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            <label className="block mb-1 font-medium">Password *</label>

            <div className="relative w-full mb-2">
            <input
                type={show ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 pr-10 border rounded-2xl"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            </div>



{mode === "register" && step === 2 && (
  <div className="grid grid-cols-2 gap-4">
    <div className="col-span-2">
      <label className="block mb-1 font-medium">Name *</label>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full p-2 border rounded-2xl"
      />
    </div>

    <div>
      <label className="block mb-1 font-medium">Picture</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setRegisteredPicture(e.target.files[0])}
        className="w-full p-2 border rounded-2xl"
      />
    </div>

    <div className="col-span-2">
      <label className="block mb-1 font-medium">Biography</label>
      <textarea
        placeholder="Write something about yourself"
        value={biography}
        onChange={(e) => setBiography(e.target.value)}
        className="w-full p-2 border rounded-2xl"
      />
    </div>
  </div>
)}






            <button
              onClick={mode === "login" ? handleLogin : handleRegister}
              disabled={loading}
              className="mt-5 w-full bg-green-500 text-white py-2 rounded-2xl"
            >
              {mode === "login" ? "Login" : "Register"}
            </button>
          </>
        )}

        {success ? (
        <p className="text-green-600 mt-2">{success}</p>
        ) : (
        error && <p className="text-red-500 mt-2">{error}</p>
        )}

{mode === "login" && (
  <FirebaseLogin setToken={setToken} setPicture={setPicture} />
)}

      </div>

    </div>
  );
}
