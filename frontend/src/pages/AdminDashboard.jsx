const SUMMARY_CARDS = [
  { label: "Tổng số tình nguyện viên", value: 1284, change: "+8.2% tuần này" },
  { label: "Sự kiện đang diễn ra", value: 12, change: "3 sự kiện cần duyệt" },
  { label: "Giờ đóng góp tháng này", value: "4.980h", change: "+15% so với tháng trước" },
  { label: "Đánh giá trung bình", value: "4.7/5", change: "dựa trên 321 phản hồi" },
];

const PENDING_APPROVALS = [
  {
    name: "Nguyễn Thị Lan",
    type: "Tình nguyện viên",
    submittedAt: "20/10/2025",
    note: "Kinh nghiệm tổ chức 3 chương trình gây quỹ."
  },
  {
    name: 'Chiến dịch "Gieo Mầm Xanh"',
    type: "Sự kiện",
    submittedAt: "19/10/2025",
    note: "Hợp tác với Đoàn trường THPT Trần Phú."
  },
  {
    name: "Trần Nhật Minh",
    type: "Tình nguyện viên",
    submittedAt: "18/10/2025",
    note: "Có chứng chỉ sơ cấp cứu của Hội Chữ thập đỏ."
  },
];

const TOP_VOLUNTEERS = [
  { name: "Phạm Anh Tuấn", hours: 186, events: 9 },
  { name: "Hoàng Minh Châu", hours: 171, events: 8 },
  { name: "Lê Bảo Ngọc", hours: 158, events: 7 },
  { name: "Đỗ Gia Huy", hours: 149, events: 6 },
];

const QUICK_ACTIONS = [
  { label: "Tạo sự kiện mới", description: "Lên kế hoạch cho chương trình sắp tới", tone: "indigo" },
  { label: "Gửi thông báo", description: "Thông tin quan trọng đến đội ngũ tình nguyện", tone: "emerald" },
  { label: "Xuất báo cáo", description: "Tải xuống thống kê hoạt động mới nhất", tone: "amber" },
];

const TONE_CLASSES = {
  indigo: "border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100",
  emerald: "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100",
  amber: "border-amber-200 bg-amber-50/60 hover:bg-amber-100",
};

export default function AdminDashboard({ user }) {
  return (
    <div className="w-full min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-500">Bảng điều khiển</p>
          <h1 className="text-3xl font-bold text-slate-900">Chào mừng bạn quay lại, {user.personalInformation.name}!</h1>
          <p className="text-base text-slate-600">
            Theo dõi hoạt động của cộng đồng tình nguyện, xử lý đơn đăng ký và khởi động các chiến dịch mới.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {SUMMARY_CARDS.map(({ label, value, change }) => (
            <div key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
              <p className="mt-2 text-sm text-emerald-600">{change}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Đơn chờ phê duyệt</h2>
                <p className="text-sm text-slate-500">Xem xét hồ sơ mới của tình nguyện viên và sự kiện.</p>
              </div>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Xem tất cả
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {PENDING_APPROVALS.map(({ name, type, submittedAt, note }) => (
                <article key={`${name}-${submittedAt}`} className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{name}</p>
                    <p className="text-sm text-slate-500">Loại: {type}</p>
                    <p className="mt-2 text-sm text-slate-600">{note}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700">
                      {submittedAt}
                    </span>
                    <div className="flex gap-2">
                      <button className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600">
                        Phê duyệt
                      </button>
                      <button className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                        Từ chối
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Top tình nguyện viên</h2>
              <p className="text-sm text-slate-500">Dựa trên số giờ đóng góp trong 90 ngày gần nhất.</p>
              <ul className="mt-4 space-y-3">
                {TOP_VOLUNTEERS.map(({ name, hours, events }) => (
                  <li key={name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">Tham gia {events} sự kiện</p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">{hours} giờ</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Hành động nhanh</h2>
              <p className="text-sm text-slate-500">Thực hiện các bước quản trị phổ biến chỉ với một lần nhấn.</p>
              <div className="mt-4 space-y-3">
                {QUICK_ACTIONS.map(({ label, description, tone }) => (
                  <button
                    key={label}
                    type="button"
                    className={`block w-full rounded-lg border px-4 py-3 text-left transition ${
                      TONE_CLASSES[tone] ?? "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-600">{description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
