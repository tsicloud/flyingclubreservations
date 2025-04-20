import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and nav links */}
            <div className="flex items-center space-x-8">
              <Link to="/">
                <img src="/logo192.png" alt="Logo" className="h-8 w-auto" />
              </Link>
              <nav className="hidden sm:flex space-x-4">
                <Link to="/calendar" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Calendar
                </Link>
                {/* Add more links here */}
              </nav>
            </div>
            {/* User menu */}
            <div className="flex items-center">
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center rounded-full bg-gray-200 p-2 focus:outline-none">
                  <span className="sr-only">Open user menu</span>
                  <span className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-medium">
                    U
                  </span>
                  <ChevronDownIcon className="ml-1 h-5 w-5 text-gray-600" aria-hidden="true" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/profile"
                        className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}
                      >
                        Profile
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={() => {/* TODO: implement logout */}}
                        className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-gray-700`}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          </div>
        </div>
      </header>
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
