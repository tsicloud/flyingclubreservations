

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

  const handleReservationSave = async (start, end) => {
    await createReservation({ start, end });
    const updated = await fetchReservations();
    setReservations(updated);
    setModalOpen(false);
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarView}
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
        ref={calendarRef}
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