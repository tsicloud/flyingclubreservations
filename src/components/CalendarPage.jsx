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
    const fetchReservationsFromApi = async () => {
      try {
        const data = await fetchReservations();
        if (Array.isArray(data)) {
          const formatted = data.map(reservation => ({
            id: reservation.id,
            title: `${reservation.user_name || 'Reservation'}`,
            start: reservation.start_time,
            end: reservation.end_time,
            color: reservation.airplane_color || '#2563eb',
            extendedProps: {
              airplaneId: reservation.airplane_id,
              tailNumber: reservation.airplane_tail || 'N/A',
              phoneNumber: reservation.phone_number,
              notes: reservation.notes,
              complianceStatus: reservation.compliance_status,
            }
          }));
          setReservations(formatted);
        } else {
          console.warn('Fetched reservations is not an array:', data);
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      }
    };
    fetchReservationsFromApi();
  }, []);

  const handleDateSelect = (selectInfo) => {
    const start = selectInfo.start;
    let end = selectInfo.end;

    if (!selectInfo.allDay && start.getTime() === end.getTime()) {
      end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default to 2 hours
    }

    setSelectedStart(start);
    setSelectedEnd(end);
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
    if (!airplaneId) {
      console.error('Airplane ID is required to create a reservation');
      return;
    }
    try {
      await createReservation({
        start_time: selectedStart.toISOString(),
        end_time: selectedEnd.toISOString(),
        airplane_id: airplaneId,
        notes: notes || '',
      });
      const updated = await fetchReservations();
      setReservations(formatReservations(updated));
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save reservation:', error);
    }
  };

  const handleDatesSet = (arg) => {
    setCalendarDate(arg.start);
    setCalendarView(arg.view.type);
  };

  const renderEventContent = (eventInfo) => {
    const bgColor = eventInfo.event.backgroundColor || eventInfo.event.extendedProps.color || '#2563eb';
    const tailNumber = eventInfo.event.extendedProps.tailNumber || 'N/A';
    return (
      <div
        style={{
          backgroundColor: bgColor,
          padding: '6px 8px',
          borderRadius: '4px',
          color: 'white',
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ fontWeight: '600' }}>
          {tailNumber}
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
          {eventInfo.event.title}
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