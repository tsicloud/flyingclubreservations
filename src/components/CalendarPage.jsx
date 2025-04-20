import React, { useState, useEffect } from 'react';
import ReservationModal from './ReservationModal';
import MonthGrid from './MonthGrid';
import WeekView from './WeekView';
import DayView from './DayView';
import MeetingsView from './MeetingsView';
import { isSameDay } from 'date-fns';
import { fetchReservations, createReservation, updateReservation, deleteReservation } from '../services/api';

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
  const reload = async () => {
    try {
      const data = await fetchReservations();
      setEvents(formatReservations(data));
    } catch (e) { console.error("Error loading reservations", e); }
  };
  useEffect(() => { reload(); }, []);
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
  const [viewMode, setViewMode] = useState('week'); // 'month' | 'week' | 'day' | 'meetings'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const { events, createOrUpdate, remove } = useReservations();

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
        user_id: reservation.user_id || 'auth0|user1',
        start_time: start_time instanceof Date ? start_time.toISOString() : start_time,
        end_time:   end_time   instanceof Date ? end_time.toISOString()   : end_time,
        airplane_id,
        flight_review: reservation.flight_review ?? false,
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

  return (
    <div className="p-4">
      <div className="mb-4 flex space-x-2">
        <button
          className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('month')}
        >
          Month
        </button>
        <button
          className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('week')}
        >
          Week
        </button>
        <button
          className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('day')}
        >
          Day
        </button>
        <button
          className={`px-3 py-1 rounded ${viewMode === 'meetings' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('meetings')}
        >
          Meetings
        </button>
      </div>
      {viewMode === 'month' && (
        <MonthGrid events={events} onSelectDate={date => { setCalendarDate(date); setViewMode('week'); }} />
      )}
      {viewMode === 'week' && (
        <WeekView
          date={calendarDate}
          events={events.filter(e => isSameDay(e.start, calendarDate))}
          onEdit={evt => {
            setFormData({
              id: evt.id,
              start_time: evt.start,
              end_time: evt.end,
              airplane_id: evt.extendedProps.airplaneId || '',
              notes: evt.extendedProps.notes || '',
            });
            setModalOpen(true);
          }}
          onDelete={handleReservationDelete}
        />
      )}
      {viewMode === 'day' && (
        <DayView
          date={calendarDate}
          events={events.filter(e => isSameDay(e.start, calendarDate))}
          onEdit={evt => {
            setFormData({
              id: evt.id,
              start_time: evt.start,
              end_time: evt.end,
              airplane_id: evt.extendedProps.airplaneId || '',
              notes: evt.extendedProps.notes || '',
            });
            setModalOpen(true);
          }}
          onDelete={handleReservationDelete}
        />
      )}
      {viewMode === 'meetings' && (
        <MeetingsView
          events={events}
          selectedDate={calendarDate}
          onSelectDate={date => setCalendarDate(date)}
        />
      )}
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