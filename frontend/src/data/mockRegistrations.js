import { MOCK_EVENTS } from './mockEvents';

// Mock registrations to mirror backend Registration model
export const MOCK_REGISTRATIONS = [
  // Current user (mock-volunteer) registrations
  {
    _id: "reg-001",
    userId: "mock-volunteer",
    eventId: "evt-001",
    registeredAt: "2025-10-01T09:00:00.000Z",
    status: "accepted", // Đã được accept - có thể xem danh sách volunteers
    completionStatus: "completed", // Đã hoàn thành sự kiện
  },
  {
    _id: "reg-002",
    userId: "mock-volunteer",
    eventId: "evt-003",
    registeredAt: "2025-10-10T14:30:00.000Z",
    status: "pending", // Đang chờ accept - chưa xem được danh sách
    completionStatus: "not-completed",
  },
  {
    _id: "reg-003",
    userId: "mock-volunteer",
    eventId: "evt-004",
    registeredAt: "2025-10-15T08:00:00.000Z",
    status: "accepted", // Đã được accept
    completionStatus: "not-completed", // Chưa hoàn thành
  },
  {
    _id: "reg-004",
    userId: "mock-volunteer",
    eventId: "evt-006",
    registeredAt: "2025-10-18T10:30:00.000Z",
    status: "rejected", // Bị từ chối
    completionStatus: "not-completed",
  },
  // Thêm registrations cho user mock-volunteer với các sự kiện mới
  {
    _id: "reg-005",
    userId: "mock-volunteer",
    eventId: "evt-008",
    registeredAt: "2025-11-01T08:00:00.000Z",
    status: "accepted",
    completionStatus: "completed", // Đã hoàn thành
  },
  {
    _id: "reg-006",
    userId: "mock-volunteer",
    eventId: "evt-009",
    registeredAt: "2025-11-05T14:00:00.000Z",
    status: "accepted",
    completionStatus: "not-completed", // Chưa hoàn thành
  },
  {
    _id: "reg-007",
    userId: "mock-volunteer",
    eventId: "evt-010",
    registeredAt: "2025-11-10T09:30:00.000Z",
    status: "pending", // Đang chờ duyệt
    completionStatus: "not-completed",
  },
  {
    _id: "reg-008",
    userId: "mock-volunteer",
    eventId: "evt-012",
    registeredAt: "2025-11-15T16:00:00.000Z",
    status: "accepted",
    completionStatus: "not-completed",
  },
  {
    _id: "reg-009",
    userId: "mock-volunteer",
    eventId: "evt-015",
    registeredAt: "2025-11-20T07:00:00.000Z",
    status: "accepted",
    completionStatus: "completed", // Đã hoàn thành
  },
  
  // Other volunteers for event evt-001 (để hiện trong danh sách social media)
  {
    _id: "reg-101",
    userId: "volunteer-001",
    eventId: "evt-001",
    registeredAt: "2025-09-28T14:20:00.000Z",
    status: "accepted",
  },
  {
    _id: "reg-102",
    userId: "volunteer-002",
    eventId: "evt-001",
    registeredAt: "2025-09-29T09:15:00.000Z",
    status: "accepted",
  },
  {
    _id: "reg-103",
    userId: "volunteer-003",
    eventId: "evt-001",
    registeredAt: "2025-09-30T16:45:00.000Z",
    status: "pending", // Người này chưa được accept
  },
  
  // Other volunteers for event evt-004
  {
    _id: "reg-201",
    userId: "volunteer-004",
    eventId: "evt-004",
    registeredAt: "2025-10-10T11:00:00.000Z",
    status: "accepted",
  },
  {
    _id: "reg-202",
    userId: "volunteer-005",
    eventId: "evt-004",
    registeredAt: "2025-10-11T15:30:00.000Z",
    status: "accepted",
  },
  
  // Manager registrations
  {
    _id: "reg-301",
    userId: "mock-manager",
    eventId: "evt-005",
    registeredAt: "2025-10-20T12:00:00.000Z",
    status: "accepted",
  },
];

