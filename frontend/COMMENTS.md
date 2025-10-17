# 📝 Code Comments - VolunteerHub Frontend

## Tài liệu giải thích chi tiết code và Tailwind CSS

---

## 📄 Home.jsx - Trang chủ

### **Imports**
```javascript
import { motion } from "framer-motion";        // Animation library
import { Heart, Users, Calendar, ArrowRight } from "lucide-react"; // Icons
import { Link } from "react-router-dom";       // Navigation không reload
import Card from "../components/Card.jsx";     // Feature card
import heroImage from "../assets/hd1.png";     // Ảnh placeholder
import Hero from "../components/Hero.jsx";     // Hero section
```

### **Props**
- `token`: JWT token (null nếu chưa login)
- `openAuth`: Function mở modal - `openAuth("register" | "login")`

### **Features Array**
```javascript
const features = [
  { icon: Heart, title: "...", description: "...", src: heroImage }
  // Heart, Users, Calendar = Lucide icons (components)
];
```

### **Tailwind Classes Breakdown**

#### Container chính
```jsx
<div className="w-full">
  {/* w-full: Width 100% - Full-bleed layout */}
```

#### Content wrapper
```jsx
<div className="w-full px-6 sm:px-12 lg:px-20 py-10">
  {/* 
    w-full: Width 100%
    px-6: Padding horizontal 1.5rem (mobile)
    sm:px-12: 3rem từ 640px (tablet)
    lg:px-20: 5rem từ 1024px (desktop)
    py-10: Padding vertical 2.5rem
  */}
```

#### Features Grid
```jsx
<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
  {/* 
    grid: Display grid
    gap-4: Gap 1rem giữa cards
    sm:grid-cols-2: 2 cột từ 640px
    xl:grid-cols-3: 3 cột từ 1280px
    
    Mobile: 1 cột (stack)
    Tablet: 2 cột
    Desktop: 3 cột
  */}
```

#### CTA Section
```jsx
<motion.section
  className="rounded-3xl border border-[#A8D0E6]/70 bg-white/70 p-8 text-center shadow-lg shadow-blue-200/30"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.5 }}
>
  {/* 
    TAILWIND:
    - rounded-3xl: Border radius 1.5rem (rất tròn)
    - border: Border 1px
    - border-[#A8D0E6]/70: Màu xanh nhạt, opacity 70%
    - bg-white/70: Background trắng semi-transparent
    - p-8: Padding 2rem
    - text-center: Căn giữa text
    - shadow-lg: Box shadow lớn
    - shadow-blue-200/30: Shadow xanh nhạt 30%
    
    FRAMER MOTION:
    - initial: Trạng thái đầu (ẩn, y+20px)
    - whileInView: Khi scroll vào view (hiện, y=0)
    - viewport.once: Chỉ animate 1 lần
    - viewport.amount: 0.3 = trigger khi 30% visible
    - transition: 0.5s
  */}
```

#### Button Styles
```jsx
<Link className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#005A9C] to-[#0077CC] px-5 py-3 text-base font-semibold text-white hover:from-[#004A82] hover:to-[#0066B3] hover:shadow-2xl hover:shadow-blue-400/50 active:scale-95 transition-all shadow-lg">
  {/* 
    inline-flex: Display inline-flex
    items-center: Căn giữa vertical
    gap-2: Gap 0.5rem giữa text và icon
    rounded-2xl: Border radius 1rem
    bg-gradient-to-r: Gradient ngang
    from-[#005A9C]: Xanh đậm (start)
    to-[#0077CC]: Xanh sáng (end)
    px-5: Padding horizontal 1.25rem
    py-3: Padding vertical 0.75rem
    text-base: Font size 1rem
    font-semibold: Weight 600
    text-white: Màu trắng
    hover:from-[#004A82]: Gradient đậm hơn khi hover
    hover:to-[#0066B3]: End color đậm hơn
    hover:shadow-2xl: Shadow lớn hơn
    hover:shadow-blue-400/50: Shadow xanh 50%
    active:scale-95: Scale 95% khi click
    transition-all: Transition mọi property
    shadow-lg: Shadow mặc định
  */}
```

---

## 📄 Hero.jsx - Hero Section

### **Cấu trúc**
```jsx
<section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
  <video /> {/* Background video */}
  <div className="absolute inset-0 bg-gradient-to-r" /> {/* Overlay */}
  <div className="relative z-10"> {/* Content */}
    <h1>Tiêu đề</h1>
    <p>Mô tả</p>
    <Buttons />
  </div>
</section>
```

### **Tailwind Classes**

