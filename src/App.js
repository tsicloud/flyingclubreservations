import React, { useState, useEffect, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchReservations, createReservation, deleteReservation } from './services/api';
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
  const airplanes = useMemo(() => [
    { id: "4", tail_number: "N12345", color: "#3B82F6" }, // Blue
    { id: "5", tail_number: "N54321", color: "#F59E0B" }, // Amber
  ], []);
  const calendarRef = useRef(null);

  useEffect(() => {
    async function loadReservations() {
      const reservations = await fetchReservations();
      console.log("Reservations loaded:", reservations); // Added console log for debugging
      const formattedEvents = reservations.map(res => {
        const airplane = airplanes.find(p => p.tail_number === res.airplane_tail);
        return {
          id: res.id,
          title: `${res.airplane_tail} - ${res.user_name}`,
          start: res.start_time,
          end: res.end_time,
          backgroundColor: airplane ? airplane.color : '#3B82F6',
          borderColor: airplane ? airplane.color : '#3B82F6',
          textColor: 'white',
          extendedProps: {
            flightReview: res.flight_review,
            airplane_tail: res.airplane_tail,
            user_name: res.user_name,
          },
        };
      });
      setEvents(formattedEvents);
    }
    loadReservations();
  }, [airplanes]);

  const eventContent = (eventInfo) => (
    <div className="flex flex-col p-1">
      <div className="text-xs font-bold text-gray-700">{eventInfo.event.extendedProps.airplane_tail}</div>
      <div className="text-[10px] text-gray-500">{eventInfo.event.extendedProps.user_name}</div>
      {eventInfo.event.extendedProps.flightReview && (
        <div className="text-[9px] text-red-400 mt-1">Flight Review</div>
      )}
    </div>
  );

  function handleSlotSelect(selectionInfo) {
    let start = new Date(selectionInfo.startStr);
    let end = new Date(selectionInfo.endStr);

    const diffInMinutes = (end - start) / (1000 * 60);

    // If the user selected less than 2 hours, set default to 2 hours
    if (diffInMinutes < 120) {
      end = new Date(start);
      end.setHours(start.getHours() + 2);
    }

    setFormData({
      airplane_id: "4",
      start_time: start.toISOString().slice(0, 16),
      end_time: end.toISOString().slice(0, 16),
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
      const formattedEvents = reservations.map(res => {
        const airplane = airplanes.find(p => p.tail_number === res.airplane_tail);
        return {
          id: res.id,
          title: `${res.airplane_tail} - ${res.user_name}`,
          start: res.start_time,
          end: res.end_time,
          backgroundColor: airplane ? airplane.color : '#3B82F6',
          borderColor: airplane ? airplane.color : '#3B82F6',
          textColor: 'white',
          extendedProps: {
            flightReview: res.flight_review,
            airplane_tail: res.airplane_tail,
            user_name: res.user_name,
          },
        };
      });
      setEvents(formattedEvents);

      setShowModal(false);
    } catch (error) {
      console.error("Failed to save reservation:", error);
      alert("Error saving reservation.");
    }
  }

  async function handleEventClick(clickInfo) {
    if (window.confirm(`Delete this reservation for ${clickInfo.event.title}?`)) {
      try {
        await deleteReservation(clickInfo.event.id);

        // Wait briefly then manually refetch events through FullCalendar API
        setTimeout(() => {
          const calendarApi = calendarRef.current?.getApi();
          if (calendarApi) {
            calendarApi.refetchEvents();
          }
        }, 500);

        alert('Reservation deleted successfully!');
      } catch (error) {
        console.error("Error deleting reservation:", error);
        alert('Failed to delete reservation.');
      }
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
        <div
          className="bg-white rounded-xl shadow-md overflow-hidden p-4 border border-gray-200"
          style={{ height: '80vh', overflowY: 'scroll' }}
        >
          <FullCalendar
            key={events.length}
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev today next',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,dayGridMonth'
            }}
            editable={true}
            selectable={true}
            select={handleSlotSelect}
            events={events}
            eventContent={eventContent}
            scrollTime="07:00:00"
            slotDuration="00:30:00"
            allDaySlot={false}
            titleFormat={{ month: 'short', year: 'numeric' }}
            eventClick={handleEventClick}
          />
        </div>
      </main>
    </div>
  );
}

export default App;