import React, { useEffect, useRef } from 'react';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';

// map tail numbers to Tailwind color names
const colorMap = {
  default: 'blue',
  // add your tail number mappings here, e.g. 'N12345': 'indigo',
};
const getColor = (tail) => colorMap[tail] || colorMap.default;

export default function WeekView({ date, events, onEdit, onDelete }) {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const offsetRef = useRef(null);
  useEffect(() => {
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    const scrollHeight =
      containerRef.current.scrollHeight -
      navRef.current.offsetHeight -
      offsetRef.current.offsetHeight;
    containerRef.current.scrollTop = (scrollHeight * currentMinute) / 1440;
  }, []);

  // Compute the seven days for the week starting Sunday
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-none items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900">
          Week of {format(weekStart, 'MMM d, yyyy')}
        </h2>
      </header>
      <div ref={containerRef} className="isolate flex flex-auto flex-col overflow-auto bg-white">
        <div style={{ width: '165%' }} className="flex max-w-full flex-none flex-col md:max-w-none lg:max-w-full">
          <div
            ref={navRef}
            className="sticky top-0 grid grid-cols-7 bg-white text-xs text-gray-500 shadow-sm ring-1 ring-black/5"
          >
            {days.map((day) => (
              <div key={day.toISOString()} className="flex items-center justify-center py-2">
                <time dateTime={day.toISOString()} className="font-semibold text-gray-900">
                  {format(day, 'EEE d')}
                </time>
              </div>
            ))}
          </div>
          <div className="flex flex-auto">
            <div className="sticky left-0 z-10 w-14 flex-none bg-white ring-1 ring-gray-100" />
            <div className="grid flex-auto grid-cols-1 grid-rows-1">
              {/* Time slots */}
              <div
                className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
                style={{ gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))' }}
              >
                <div ref={offsetRef} className="row-end-1 h-7" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i}>
                    <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs text-gray-400">
                      {i === 0 ? '12AM' : i < 12 ? `${i}AM` : i === 12 ? '12PM' : `${i - 12}PM`}
                    </div>
                  </div>
                ))}
              </div>
              {/* Vertical day dividers */}
              <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                {days.map((_, i) => (
                  <div key={i} className={`col-start-${i + 1} row-span-full`} />
                ))}
                <div className="col-start-8 row-span-full w-8" />
              </div>
              {/* Events */}
              <ol
                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                style={{ gridTemplateRows: '1.75rem repeat(288, minmax(0, 1fr)) auto' }}
              >
                {days.map((day, dayIndex) => {
                  const dayEvents = events.filter((evt) => {
                    const start = evt.start instanceof Date ? evt.start : parseISO(evt.start);
                    return isSameDay(start, day);
                  });
                  return dayEvents.map((evt) => {
                    const start = evt.start instanceof Date ? evt.start : parseISO(evt.start);
                    const end = evt.end instanceof Date ? evt.end : parseISO(evt.end);
                    const minutesFromMidnight = start.getHours() * 60 + start.getMinutes();
                    const durationMinutes = (end - start) / 60000;
                    const rowStart = Math.floor(minutesFromMidnight / 30) + 1;
                    const rowSpan = Math.ceil(durationMinutes / 30);
                    const color = getColor(evt.extendedProps?.tailNumber);
                    return (
                      <li
                        key={evt.id}
                        style={{
                          gridColumnStart: dayIndex + 1,
                          gridRow: `${rowStart} / span ${rowSpan}`,
                        }}
                        className={`relative mt-px flex flex-col overflow-y-auto rounded-lg p-2 text-xs font-medium bg-${color}-50 hover:bg-${color}-100`}
                      >
                        <div className={`text-${color}-700`}>{evt.title}</div>
                        <div className={`mt-1 text-${color}-500`}>
                          <time dateTime={evt.start}>{format(start, 'h:mm a')}</time>
                        </div>
                      </li>
                    );
                  });
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
