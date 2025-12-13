# VolunteerHub Frontend - Architecture Documentation

## 📁 Cấu Trúc Dự Án

```
frontend/src/
├── api.js                  # Axios instance với interceptors
├── main.jsx               # Entry point
├── App.jsx                # Root component với routing
├── index.css              # Global styles
├── types.js               # Type definitions
│
├── components/            # UI Components
│   ├── common/           # Reusable components
│   │   ├── StatCard.jsx
│   │   ├── Toast.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── PromptModal.jsx
│   ├── admin/            # Admin-specific components
│   │   ├── EventApprovalModal.jsx
│   │   ├── AdminUsersTab.jsx
│   │   └── AdminEventsTab.jsx
│   └── media/            # Media-related components
│
├── pages/                 # Page-level components
│   ├── Home.jsx
│   ├── Dashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── ManagerDashboard.jsx
│   ├── Events.jsx
│   └── ...
│
├── features/              # Redux slices (Domain-driven)
│   ├── auth/
│   │   └── authSlice.js
│   ├── event/
│   │   └── eventSlice.js
│   ├── user/
│   │   └── userSlice.js
│   └── registration/
│       └── registrationSlice.js
│
├── hooks/                 # Custom React Hooks
│   ├── index.js          # Barrel export
│   ├── useToast.js       # Toast notification management
│   ├── useGeolocation.js # Geolocation operations
│   └── useAdminDashboard.js # Admin dashboard logic
│
├── services/              # Business Logic Layer
│   ├── index.js          # Barrel export
│   └── eventService.js   # Event-related business logic
│
├── utils/                 # Utility Functions
│   ├── constants.js      # App-wide constants
│   ├── validationSchemas.js # Yup validation schemas
│   ├── exportUtils.js    # CSV/JSON export utilities
│   ├── mapHelpers.js     # Map/geolocation helpers
│   └── dateHelpers.js    # Date formatting utilities
│
├── store/                 # Redux store configuration
│   └── index.js
│
└── config/                # Configuration files
    └── firebase.js
```

## 🎯 Design Patterns Sử Dụng

### 1. **Container/Presentational Pattern**
- **Container Components**: `App.jsx`, `AdminDashboard.jsx`, `ManagerDashboard.jsx`
  - Chứa business logic, state management
  - Connect với Redux store
  - Xử lý side effects (API calls, routing)

- **Presentational Components**: `StatCard.jsx`, `EventApprovalModal.jsx`
  - Chỉ nhận props và render UI
  - Không có logic nghiệp vụ
  - Dễ test và tái sử dụng

### 2. **Custom Hook Pattern**
**Hooks** tách logic nghiệp vụ khỏi UI components:

```javascript
// hooks/useToast.js
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type) => { /*...*/ };
  const removeToast = (id) => { /*...*/ };
  return { toasts, addToast, removeToast };
};

// Sử dụng:
const MyComponent = () => {
  const { toasts, addToast } = useToast();
  // ...
};
```

**Custom hooks trong dự án:**
- `useToast` - Quản lý notifications
- `useGeolocation` - Lấy vị trí người dùng
- `useAdminDashboard` - Business logic cho Admin Dashboard

### 3. **Service Layer Pattern**
**Services** chứa business logic thuần túy, không phụ thuộc React:

```javascript
// services/eventService.js
export const filterEvents = (events, filters) => {
  // Pure business logic
};

export const getEventStatus = (event) => {
  // Pure function
};
```

### 4. **Utility Module Pattern**
**Utils** chứa helper functions có thể tái sử dụng:

```javascript
// utils/mapHelpers.js
export const calculateDistanceKm = (pointA, pointB) => { /*...*/ };
export const formatDistance = (value) => { /*...*/ };
```

### 5. **Barrel Export Pattern**
Tổ chức imports sạch sẽ hơn:

```javascript
// hooks/index.js
export { useToast } from './useToast';
export { useGeolocation } from './useGeolocation';

// Usage:
import { useToast, useGeolocation } from '../hooks';
```

## 📝 Code Style Guidelines

