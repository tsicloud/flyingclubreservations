

import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white w-64 fixed inset-y-0 left-0 transform md:translate-x-0 transition-transform duration-200 ease-in-out">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <div className="text-2xl font-bold">✈️</div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2">
          <li>
            <Link to="/" className="block py-2.5 px-4 rounded hover:bg-gray-700">
              Calendar
            </Link>
          </li>
          {/* Future menu items like Profile, Admin, etc */}
        </ul>
      </nav>
    </div>
  );
}