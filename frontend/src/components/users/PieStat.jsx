/** @format */

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Component hiển thị thống kê dạng biểu đồ tròn
// data format: [{ name: "Label", value: 10, color: "#hex" }, ...]
export default function PieStat({
  title = "Thống kê",
  data = [],
  height = 250,
}) {
  // Tính tổng để hiển thị phần trăm nếu cần
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col'>
      <div className='mb-2'>
        <h4 className='text-sm font-bold text-gray-800 uppercase tracking-wider'>
          {title}
        </h4>
      </div>

      <div className='flex-1 min-h-[200px]' style={{ width: "100%", height }}>
        {data.length > 0 ? (
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={60} // Tạo biểu đồ dạng Donut
                outerRadius={80}
                paddingAngle={5}
                stroke='none' // Bỏ viền trắng mặc định
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#10b981"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}`, "Số lượng"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className='h-full flex items-center justify-center text-gray-400 text-sm'>
            Chưa có dữ liệu thống kê
          </div>
        )}
      </div>

      {/* Legend (Chú thích) */}
      <div className='mt-4 space-y-3'>
        {data.map((entry, index) => {
          const percentage =
            total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <div
              key={index}
              className='flex items-center justify-between text-sm'>
              <div className='flex items-center gap-2'>
                <span
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: entry.color || "#10b981" }}
                />
                <span className='text-gray-600'>{entry.name}</span>
              </div>
              <div className='flex items-center gap-3'>
                <span className='font-semibold text-gray-900'>
                  {entry.value}
                </span>
                <span className='text-xs text-gray-400 w-8 text-right'>
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
