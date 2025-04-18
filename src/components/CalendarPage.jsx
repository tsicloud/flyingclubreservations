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
  const [formData, setFormData] = useState({
    start_time: null,
    end_time: null,
    airplane_id: '',
    notes: ''
  });
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarRef = useRef(null);

  const formatReservations = (data) => {
    return data.map(reservation => {
      const start = reservation.start_time?.endsWith('Z') ? reservation.start_time : reservation.start_time + ":00Z";
      const end = reservation.end_time?.endsWith('Z') ? reservation.end_time : reservation.end_time + ":00Z";

      return {
        id: reservation.id,
        title: reservation.user_name || 'Reservation',
        start,
        end,
        color: reservation.airplane_color || '#2563eb',
        extendedProps: {
          airplaneId: reservation.airplane_id,
          tailNumber: reservation.airplane_tail || 'N/A',
          phoneNumber: reservation.phone_number,
          notes: reservation.notes,
          complianceStatus: reservation.compliance_status,
        }
      };
    });
  };

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
    let end = selectInfo.end || new Date(start.getTime() + 2 * 60 * 60 * 1000); // Default to 2 hours if end not provided
    if (start.getTime() === end.getTime()) {
      end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    }

    setFormData({
      start_time: start,
      end_time: end,
      airplane_id: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setFormData({
      id: clickInfo.event.id,
      start_time: clickInfo.event.start,
      end_time: clickInfo.event.end,
      airplane_id: clickInfo.event.extendedProps.airplaneId,
      notes: clickInfo.event.extendedProps.notes || '',
    });
    setModalOpen(true);
  };

  const handleEventDrop = async (dropInfo) => {
    const currentUserName = "John Doe"; // TODO: Replace with dynamic logged-in user later
    if (dropInfo.event.title !== currentUserName) {
      alert("You can only move your own reservations!");
      dropInfo.revert();
      return;
    }
    
    try {
      await createReservation({
        id: dropInfo.event.id,
        start_time: dropInfo.event.start.toISOString(),
        end_time: dropInfo.event.end.toISOString(),
        airplane_id: dropInfo.event.extendedProps.airplaneId,
        notes: dropInfo.event.extendedProps.notes || '',
      });
      const updated = await fetchReservations();
      setReservations(formatReservations(updated));
    } catch (error) {
      console.error("Error updating reservation:", error);
      dropInfo.revert();
    }
  };

  const handleReservationSave = async ({ airplaneId, notes }) => {
    if (!airplaneId) {
      console.error('Airplane ID is required to create a reservation');
      return;
    }
    try {
      await createReservation({
        id: formData.id, // might be undefined on new, that's OK
        start_time: formData.start_time.toISOString(),
        end_time: formData.end_time.toISOString(),
        airplane_id: airplaneId,
        notes: notes || '',
      });
      // Short delay to ensure database update is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      const updated = await fetchReservations();
      setReservations(formatReservations(updated));
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView(calendarView, calendarDate);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save reservation:', error);
    }
  };

  const handleReservationDelete = async (reservationId) => {
    try {
      await deleteReservation(reservationId);
      await new Promise(resolve => setTimeout(resolve, 300));
      const updated = await fetchReservations();
      setReservations(formatReservations(updated));
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to delete reservation:', error);
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
        viewDidMount={() => {
          if (calendarRef.current) {
            calendarRef.current.getApi().changeView(calendarView, calendarDate);
          }
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable={true}
        editable={true}
        events={reservations}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        datesSet={handleDatesSet}
        ref={calendarRef}
        eventContent={renderEventContent}
      />
      <ReservationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleReservationSave}
        onDelete={handleReservationDelete}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default CalendarPage;