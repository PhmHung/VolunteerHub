// Mock registrations to mirror backend Registration model
export const MOCK_REGISTRATIONS = [
  {
    _id: "reg-001",
    userId: "mock-volunteer",
    eventId: "evt-001",
    registeredAt: "2025-10-01T09:00:00.000Z",
    status: "registered",
  },
  {
    _id: "reg-002",
    userId: "mock-volunteer",
    eventId: "evt-003",
    registeredAt: "2025-10-10T14:30:00.000Z",
    status: "registered",
  },
  {
    _id: "reg-003",
    userId: "mock-manager",
    eventId: "evt-005",
    registeredAt: "2025-10-20T12:00:00.000Z",
    status: "registered",
  },
];

export default MOCK_REGISTRATIONS;
