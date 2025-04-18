export async function fetchReservations() {
    try {
      const response = await fetch("/api/reservations");
      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return [];
    }
}

/**
 * Fetches reservations from DB and returns them as FullCalendar event objects.
 */
export async function fetchCalendarEvents() {
  const raw = await fetchReservations();
  return raw.map(mapToEvent);
}

function mapToEvent(r) {
  return {
    id: r.id,
    title: r.user_name || 'Reservation',
    start: r.start_time.endsWith('Z') ? r.start_time : r.start_time + ':00Z',
    end:   r.end_time.endsWith('Z')   ? r.end_time   : r.end_time   + ':00Z',
    color: r.airplane_color || '#2563eb',
    extendedProps: {
      airplaneId: r.airplane_id?.toString(),
      tailNumber: r.airplane_tail,
      notes:      r.notes || '',
      complianceStatus: r.compliance_status
    }
  };
}

export async function createReservation(reservationData) {
  try {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });
    if (!response.ok) {
      throw new Error("Failed to create reservation");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating reservation:", error);
    throw error;
  }
}

export async function deleteReservation(reservationId) {
  try {
    const response = await fetch(`/api/reservations/${reservationId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete reservation");
    }
    return;
  } catch (error) {
    console.error("Error deleting reservation:", error);
    throw error;
  }
}

export async function updateReservation(reservationId, updatedData) {
  try {
    const response = await fetch(`/api/reservations/${reservationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
      throw new Error("Failed to update reservation");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating reservation:", error);
    throw error;
  }
}

/**
 * Fetches the list of airplanes for dropdowns or filters.
 */
export async function fetchAirplanes() {
  try {
    const response = await fetch('/api/airplanes');
    if (!response.ok) {
      throw new Error('Failed to fetch airplanes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching airplanes:', error);
    return [];
  }
}