#### Container
```css
relative              /* Position relative cho absolute children */
w-full                /* Width 100% - full-bleed */
min-h-[85vh]          /* Min height 85% viewport height */
flex items-center     /* Flex, căn giữa vertical */
justify-center        /* Căn giữa horizontal */
overflow-hidden       /* Ẩn phần tràn */
```

#### Video Background
```jsx
<video className="absolute inset-0 w-full h-full object-cover">
  {/* 
    absolute: Position absolute
    inset-0: top/right/bottom/left = 0 (full parent)
    w-full h-full: Width & height 100%
    object-cover: Cover parent, không méo (như background-size: cover)
  */}
```

#### Dark Overlay
```jsx
<div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
  {/* 
    absolute inset-0: Phủ toàn bộ parent
    bg-gradient-to-r: Gradient ngang
    from-black/60: Đen 60% opacity (trái)
    via-black/40: Đen 40% opacity (giữa)
    to-transparent: Trong suốt (phải)
    
    → Tạo gradient tối → sáng để text bên trái rõ ràng
  */}
```

#### Content Container
```jsx
<div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
  {/* 
    relative: Position relative
    z-10: Z-index 10 (nổi lên trên overlay)
    max-w-4xl: Max width 56rem (896px)
    mx-auto: Margin auto (căn giữa)
    px-6: Padding horizontal 1.5rem
    text-center: Căn giữa text
  */}
```

#### Typography - Responsive
```jsx
<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
  {/* 
    Responsive font sizes:
    - text-4xl: 2.25rem / 36px (mobile)
    - sm:text-5xl: 3rem / 48px (≥640px)
    - md:text-6xl: 3.75rem / 60px (≥768px)
    - lg:text-7xl: 4.5rem / 72px (≥1024px)
    
    font-bold: Weight 700
    text-white: Màu trắng
    drop-shadow-2xl: Text shadow rất lớn (để nổi trên video)
  */}
```

#### Buttons Container
```jsx
<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
  {/* 
    mt-8: Margin top 2rem
    flex: Display flex
    flex-col: Direction column (mobile - buttons stack)
    sm:flex-row: Direction row từ 640px (buttons ngang)
    gap-4: Gap 1rem giữa buttons
    justify-center: Căn giữa
  */}
```

---

## 📄 Header.jsx - Navigation Bar

### **Cấu trúc**
```jsx
<header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b">
  <nav>
    <Logo />
    <DesktopNav className="hidden md:flex" />
    <AuthButtons />
    <MobileMenuButton className="md:hidden" />
  </nav>
</header>

{/* Mobile Dropdown */}
<AnimatePresence>
  {isOpen && <MobileMenu />}
</AnimatePresence>
```

### **Tailwind Classes**

#### Header Container
```css
sticky                /* Position sticky (dính khi scroll) */
top-0                 /* Top 0 khi sticky */
z-40                  /* Z-index 40 (trên content, dưới modals) */
bg-white/95           /* Background trắng 95% opacity */
backdrop-blur-md      /* Blur background phía sau 12px */
border-b              /* Border bottom 1px */
border-gray-200       /* Màu border xám nhạt */
```

#### Desktop Navigation
```jsx
<div className="hidden md:flex items-center gap-6">
  {/* 
    hidden: Ẩn mặc định (mobile)
    md:flex: Display flex từ 768px (tablet/desktop)
    items-center: Căn giữa vertical
    gap-6: Gap 1.5rem giữa links
  */}
```

#### Mobile Menu Button
```jsx
<button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
  {/* 
    md:hidden: Ẩn từ 768px (chỉ show mobile)
    p-2: Padding 0.5rem
    rounded-lg: Border radius 0.5rem
    hover:bg-gray-100: Background xám nhạt khi hover
  */}
```

#### Active Link
```jsx
<Link className={`
  px-3 py-2 rounded-lg transition-colors
  ${isActive 
    ? 'bg-[#005A9C] text-white' 
    : 'text-gray-700 hover:bg-gray-100'
  }
`}>
  {/* 
    px-3: Padding horizontal 0.75rem
    py-2: Padding vertical 0.5rem
    rounded-lg: Border radius 0.5rem
    transition-colors: Transition màu sắc
    
    Active state:
    - bg-[#005A9C]: Background xanh primary
    - text-white: Text trắng
    
    Inactive state:
    - text-gray-700: Text xám đậm
    - hover:bg-gray-100: Background xám nhạt khi hover
  */}
```

