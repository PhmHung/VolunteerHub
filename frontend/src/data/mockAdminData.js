import { MOCK_EVENTS } from './mockEvents';
import { MOCK_VOLUNTEERS, MOCK_MANAGERS } from './mockRegistrations';
import { getRegistrationsList } from './mockApi';
import { MOCK_USER } from '../utils/mockUser';
import { createChannel } from './mockChannels';

// Mock Data cho Manager Requests
const MOCK_MANAGER_REQUESTS = [
  {
    id: 'req-m-001',
    candidate: {
      _id: 'u-005',
      userName: 'Trần Văn Quản',
      userEmail: 'quan.tran@example.com',
      profilePicture: 'https://i.pravatar.cc/150?u=manager1',
      age: 28
    },
    appliedAt: '2025-11-20T10:00:00Z',
    experience: 3,
    currentRole: 'Team Leader',
    organization: 'Green Earth NGO',
    linkedIn: 'https://linkedin.com/in/tranquan',
    cvUrl: '#',
    motivation: 'Tôi muốn đóng góp kinh nghiệm quản lý dự án của mình để phát triển cộng đồng tình nguyện viên lớn mạnh hơn.',
    status: 'pending'
  },
  {
    id: 'req-m-002',
    candidate: {
      _id: 'u-006',
      userName: 'Lê Thị Lý',
      userEmail: 'ly.le@example.com',
      profilePicture: 'https://i.pravatar.cc/150?u=manager2',
      age: 32
    },
    appliedAt: '2025-11-22T14:30:00Z',
    experience: 5,
    currentRole: 'Event Coordinator',
    organization: 'Youth Union',
    linkedIn: 'https://linkedin.com/in/lethily',
    cvUrl: '#',
    motivation: 'Mong muốn được thử sức ở môi trường mới và kết nối các bạn trẻ.',
    status: 'pending'
  }
];

// In-memory storage for manager requests
let managerRequestsData = [...MOCK_MANAGER_REQUESTS];

// Lấy danh sách sự kiện đang chờ duyệt (status = pending)
export const getPendingEvents = () => {
  return MOCK_EVENTS.filter(event => event.status === 'pending');
};

// Lấy danh sách tất cả các đăng ký đang chờ duyệt (status = pending)
// Join bảng Registration + User + Event
export const getPendingRegistrations = () => {
  return getRegistrationsList()
    .filter(reg => reg.status === 'pending')
    .map(reg => {
      const volunteer = MOCK_VOLUNTEERS.find(v => v._id === reg.userId) || {
        userName: 'Unknown User',
        userEmail: 'unknown@example.com',
        profilePicture: null,
        skills: [],
        phoneNumber: 'N/A'
      };
      
      const event = MOCK_EVENTS.find(e => e._id === reg.eventId || e.id === reg.eventId) || {
        title: 'Unknown Event',
        date: new Date().toISOString()
      };

      return {
        ...reg,
        volunteer,
        event
      };
    });
};

// Lấy danh sách yêu cầu làm Manager
export const getPendingManagerRequests = () => {
  return managerRequestsData.filter(req => req.status === 'pending');
};

// Mock function: Duyệt sự kiện
export const approveEventMock = (eventId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Update status in MOCK_EVENTS (in-memory)
      const event = MOCK_EVENTS.find(e => e.id === eventId || e._id === eventId);
      if (event) {
        event.status = 'approved';
        // Tự động tạo channel cho sự kiện
        createChannel(eventId);
        console.log(`Approved event ${eventId} and created channel`);
      }
      resolve({ success: true, message: "Đã duyệt sự kiện thành công" });
    }, 500);
  });
};

// Mock function: Từ chối sự kiện
export const rejectEventMock = (eventId, reason) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Rejected event ${eventId} because: ${reason}`);
      resolve({ success: true, message: "Đã từ chối sự kiện" });
    }, 500);
  });
};

// Mock function: Duyệt yêu cầu Manager
export const approveManagerRequestMock = (requestId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = managerRequestsData.findIndex(r => r.id === requestId);
      if (index !== -1) {
        managerRequestsData[index].status = 'approved';
        console.log(`Approved manager request ${requestId}`);
      }
      resolve({ success: true, message: "Đã duyệt yêu cầu lên Manager" });
    }, 500);
  });
};

// Mock function: Từ chối yêu cầu Manager
export const rejectManagerRequestMock = async (requestId, reason) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const req = managerRequestsData.find(r => r.id === requestId);
      if (req) {
        req.status = 'rejected';
        req.rejectionReason = reason;
      }
      resolve(true);
    }, 800);
  });
};

// Mock function: Xóa sự kiện
export const deleteEventMock = async (eventId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = MOCK_EVENTS.findIndex(e => e.id === eventId || e._id === eventId);
      if (index !== -1) {
        MOCK_EVENTS.splice(index, 1);
      }
      resolve(true);
    }, 500);
  });
};

// Mock function: Lock user
export const lockUserMock = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Helper to find and update user in any of the lists
      const updateUserStatus = (list) => {
        const user = list.find(u => u._id === userId || u.id === userId);
        if (user) {
          user.status = user.status === 'locked' ? 'active' : 'locked';
          return true;
        }
        return false;
      };

      // Try to find and update user in all lists
      if (!updateUserStatus(MOCK_VOLUNTEERS)) {
        if (!updateUserStatus(MOCK_MANAGERS)) {
          if (MOCK_USER._id === userId) {
            MOCK_USER.status = MOCK_USER.status === 'locked' ? 'active' : 'locked';
          }
        }
      }
      
      console.log(`User ${userId} status toggled`);
      resolve(true);
    }, 500);
  });
};
