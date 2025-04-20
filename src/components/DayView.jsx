import React from 'react';
import { format, isSameDay, parseISO } from 'date-fns';

/**
 * DayView displays a list of events for a specific day.
 *
 * Props:
 * - date: Date object representing the day to display.
 * - events: Array of event objects with `start`, `end`, `title`, and `extendedProps` as provided by CalendarPage.
 * - onEdit: function(event) called when clicking "Edit".
 * - onDelete: function(id) called when clicking "Delete".
 */
export default function DayView({ date, events, onEdit, onDelete }) {
  // Filter events to those on the given date
  const dayEvents = events.filter(evt => {
    const evtDate = typeof evt.start === 'string' ? parseISO(evt.start) : evt.start;
    return isSameDay(evtDate, date);
  });

  return (
    <div className="p-4">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4">
        {format(date, 'EEEE, MMMM d, yyyy')}
      </h2>

      {/* No events message */}
      {dayEvents.length === 0 ? (
        <p className="text-gray-500">No reservations for this day.</p>
      ) : (
        <ul className="space-y-4">
          {dayEvents.map(evt => {
            const start = typeof evt.start === 'string' ? parseISO(evt.start) : evt.start;
            const end = typeof evt.end === 'string' ? parseISO(evt.end) : evt.end;
            const tail = evt.extendedProps?.tailNumber || 'N/A';
            return (
              <li key={evt.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
                <div>
                  <div className="text-lg font-medium">{evt.title}</div>
                  <div className="text-sm text-gray-500">
                    {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Airplane: {tail}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(evt)}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(evt.id)}
                    className="text-red-500 hover:underline"
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
}
