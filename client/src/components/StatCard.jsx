import React from 'react';

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      {icon}
      <div>
        <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
