/** @format */
import React, { useMemo, useState } from "react";
import { Users, CheckCircle, XCircle, UserCheck, Filter } from "lucide-react";

const statusMap = {
  "in-progress": {
    label: "Đang tham gia",
    color: "bg-blue-100 text-blue-700",
    icon: <UserCheck size={14} />
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} />
  },
  absent: {
    label: "Vắng mặt",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />
  }
};

const getStatus = (att) => {
  if (att.status === "completed") return "completed";
  if (att.status === "in-progress") return "in-progress";
  return "absent";
};

const AttendanceManagement = ({ attendances = [] }) => {
  console.log("start");
  const [filter, setFilter] = useState("all");
  const [keyword, setKeyword] = useState("");

  const enriched = useMemo(() => {
    return attendances.map((att) => ({
      ...att,
      computedStatus: getStatus(att),
      user: att.regId?.userId
    }));
  }, [attendances]);

  const stats = useMemo(() => {
    return {
      total: enriched.length,
      inProgress: enriched.filter(i => i.computedStatus === "in-progress").length,
      completed: enriched.filter(i => i.computedStatus === "completed").length,
      absent: enriched.filter(i => i.computedStatus === "absent").length
    };
  }, [enriched]);

  const filtered = useMemo(() => {
    return enriched.filter((item) => {
      const matchStatus =
        filter === "all" || item.computedStatus === filter;

      const matchKeyword =
        item.user?.userName?.toLowerCase().includes(keyword.toLowerCase()) ||
        item.user?.userEmail?.toLowerCase().includes(keyword.toLowerCase());

      return matchStatus && matchKeyword;
    });
  }, [enriched, filter, keyword]);

  return (
    <div className="space-y-8">
      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Tổng đăng ký" value={stats.total} />
        <StatCard label="Đang tham gia" value={stats.inProgress} color="blue" />
        <StatCard label="Hoàn thành" value={stats.completed} color="green" />
        <StatCard label="Vắng mặt" value={stats.absent} color="red" />
      </div>

      {/* ===== FILTER ===== */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="flex-1 px-4 py-2 border rounded-xl"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded-xl"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="in-progress">Đang tham gia</option>
          <option value="completed">Hoàn thành</option>
          <option value="absent">Vắng mặt</option>
        </select>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-2xl overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4 text-left">Tình nguyện viên</th>
              <th>Trạng thái</th>
              <th>Thời gian điểm danh</th>
              <th>Đánh giá</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((att) => {
              const st = statusMap[att.computedStatus];
              return (
                <tr key={att._id} className="border-t">
                  <td className="p-4">
                    <div className="font-semibold">
                      {att.user?.userName || "Không tên"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {att.user?.userEmail}
                    </div>
                  </td>

                  <td>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${st.color}`}
                    >
                      {st.icon}
                      {st.label}
                    </span>
                  </td>

                  <td>
                    {att.checkOut
                      ? formatDateTime(att.checkOut)
                      : "--:--"}
                  </td>

                  <td>
                    {att.feedback?.rating
                      ? `⭐ ${att.feedback.rating}`
                      : "Chưa đánh giá"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const StatCard = ({ label, value, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700"
  };

  return (
    <div className={`p-6 rounded-2xl ${colorMap[color] || "bg-white border"}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
};

export default AttendanceManagement;
