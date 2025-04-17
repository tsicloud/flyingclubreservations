-- Users table (stores member info and compliance)
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Auth0 user ID
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  medical_expiry DATE,
  faa_flight_review_expiry DATE,
  club_flight_review_expiry DATE,
  is_board_member BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Airplanes table (stores airplane details)
CREATE TABLE airplanes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tail_number TEXT NOT NULL UNIQUE, -- e.g., 'N12345'
  name TEXT NOT NULL -- e.g., 'Cessna 172'
);

-- Reservations table (stores flight reservations)
CREATE TABLE reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  airplane_id INTEGER NOT NULL,
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
  airplane_id INTEGER NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (airplane_id) REFERENCES airplanes(id)
);

-- Squawks table (stores airplane issues and resolutions)
CREATE TABLE squawks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  airplane_id INTEGER NOT NULL,
  reported_by TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolution_notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  severity TEXT CHECK(severity IN ('low', 'moderate', 'high')) DEFAULT 'moderate',
  FOREIGN KEY (airplane_id) REFERENCES airplanes(id),
  FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- Insert sample airplane data
INSERT INTO airplanes (tail_number, name) VALUES
  ('N12345', 'Cessna 172'),
  ('N67890', 'Piper Cherokee'),
  ('N54321', 'Cessna 182');

-- Airplane requirements table (stores airplane-specific limitations)
CREATE TABLE airplane_requirements (
  airplane_id INTEGER PRIMARY KEY,
  requires_high_performance BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (airplane_id) REFERENCES airplanes(id)
);

-- Insert sample airplane requirements data
-- Assuming Cessna 182 is the 3rd airplane inserted and has id = 3
INSERT INTO airplane_requirements (airplane_id, requires_high_performance) VALUES
  (3, TRUE);

-- Pilot ratings table (stores ratings for each user)
CREATE TABLE pilot_ratings (
  user_id TEXT NOT NULL,
  rating TEXT NOT NULL,
  PRIMARY KEY (user_id, rating),
  FOREIGN KEY (user_id) REFERENCES users(id)
);