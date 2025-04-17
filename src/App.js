import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import CalendarPage from './components/CalendarPage';
import Profile from './components/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SidebarLayout />}>
          <Route index element={<CalendarPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;