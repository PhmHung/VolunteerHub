import { 
  MOCK_REGISTRATIONS, 
  MOCK_VOLUNTEERS 
} from './mockRegistrations';
import { MOCK_EVENTS } from './mockEvents';
import { MOCK_USER } from '../utils/mockUser';

// In-memory storage for registrations (sẽ reset khi reload page)
let registrationsData = [...MOCK_REGISTRATIONS];

export const getRegistrationsList = () => registrationsData;

// Helper: Tính số lượng volunteers đã accepted cho một event
const getAcceptedCount = (eventId) => {
  return registrationsData.filter(
    reg => reg.eventId === eventId && reg.status === 'accepted'
  ).length;
};

// Helper: Update event's currentParticipants
const updateEventParticipants = (eventId) => {
  const acceptedCount = getAcceptedCount(eventId);
  // Lưu vào localStorage để persist
  const eventsData = JSON.parse(localStorage.getItem('mockEventsData') || '{}');
  eventsData[eventId] = { currentParticipants: acceptedCount };
  localStorage.setItem('mockEventsData', JSON.stringify(eventsData));
  return acceptedCount;
};

// Mock API: Đăng ký sự kiện (tạo registration với status = pending)
export const mockRegisterForEvent = async (eventId, userId = MOCK_USER._id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Kiểm tra event có tồn tại không
      const event = MOCK_EVENTS.find(e => e._id === eventId || e.id === eventId);
      if (!event) {
        reject({ message: "Sự kiện không tồn tại" });
        return;
      }

      // Kiểm tra đã đăng ký chưa
      const existingReg = registrationsData.find(
        reg => reg.eventId === eventId && reg.userId === userId
      );
      if (existingReg) {
        reject({ message: "Bạn đã đăng ký sự kiện này" });
        return;
      }

      // Tạo registration mới với status = pending
      const newReg = {
        _id: `reg-${Date.now()}`,
        userId,
        eventId,
        registeredAt: new Date().toISOString(),
        status: "pending", // Mặc định là pending, chưa được tính vào currentParticipants
      };

      registrationsData.push(newReg);
      
      // Lưu vào localStorage
      localStorage.setItem('mockRegistrations', JSON.stringify(registrationsData));

      resolve({
        success: true,
        message: "Đăng ký thành công! Vui lòng chờ ban tổ chức duyệt.",
        data: newReg,
      });
    }, 500);
  });
};

// Mock API: Manager/Admin accept registration
export const mockAcceptRegistration = async (registrationId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const regIndex = registrationsData.findIndex(r => r._id === registrationId);
      
      if (regIndex === -1) {
        reject({ message: "Không tìm thấy đăng ký" });
        return;
      }

      const registration = registrationsData[regIndex];
      
      // Kiểm tra event còn slot không
      const event = MOCK_EVENTS.find(e => e._id === registration.eventId || e.id === registration.eventId);
      if (!event) {
        reject({ message: "Sự kiện không tồn tại" });
        return;
      }

      const currentAccepted = getAcceptedCount(registration.eventId);
      if (currentAccepted >= event.maxParticipants) {
        reject({ message: "Sự kiện đã đủ số lượng tham gia" });
        return;
      }

      // Cập nhật status thành accepted
      registrationsData[regIndex] = {
        ...registration,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
      };

      // Cập nhật currentParticipants của event
      const newCount = updateEventParticipants(registration.eventId);

      // Lưu vào localStorage
      localStorage.setItem('mockRegistrations', JSON.stringify(registrationsData));

      resolve({
        success: true,
        message: "Đã chấp nhận tình nguyện viên",
        data: registrationsData[regIndex],
        eventParticipants: newCount,
      });
    }, 500);
  });
};

// Mock API: Manager/Admin reject registration
export const mockRejectRegistration = async (registrationId, reason = '') => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const regIndex = registrationsData.findIndex(r => r._id === registrationId);
      
      if (regIndex === -1) {
        reject({ message: "Không tìm thấy đăng ký" });
        return;
      }

      const registration = registrationsData[regIndex];
      const wasAccepted = registration.status === 'accepted';

      // Cập nhật status thành rejected
      registrationsData[regIndex] = {
        ...registration,
        status: "rejected",
        rejectedAt: new Date().toISOString(),
        rejectReason: reason,
      };

      // Nếu trước đó đã accepted, cần giảm currentParticipants
      let newCount = null;
      if (wasAccepted) {
        newCount = updateEventParticipants(registration.eventId);
      }

      // Lưu vào localStorage
      localStorage.setItem('mockRegistrations', JSON.stringify(registrationsData));

      resolve({
        success: true,
        message: "Đã từ chối tình nguyện viên",
        data: registrationsData[regIndex],
        eventParticipants: newCount,
      });
    }, 500);
  });
};

