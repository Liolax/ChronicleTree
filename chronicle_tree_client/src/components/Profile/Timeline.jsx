import React from 'react';
import Card from '../UI/Card';

export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return <Card title="Timeline"><p className="text-gray-500">No timeline events available.</p></Card>;
  }
  return (
    <Card title="Timeline">
      <ul className="space-y-4">
        {events.map(event => (
          <li key={event.id} className="p-4 bg-gray-50 rounded-lg shadow">
            <p className="font-bold">{event.title}</p>
            <p className="text-sm text-gray-600">{event.date ? new Date(event.date).toLocaleDateString() : ''}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
