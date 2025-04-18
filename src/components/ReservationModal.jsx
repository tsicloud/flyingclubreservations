import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-globals
const customConfirm = (message) => confirm(message);

const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function ReservationModal({ isOpen, onClose, onSave, onDelete, formData = {}, setFormData }) {
  const [airplanes, setAirplanes] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/airplanes')
        .then((res) => res.json())
        .then((data) => setAirplanes(data))
        .catch((err) => console.error('Failed to fetch airplanes:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (!formData.start_time || !formData.end_time)) {
      const now = new Date();
      const defaultStart = new Date(now);
      const defaultEnd = new Date(now);
      defaultEnd.setHours(now.getHours() + 2);

      setFormData((prev) => ({
        ...prev,
        start_time: defaultStart.toISOString(),
        end_time: defaultEnd.toISOString(),
      }));
    }
  }, [isOpen, formData.start_time, formData.end_time, setFormData]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">New Reservation</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Airplane</label>
          <select
            value={formData.airplane_id}
            onChange={(e) => setFormData({ ...formData, airplane_id: e.target.value })}
            className="w-full border rounded p-2"
          >
            <option value="" disabled>Select an airplane</option>
            {airplanes.length > 0 ? (
              airplanes.map((plane) => (
                <option key={plane.id} value={plane.id}>
                  {plane.tail_number}
                </option>
              ))
            ) : (
              <option disabled>No airplanes available</option>
            )}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Start Time</label>
          <input
            type="datetime-local"
            step="900"
            value={formatDateForInput(formData.start_time)}
            onChange={(e) => setFormData({ ...formData, start_time: new Date(e.target.value).toISOString() })}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="datetime-local"
            step="900"
            value={formatDateForInput(formData.end_time)}
            onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            maxLength={250}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full border rounded p-2"
            placeholder="Optional notes (e.g., KTWF > KSUN > KTWF)"
          />
        </div>

        <div className="flex justify-end space-x-2">
          {formData.id && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={async () => {
                if (customConfirm('Are you sure you want to delete this reservation?')) {
                  try {
                    const response = await fetch(`/api/reservations/${formData.id}`, {
                      method: 'DELETE',
                    });
                    if (!response.ok) {
                      throw new Error('Failed to delete reservation');
                    }
                    await onDelete();
                    onClose();
                  } catch (error) {
                    console.error(error);
                    alert('Error deleting reservation. Please try again.');
                  }
                }
              }}
            >
              Delete
            </button>
          )}
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={async () => {
              if (!formData.airplane_id || !formData.start_time || !formData.end_time) {
                alert('Please complete all fields before saving.');
                return;
              }

              const payload = {
                airplane_id: formData.airplane_id,
                user_id: formData.user_id ?? 'auth0|user1',
                start_time: formData.start_time,
                end_time: formData.end_time,
                flight_review: formData.flight_review || false,
                notes: formData.notes || '',
                ...(formData.id && { id: formData.id }), // Include id if editing
              };

              try {
                const response = await fetch(
                  formData.id ? `/api/reservations/${formData.id}` : '/api/reservations',
                  {
                    method: formData.id ? 'PUT' : 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                  }
                );

                if (!response.ok) {
                  throw new Error('Failed to save reservation');
                }

                await onSave(); // Ensure save completes before closing
                onClose();
              } catch (error) {
                console.error(error);
                alert('Error saving reservation. Please try again.');
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}