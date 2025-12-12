/** @format */

import React, { useState, useEffect } from "react";
import { EVENT_STATUS } from "../../types";
import { EVENT_CATEGORIES } from "../../utils/constants";
import { eventValidationSchema } from "../../utils/validationSchemas";
// Note: Ensure this file name matches what you created (LocationPicker.jsx)
import LocationPicker from "./LocationPick";

// --- ICONS ---
const PencilIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z'
    />
  </svg>
);
const PlusIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-6 w-6'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
  </svg>
);
const CheckIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    className='h-5 w-5'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    strokeWidth={2}>
    <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
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

// Helper format date
const toDateTimeLocal = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

const toISOString = (localDateTime) => {
  if (!localDateTime) return "";
  try {
    return new Date(localDateTime).toISOString();
  } catch {
    return "";
  }
};

export const EventForm = ({ eventToEdit, onSave, onClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (eventToEdit) {
      // console.log("Loading Event Data:", eventToEdit);

      // Logic lấy tọa độ: Ưu tiên lấy trong object 'coordinate'
      let loadedLat = "";
      let loadedLng = "";

      if (eventToEdit.coordinate) {
        loadedLat = eventToEdit.coordinate.lat;
        loadedLng = eventToEdit.coordinate.lng;
      } else if (eventToEdit.latitude) {
        // Fallback cho data cũ
        loadedLat = eventToEdit.latitude;
        loadedLng = eventToEdit.longitude;
      }

      setFormData({
        ...eventToEdit,
        latitude: loadedLat,
        longitude: loadedLng,
        tags: eventToEdit.tags || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [eventToEdit]);

  const handleLocationSelect = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Clear lỗi map khi user chọn lại
    if (
      errors["coordinate"] ||
      errors["coordinate.lat"] ||
      errors["coordinate.lng"]
    ) {
      setErrors((prev) => ({
        ...prev,
        coordinate: undefined,
        "coordinate.lat": undefined,
        "coordinate.lng": undefined,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (type === "number") {
      if (name === "latitude" || name === "longitude") {
        newValue = value;
      } else {
        newValue = parseInt(value, 10) || 0;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const toggleTag = (tag) => {
    setFormData((prev) => {
      const has = (prev.tags || []).includes(tag);
      let nextTags = has
        ? (prev.tags || []).filter((t) => t !== tag)
        : [...(prev.tags || []), tag];
      if (nextTags.length > 5) nextTags = nextTags.slice(0, 5);
      return { ...prev, tags: nextTags };
    });
    if (errors.tags) {
      setErrors((prev) => ({ ...prev, tags: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Parse tọa độ
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      const hasValidCoords = !isNaN(lat) && !isNaN(lng);

      // 2. Chuẩn bị data
      const dataToProcess = {
        ...formData,
        startDate: toISOString(formData.startDate),
        endDate: toISOString(formData.endDate),
        maxParticipants: parseInt(formData.maxParticipants, 10),

        // Nếu không có tọa độ -> undefined -> Yup sẽ báo lỗi Required
        coordinate: hasValidCoords ? { lat, lng } : undefined,
      };

      // 3. Validate
      await eventValidationSchema.validate(dataToProcess, {
        abortEarly: false,
      });

      // 4. Chuẩn bị final data
      const finalData = {
        ...dataToProcess,
        tags: (formData.tags || []).slice(0, 5),
      };

      // Clean up fields
      delete finalData.latitude;
      delete finalData.longitude;
      delete finalData._id;
      delete finalData.createdAt;
      delete finalData.updatedAt;
      delete finalData.__v;
      delete finalData.attendees;

      setErrors({});
      onSave(finalData);
    } catch (err) {
      if (err.name === "ValidationError") {
        const validationErrors = {};
        err.inner.forEach((error) => {
          if (error.path) validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        console.error("Lỗi hệ thống:", err);
      }
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in'
      onClick={onClose}
      aria-modal='true'>
      <div
        className='bg-surface-base rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-up'
        onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className='flex flex-col h-full min-h-0'>
          {/* HEADER */}
          <header className='p-6 border-b border-border flex items-center gap-4'>
            <div className='bg-primary-100 text-primary-600 rounded-lg p-3 flex-shrink-0'>
              {eventToEdit ? <PencilIcon /> : <PlusIcon />}
            </div>
            <div>
              <h2 className='text-xl font-bold text-text-main'>
                {eventToEdit ? "Edit Event" : "Create New Event"}
              </h2>
              <p className='text-text-muted text-sm mt-0.5'>
                Fill out the details below to{" "}
                {eventToEdit ? "update" : "create"} your event.
              </p>
            </div>
          </header>

          {/* MAIN FORM */}
          <main className='px-6 py-4 space-y-4 overflow-y-auto flex-1 min-h-0'>
            <InputField label='Title' error={errors.title}>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                className={inputClass(errors.title)}
                placeholder='Event title...'
              />
            </InputField>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InputField label='Start Date & Time' error={errors.startDate}>
                <input
                  name='startDate'
                  type={formData.startDate ? "datetime-local" : "text"}
                  onFocus={(e) => (e.target.type = "datetime-local")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  placeholder='Chọn thời gian bắt đầu'
                  value={toDateTimeLocal(formData.startDate)}
                  onChange={handleChange}
                  className={inputClass(errors.startDate)}
                />
              </InputField>
              <InputField label='End Date & Time' error={errors.endDate}>
                <input
                  name='endDate'
                  type={formData.endDate ? "datetime-local" : "text"}
                  onFocus={(e) => (e.target.type = "datetime-local")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  placeholder='Chọn thời gian kết thúc'
                  value={toDateTimeLocal(formData.endDate)}
                  onChange={handleChange}
                  className={inputClass(errors.endDate)}
                />
              </InputField>
            </div>

            <InputField label='Location' error={errors.location}>
              <input
                type='text'
                name='location'
                value={formData.location}
                onChange={handleChange}
                className={inputClass(errors.location)}
                placeholder='Address...'
              />
            </InputField>

            {/* MAP SECTION */}
            <div className='p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
              <div className='flex justify-between items-center mb-2'>
                <p className='text-xs font-bold text-gray-500 uppercase'>
                  Vị trí trên bản đồ <span className='text-red-500'>*</span>
                </p>
                <span className='text-xs text-gray-400'>
                  {formData.latitude
                    ? `${parseFloat(formData.latitude).toFixed(
                        4
                      )}, ${parseFloat(formData.longitude).toFixed(4)}`
                    : "Chưa chọn"}
                </span>
              </div>

              <LocationPicker
                lat={parseFloat(formData.latitude)}
                lng={parseFloat(formData.longitude)}
                onLocationSelect={handleLocationSelect}
              />

              {/* Input ẩn để debug nếu cần */}
              <input type='hidden' name='latitude' value={formData.latitude} />
              <input
                type='hidden'
                name='longitude'
                value={formData.longitude}
              />

              {/* Hiển thị lỗi Map */}
              {(errors.coordinate ||
                errors["coordinate.lat"] ||
                errors["coordinate.lng"]) && (
                <p className='text-sm text-red-500 mt-2 font-medium bg-red-50 p-2 rounded border border-red-200'>
                  ⚠️ {errors.coordinate || "Vui lòng chọn địa điểm trên bản đồ"}
                </p>
              )}
            </div>

            <InputField label='Image URL' error={errors.image}>
              <input
                type='text'
                name='image'
                value={formData.image}
                onChange={handleChange}
                placeholder='https://example.com/image.jpg'
                className={inputClass(errors.image)}
              />
            </InputField>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className={eventToEdit ? "" : "sm:col-span-2"}>
                <InputField
                  label='Max Participants'
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
              </div>
              {eventToEdit && (
                <InputField label='Status'>
                  <select
                    name='status'
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass()}>
                    {Object.values(EVENT_STATUS).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </InputField>
              )}
            </div>

            <InputField label='Tags' hint='Choose up to 5 categories'>
              <div className='flex flex-wrap gap-2'>
                {EVENT_CATEGORIES.filter((c) => c !== "Tất cả").map((cat) => {
                  const selected = (formData.tags || []).includes(cat);
                  return (
                    <button
                      type='button'
                      key={cat}
                      onClick={() => toggleTag(cat)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors border ${
                        selected
                          ? "bg-primary-600 text-white border-transparent"
                          : "bg-surface-muted text-text-secondary border-border"
                      }`}
                      disabled={!selected && (formData.tags || []).length >= 5}>
                      {selected ? (
                        <span className='inline-flex items-center gap-2'>
                          <CheckIcon />
                          {cat}
                        </span>
                      ) : (
                        cat
                      )}
                    </button>
                  );
                })}
              </div>
            </InputField>

            <InputField label='Description' error={errors.description}>
              <textarea
                name='description'
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={inputClass(errors.description)}></textarea>
            </InputField>
          </main>

          <footer className='bg-surface-muted px-6 py-4 rounded-b-xl flex justify-end items-center gap-3 mt-auto flex-shrink-0 border-t border-border'>
            <button
              type='button'
              onClick={onClose}
              className='btn btn-secondary'>
              Cancel
            </button>
            <button
              type='submit'
              className='btn btn-primary flex items-center gap-2 shadow-sm'>
              <CheckIcon />
              <span>Save Event</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

// Reusable component for form fields
const InputField = ({ label, error, hint, children }) => (
  <div>
    <label className='block text-sm font-medium text-text-secondary'>
      {label}
    </label>
    <div className='mt-1'>{children}</div>
    {error && <p className='mt-1 text-sm text-error-600'>{error}</p>}
    {hint && !error && <p className='mt-1 text-xs text-text-muted'>{hint}</p>}
  </div>
);

// Helper function to generate input classes
const inputClass = (hasError) =>
  `input-field w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${
    hasError
      ? "border-error-400 text-error-900 placeholder-error-400 focus:border-error-500"
      : "border-gray-300 focus:border-primary-500"
  }`;

export default EventForm;
