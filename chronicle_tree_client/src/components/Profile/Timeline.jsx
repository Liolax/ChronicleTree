import React from 'react';
import Card from '../UI/Card';

export default function Timeline() {
  // Placeholder data
  const events = [
    { id: 1, date: '2023-10-26', title: 'Born' },
    { id: 2, date: '2045-08-15', title: 'Graduated High School' },
  ];

  return (
    <Card title="Timeline">
      <ul className="space-y-4">
        {events.map(event => (
          <li key={event.id} className="p-4 bg-gray-50 rounded-lg shadow">
            <p className="font-bold">{event.title}</p>
            <p className="text-sm text-gray-600">{event.date}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
