/**
 * @file validationSchemas.js
 * @description Yup validation schemas for forms
 * @pattern Schema Validation Pattern
 */

import * as yup from 'yup';

// ==================== EVENT VALIDATION ====================

/**
 * Validation schema for Event Form
 * Validates event creation/update data
 * @type {yup.ObjectSchema}
 */
export const eventValidationSchema = yup.object().shape({
  title: yup
    .string()
    .required('Vui lòng nhập tiêu đề sự kiện')
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  
  description: yup
    .string()
    .required('Vui lòng nhập mô tả')
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự'),
  
  location: yup
    .string()
    .required('Vui lòng nhập địa điểm'),
  
  startDate: yup
    .date()
    .required('Vui lòng chọn ngày bắt đầu')
    .min(new Date(), 'Ngày bắt đầu phải sau thời điểm hiện tại')
    .typeError('Ngày bắt đầu không hợp lệ'),
  
  endDate: yup
    .date()
    .required('Vui lòng chọn ngày kết thúc')
    .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
    .typeError('Ngày kết thúc không hợp lệ'),
  
  maxParticipants: yup
    .number()
    .required('Vui lòng nhập số lượng người tham gia tối đa')
    .positive('Số lượng phải lớn hơn 0')
    .integer('Số lượng phải là số nguyên')
    .min(1, 'Số lượng tối thiểu là 1 người')
    .max(1000, 'Số lượng tối đa là 1000 người')
    .typeError('Số lượng phải là số'),
  
  tags: yup
    .array()
    .of(yup.string())
    .min(1, 'Vui lòng chọn ít nhất 1 danh mục')
    .max(5, 'Chỉ được chọn tối đa 5 danh mục'),
  
  image: yup
    .string()
    .url('URL hình ảnh không hợp lệ')
    .nullable(),
});

// ==================== AUTH VALIDATION ====================

/**
 * Validation schema for User Registration Form
 * @type {yup.ObjectSchema}
 */
export const registerValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email không đúng định dạng'
    ),
  
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    ),
  
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
  
  fullName: yup
    .string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự')
    .matches(
      /^[a-zA-ZÀ-ỹ\s]+$/,
      'Họ tên chỉ được chứa chữ cái và khoảng trắng'
    ),
  
  phoneNumber: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(
      /^(0|\+84)[0-9]{9}$/,
      'Số điện thoại không hợp lệ (10 số bắt đầu bằng 0 hoặc +84)'
    ),
  
  role: yup
    .string()
    .required('Vui lòng chọn vai trò')
    .oneOf(['volunteer', 'manager'], 'Vai trò không hợp lệ'),
});

// Schema validation cho Login Form
export const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ'),
  
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

// Schema validation cho Profile Update
export const profileValidationSchema = yup.object().shape({
  userName: yup
    .string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự'),
  
  userEmail: yup
    .string()
    .required('Vui lòng nhập email')
    .email('Email không hợp lệ'),
  
  phoneNumber: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(
      /^(0|\+84)[0-9]{9}$/,
      'Số điện thoại không hợp lệ'
    ),
  
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Ngày sinh không được là ngày tương lai')
    .min(new Date('1900-01-01'), 'Ngày sinh không hợp lệ')
    .nullable()
    .typeError('Ngày sinh không hợp lệ'),
  
  address: yup
    .string()
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
    .nullable(),
});

// Helper function để validate và trả về errors dạng object
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      if (error.path) {
        errors[error.path] = error.message;
      }
    });
    return { isValid: false, errors };
  }
};

// Helper function để validate từng field
export const validateField = async (schema, fieldName, value, formData = {}) => {
  try {
    await schema.validateAt(fieldName, { ...formData, [fieldName]: value });
    return null; // Không có lỗi
  } catch (err) {
    return err.message; // Trả về message lỗi
  }
};