// Mock volunteers data
export const MOCK_VOLUNTEERS = [
  {
    _id: "volunteer-001",
    userName: "Nguyễn Văn An",
    userEmail: "an.nguyen@gmail.com",
    profilePicture: "https://i.pravatar.cc/150?img=1",
    phoneNumber: "0912345001",
    role: "volunteer",
    skills: ["Làm vườn", "Ngoại ngữ"],
  },
  {
    _id: "volunteer-002",
    userName: "Trần Thị Bình",
    userEmail: "binh.tran@gmail.com",
    profilePicture: "https://i.pravatar.cc/150?img=2",
    phoneNumber: "0912345002",
    role: "volunteer",
    skills: ["Dạy học", "Sơ cứu"],
  },
  {
    _id: "volunteer-003",
    userName: "Lê Hoàng Cường",
    userEmail: "cuong.le@gmail.com",
    profilePicture: "https://i.pravatar.cc/150?img=3",
    phoneNumber: "0912345003",
    role: "volunteer",
    skills: ["Nhiếp ảnh", "Marketing"],
  },
  {
    _id: "volunteer-004",
    userName: "Phạm Thị Dung",
    userEmail: "dung.pham@gmail.com",
    profilePicture: "https://i.pravatar.cc/150?img=4",
    phoneNumber: "0912345004",
    role: "volunteer",
    skills: ["Tổ chức sự kiện", "Giao tiếp"],
  },
  {
    _id: "volunteer-005",
    userName: "Hoàng Minh Đức",
    userEmail: "duc.hoang@gmail.com",
    profilePicture: "https://i.pravatar.cc/150?img=5",
    phoneNumber: "0912345005",
    role: "volunteer",
    skills: ["Thể thao", "Chăm sóc trẻ em"],
  },
  {
    _id: "mock-volunteer",
    userName: "Tình nguyện viên Demo",
    userEmail: "volunteer@volunteerhub.dev",
    profilePicture: null,
    phoneNumber: "0987654321",
    role: "volunteer",
    skills: ["Nhiệt tình", "Trách nhiệm"],
  },
];

// Mock managers data
export const MOCK_MANAGERS = [
  {
    _id: 'mock-manager',
    userName: 'Người quản lý Demo',
    userEmail: 'manager@volunteerhub.dev',
    role: 'manager',
    profilePicture: null
  }
];

// Registration status
export const REGISTRATION_STATUS = {
  pending: { label: "Chờ duyệt", color: "amber" },
  accepted: { label: "Đã chấp nhận", color: "emerald" },
  rejected: { label: "Từ chối", color: "red" },
  cancelled: { label: "Đã hủy", color: "gray" },
  waitlisted: { label: "Danh sách chờ", color: "blue" },
};

// Helper to get registrations from storage or default
export const getMockRegistrations = () => {
  const stored = localStorage.getItem('mockRegistrations');
  return stored ? JSON.parse(stored) : MOCK_REGISTRATIONS;
};

// Helper function: Get volunteers list for an event (only for accepted users or creator)
export const getEventVolunteers = (eventId, currentUserId) => {
  const registrations = getMockRegistrations();

  // Check if user is the creator
  const event = MOCK_EVENTS.find(e => e.id === eventId || e._id === eventId);
  const isCreator = event && event.createdBy === currentUserId;

  // Check if user is accepted
  const currentUserReg = registrations.find(
    (reg) => reg.eventId === eventId && reg.userId === currentUserId
  );
  const isAccepted = currentUserReg && currentUserReg.status === "accepted";

  if (!isCreator && !isAccepted) {
    throw new Error("Bạn phải được chấp nhận tham gia sự kiện mới xem được danh sách tình nguyện viên");
  }

  // If creator, show all registrations (pending, accepted, rejected)
  // If volunteer, show only accepted
  let relevantRegistrations;
  
  if (isCreator) {
    relevantRegistrations = registrations.filter(
      (reg) => reg.eventId === eventId
    );
  } else {
    relevantRegistrations = registrations.filter(
      (reg) => reg.eventId === eventId && reg.status === "accepted"
    );
  }

  // Join with volunteer info
  return relevantRegistrations.map((reg) => {
    const volunteer = MOCK_VOLUNTEERS.find((v) => v._id === reg.userId) || {
        userName: "Unknown User",
        userEmail: "unknown",
        _id: reg.userId
    };
    return {
      ...volunteer,
      registrationId: reg._id,
      registeredAt: reg.registeredAt,
      status: reg.status // Include status for manager to see
    };
  });
};

// Helper function: Get user's registrations
export const getUserRegistrations = (userId) => {
  const registrations = getMockRegistrations();
  return registrations.filter((reg) => reg.userId === userId);
};

// Helper function: Check if user can view event volunteers
export const canViewEventVolunteers = (eventId, currentUserId) => {
  const registrations = getMockRegistrations();

  // Check if user is the creator
  const event = MOCK_EVENTS.find(e => e.id === eventId || e._id === eventId);
  if (event && event.createdBy === currentUserId) return true;

  const registration = registrations.find(
    (reg) => reg.eventId === eventId && reg.userId === currentUserId
  );
  return registration && registration.status === "accepted";
};

// Helper function: Check if user is the event creator
export const isEventCreator = (eventId, currentUserId) => {
  const event = MOCK_EVENTS.find((e) => e._id === eventId);
  return event && event.creatorId === currentUserId;
};

export default MOCK_REGISTRATIONS;
