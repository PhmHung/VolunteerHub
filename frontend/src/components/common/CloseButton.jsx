/** @format */

import React from "react";
import { X } from "lucide-react";

const CloseButton = ({ onClick, className = "" }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`absolute -top-4 -right-4 z-50 p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-transform hover:scale-105 flex items-center justify-center ${className}`}
      aria-label='Đóng'>
      <X className='w-5 h-5' />
    </button>
  );
};

export default CloseButton;