#### Logo với Sparkles
```jsx
<div className="flex items-center gap-2">
  <Sparkles className="h-6 w-6 text-[#005A9C]" />
  <span className="text-xl font-bold bg-gradient-to-r from-[#005A9C] to-[#0077CC] bg-clip-text text-transparent">
    {/* 
      bg-gradient-to-r: Gradient ngang
      from-[#005A9C] to-[#0077CC]: Xanh đậm → sáng
      bg-clip-text: Clip background vào text
      text-transparent: Text transparent (để thấy gradient)
      
      → Tạo text với gradient fill
    */}
```

#### Mobile Dropdown Animation
```jsx
<motion.div
  initial={{ opacity: 0, height: 0 }}
  animate={{ opacity: 1, height: 'auto' }}
  exit={{ opacity: 0, height: 0 }}
  transition={{ duration: 0.2 }}
  className="md:hidden bg-white border-b shadow-lg"
>
  {/* 
    Framer Motion:
    - initial: Ẩn, height 0
    - animate: Hiện, height auto
    - exit: Fade out, collapse
    - duration: 0.2s
    
    Tailwind:
    - md:hidden: Chỉ show mobile
    - bg-white: Background trắng
    - border-b: Border bottom
    - shadow-lg: Shadow lớn
  */}
```

---

## 📄 Card.jsx - Feature Card

### **Props**
```javascript
{
  icon: Component,      // Lucide icon (Heart, Users, etc)
  title: String,        // Tiêu đề
  description: String,  // Mô tả
  src: String          // URL ảnh background
}
```

### **Cấu trúc**
```jsx
<motion.div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
  <img className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60" />
  <div className="relative p-6">
    <IconContainer />
    <Title />
    <Description />
  </div>
</motion.div>
```

### **Tailwind Classes**

#### Card Container
```css
group                   /* Khai báo group cho hover children */
relative                /* Position relative */
overflow-hidden         /* Ẩn phần tràn */
rounded-2xl             /* Border radius 1rem */
bg-white                /* Background trắng */
shadow-lg               /* Shadow lớn */
hover:shadow-xl         /* Shadow rất lớn khi hover */
transition-all          /* Transition tất cả */
hover:-translate-y-2    /* Dịch lên 8px khi hover */
```

#### Image Background
```jsx
<img className="h-48 w-full object-cover" src={src} />
  {/* 
    h-48: Height 12rem (192px)
    w-full: Width 100%
    object-cover: Cover container, không méo
  */}
```

#### Icon Container
```jsx
<div className="mb-4 inline-flex rounded-full bg-[#A8D0E6]/20 p-3">
  <Icon className="h-6 w-6 text-[#005A9C]" />
  {/* 
    mb-4: Margin bottom 1rem
    inline-flex: Display inline-flex
    rounded-full: Border radius 9999px (tròn)
    bg-[#A8D0E6]/20: Màu xanh nhạt, opacity 20%
    p-3: Padding 0.75rem
    
    Icon:
    h-6 w-6: Kích thước 24x24px
    text-[#005A9C]: Màu xanh primary
  */}
```

#### Title
```jsx
<h3 className="text-xl font-bold text-gray-900 mb-2">
  {/* 
    text-xl: Font size 1.25rem
    font-bold: Weight 700
    text-gray-900: Màu xám rất đậm
    mb-2: Margin bottom 0.5rem
  */}
```

#### Description
```jsx
<p className="text-sm text-gray-600 leading-relaxed">
  {/* 
    text-sm: Font size 0.875rem
    text-gray-600: Màu xám vừa
    leading-relaxed: Line height 1.625
  */}
```

---

## 📄 AuthModal.jsx - Modal Đăng ký/Đăng nhập

### **Props**
```javascript
{
  mode: "login" | "register",
  onClose: Function,
  onSuccess: Function,
  error: String,
  success: String,
  setError: Function,
  setSuccess: Function
}
```

### **States**
```javascript
const [email, setEmail] = useState("");           // Email
const [password, setPassword] = useState("");     // Password
const [name, setName] = useState("");             // Họ tên
const [role, setRole] = useState("volunteer");    // Role: volunteer/admin
const [biography, setBiography] = useState("");   // Tiểu sử
const [registeredPicture, setRegisteredPicture] = useState(null); // File ảnh
const [code, setCode] = useState("");             // Mã xác thực 6 số
const [step, setStep] = useState(0);              // Bước: 0, 1, 2
const [loading, setLoading] = useState(false);    // Loading state
const [show, setShow] = useState(false);          // Show/hide password
```

### **Flow đăng ký**
```
Step 0: sendVerification()
  → POST /api/auth/send-verification
  → Backend gửi code qua email
  → setStep(1)

Step 1: verifyCode()
  → POST /api/auth/verify-code
  → Backend check code
  → setStep(2)

Step 2: handleRegister()
  → FormData với picture, name, email, password, role, biography
  → POST /api/auth/register (hoặc /request-admin)
  → Success → setSuccess → setTimeout → onSuccess
```

