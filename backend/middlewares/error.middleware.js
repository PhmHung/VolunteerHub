export default function errorMiddleware(err, req, res, next) {
  // Xác định mã trạng thái mặc định
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Lỗi xác thực JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Token hết hạn
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Lỗi MongoDB: ObjectId không hợp lệ
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Lỗi MongoDB: Vi phạm unique key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue);
    message = `Duplicate value for field: ${field}`;
  }

  // Lỗi Validation từ Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = `Validation failed: ${errors.join(', ')}`;
  }

  res.status(statusCode).json({
    success: false,
    message: message
  });
}