### Import Organization
Imports được sắp xếp theo thứ tự:
1. **React core** - React, hooks
2. **Third-party libraries** - Redux, React Router, Lucide Icons, etc.
3. **Internal modules** - Features, components, utils
4. **Styles** - CSS imports

```javascript
// React core
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Third-party
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, MapPin } from 'lucide-react';

// Internal - Features
import { fetchEvents } from '../features/event/eventSlice';

// Internal - Components
import Header from '../components/Header';

// Internal - Utils
import { EVENT_CATEGORIES } from '../utils/constants';

// Styles
import './styles.css';
```

### JSDoc Comments
Mọi function/component đều có JSDoc:

```javascript
/**
 * Calculate distance between two geographic points
 * @param {Object} pointA - First point {lat, lng}
 * @param {Object} pointB - Second point {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistanceKm = (pointA, pointB) => {
  // Implementation
};
```

### Component Documentation
```javascript
/**
 * @file StatCard.jsx
 * @description Reusable statistics card component
 * @pattern Presentational Component Pattern
 */

/**
 * StatCard Component
 * Displays a statistic with icon, value, and change percentage
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {number} props.value - Main value
 * @returns {JSX.Element}
 */
const StatCard = ({ title, value }) => {
  // ...
};
```

## 🔄 Data Flow

### Redux Flow
```
Component → dispatch(action) → Thunk → API → 
→ Redux State Update → Component Re-render
```

### Custom Hook Flow
```
Component → useCustomHook() → Local State + Business Logic →
→ Return state & methods → Component uses them
```

### Service Layer Flow
```
Component → Service Function → Pure Business Logic →
→ Return processed data → Component renders
```

## ✅ Best Practices Implemented

1. **Separation of Concerns**
   - UI logic trong components
   - Business logic trong services
   - State management trong Redux slices
   - Reusable logic trong custom hooks

2. **Single Responsibility Principle**
   - Mỗi component/function chỉ làm 1 việc
   - Tách component lớn thành nhiều component nhỏ

3. **DRY (Don't Repeat Yourself)**
   - Custom hooks cho logic lặp lại
   - Utility functions cho operations chung

4. **Documentation**
   - JSDoc cho mọi function/component
   - File headers với pattern description
   - Inline comments cho logic phức tạp

5. **Code Organization**
   - Grouped imports theo category
   - Barrel exports cho clean imports
   - Folder structure theo domain

## 🚀 Usage Examples

### Using Custom Hooks
```javascript
import { useToast } from '../hooks';

const MyComponent = () => {
  const { toasts, addToast, removeToast } = useToast();
  
  const handleAction = () => {
    addToast('Action completed!', 'success');
  };
  
  return (
    <>
      <button onClick={handleAction}>Do Something</button>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};
```

### Using Services
```javascript
import { filterEvents, sortEvents } from '../services';

const EventsList = ({ events }) => {
  const filtered = filterEvents(events, {
    search: 'volunteer',
    category: 'Môi trường',
    status: 'approved'
  });
  
  const sorted = sortEvents(filtered, 'date', 'asc');
  
  return <div>{/* render sorted events */}</div>;
};
```

### Using Utils
```javascript
import { calculateDistanceKm, formatDistance } from '../utils/mapHelpers';
import { formatDate } from '../utils/dateHelpers';

const distance = calculateDistanceKm(pointA, pointB);
console.log(formatDistance(distance)); // "2.5 km"
console.log(formatDate(event.startDate)); // "T2, 09/12"
```

## 📊 Component Hierarchy

```
App (Container)
├── Header (Presentational)
├── Routes
│   ├── HomePage (Presentational)
│   ├── Dashboard (Container)
│   │   └── Uses: useGeolocation, mapHelpers, dateHelpers
│   ├── AdminDashboard (Container)
│   │   └── Uses: useAdminDashboard, useToast
│   │       ├── StatCard (Presentational)
│   │       ├── AdminUsersTab (Presentational)
│   │       └── EventApprovalModal (Presentational)
│   └── ...
└── Footer (Presentational)
```
