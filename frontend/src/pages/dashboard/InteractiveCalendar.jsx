/** @format */

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const InteractiveCalendar = ({
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  events,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const monthName = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const eventCounts = useMemo(() => {
    const counts = {};
    events.forEach((event) => {
      const eventDate = new Date(event.startDate || event.date);
      if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
        const day = eventDate.getDate();
        counts[day] = (counts[day] || 0) + 1;
      }
    });
    return counts;
  }, [events, month, year]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(year, month, day);
    if (
      selectedDate &&
      clickedDate.toDateString() === selectedDate.toDateString()
    ) {
      setSelectedDate(null);
    } else {
      setSelectedDate(clickedDate);
    }
  };

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();
  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-bold text-gray-900 capitalize'>
          {monthName}
        </h3>
        <div className='flex items-center gap-2'>
          <button
            onClick={goToPrevMonth}
            className='p-2 hover:bg-gray-100 rounded-lg transition'>
            <ChevronLeft className='h-5 w-5 text-gray-600' />
          </button>
          <button
            onClick={goToNextMonth}
            className='p-2 hover:bg-gray-100 rounded-lg transition'>
            <ChevronRight className='h-5 w-5 text-gray-600' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-2'>
        {weekDays.map((day) => (
          <div
            key={day}
            className='text-center text-xs font-semibold text-gray-400 py-2'>
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {calendarDays.map((day, index) => {
          const hasEvents = day && eventCounts[day];
          const evtCount = eventCounts[day] || 0;
          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              disabled={!day}
              className={`
                relative aspect-square rounded-xl text-sm font-medium transition-all
                ${!day ? "invisible" : "hover:bg-gray-100"}
                ${
                  isToday(day) ? "bg-blue-600 text-white hover:bg-blue-700" : ""
                }
                ${
                  isSelected(day) && !isToday(day)
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                    : ""
                }
                ${!isToday(day) && !isSelected(day) ? "text-gray-700" : ""}
              `}>
              <span className='absolute inset-0 flex items-center justify-center'>
                {day}
              </span>
              {hasEvents && (
                <span className='absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5'>
                  {evtCount <= 3 ? (
                    [...Array(evtCount)].map((_, i) => (
                      <span
                        key={i}
                        className={`h-1 w-1 rounded-full ${
                          isToday(day) ? "bg-white" : "bg-blue-500"
                        }`}
                      />
                    ))
                  ) : (
                    <span
                      className={`text-[10px] font-bold ${
                        isToday(day) ? "text-white" : "text-blue-600"
                      }`}>
                      {evtCount}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveCalendar;
