export async function registerPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Trình duyệt không hỗ trợ Web Push!");
    return;
  }

  // Đăng ký service worker
  await navigator.serviceWorker.register("/sw.js");

  // LUÔN chờ ACTIVE!
  const registration = await navigator.serviceWorker.ready;

  const publicKey = import.meta.env.VITE_PUBLIC_VAPID_KEY;
  const convertedKey = urlBase64ToUint8Array(publicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: convertedKey,
  });

  const token = localStorage.getItem("token");

  
    await fetch("http://localhost:5000/api/push/subscribe", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify({ subscription }), 
    });

  alert("Đăng ký thông báo thành công!");
}

function urlBase64ToUint8Array(base64String) { const padding = "=".repeat((4 - (base64String.length % 4)) % 4); const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/"); const rawData = atob(base64); const Uint8ArrayData = new Uint8Array(rawData.length); for (let i = 0; i < rawData.length; ++i) { Uint8ArrayData[i] = rawData.charCodeAt(i); } return Uint8ArrayData; }