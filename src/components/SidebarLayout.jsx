import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const SidebarLayout = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-white border-r border-gray-200">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
