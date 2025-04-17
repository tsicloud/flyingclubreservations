import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchReservations, createReservation } from './services/api';
import './App.css';
import ReservationModal from './components/ReservationModal';

function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    airplane_id: '',
    start_time: '',
    end_time: '',
  });
  const airplanes = [
    { id: "4", tail_number: "N12345" },
    { id: "5", tail_number: "N54321" }
  ];

  useEffect(() => {
    async function loadReservations() {
      const reservations = await fetchReservations();
      const formattedEvents = reservations.map(res => ({
        id: res.id,
        title: `${res.airplane_tail} - ${res.user_name}`,
        start: res.start_time,
        end: res.end_time,
        extendedProps: {
          flightReview: res.flight_review,
        },
      }));
      setEvents(formattedEvents);
    }
    loadReservations();
  }, []);

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

  function handleSlotSelect(selectionInfo) {
    let start = selectionInfo.startStr;
    let end = selectionInfo.endStr;

    if (start === end) {
      const startDate = new Date(start);
      startDate.setHours(startDate.getHours() + 2);
      end = startDate.toISOString().slice(0, 16);
    }

    setFormData({
      airplane_id: "4",
      start_time: start.slice(0, 16),
      end_time: end.slice(0, 16),
    });

    setShowModal(true);
  }

  async function handleSaveReservation() {
    try {
      const newReservation = {
        airplane_id: formData.airplane_id,
        user_id: "auth0|user1",
        start_time: formData.start_time,
        end_time: formData.end_time,
        flight_review: false,
      };
      await createReservation(newReservation);
      alert("Reservation created!");

      const reservations = await fetchReservations();
      const formattedEvents = reservations.map(res => ({
        id: res.id,
        title: `${res.airplane_tail} - ${res.user_name}`,
        start: res.start_time,
        end: res.end_time,
        extendedProps: {
          flightReview: res.flight_review,
        },
      }));
      setEvents(formattedEvents);

      setShowModal(false);
    } catch (error) {
      console.error("Failed to save reservation:", error);
      alert("Error saving reservation.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-blue-600 text-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold">Flying Club Reservations</h1>
      </header>
      <main className="mt-4">
        <ReservationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveReservation}
          formData={formData}
          setFormData={setFormData}
          airplanes={airplanes}
        />
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
          select={handleSlotSelect}
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