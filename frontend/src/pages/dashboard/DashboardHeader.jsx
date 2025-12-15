/** @format */

import React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const DashboardHeader = ({ onRefresh, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Bảng điều khiển</h1>
        <p className='text-gray-500 mt-1'>Tổng quan các sự kiện tình nguyện</p>
      </div>
      <div className='flex items-center gap-3'>
        <button
          onClick={onRefresh}
          className='inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition'>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
        <Link
          to='/events'
          className='inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/25'>
          <Sparkles className='h-4 w-4' />
          Khám phá sự kiện
        </Link>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
