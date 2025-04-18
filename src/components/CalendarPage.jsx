import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ReservationModal from './ReservationModal';
import { fetchReservations, createReservation, updateReservation, deleteReservation } from '../services/api';
import '@fullcalendar/common/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

// Map raw reservation data into FullCalendar event objects
const formatReservations = (data) =>
  data.map(r => ({
    id: r.id,
    title: r.user_name || 'Reservation',
    start: new Date(r.start_time),
    end:   new Date(r.end_time),
    color: r.airplane_color || '#2563eb',
    extendedProps: {
      airplaneId: r.airplane_id.toString(),
      tailNumber: r.airplane_tail || 'N/A',
      phoneNumber: r.phone_number,
      notes: r.notes,
      complianceStatus: r.compliance_status,
    },
  }));

// Custom hook to manage fetch/create/update/delete
function useReservations() {
  const [events, setEvents] = useState([]);
  useEffect(() => { reload(); }, []);
  const reload = async () => {
    try {
      const data = await fetchReservations();
      setEvents(formatReservations(data));
    } catch (e) { console.error("Error loading reservations", e); }
  };
  const createOrUpdate = async payload => {
    if (payload.id) {
      await updateReservation(payload.id, payload);
    } else {
      await createReservation(payload);
    }
    await reload();
  };
  const remove = async id => { await deleteReservation(id); await reload(); };
  return { events, createOrUpdate, remove };
}

const CalendarPage = () => {
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
  const { events, createOrUpdate, remove } = useReservations();

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
      airplane_id: clickInfo.event.extendedProps.airplaneId || '',
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
      await createOrUpdate({
        id: dropInfo.event.id,
        start_time: dropInfo.event.start.toISOString(),
        end_time: dropInfo.event.end.toISOString(),
        airplane_id: dropInfo.event.extendedProps.airplaneId,
        notes: dropInfo.event.extendedProps.notes || '',
      });
    } catch (error) {
      console.error("Error updating reservation:", error);
      dropInfo.revert();
    }
  };

  const handleReservationSave = async reservation => {
    // Ensure we have the full reservation object from the modal
    const { id, start_time, end_time, airplane_id, notes } = reservation;
    if (!airplane_id) {
      console.error('Airplane ID is required');
      return;
    }
    try {
      await createOrUpdate({
        id,
        start_time: start_time instanceof Date ? start_time.toISOString() : start_time,
        end_time:   end_time   instanceof Date ? end_time.toISOString()   : end_time,
        airplane_id,
        notes: notes || '',
      });
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save reservation:', error);
    }
  };

  const handleReservationDelete = async (reservationId) => {
    try {
      await remove(reservationId);
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
        events={events}
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