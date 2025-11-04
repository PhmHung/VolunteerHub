import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function PieStat({ title = 'Pie Stat', data = [], height = 180 }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-full">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} paddingAngle={4}>
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color || '#8884d8'} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {data.map((d, i) => (
          <li key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span style={{ width: 10, height: 10, backgroundColor: d.color || '#8884d8', display: 'inline-block', borderRadius: 3 }} />
              <span>{d.name}</span>
            </div>
            <span className="font-semibold text-slate-800">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
