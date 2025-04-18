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
  
export async function createReservation(reservationData) {
  try {
    const response = await fetch("/reservations", {
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
    const response = await fetch(`/reservations/${reservationId}`, {
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
    const response = await fetch(`/reservations/${reservationId}`, {
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