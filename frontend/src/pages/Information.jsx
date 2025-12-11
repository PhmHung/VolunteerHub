import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api.js";
import { Eye, EyeOff, ShieldCheck, Bell, AlertCircle, Mail, Phone } from "lucide-react";
import { fetchUserProfile, updateUserProfile, changeUserPassword, clearMessages } from "../features/user/userSlice.js";

export default function Information({ onProfileUpdate }) {
  const dispatch = useDispatch();
  const { profile: reduxUser, profileLoading, message, error } = useSelector((state) => state.user);
  
  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync local user state with Redux
  useEffect(() => {
    if (reduxUser) {
      setUser(reduxUser);
    }
  }, [reduxUser]);

  // fetch user on mount
  useEffect(() => {
    if (token && userId) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, userId, token]);

  // Handle messages
  useEffect(() => {
    if (message) {
      window.alert(message);
      dispatch(clearMessages());
    }
    if (error) {
      window.alert(error);
      dispatch(clearMessages());
    }
  }, [message, error, dispatch]);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // keep local file and preview, upload on Save
    setPictureFile(file);
    const url = URL.createObjectURL(file);
    setPicturePreview(url);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      // attach picture when present
      if (pictureFile) {
        formData.append("picture", pictureFile);
      }

      // attach fields expected by backend: userName, phoneNumber, profile picture
      const pi = user.personalInformation || {};
      const nameValue = user.userName || pi.name || "";
      formData.append("userName", String(nameValue));
      // include phoneNumber if present
      if (user.phoneNumber) formData.append("phoneNumber", String(user.phoneNumber));
      // include biography as free-form field (backend may ignore it)
      if (pi.biography) formData.append("biography", String(pi.biography));

      // notification prefs (booleans as strings)
      const np = user.notificationPrefs || {};
      if ("emailAnnouncements" in np)
        formData.append(
          "notificationPrefs.emailAnnouncements",
          String(Boolean(np.emailAnnouncements))
        );
      if ("emailAssignments" in np)
        formData.append(
          "notificationPrefs.emailAssignments",
          String(Boolean(np.emailAssignments))
        );

      const res = await api.put("/user/profile", formData, {
        headers: {
          // Let axios set multipart Content-Type (boundary)
        },
      });

      if (res.data) {
        if (res.data.error) {
          // show error in window and refresh form with exact server state
          window.alert(res.data.error);
          dispatch(fetchUserProfile());
          setPictureFile(null);
          if (picturePreview) {
            URL.revokeObjectURL(picturePreview);
            setPicturePreview(null);
          }
          // keep editing so user can adjust
          setEditing(true);
        } else if (res.data.message && res.data.user) {
          setUser(res.data.user);
          if (res.data.user?.profilePicture) {
            localStorage.setItem("picture", res.data.user.profilePicture);
          }

          onProfileUpdate?.(res.data.user);

          setEditing(false);

          // clear picture temp
          if (picturePreview) {
            URL.revokeObjectURL(picturePreview);
            setPicturePreview(null);
          }
          setPictureFile(null);
        } else {
          throw new Error("Unexpected server response");
        } 
      } else {
        throw new Error("No response data from server");
      }
    } catch (err) {
      console.error("Update failed", err);
      const errMsg =
        err?.response?.data?.error || err.message || "Failed to update profile.";
      // alert the user and refresh to server state
      window.alert(errMsg);
      dispatch(fetchUserProfile());
      setPictureFile(null);
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
        setPicturePreview(null);
      }
      setEditing(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      // Note: backend exposes DELETE /user/:id for admin; attempting delete for current user may fail if not allowed.
      const targetId = user._id || user.id;
      await api.delete(`/user/${targetId}`);
      alert("Account deleted.");
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      const errMsg = err?.response?.data?.error || err.message || 'Failed to delete account';
      window.alert(errMsg);
    }
  };

  const handleChangePassword = async () => {
    // client-side validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      window.alert("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      window.alert("New password and confirmation do not match");
      return;
    }

    try {
      await dispatch(changeUserPassword({ currentPassword: oldPassword, newPassword })).unwrap();
      setPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      window.alert("Password changed successfully!");
    } catch (err) {
      const errMsg =
        err?.response?.data?.error || err.message || "Failed to change password";
      window.alert(errMsg);
    }
  };

  if (!user) return null;

  const email = user.userEmail || user.email || "—";
  const phone =
    user.phoneNumber ||
    user.personalInformation?.phoneNumber ||
    user.personalInformation?.phone ||
    "—";
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleString() : "—";
  const updatedAt = user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—";
  const displayName =
    user.personalInformation?.name ||
    user.userName ||
    user.name ||
    "Chưa cập nhật tên";
  const biography =
    user.personalInformation?.biography ||
    "Kể câu chuyện của bạn để cộng đồng hiểu thêm về hành trình thiện nguyện.";
  const roleLabel = user.role === "admin" ? "Quản trị viên" : "Tình nguyện viên";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 pb-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-600 to-secondary-600 text-white shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(var(--warning-400),0.3),_transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
            <div className="relative h-28 w-28 shrink-0">
              <div
                className="absolute inset-0 rounded-full bg-warning-400/40 blur-xl"
                aria-hidden="true"
              />
              <img
                src={
                  picturePreview ||
                  user.personalInformation?.picture ||
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+"
                }
                alt="Ảnh hồ sơ"
                className="relative h-full w-full rounded-full border-4 border-white/70 object-cover shadow-2xl"
              />
              {editing && (
                <label className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600 shadow-lg transition hover:bg-gray-100 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    className="hidden"
                  />
                  Cập nhật ảnh
                </label>
              )}
            </div>

            <div className="flex max-w-xl flex-col gap-4">
              <span className="inline-flex items-center rounded-full bg-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {roleLabel}
              </span>
              <h1 className="text-3xl font-extrabold md:text-4xl">{displayName}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-white">
                  <Mail className="h-4 w-4" />
                  Email: {email}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/90">{biography}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-lg transition hover:shadow-xl hover:bg-gray-50"
              >
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUpdate}
                className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition hover:shadow-xl hover:bg-yellow-500"
              >
                Lưu thay đổi
              </button>
            )}
            <button
              type="button"
              onClick={() => setPasswordModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              Xoá tài khoản
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                Thông tin cá nhân
              </h2>
              <p className="text-sm text-gray-600">
                Cập nhật tên hiển thị và chia sẻ câu chuyện của bạn để truyền cảm hứng cho cộng đồng.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Họ và tên
                </label>
                  <input
                    type="text"
                    value={user.userName || user.personalInformation?.name || ""}
                    readOnly={!editing}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        userName: e.target.value,
                      })
                    }
                    className={`w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                      !editing ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
                    }`}
                    placeholder="Nhập tên của bạn"
                  />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                  Giới thiệu bản thân
                </label>
                <textarea
                  rows={5}
                  value={user.personalInformation?.biography || ""}
                  readOnly={!editing}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      personalInformation: {
                        ...(user.personalInformation || {}),
                        biography: e.target.value,
                      },
                    })
                  }
                  className={`w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base leading-relaxed text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                    !editing ? "cursor-not-allowed bg-gray-100 text-gray-500" : ""
                  }`}
                  placeholder="Chia sẻ kinh nghiệm, đam mê và mong muốn đóng góp của bạn."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                <Bell className="h-4 w-4 text-blue-600" /> Thông báo
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <label
                  className={`flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 transition ${
                    editing ? "hover:border-blue-400 cursor-pointer" : "cursor-not-allowed opacity-70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(user.notificationPrefs?.emailAnnouncements)}
                    disabled={!editing}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        notificationPrefs: {
                          ...(user.notificationPrefs || {}),
                          emailAnnouncements: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Nhận email về sự kiện mới, cập nhật dự án và câu chuyện tác động.
                  </span>
                </label>
                <label
                  className={`flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 transition ${
                    editing ? "hover:border-blue-400 cursor-pointer" : "cursor-not-allowed opacity-70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(user.notificationPrefs?.emailAssignments)}
                    disabled={!editing}
                    onChange={(e) =>
                      setUser({
                        ...user,
                        notificationPrefs: {
                          ...(user.notificationPrefs || {}),
                          emailAssignments: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Thông báo khi bạn được phân công nhiệm vụ hoặc cần xác nhận tham gia.
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Thông tin tài khoản
              </h3>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div>
                  <span className="font-semibold text-gray-900">Email:</span> {email}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Mã tài khoản:</span> {user._id || user.id || "—"}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Ngày tạo:</span> {createdAt}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Cập nhật gần nhất:</span> {updatedAt}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-300 bg-yellow-50 p-6 text-sm text-gray-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-1 h-5 w-5 text-yellow-600" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Lưu ý bảo mật</h4>
                  <p>
                    Thay đổi mật khẩu định kỳ và giữ thông tin liên hệ luôn cập nhật để chúng tôi có thể liên lạc khi cần.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setPasswordModal(false)}
              className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
              aria-label="Đóng"
            >
              ✕
            </button>
            <div className="mb-6 space-y-2">
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                Đổi mật khẩu
              </h2>
              <p className="text-sm text-gray-600">
                Đảm bảo mật khẩu mới đủ mạnh với tối thiểu 6 ký tự.
              </p>
            </div>

            {[
              {
                label: "Mật khẩu hiện tại",
                value: oldPassword,
                setValue: setOldPassword,
                show: showOld,
                setShow: setShowOld,
              },
              {
                label: "Mật khẩu mới",
                value: newPassword,
                setValue: setNewPassword,
                show: showNew,
                setShow: setShowNew,
              },
              {
                label: "Xác nhận mật khẩu",
                value: confirmPassword,
                setValue: setConfirmPassword,
                show: showConfirm,
                setShow: setShowConfirm,
              },
            ].map((field, i) => (
              <div key={i} className="relative mb-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {field.label}
                </label>
                <input
                  type={field.show ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => field.setShow((s) => !s)}
                  className="absolute right-4 top-9 text-gray-400 transition hover:text-gray-600"
                >
                  {field.show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            ))}

            <button
              onClick={handleChangePassword}
              className="mt-2 w-full rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              Cập nhật mật khẩu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
