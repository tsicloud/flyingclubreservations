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
    if (isOpen) {
      const now = new Date();
      if (!formData.start_time || !formData.end_time) {
        const defaultStart = new Date(now);
        const defaultEnd = new Date(now);
        defaultEnd.setHours(now.getHours() + 2);

        setFormData((prev) => ({
          ...prev,
          start_time: defaultStart.toISOString(),
          end_time: defaultEnd.toISOString(),
        }));
      }
      if (!formData.airplane_id && airplanes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          airplane_id: airplanes[0]?.id.toString() || '',
        }));
      }
    }
  }, [isOpen, airplanes, formData.start_time, formData.end_time, formData.airplane_id, setFormData]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-semibold mb-4">
          {formData.id ? 'Edit Reservation' : 'New Reservation'}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Airplane</label>
          <select
            value={formData.airplane_id?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, airplane_id: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="" disabled>Select an airplane</option>
            {airplanes.length > 0 ? (
                airplanes.map((plane) => (
                <option key={plane.id} value={plane.id.toString()}>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">End Time</label>
          <input
            type="datetime-local"
            step="900"
            value={formatDateForInput(formData.end_time)}
            onChange={(e) => setFormData({ ...formData, end_time: new Date(e.target.value).toISOString() })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            maxLength={250}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Optional notes (e.g., KTWF > KSUN > KTWF)"
          />
        </div>

        <div className="flex justify-end space-x-2">
          {formData.id && (
            <button
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={async () => {
                if (customConfirm('Are you sure you want to delete this reservation?')) {
                  try {
                    await onDelete(formData.id);
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
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={async () => {
              if (!formData.start_time || !formData.end_time || !formData.airplane_id) {
                alert('Please complete all fields before saving.');
                return;
              }

              try {
                await onSave(formData);
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