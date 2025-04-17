import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './App.css';

function App() {
  // Sample events to mimic the screenshot
  const events = [
    {
      title: '3 Days Jordan Package Tours – JE',
      start: '2025-04-27T19:00:00',
      end: '2025-04-27T20:00:00',
      extendedProps: { category: 'Packages', participants: 4 },
    },
    {
      title: '3 Days Jordan Package Tours – JE',
      start: '2025-04-28T07:00:00',
      end: '2025-04-28T08:00:00',
      extendedProps: { category: 'Packages', participants: 2 },
    },
    {
      title: 'Hotel name',
      start: '2025-04-30T07:00:00',
      end: '2025-04-30T08:00:00',
      extendedProps: { category: 'Hotel', participants: 4 },
    },
    {
      title: 'Burj Khalifa tickets: levels 124 and 125',
      start: '2025-04-28T07:00:00',
      end: '2025-04-28T08:00:00',
      extendedProps: { category: 'Activities', participants: 2 },
    },
  ];

  // Event content customization to match screenshot
  const eventContent = (arg) => {
    const { category, participants } = arg.event.extendedProps;
    return (
      <div className={`p-2 rounded ${category === 'Packages' ? 'bg-green-100' : category === 'Hotel' ? 'bg-yellow-100' : 'bg-purple-100'}`}>
        <div className="text-sm font-semibold">{arg.event.title}</div>
        <div className="text-xs">{category}</div>
        <div className="text-xs">👥 {participants}</div>
        <div className="flex space-x-1 mt-1">
          <button className="text-gray-500 hover:text-gray-700">✏️</button>
          <button className="text-gray-500 hover:text-gray-700">🗑️</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold">Flying Club Reservations</h1>
      </header>
      <div className="mt-4 flex flex-wrap gap-4">
        {/* Filter Dropdowns */}
        <select className="border rounded px-2 py-1">
          <option>Country</option>
          <option>Italy</option>
          <option>Spain</option>
          <option>Israel</option>
        </select>
        <select className="border rounded px-2 py-1">
          <option>Supplier</option>
          <option>Travel HIT</option>
        </select>
        <select className="border rounded px-2 py-1">
          <option>Select category</option>
          <option>Packages</option>
          <option>Hotel</option>
          <option>Activities</option>
        </select>
        <select className="border rounded px-2 py-1">
          <option>Select agents</option>
        </select>
      </div>
      <main className="mt-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek,dayGridMonth,dayGridYear'
          }}
          editable={true}
          selectable={true}
          events={events}
          eventContent={eventContent}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          initialDate="2025-04-27"
          scrollTime="06:00:00"
          slotDuration="01:00:00"
          allDaySlot={false}
          height="auto"
          dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }}
          titleFormat={{ month: 'short', year: 'numeric' }}
        />
      </main>
    </div>
  );
}

export default App;