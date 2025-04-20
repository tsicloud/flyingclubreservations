'use client';

import React, { useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';

export default function DayView({ date, events, onEdit, onDelete }) {
  const container = useRef(null);
  const containerNav = useRef(null);
  const containerOffset = useRef(null);

  // Scroll to current time on mount
  useEffect(() => {
    const currentMinute = new Date().getHours() * 60 + new Date().getMinutes();
    if (container.current && containerNav.current && containerOffset.current) {
      container.current.scrollTop =
        ((container.current.scrollHeight - containerNav.current.offsetHeight - containerOffset.current.offsetHeight) *
          currentMinute) /
        1440;
    }
  }, []);

  // Filter and map events for this day
  const dayEvents = events
    .map(evt => {
      const start = typeof evt.start === 'string' ? parseISO(evt.start) : evt.start;
      const end = typeof evt.end === 'string' ? parseISO(evt.end) : evt.end;
      return { ...evt, start, end };
    })
    .filter(evt => format(evt.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          <time dateTime={format(date, 'yyyy-MM-dd')}>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </time>
        </h2>
      </header>

      {/* Time grid */}
      <div ref={container} className="flex flex-auto flex-col overflow-auto bg-white">
        <div style={{ width: '100%' }} className="flex max-w-full flex-none flex-col">
          <div ref={containerNav} className="sticky top-0 z-10 grid grid-cols-1 bg-white text-sm text-gray-500 shadow-sm ring-1 ring-black/5">
            {/* Empty placeholder to align with grid */}
            <div className="h-6"></div>
          </div>
          <div className="flex flex-auto">
            {/* Time labels */}
            <div className="sticky left-0 w-14 flex-none bg-white ring-1 ring-gray-100">
              <div ref={containerOffset} className="h-7"></div>
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="relative h-14">
                  <div className="absolute -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs text-gray-400">
                    {format(new Date().setHours(hour, 0, 0, 0), 'ha')}
                  </div>
                  {/* Half-hour slot lines */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
                </div>
              ))}
            </div>
            {/* Grid and events */}
            <div className="relative flex-auto">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 grid grid-rows-[repeat(48,minmax(3.5rem,1fr))]">
                {Array.from({ length: 48 }).map((_, idx) => (
                  <div key={idx} className={`border-t ${idx % 2 === 0 ? 'border-gray-200' : 'border-gray-100'}`} />
                ))}
              </div>
              {/* Events positioned */}
              <div className="relative">
                {dayEvents.map(evt => {
                  const minutesFromStart = evt.start.getHours() * 60 + evt.start.getMinutes();
                  const durationMinutes = (evt.end.getTime() - evt.start.getTime()) / 60000;
                  const topPercent = (minutesFromStart / 1440) * 100;
                  const heightPercent = (durationMinutes / 1440) * 100;
                  return (
                    <div
                      key={evt.id}
                      className="absolute left-2 right-2 rounded-lg p-2 text-white"
                      style={{
                        top: `${topPercent}%`,
                        height: `${heightPercent}%`,
                        backgroundColor: evt.extendedProps?.color || '#3B82F6',
                      }}
                    >
                      <div className="font-semibold">{evt.title}</div>
                      <div className="text-xs">
                        {format(evt.start, 'h:mm a')} – {format(evt.end, 'h:mm a')}
                      </div>
                      <div className="mt-1 flex space-x-2 text-xs">
                        <button onClick={() => onEdit(evt)} className="underline">Edit</button>
                        <button onClick={() => onDelete(evt.id)} className="underline">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
