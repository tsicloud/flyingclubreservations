-- Users table (stores member info and compliance)
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Auth0 user ID
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  medical_expiry DATE,
  faa_flight_review_expiry DATE,
  club_flight_review_expiry DATE,
  is_board_member BOOLEAN DEFAULT FALSE
);

-- Airplanes table (stores airplane details)
CREATE TABLE airplanes (
  id TEXT PRIMARY KEY, -- Unique ID for each airplane (e.g., 'plane1')
  tail_number TEXT NOT NULL UNIQUE, -- e.g., 'N12345'
  name TEXT NOT NULL -- e.g., 'Cessna 172'
);

-- Reservations table (stores flight reservations)
CREATE TABLE reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  airplane_id TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  is_flight_review BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (airplane_id) REFERENCES airplanes(id)
);

-- Maintenance table (stores scheduled maintenance)
CREATE TABLE maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  airplane_id TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (airplane_id) REFERENCES airplanes(id)
);

-- Squawks table (stores airplane issues and resolutions)
CREATE TABLE squawks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  airplane_id TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolution_notes TEXT,
  FOREIGN KEY (airplane_id) REFERENCES airplanes(id),
  FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- Insert sample airplane data
INSERT INTO airplanes (id, tail_number, name) VALUES
  ('plane1', 'N12345', 'Cessna 172'),
  ('plane2', 'N67890', 'Piper Cherokee'),
  ('plane3', 'N54321', 'Cessna 182');