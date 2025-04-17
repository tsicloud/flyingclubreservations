
import React, { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/profile")
      .then((r) => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then(setProfile)
      .catch((err) => {
        console.error(err);
        setError("Failed to load profile.");
      });
  }, []);

  if (error) {
    return <div className="max-w-md mx-auto p-4 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="max-w-md mx-auto p-4">Loading…</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <div className="mb-2"><strong>Name:</strong> {profile.name}</div>
      <div className="mb-2"><strong>Email:</strong> {profile.email}</div>
      <div className="mb-2"><strong>Phone:</strong> {profile.phone}</div>
      <div className="mb-2">
        <strong>Medical Expiry:</strong>{" "}
        {profile.medical_expiry || "Not set"}
      </div>
      <div className="mb-2">
        <strong>FAA Flight Review Expiry:</strong>{" "}
        {profile.faa_flight_review_expiry || "Not set"}
      </div>
      <div className="mb-2">
        <strong>Club Flight Review Expiry:</strong>{" "}
        {profile.club_flight_review_expiry || "Not set"}
      </div>
    </div>
  );
}