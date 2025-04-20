import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns';

/**
 * MonthGrid displays a calendar month as a 7-column grid.
 * Props:
 * - events: Array of event objects with a `start` Date property.
 * - onSelectDate: function(Date) called when a day is clicked.
 * - initialDate (optional): Date to display the month of; defaults to today.
 */
export default function MonthGrid({
  events,
  onSelectDate,
  initialDate = new Date(),
}) {
  // Build a map of dates (YYYY-MM-DD) to event counts
  const eventsByDate = events.reduce((map, evt) => {
    const key = format(evt.start, 'yyyy-MM-dd');
    map[key] = map[key] ? map[key] + 1 : 1;
    return map;
  }, {});

  const monthStart = startOfMonth(initialDate);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Generate an array of all dates to render
  const calendarDates = [];
  let curr = gridStart;
  while (curr <= gridEnd) {
    calendarDates.push(curr);
    curr = addDays(curr, 1);
  }

  // Helper to check if a date is in the current month
  const isCurrentMonth = (date) => isSameMonth(date, monthStart);

  return (
    <div className="space-y-2">
      {/* Header: Month and Year */}
      <div className="text-center text-lg font-semibold">
        {format(monthStart, 'MMMM yyyy')}
      </div>
      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 text-center text-xs font-semibold text-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="bg-white py-2">
            {d}
          </div>
        ))}
      </div>
      {/* Dates grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {calendarDates.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const hasEvents = eventsByDate[dateKey] > 0;
          const today = isSameDay(date, new Date());
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`relative px-3 py-2 text-left focus:outline-none ${
                isCurrentMonth(date) ? 'bg-white' : 'bg-gray-50 text-gray-400'
              }`}
            >
              <time
                dateTime={dateKey}
                className={`block text-sm font-medium ${
                  today
                    ? 'text-blue-600'
                    : isCurrentMonth(date)
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {format(date, 'd')}
              </time>
              {hasEvents && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 block w-2 h-2 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
