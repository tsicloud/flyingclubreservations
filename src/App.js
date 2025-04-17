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
  const [notification, setNotification] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);
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
          allDay: false,
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
    <div className="flex flex-col p-1" style={{ width: '85%', marginLeft: 'auto' }}>
      <div className="text-xs font-bold text-gray-700">{eventInfo.event.extendedProps.airplane_tail}</div>
      <div className="text-[10px] text-gray-500">{eventInfo.event.extendedProps.user_name}</div>
      {eventInfo.event.extendedProps.flightReview && (
        <div className="text-[9px] text-red-400 mt-1">Flight Review</div>
      )}
    </div>
  );

  function handleSlotSelect(selectionInfo) {
    let start = selectionInfo.start; // Correct local time
    let end = selectionInfo.end;

    const diffInMinutes = (end - start) / (1000 * 60);

    if (diffInMinutes < 30) {
      end = new Date(start);
      end.setHours(start.getHours() + 2);
    }

    const formatLocalDateTime = (date) => {
      return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0') + 'T' +
        String(date.getHours()).padStart(2, '0') + ':' +
        String(date.getMinutes()).padStart(2, '0');
    };

    setFormData({
      airplane_id: "4",
      start_time: formatLocalDateTime(start),
      end_time: formatLocalDateTime(end),
    });

    setShowModal(true);
  }

  async function handleSaveReservation() {
    console.log("handleSaveReservation() CALLED!");
    const calendarApi = calendarRef.current?.getApi();
    const currentViewDate = calendarApi?.getDate();
    const currentViewType = calendarApi?.view.type;

    try {
      const newReservation = {
        airplane_id: formData.airplane_id,
        user_id: "auth0|user1",
        start_time: formData.start_time,
        end_time: formData.end_time,
        flight_review: false,
      };
      await createReservation(newReservation);
      setNotification("Reservation created!");
      setTimeout(() => setNotification(null), 5000);

      const reservations = await fetchReservations();
      const formattedEvents = reservations.map(res => {
        const airplane = airplanes.find(p => p.tail_number === res.airplane_tail);
        return {
          id: res.id,
          title: `${res.airplane_tail} - ${res.user_name}`,
          start: res.start_time,
          end: res.end_time,
          allDay: false,
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

      if (calendarApi && currentViewDate && currentViewType) {
        setPendingNavigation({ date: currentViewDate, view: currentViewType });
      }

      setShowModal(false);
    } catch (error) {
      console.error("Failed to save reservation:", error);
      setNotification("Error saving reservation.");
      setTimeout(() => setNotification(null), 5000);
    }
  }

  async function handleEventClick(clickInfo) {
    console.log("handleEventClick() CALLED!");
    if (window.confirm(`Delete this reservation for ${clickInfo.event.title}?`)) {
      const calendarApi = calendarRef.current?.getApi();
      const currentViewDate = calendarApi?.getDate();
      const currentViewType = calendarApi?.view.type;
      console.log("Captured view (delete):", currentViewType, "Captured date (delete):", currentViewDate);

      try {
        await deleteReservation(clickInfo.event.id);
        setNotification("Reservation deleted successfully!");
        setTimeout(() => setNotification(null), 5000);

        const reservations = await fetchReservations();
        const formattedEvents = reservations.map(res => {
          const airplane = airplanes.find(p => p.tail_number === res.airplane_tail);
          return {
            id: res.id,
            title: `${res.airplane_tail} - ${res.user_name}`,
            start: res.start_time,
            end: res.end_time,
            allDay: false,
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

        if (calendarApi && currentViewDate && currentViewType) {
          setPendingNavigation({ date: currentViewDate, view: currentViewType });
        }
      } catch (error) {
        console.error("Error deleting reservation:", error);
        setNotification('Failed to delete reservation.');
        setTimeout(() => setNotification(null), 5000);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-3 rounded shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-white">&times;</button>
          </div>
        </div>
      )}
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
            timeZone="local"
            headerToolbar={{
              left: 'prev today next',
              center: 'title',
              right: 'timeGridDay,timeGridWeek,dayGridMonth'
            }}
            editable={true}
            selectable={true}
            selectOverlap={true}
            select={handleSlotSelect}
            events={events}
            eventContent={eventContent}
            scrollTime="07:00:00"
            slotDuration="00:30:00"
            allDaySlot={false}
            titleFormat={{ month: 'short', year: 'numeric' }}
            eventClick={handleEventClick}
            datesSet={(arg) => {
              if (pendingNavigation) {
                console.log("Restoring pending navigation:", pendingNavigation);
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) {
                  calendarApi.changeView(pendingNavigation.view, pendingNavigation.date);
                  setPendingNavigation(null);
                }
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default App;