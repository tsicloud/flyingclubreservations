import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ReservationModal from './ReservationModal';
import { fetchReservations, createReservation, deleteReservation } from '../services/api';

const CalendarPage = () => {
  const [reservations, setReservations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const loadReservations = async () => {
      const data = await fetchReservations();
      setReservations(data);
    };
    loadReservations();
  }, []);

  const handleDateSelect = (selectInfo) => {
    setSelectedStart(selectInfo.start);
    setSelectedEnd(selectInfo.end);
    setModalOpen(true);
  };

  const handleEventClick = async (clickInfo) => {
    if (window.confirm(`Are you sure you want to delete this reservation?`)) {
      await deleteReservation(clickInfo.event.id);
      const updated = await fetchReservations();
      setReservations(updated);
    }
  };

  const handleReservationSave = async ({ airplaneId, notes }) => {
    await createReservation({ start: selectedStart, end: selectedEnd, airplaneId, notes });
    const updated = await fetchReservations();
    setReservations(updated);
    setModalOpen(false);
  };

  const handleDatesSet = (arg) => {
    setCalendarDate(arg.start);
    setCalendarView(arg.view.type);
  };

  const renderEventContent = (eventInfo) => {
    const bgColor = eventInfo.event.extendedProps.color || '#2563eb';
    return (
      <div
        style={{
          backgroundColor: bgColor,
          padding: '6px 10px',
          borderRadius: '4px',
          color: 'white',
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <strong>{eventInfo.event.title}</strong>
        <div>Tail Number: {eventInfo.event.extendedProps.tailNumber}</div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarView}
        initialDate={calendarDate}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable={true}
        editable={false}
        events={reservations}
        select={handleDateSelect}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        ref={calendarRef}
        eventContent={renderEventContent}
      />
      <ReservationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleReservationSave}
        start={selectedStart}
        end={selectedEnd}
      />
    </div>
  );
};

export default CalendarPage;