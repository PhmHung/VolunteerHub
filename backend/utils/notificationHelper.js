/**
 * @format
 * @param {Object} req - Đối tượng request từ express (chứa req.io)
 * @param {String} room - ID người nhận hoặc "admin"
 * @param {Object} data - Nội dung thông báo { title, message, type, link }
 */

export const emitNotification = (req, room, data) => {
  if (req.io && room) {
    req.io.to(room).emit("NOTIFICATION", {
      ...data,
      time: new Date(),
      id: Date.now().toString,
    });
  }
};

export const emitToMultiple = (req, userIds, data) => {
  if (req.io && userIds && userIds.length > 0) {
    userIds.forEach((id) => {
      req.io.to(id.toString()).emit("NOTIFICATION", {
        ...data,
        id: `${Date.now()}-${id}`,
        time: new Date(),
      });
    });
  }
};
