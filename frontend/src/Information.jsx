import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function Information({ setPicture }) {
  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;

  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
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

  // fetch user helper (used on mount and to refresh after errors)
  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  useEffect(() => {
    if (token && userId) fetchUser();
  }, [userId, token]);

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

      console.log(pictureFile);

      // attach picture when present
      if (pictureFile) {
        formData.append('picture', pictureFile);
      }

      // attach personalInformation fields using dot-notation
      const pi = user.personalInformation || {};
      if ('name' in pi) formData.append('personalInformation.name', String(pi.name || ''));
      if ('biography' in pi) formData.append('personalInformation.biography', String(pi.biography || ''));

      // notification prefs (booleans as strings)
      const np = user.notificationPrefs || {};
      if ('emailAnnouncements' in np) formData.append('notificationPrefs.emailAnnouncements', String(Boolean(np.emailAnnouncements)));
      if ('emailAssignments' in np) formData.append('notificationPrefs.emailAssignments', String(Boolean(np.emailAssignments)));

      const res = await axios.put(
        `http://localhost:5000/user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Let axios set multipart Content-Type (boundary)
          },
        }
      );

      if (res.data) {
        if (res.data.error) {
          // show error in window and refresh form with exact server state
          window.alert(res.data.error);
          await fetchUser();
          setPictureFile(null);
          if (picturePreview) {
            URL.revokeObjectURL(picturePreview);
            setPicturePreview(null);
          }
          // keep editing so user can adjust
          setEditing(true);
        } else if (res.data.message && res.data.user) {
          setUser(res.data.user);
          if (res.data.user?.personalInformation?.picture) {
            localStorage.setItem("picture", res.data.user.personalInformation.picture);
            setPicture(res.data.user.personalInformation.picture);
          }

          setEditing(false);

          // clear picture temp
          if (picturePreview) {
            URL.revokeObjectURL(picturePreview);
            setPicturePreview(null);
          }
          setPictureFile(null);
        } else {
          throw new Error('Unexpected server response');
        }
      } else {
        throw new Error('No response data from server');
      }
    } catch (err) {
      console.error('Update failed', err);
      const errMsg = err?.response?.data?.error || err.message || 'Failed to update profile.';
      // alert the user and refresh to server state
      window.alert(errMsg);
      await fetchUser();
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
      await axios.delete(`http://localhost:5000/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      window.alert('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      window.alert('New password and confirmation do not match');
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/user/change-password/${userId}`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res);

      if (res.data && res.data.message) {
        window.alert(res.data.message);
        setPasswordModal(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (res.data && res.data.error) {
        window.alert(res.data.error);
      } else {
        window.alert('Password change response unexpected');
      }
    } catch (err) {
      const errMsg = err?.response?.data?.error || err.message || 'Failed to change password';
      window.alert(errMsg);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-y-3 w-full mx-auto min-w-0">
      <section className="flex flex-col gap-3 w-full max-w-none p-4 rounded-2xl bg-white/50 backdrop-blur-md shadow-lg overflow-hidden">

        {/* AVATAR */}
        <div className="flex flex-col items-center">
            <img
                src={
                picturePreview ||
                user.personalInformation.picture ||
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+" // ảnh trắng
                }
                alt="Picture"
                className="w-32 h-32 rounded-full object-cover border bg-white"
            />
          {editing && (
            <input
              type="file"
              accept="image/*"
              onChange={handlePictureChange}
              className="mt-2"
            />
          )}
        </div>

        {/* PERSONAL INFO */}
        <div className="flex flex-col gap-4">
          {/* FULL NAME */}
          <div>
            <label className={`block font-medium text-base`}>
              Name
            </label>
            <input
              type="text"
              value={user.personalInformation.name}
              readOnly={!editing}
              onChange={(e) =>
                setUser({
                  ...user,
                  personalInformation: { ...user.personalInformation, name: e.target.value },
                })
              }
              className={`w-full p-2 border rounded-2xl text-base ${!editing ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* BIO */}
          <div className="col-span-2">
            <label className={`block font-medium text-base`}>
              Biography
            </label>
            <textarea
              value={user.personalInformation.biography}
              readOnly={!editing}
              onChange={(e) =>
                setUser({
                  ...user,
                  personalInformation: { ...user.personalInformation, biography: e.target.value },
                })
              }
              className={`w-full p-2 border rounded-2xl text-base ${!editing ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>

        {/* READ-ONLY FIELDS */}
        <div className={`grid grid-cols-2 gap-4 mt-4 text-base`}>
          <div><b>Email:</b> {user.email}</div>
          <div><b>ID:</b> {user._id}</div>
          <div><b>Created:</b> {new Date(user.createdAt).toLocaleString()}</div>
          <div><b>Updated:</b> {new Date(user.updatedAt).toLocaleString()}</div>
        </div>

        {/* ACTION BUTTONS */}
        <div className={`flex gap-3 mt-4 text-base`}>
          {!editing ? (
            <button
              onClick={() => { setOriginalUser(JSON.parse(JSON.stringify(user))); setEditing(true); }}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-4 py-2 rounded-2xl"
            >
              Save
            </button>
          )}
          <button
            onClick={() => setPasswordModal(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-2xl"
          >
            Change Password
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-2xl"
          >
            Delete Account
          </button>
        </div>

      </section>

      {/* PASSWORD MODAL */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-lg">
            <button
              onClick={() => setPasswordModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className={`text-xl font-bold mb-4 ${getFontSizeClass(setting.fontSize, "large")}`}>
              Change Password
            </h2>

            {[{
              label: "Old Password",
              value: oldPassword,
              setValue: setOldPassword,
              show: showOld,
              setShow: setShowOld
            }, {
              label: "New Password",
              value: newPassword,
              setValue: setNewPassword,
              show: showNew,
              setShow: setShowNew
            }, {
              label: "Confirm Password",
              value: confirmPassword,
              setValue: setConfirmPassword,
              show: showConfirm,
              setShow: setShowConfirm
            }].map((field, i) => (
              <div key={i} className="relative w-full mb-2">
                <label className={`block mb-1 font-medium text-base`}>
                  {field.label}
                </label>
                <input
                  type={field.show ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => field.setValue(e.target.value)}
                  className={`w-full p-2 pr-10 border rounded-2xl text-base`}
                />
                <button
                  type="button"
                  onClick={() => field.setShow((s) => !s)}
                  className="absolute inset-y-0 right-2 top-7 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {field.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            ))}

            <button
              onClick={handleChangePassword}
              className="w-full bg-green-500 text-white py-2 rounded-2xl"
            >
              Update Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
