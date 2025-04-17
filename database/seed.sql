-- Insert test users
INSERT INTO users (id, name, email, phone) VALUES
  ('auth0|user1', 'John Doe', 'john@example.com', '555-1234'),
  ('auth0|user2', 'Jane Smith', 'jane@example.com', '555-5678');

-- Insert test airplanes
INSERT INTO airplanes (tail_number, name) VALUES
  ('N12345', 'Cessna 172'),
  ('N54321', 'Cessna 182');

-- Mark Cessna 182 as requiring high-performance
INSERT INTO airplane_requirements (airplane_id, requires_high_performance)
SELECT id, TRUE FROM airplanes WHERE tail_number = 'N54321';

-- Insert pilot ratings
INSERT INTO pilot_ratings (user_id, rating) VALUES
  ('auth0|user1', 'Private'),
  ('auth0|user2', 'Private'),
  ('auth0|user2', 'Instrument');

-- Insert a reservation for the first airplane (Cessna 172)
INSERT INTO reservations (user_id, airplane_id, start_time, end_time)
SELECT 'auth0|user1', id, '2025-05-01 08:00:00', '2025-05-01 10:00:00'
FROM airplanes WHERE tail_number = 'N12345';

-- Insert maintenance for the first airplane (Cessna 172)
INSERT INTO maintenance (airplane_id, start_time, end_time, notes)
SELECT id, '2025-05-02 08:00:00', '2025-05-02 12:00:00', 'Routine oil change'
FROM airplanes WHERE tail_number = 'N12345';

-- Insert squawk for the first airplane (Cessna 172)
INSERT INTO squawks (airplane_id, reported_by, issue_description, severity)
SELECT id, 'auth0|user1', 'Sticky throttle', 'moderate'
FROM airplanes WHERE tail_number = 'N12345';