### **Tailwind Classes Chi Tiết**

#### Modal Overlay
```css
fixed                 /* Position fixed */
inset-0               /* top/right/bottom/left = 0 (full screen) */
z-50                  /* Z-index 50 (trên mọi thứ) */
flex                  /* Display flex */
items-center          /* Căn giữa vertical */
justify-center        /* Căn giữa horizontal */
bg-black/60           /* Background đen, opacity 60% */
backdrop-blur-sm      /* Blur phía sau 4px */
p-4                   /* Padding 1rem */
```

#### Modal Container
```css
bg-white              /* Background trắng */
rounded-3xl           /* Border radius 1.5rem */
w-full                /* Width 100% */
max-w-md              /* Max width 28rem (448px) */
max-h-[90vh]          /* Max height 90% viewport */
relative              /* Position relative */
shadow-2xl            /* Shadow rất lớn */
overflow-hidden       /* Ẩn tràn */
border                /* Border 1px */
border-gray-100       /* Màu border xám rất nhạt */
flex flex-col         /* Flex column (để content scroll) */
```

#### Close Button
```css
absolute              /* Position absolute */
top-4 right-4         /* Top 1rem, right 1rem */
z-10                  /* Z-index 10 */
text-gray-400         /* Màu xám nhạt */
hover:text-gray-600   /* Xám đậm khi hover */
transition-colors     /* Transition màu */
bg-white/80           /* Background trắng 80% */
backdrop-blur-sm      /* Blur 4px */
rounded-full          /* Tròn */
p-1                   /* Padding 0.25rem */
```

#### Content Wrapper (Scrollable)
```css
p-5 sm:p-6 md:p-8     /* Padding responsive: 1.25rem → 1.5rem → 2rem */
overflow-y-auto       /* Scroll dọc khi cần */
flex-1                /* Flex grow 1 (chiếm hết space) */
```

#### Form Input
```jsx
<input className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:border-transparent transition-all" />
  {/* 
    w-full: Width 100%
    px-3 py-2.5: Padding 0.75rem horizontal, 0.625rem vertical (mobile)
    sm:px-4 sm:py-3: 1rem x 0.75rem từ 640px
    border border-gray-300: Border 1px xám
    rounded-xl: Border radius 0.75rem
    text-sm sm:text-base: Font 0.875rem → 1rem
    focus:outline-none: Không outline khi focus
    focus:ring-2: Ring 2px khi focus
    focus:ring-[#005A9C]: Ring xanh primary
    focus:border-transparent: Border transparent khi focus
    transition-all: Transition mọi property
  */}
```

#### Submit Button
```jsx
<button className="w-full bg-gradient-to-r from-[#005A9C] to-[#0077CC] text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:from-[#004A82] hover:to-[#0066B3] focus:outline-none focus:ring-2 focus:ring-[#005A9C] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl" disabled={loading}>
  {/* 
    w-full: Width 100%
    bg-gradient-to-r: Gradient ngang
    from-[#005A9C] to-[#0077CC]: Xanh đậm → sáng
    text-white: Text trắng
    py-2.5 sm:py-3: Padding vertical responsive
    rounded-xl: Border radius 0.75rem
    font-semibold: Weight 600
    hover:from-[#004A82] hover:to-[#0066B3]: Gradient đậm hơn
    focus:outline-none: Không outline
    focus:ring-2: Ring 2px khi focus
    focus:ring-[#005A9C]: Ring xanh
    focus:ring-offset-2: Offset 2px
    disabled:opacity-50: Opacity 50% khi disabled
    disabled:cursor-not-allowed: Cursor not-allowed
    transition-all: Transition tất cả
    shadow-lg: Shadow lớn
    hover:shadow-xl: Shadow rất lớn khi hover
  */}
```

#### Role Selection (Radio Buttons)
```jsx
<div className="flex gap-4">
  <label className="flex-1 cursor-pointer">
    <input type="radio" className="peer sr-only" />
    <div className="rounded-xl border-2 border-gray-300 p-3 sm:p-4 text-center peer-checked:border-[#005A9C] peer-checked:bg-[#005A9C]/5 transition-all">
      {/* 
        peer: Khai báo peer cho peer-checked
        sr-only: Screen reader only (ẩn input radio)
        
        Div wrapper:
        rounded-xl: Border radius 0.75rem
        border-2: Border 2px
        border-gray-300: Màu xám (default)
        p-3 sm:p-4: Padding responsive
        text-center: Căn giữa
        peer-checked:border-[#005A9C]: Border xanh khi radio checked
        peer-checked:bg-[#005A9C]/5: Background xanh nhạt 5%
        transition-all: Transition
      */}
    </div>
  </label>
</div>
```

