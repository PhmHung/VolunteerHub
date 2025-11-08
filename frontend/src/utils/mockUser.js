const normalizeRole = (value) => {
  const raw = (value || "").toString().trim().toLowerCase();
  return raw === "admin" ? "admin" : "volunteer";
};

export const USE_MOCK = import.meta.env.VITE_USE_MOCK_BACKEND === "true";
export const MOCK_ROLE = normalizeRole(import.meta.env.VITE_MOCK_USER_ROLE);

const displayName =
  MOCK_ROLE === "admin" ? "Quản trị viên Demo" : "Tình nguyện viên Demo";
const email =
  MOCK_ROLE === "admin"
    ? "admin@volunteerhub.dev"
    : "volunteer@volunteerhub.dev";
const biography =
  MOCK_ROLE === "admin"
    ? "Bạn đang chạy ứng dụng với tài khoản quản trị mô phỏng."
    : "Bạn đang chạy ứng dụng với tài khoản tình nguyện viên mô phỏng.";

const timestamp = "2024-01-01T00:00:00.000Z";

export const MOCK_USER = Object.freeze({
  id: `mock-${MOCK_ROLE}`,
  _id: `mock-${MOCK_ROLE}`,
  userName: displayName,
  userEmail: email,
  role: MOCK_ROLE,
  profilePicture: null,
  personalInformation: {
    name: displayName,
    biography,
    picture: null,
  },
  notificationPrefs: {
    emailAnnouncements: true,
    emailAssignments: MOCK_ROLE === "admin",
  },
  createdAt: timestamp,
  updatedAt: timestamp,
});