// Mock API: Hủy đăng ký
export const mockCancelRegistration = async (registrationId, userId = MOCK_USER._id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const regIndex = registrationsData.findIndex(r => r._id === registrationId);
      
      if (regIndex === -1) {
        reject({ message: "Không tìm thấy đăng ký" });
        return;
      }

      const registration = registrationsData[regIndex];

      // Kiểm tra quyền
      if (registration.userId !== userId && MOCK_USER.role !== 'admin') {
        reject({ message: "Không có quyền hủy đăng ký này" });
        return;
      }

      const wasAccepted = registration.status === 'accepted';

      // Xóa registration
      registrationsData.splice(regIndex, 1);

      // Nếu đã accepted, cần giảm currentParticipants
      let newCount = null;
      if (wasAccepted) {
        newCount = updateEventParticipants(registration.eventId);
      }

      // Lưu vào localStorage
      localStorage.setItem('mockRegistrations', JSON.stringify(registrationsData));

      resolve({
        success: true,
        message: "Đã hủy đăng ký",
        eventParticipants: newCount,
      });
    }, 500);
  });
};

// Mock API: Hủy đăng ký sự kiện (by Event ID)
export const mockCancelRegistrationByEventId = async (eventId, userId = MOCK_USER._id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const regIndex = registrationsData.findIndex(
        reg => reg.eventId === eventId && reg.userId === userId
      );

      if (regIndex === -1) {
        reject({ message: "Bạn chưa đăng ký sự kiện này" });
        return;
      }

      const registration = registrationsData[regIndex];
      
      // Kiểm tra trạng thái
      if (registration.status === 'rejected') {
        reject({ message: "Không thể hủy đăng ký đã bị từ chối" });
        return;
      }

      // Xóa khỏi danh sách (hoặc chuyển status thành cancelled nếu muốn lưu lịch sử)
      // Ở đây ta xóa luôn để đơn giản hóa
      registrationsData.splice(regIndex, 1);
      
      // Lưu vào localStorage
      localStorage.setItem('mockRegistrations', JSON.stringify(registrationsData));
      
      // Cập nhật lại số lượng participants nếu cần (nếu đã accepted)
      if (registration.status === 'accepted') {
        updateEventParticipants(eventId);
      }

      resolve({
        success: true,
        message: "Hủy đăng ký thành công",
      });
    }, 500);
  });
};

// Mock API: Lấy danh sách registrations của user
export const mockGetMyRegistrations = async (userId = MOCK_USER._id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userRegs = registrationsData.filter(reg => reg.userId === userId);
      
      // Join với thông tin event
      const regsWithEvents = userRegs.map(reg => {
        const event = MOCK_EVENTS.find(e => e._id === reg.eventId || e.id === reg.eventId);
        return {
          ...reg,
          event,
        };
      });

      resolve({
        success: true,
        data: regsWithEvents,
      });
    }, 300);
  });
};

// Mock API: Lấy danh sách registrations của một event (cho Manager)
export const mockGetEventRegistrations = async (eventId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const eventRegs = registrationsData.filter(reg => reg.eventId === eventId);
      
      // Join với thông tin volunteer
      const regsWithVolunteers = eventRegs.map(reg => {
        const volunteer = MOCK_VOLUNTEERS.find(v => v._id === reg.userId);
        return {
          ...reg,
          volunteer,
        };
      });

      resolve({
        success: true,
        data: regsWithVolunteers,
        stats: {
          total: eventRegs.length,
          pending: eventRegs.filter(r => r.status === 'pending').length,
          accepted: eventRegs.filter(r => r.status === 'accepted').length,
          rejected: eventRegs.filter(r => r.status === 'rejected').length,
        },
      });
    }, 300);
  });
};

// Mock API: Lấy thông tin event với currentParticipants chính xác
export const mockGetEventWithParticipants = (eventId) => {
  const event = MOCK_EVENTS.find(e => e._id === eventId || e.id === eventId);
  if (!event) return null;

  // Lấy currentParticipants từ localStorage hoặc tính lại
  const eventsData = JSON.parse(localStorage.getItem('mockEventsData') || '{}');
  const currentParticipants = eventsData[eventId]?.currentParticipants ?? getAcceptedCount(eventId);

  return {
    ...event,
    currentParticipants,
    registered: currentParticipants,
  };
};

// Mock API: Lấy tất cả events với currentParticipants chính xác
export const mockGetAllEventsWithParticipants = () => {
  return MOCK_EVENTS.map(event => mockGetEventWithParticipants(event._id || event.id));
};

// Initialize: Load registrations từ localStorage nếu có
export const initializeMockData = () => {
  const savedRegs = localStorage.getItem('mockRegistrations');
  if (savedRegs) {
    try {
      registrationsData = JSON.parse(savedRegs);
    } catch (e) {
      console.error('Failed to load registrations from localStorage', e);
    }
  }
  
  // Đồng bộ currentParticipants cho tất cả events
  MOCK_EVENTS.forEach(event => {
    updateEventParticipants(event._id || event.id);
  });
};

// Reset mock data về trạng thái ban đầu
export const resetMockData = () => {
  registrationsData = [...MOCK_REGISTRATIONS];
  localStorage.setItem('mockRegistrations', JSON.stringify(registrationsData));
  localStorage.removeItem('mockEventsData');
  
  // Đồng bộ lại
  MOCK_EVENTS.forEach(event => {
    updateEventParticipants(event._id || event.id);
  });
};

// Export registrations data cho các component khác
export const getMockRegistrations = () => registrationsData;