#### Success/Error Messages
```jsx
{success && (
  <div className="mb-3 sm:mb-4 rounded-xl bg-green-50 border border-green-200 p-3 sm:p-4">
    <p className="text-sm sm:text-base text-green-700 font-medium">
      {/* 
        mb-3 sm:mb-4: Margin bottom responsive
        rounded-xl: Border radius 0.75rem
        bg-green-50: Background xanh lá nhạt
        border border-green-200: Border xanh lá
        p-3 sm:p-4: Padding responsive
        
        Text:
        text-sm sm:text-base: Font size responsive
        text-green-700: Màu xanh lá đậm
        font-medium: Weight 500
      */}
```

---

## 🎨 Tailwind Utility Classes - Tổng hợp

### **Spacing Scale**
```
0.5 = 0.125rem = 2px
1   = 0.25rem  = 4px
2   = 0.5rem   = 8px
3   = 0.75rem  = 12px
4   = 1rem     = 16px
5   = 1.25rem  = 20px
6   = 1.5rem   = 24px
8   = 2rem     = 32px
10  = 2.5rem   = 40px
12  = 3rem     = 48px
16  = 4rem     = 64px
20  = 5rem     = 80px
```

### **Font Size Scale**
```
text-xs   = 0.75rem  = 12px
text-sm   = 0.875rem = 14px
text-base = 1rem     = 16px
text-lg   = 1.125rem = 18px
text-xl   = 1.25rem  = 20px
text-2xl  = 1.5rem   = 24px
text-3xl  = 1.875rem = 30px
text-4xl  = 2.25rem  = 36px
text-5xl  = 3rem     = 48px
text-6xl  = 3.75rem  = 60px
text-7xl  = 4.5rem   = 72px
```

### **Font Weight**
```
font-light     = 300
font-normal    = 400
font-medium    = 500
font-semibold  = 600
font-bold      = 700
```

### **Border Radius**
```
rounded-none   = 0
rounded-sm     = 0.125rem = 2px
rounded        = 0.25rem  = 4px
rounded-md     = 0.375rem = 6px
rounded-lg     = 0.5rem   = 8px
rounded-xl     = 0.75rem  = 12px
rounded-2xl    = 1rem     = 16px
rounded-3xl    = 1.5rem   = 24px
rounded-full   = 9999px
```

### **Shadow**
```
shadow-sm  = 0 1px 2px rgba(0,0,0,0.05)
shadow     = 0 1px 3px rgba(0,0,0,0.1)
shadow-md  = 0 4px 6px rgba(0,0,0,0.1)
shadow-lg  = 0 10px 15px rgba(0,0,0,0.1)
shadow-xl  = 0 20px 25px rgba(0,0,0,0.1)
shadow-2xl = 0 25px 50px rgba(0,0,0,0.25)
```

### **Breakpoints**
```
sm  = 640px   (Tablet portrait)
md  = 768px   (Tablet landscape)
lg  = 1024px  (Desktop)
xl  = 1280px  (Large desktop)
2xl = 1536px  (Extra large)
```

### **Common Patterns**

#### Centered Container
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

#### Flex Center
```jsx
<div className="flex items-center justify-center">
```

#### Grid Responsive
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

#### Button Primary
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition">
```

#### Card
```jsx
<div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
```

#### Input Field
```jsx
<input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
```

---

## 🚀 Best Practices

### 1. **Mobile First**
Luôn viết class cho mobile trước, sau đó thêm breakpoints:
```jsx
className="text-sm sm:text-base lg:text-lg"
```

### 2. **Consistent Spacing**
Dùng scale nhất quán (4, 6, 8, 12, 16...):
```jsx
className="p-4 sm:p-6 lg:p-8"
```

### 3. **Color Palette**
Stick với brand colors:
```css
Primary: #005A9C, #0077CC
Secondary: #A8D0E6
Accent: #F4A261, #FFC107
```

### 4. **Reusable Components**
Tách component nhỏ, tái sử dụng:
```jsx
<Button variant="primary" size="lg">Click me</Button>
```

### 5. **Animation Timing**
```css
Fast: 0.2s   (Hover, clicks)
Medium: 0.5s (Transitions)
Slow: 1s     (Page loads)
```

---

**Tài liệu này cover toàn bộ Tailwind classes và logic code trong VolunteerHub frontend!** 🎉
