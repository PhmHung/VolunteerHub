/** @format */

import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ icon, label, value, color, delay }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  const iconColors = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${colors[color]} bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-4`}>
      <div className={`${iconColors[color]} p-3 rounded-xl`}>{icon}</div>
      <div>
        <p className='text-2xl font-bold text-gray-900'>{value}</p>
        <p className='text-sm text-gray-500'>{label}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
