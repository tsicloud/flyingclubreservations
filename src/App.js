import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Profile from './components/Profile';
import CalendarPage from './components/CalendarPage';
import SidebarLayout from './components/SidebarLayout';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <header className="bg-blue-600 text-white p-4 rounded shadow">
          <h1 className="text-2xl font-bold">Flying Club Reservations</h1>
        </header>
        <main className="mt-4">
          <Routes>
            <Route element={<SidebarLayout />}>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;