import React from 'react';
import { Menu } from '@headlessui/react';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
} from '@heroicons/react/20/solid';
import { format, isSameMonth, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';

/**
 * MeetingsView displays upcoming reservations ("meetings") alongside a mini month calendar.
 *
 * Props:
 * - events: Array of event objects with `start` (Date) and `extendedProps.tailNumber`
 * - selectedDate: Date object for the currently focused date
 * - onSelectDate: function(Date) called when clicking a day in the mini calendar
 */
export default function MeetingsView({ events, selectedDate, onSelectDate }) {
  // Build upcoming meetings list (events on or after selectedDate)
  const upcoming = events
    .filter(evt => {
      const evtDate = evt.start instanceof Date ? evt.start : new Date(evt.start);
      return evtDate >= selectedDate || isSameDay(evtDate, selectedDate);
    })
    .sort((a, b) => {
      const aDate = a.start instanceof Date ? a.start : new Date(a.start);
      const bDate = b.start instanceof Date ? b.start : new Date(b.start);
      return aDate - bDate;
    });

  // Build mini-calendar dates for the month
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let cur = gridStart;
  while (cur <= gridEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }

  // Count events per day
  const eventsByDate = events.reduce((map, evt) => {
    const key = format(evt.start instanceof Date ? evt.start : new Date(evt.start), 'yyyy-MM-dd');
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-16">
      {/* List of upcoming meetings */}
      <ol className="mt-4 divide-y divide-gray-100 text-sm lg:col-span-7 xl:col-span-8">
        {upcoming.map((evt) => {
          const dateStr = format(evt.start instanceof Date ? evt.start : new Date(evt.start), 'MMMM d, yyyy');
          const timeStr = format(evt.start instanceof Date ? evt.start : new Date(evt.start), 'h:mm a');
          const tail = evt.extendedProps?.tailNumber || 'N/A';
          return (
            <li key={evt.id} className="relative flex gap-x-6 py-6 xl:static">
              <div className="flex-auto">
                <h3 className="pr-10 font-semibold text-gray-900">{evt.title}</h3>
                <dl className="mt-2 flex flex-col text-gray-500 xl:flex-row">
                  <div className="flex items-start gap-x-3">
                    <dt className="mt-0.5">
                      <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </dt>
                    <dd>
                      <time dateTime={evt.start.toISOString()}>
                        {dateStr} at {timeStr}
                      </time>
                    </dd>
                  </div>
                  <div className="mt-2 flex items-start gap-x-3 xl:mt-0 xl:ml-3.5 xl:border-l xl:border-gray-400/50 xl:pl-3.5">
                    <dt className="mt-0.5">
                      <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </dt>
                    <dd>Airplane: {tail}</dd>
                  </div>
                </dl>
              </div>
              <Menu as="div" className="absolute top-6 right-0 xl:relative xl:top-auto xl:right-auto xl:self-center">
                <Menu.Button className="-m-2 flex items-center rounded-full p-2 text-gray-500 hover:text-gray-600">
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                </Menu.Button>
                <Menu.Items
                  transition
                  className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
                >
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onSelectDate(evt.start)}
                          className={classNames(active ? 'bg-gray-100' : '', 'block w-full px-4 py-2 text-sm text-gray-700 text-left')}
                        >
                          Go to date
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            </li>
          );
        })}
        {upcoming.length === 0 && (
          <p className="col-span-7 px-4 py-6 text-gray-500">No upcoming reservations.</p>
        )}
      </ol>

      {/* Mini month calendar */}
      <div className="mt-10 text-center lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:mt-9 xl:col-start-9">
        <div className="flex items-center text-gray-900 justify-center space-x-4">
          <button type="button" className="p-1 text-gray-400 hover:text-gray-500" onClick={() => onSelectDate(addDays(selectedDate, -30))}>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="text-sm font-semibold">
            {format(selectedDate, 'MMMM yyyy')}
          </div>
          <button type="button" className="p-1 text-gray-400 hover:text-gray-500" onClick={() => onSelectDate(addDays(selectedDate, 30))}>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-7 text-xs text-gray-500">
          {['M','T','W','T','F','S','S'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow-sm ring-1 ring-gray-200">
          {days.map((date, idx) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const isCurr = isSameMonth(date, selectedDate);
            const isSelect = isSameDay(date, selectedDate);
            const hasEvents = eventsByDate[dateKey] > 0;
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onSelectDate(date)}
                className={classNames(
                  'py-1.5 hover:bg-gray-100 focus:z-10',
                  isCurr ? 'bg-white' : 'bg-gray-50',
                  isSelect && 'font-semibold text-white bg-gray-900',
                  !isSelect && isSameDay(date, new Date()) && 'text-indigo-600',
                  !isSelect && isCurr && 'text-gray-900',
                  !isSelect && !isCurr && 'text-gray-400',
                  idx === 0 && 'rounded-tl-lg',
                  idx === 6 && 'rounded-tr-lg',
                  idx === days.length - 7 && 'rounded-bl-lg',
                  idx === days.length - 1 && 'rounded-br-lg',
                )}
              >
                <time dateTime={dateKey} className="mx-auto flex h-7 w-7 items-center justify-center rounded-full">
                  {format(date, 'd')}
                </time>
                {hasEvents && <span className="block mx-auto mt-1 h-1 w-1 rounded-full bg-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
