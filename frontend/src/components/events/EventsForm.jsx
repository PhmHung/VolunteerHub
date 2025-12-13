/** @format */

import React, { useState, useEffect } from "react";
import { EVENT_STATUS } from "../../types";
import { EVENT_CATEGORIES } from "../../utils/constants";
import { eventValidationSchema } from "../../utils/validationSchemas";
import LocationPicker from "./LocationPicker";

// Icon
const CheckIcon = () => (
  <svg
    className='w-5 h-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M5 13l4 4L19 7'
    />
  </svg>
);

const initialFormData = {
  title: "",
  description: "",
  location: "",
  latitude: "",
  longitude: "",
  startDate: "",
  endDate: "",
  maxParticipants: 50,
  tags: [],
  image: "",
  status: EVENT_STATUS.PENDING,
};

const toDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

export const EventsForm = ({ eventToEdit, onSave, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (eventToEdit) {
      const lat = eventToEdit.coordinate?.lat ?? eventToEdit.latitude ?? "";
      const lng = eventToEdit.coordinate?.lng ?? eventToEdit.longitude ?? "";

      setFormData({
        ...eventToEdit,
        latitude: lat,
        longitude: lng,
        startDate: toDateTimeLocal(eventToEdit.startDate),
        endDate: toDateTimeLocal(eventToEdit.endDate),
        tags: eventToEdit.tags || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [eventToEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value, 10) || 0 : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setErrors((prev) => ({
      ...prev,
      coordinate: undefined,
      "coordinate.lat": undefined,
      "coordinate.lng": undefined,
    }));
  };

  const toggleTag = (tag) => {
    setFormData((prev) => {
      const tags = prev.tags || [];
      const nextTags = tags.includes(tag)
        ? tags.filter((t) => t !== tag)
        : tags.length < 5
        ? [...tags, tag]
        : tags;
      return { ...prev, tags: nextTags };
    });
    if (errors.tags) setErrors((prev) => ({ ...prev, tags: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    const hasValidCoords = !isNaN(lat) && !isNaN(lng);

    const dataToValidate = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      maxParticipants: parseInt(formData.maxParticipants, 10),
      coordinate: hasValidCoords ? { lat, lng } : undefined,
    };

    try {
      await eventValidationSchema.validate(dataToValidate, {
        abortEarly: false,
      });
      const finalData = {
        ...dataToValidate,
        tags: formData.tags.slice(0, 5),
      };
      // Xóa các field không cần thiết
      delete finalData.latitude;
      delete finalData.longitude;
      delete finalData._id;
      delete finalData.__v;
      delete finalData.createdAt;
      delete finalData.updatedAt;
      delete finalData.attendees;

      setErrors({});
      onSave(finalData);
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        <form onSubmit={handleSubmit}>
          <header className='p-6 border-b border-gray-200'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {eventToEdit
                ? "Chỉnh sửa sự kiện"
                : "Tạo sự kiện tình nguyện mới"}
            </h2>
          </header>

          <main className='p-6 space-y-6'>
            <InputField label='Tiêu đề sự kiện' error={errors.title}>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                className={inputClass(errors.title)}
                placeholder='VD: Dọn rác bãi biển Đà Nẵng'
              />
            </InputField>

            <InputField label='Mô tả chi tiết' error={errors.description}>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className={inputClass(errors.description)}
                placeholder='Mô tả mục tiêu, hoạt động, yêu cầu...'
              />
            </InputField>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <InputField label='Ngày bắt đầu' error={errors.startDate}>
                <input
                  type='datetime-local'
                  name='startDate'
                  value={formData.startDate}
                  onChange={handleChange}
                  className={inputClass(errors.startDate)}
                />
              </InputField>

              <InputField label='Ngày kết thúc' error={errors.endDate}>
                <input
                  type='datetime-local'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleChange}
                  className={inputClass(errors.endDate)}
                />
              </InputField>
            </div>

            {/* Truyền thêm handleChange để sửa tên địa điểm */}
            <LocationSection
              formData={formData}
              errors={errors}
              onLocationSelect={handleLocationSelect}
              onLocationNameChange={handleChange} // <-- ĐÃ SỬA LỖI Ở ĐÂY
            />

            <InputField label='URL hình ảnh sự kiện' error={errors.image}>
              <input
                type='url'
                name='image'
                value={formData.image}
                onChange={handleChange}
                className={inputClass(errors.image)}
                placeholder='https://example.com/event-image.jpg'
              />
            </InputField>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <InputField
                label='Số lượng tình nguyện viên tối đa'
                error={errors.maxParticipants}>
                <input
                  type='number'
                  name='maxParticipants'
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min='1'
                  className={inputClass(errors.maxParticipants)}
                />
              </InputField>

              {eventToEdit && (
                <InputField label='Trạng thái'>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass()}>
                    {Object.values(EVENT_STATUS).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </InputField>
              )}
            </div>

            <TagSelector
              selectedTags={formData.tags}
              onToggle={toggleTag}
              error={errors.tags}
            />
          </main>

          <footer className='p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100'>
              Hủy
            </button>
            <button
              type='submit'
              className='px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-md'>
              <CheckIcon />
              {eventToEdit ? "Cập nhật" : "Tạo sự kiện"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

// Sub-components
const InputField = ({ label, error, children }) => (
  <div>
    <label className='block text-sm font-semibold text-gray-700 mb-1'>
      {label}
    </label>
    {children}
    {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
  </div>
);

const LocationSection = ({
  formData,
  errors,
  onLocationSelect,
  onLocationNameChange,
}) => (
  <div>
    <label className='block text-sm font-semibold text-gray-700 mb-1'>
      Địa điểm sự kiện <span className='text-red-500'>*</span>
    </label>

    {/* Ô nhập tên địa điểm */}
    <input
      type='text'
      name='location'
      value={formData.location || ""}
      onChange={onLocationNameChange} // Dùng prop đã truyền vào
      className={inputClass(errors.location)}
      placeholder='VD: Bãi biển Mỹ Khê, Quận Ngũ Hành Sơn, Đà Nẵng'
    />

    {/* Bản đồ chọn tọa độ */}
    <div className='mt-4 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden'>
      <div className='h-96'>
        <LocationPicker
          lat={parseFloat(formData.latitude) || undefined}
          lng={parseFloat(formData.longitude) || undefined}
          onLocationSelect={onLocationSelect}
        />
      </div>
    </div>

    {/* Hiển thị tọa độ */}
    <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm'>
      <span className='font-medium text-blue-800'>📍 Tọa độ đã chọn:</span>
      <span className='ml-2 text-gray-700'>
        {formData.latitude && formData.longitude
          ? `${parseFloat(formData.latitude).toFixed(6)}, ${parseFloat(
              formData.longitude
            ).toFixed(6)}`
          : "Chưa chọn vị trí"}
      </span>
    </div>

    {/* Lỗi validation bản đồ */}
    {(errors.coordinate ||
      errors["coordinate.lat"] ||
      errors["coordinate.lng"]) && (
      <div className='mt-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
        <p className='text-sm text-red-700 font-medium'>
          ⚠️ Vui lòng chọn chính xác vị trí tổ chức sự kiện trên bản đồ
        </p>
        <p className='text-xs text-red-600 mt-1'>
          Thông tin này giúp tình nguyện viên dễ dàng tìm đường đến địa điểm.
        </p>
      </div>
    )}
  </div>
);

const TagSelector = ({ selectedTags = [], onToggle, error }) => (
  <div>
    <label className='block text-sm font-semibold text-gray-700 mb-2'>
      Danh mục (tối đa 5)
    </label>
    <div className='flex flex-wrap gap-3'>
      {EVENT_CATEGORIES.filter((c) => c !== "Tất cả").map((cat) => {
        const selected = selectedTags.includes(cat);
        return (
          <button
            key={cat}
            type='button'
            onClick={() => onToggle(cat)}
            disabled={!selected && selectedTags.length >= 5}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              selected
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } ${
              !selected && selectedTags.length >= 5
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}>
            {selected && <CheckIcon />} {cat}
          </button>
        );
      })}
    </div>
    {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;

export default EventsForm;
