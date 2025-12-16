/** @format */

import React from "react";
import QR from "react-qr-code";

const QRCode = ({
  value,
  size = 220,
  bgColor = "#ffffff",
  fgColor = "#000000",
}) => {
  if (!value) {
    return (
      <div className="text-text-muted text-sm">
        Không có dữ liệu QR
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm"
      style={{ width: size + 32, height: size + 32 }}
    >
      <QR
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level="Q"
      />
    </div>
  );
};

export default QRCode;
