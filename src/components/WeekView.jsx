import React, { useEffect, useRef } from 'react';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';

/**
 * WeekView displays a simple 7-day grid with daily reservation lists.
 *
 * Props:
 * - date: Date object for any day in the week to display.
 * - events: Array of event objects with `start`, `end`, `title`, and `extendedProps.tailNumber`.
 * - onEdit: function(evt) called when clicking "Edit".
 * - onDelete: function(id) called when clicking "Delete".
 */
export default function WeekView({ date, events, onEdit, onDelete }) {
  // Compute the seven days for the week starting Sunday
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="p-4">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4">
        Week of {format(weekStart, 'MMM d, yyyy')}
      </h2>
      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => {
          // Filter events for this day
          const dayEvents = events.filter(evt => {
            const evtDate = evt.start instanceof Date ? evt.start : parseISO(evt.start);
            return isSameDay(evtDate, day);
          });
          return (
            <div key={day.toISOString()} className="bg-gray-50 p-2 rounded">
              <div className="font-medium text-center mb-2">
                {format(day, 'EEE d')}
              </div>
              {dayEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No reservations</p>
              ) : (
                <ul className="space-y-2">
                  {dayEvents.map(evt => {
                    const start = evt.start instanceof Date ? evt.start : parseISO(evt.start);
                    const end = evt.end instanceof Date ? evt.end : parseISO(evt.end);
                    const tail = evt.extendedProps?.tailNumber || 'N/A';
                    return (
                      <li key={evt.id} className="bg-white p-2 rounded shadow-sm">
                        <div className="text-sm font-medium">{evt.title}</div>
                        <div className="text-xs text-gray-500">
                          {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Tail: {tail}
                        </div>
                        <div className="mt-1 flex space-x-2">
                          <button
                            onClick={() => onEdit(evt)}
                            className="text-blue-500 text-xs hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(evt.id)}
                            className="text-red-500 text-xs hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
