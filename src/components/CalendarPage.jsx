import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ReservationModal from './ReservationModal';
import { fetchReservations, createReservation, deleteReservation } from '../services/api';

const formatReservations = (data) => data.map(reservation => ({
  id: reservation.id,
  title: `${reservation.user_name || 'Reservation'}`,
  start: reservation.start_time,
  end: reservation.end_time,
  color: reservation.airplane_color || '#2563eb',
  extendedProps: {
    airplaneId: reservation.airplane_id,
    tailNumber: reservation.airplane_tail_number,
    phoneNumber: reservation.phone_number,
    notes: reservation.notes,
    complianceStatus: reservation.compliance_status,
  }
}));

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
      const formatted = formatReservations(data);
      setReservations(formatted);
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
      setReservations(formatReservations(updated));
    }
  };

  const handleReservationSave = async ({ airplaneId, notes }) => {
    await createReservation({ start: selectedStart, end: selectedEnd, airplaneId, notes });
    const updated = await fetchReservations();
    setReservations(formatReservations(updated));
    setModalOpen(false);
  };

  const handleDatesSet = (arg) => {
    setCalendarDate(arg.start);
    setCalendarView(arg.view.type);
  };

  const renderEventContent = (eventInfo) => {
    const bgColor = eventInfo.event.backgroundColor || '#2563eb';
    return (
      <div
        style={{
          backgroundColor: bgColor,
          padding: '8px 12px',
          borderRadius: '6px',
          color: 'white',
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>
          {eventInfo.event.extendedProps.tailNumber || 'Unknown Tail #'}
        </div>
        <div style={{ marginTop: '2px' }}>
          {eventInfo.event.title || 'Reservation'}
        </div>
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