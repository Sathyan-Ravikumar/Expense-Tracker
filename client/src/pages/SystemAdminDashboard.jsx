import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { FaUsers, FaUserShield, FaCog, FaClipboardList } from 'react-icons/fa';

function SystemAdminDashboard() {

  const adminActions = [
    { name: 'Manage Users', path: '/admin/users', icon: <FaUsers className="text-4xl text-blue-500" />, description: 'Add, remove, or edit user profiles and roles.' },
    { name: 'Manage Roles', path: '/admin/roles', icon: <FaUserShield className="text-4xl text-green-500" />, description: 'Define roles and their permissions within the application.' },
    { name: 'Configure Approval Rules', path: '/approval-rules', icon: <FaCog className="text-4xl text-purple-500" />, description: 'Set up and modify the claim approval workflow and thresholds.' },
    { name: 'View Audit Logs', path: '/admin/logs', icon: <FaClipboardList className="text-4xl text-yellow-500" />, description: 'Track all significant activities and changes within the system.' },
  ];

  return (
    <DashboardLayout pageTitle="System Administration">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {adminActions.map((action) => (
            <Link to={action.path} key={action.name} className="block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                {action.icon}
                <h2 className="text-xl font-bold text-gray-800 ml-4">{action.name}</h2>
              </div>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
    </DashboardLayout>
  );
}

export default SystemAdminDashboard;
