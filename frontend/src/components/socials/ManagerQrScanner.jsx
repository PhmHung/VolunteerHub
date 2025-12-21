/** @format */

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import React from "react";

function ManagerQrScanner({ eventId, onScanSuccess, onScanError }) {
  const dispatch = useDispatch();
  const regionRef = useRef(null);
  const qrRef = useRef(null);
  const startedRef = useRef(false);
  const lastTokenRef = useRef(null);
  const lockRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const waitForSizeAndStart = async () => {
      const el = regionRef.current;
      if (!el) return;

      if (el.clientWidth === 0) {
        requestAnimationFrame(waitForSizeAndStart);
        return;
      }

      if (startedRef.current || cancelled) return;
      startedRef.current = true;

      const qr = new Html5Qrcode(el.id);
      qrRef.current = qr;

      try {
        const cameras = await Html5Qrcode.getCameras();
        const cameraId =
          cameras.find((c) => c.label.toLowerCase().includes("back"))?.id ||
          cameras[0].id;

        await qr.start(
          cameraId,
          {
            fps: 10,
            qrbox: 250,
            aspectRatio: 1,
          },
          (decodedText) => {
            // 🚫 đang lock → bỏ qua
            if (lockRef.current) return;

            // 🚫 trùng QR vừa quét → bỏ qua
            if (decodedText === lastTokenRef.current) return;

            console.log("✅ QR decoded:", decodedText);

            lastTokenRef.current = decodedText;
            lockRef.current = true;

            onScanSuccess?.(decodedText);

            dispatch(fetchChannelByEventId(eventId));

            // ⏳ mở khóa sau 2s để quét tiếp
            setTimeout(() => {
              lockRef.current = false;
            }, 2000);
          },
          () => {}
        );
      } catch (e) {
        console.error("QR start failed:", e);
        onScanError?.(e?.message || e);
      }
    };

    waitForSizeAndStart();

    return () => {
      cancelled = true;

      if (qrRef.current && qrRef.current.getState() === 2) {
        qrRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className='w-full max-w-sm mx-auto'>
      <div
        id='qr-reader'
        ref={regionRef}
        className='w-full aspect-square bg-black rounded-lg overflow-hidden'
      />
    </div>
  );
}

export default React.memo(
  ManagerQrScanner,
  () => true // không cho re-render
);
