import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ReservationModal from './ReservationModal';
import { fetchReservations, createReservation, updateReservation, deleteReservation } from '../services/api';
import { isSameDay } from 'date-fns';

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 640);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);
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
        user_id: reservation.user_id || 'auth0|user1',
        start_time: start_time instanceof Date ? start_time.toISOString() : start_time,
        end_time:   end_time   instanceof Date ? end_time.toISOString()   : end_time,
        airplane_id,
        flight_review: reservation.flight_review ?? false,
        notes: notes || '',
      });
      setModalOpen(false);
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    } catch (error) {
      console.error('Failed to save reservation:', error);
    }
  };

  const handleReservationDelete = async (reservationId) => {
    try {
      await remove(reservationId);
      setModalOpen(false);
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
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
      {calendarView === 'monthList' ? (
        <div className="flex">
          <div className="w-2/3 overflow-auto max-h-[80vh] pr-4">
            {events
              .filter(e => e.start >= selectedDate || isSameDay(e.start, selectedDate))
              .sort((a,b) => a.start - b.start)
              .map(e => (
                <div key={e.id} className="mb-4 p-2 border rounded">
                  <div className="font-semibold">{e.title}</div>
                  <div>{e.start.toLocaleString()}</div>
                </div>
              ))
            }
          </div>
          <div className="w-1/3">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              initialDate={selectedDate}
              headerToolbar={false}
              events={events}
              dayCellDidMount={info => {
                const hasEvent = events.some(e => isSameDay(e.start, info.date));
                if (hasEvent) {
                  info.el.querySelector('.fc-daygrid-day-number').classList.add('bg-blue-500','rounded-full','text-white');
                }
              }}
              dateClick={({ date }) => {
                setSelectedDate(date);
                setCalendarView('timeGridWeek');
              }}
            />
          </div>
        </div>
      ) : (
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          customButtons={{
            monthList: {
              text: 'month',
              click: () => setCalendarView('monthList'),
            }
          }}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'monthList,timeGridWeek,timeGridDay'
          }}
          initialView={isSmallScreen ? 'listWeek' : calendarView}
          initialDate={calendarDate}
          scrollTime="00:00"
          aspectRatio={isSmallScreen ? 0.5 : 1.35}
          selectable
          editable
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
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