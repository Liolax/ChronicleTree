import React from 'react';
import Card from '../UI/Card';

export default function Timeline({ events, onEdit, onDelete }) {
  if (!events || events.length === 0) {
    return <Card title="Timeline"><p className="text-gray-500">No timeline events available.</p></Card>;
  }
  return (
    <Card title="Timeline">
      <ul className="space-y-4">
        {events.map(event => (
          <li key={event.id} className="p-4 bg-gray-50 rounded-lg shadow flex items-center justify-between">
            <div>
              <p className="font-bold">{event.title}</p>
              <p className="text-sm text-gray-600">{event.date ? new Date(event.date).toLocaleDateString() : ''}</p>
              {event.description && <p className="text-sm text-gray-500 mt-1">{event.description}</p>}
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <button className="text-blue-600 hover:underline text-xs" onClick={() => onEdit(event)} title="Edit Event">
                    <i className="fas fa-pencil-alt"></i>
                  </button>
                )}
                {onDelete && (
                  <button className="text-red-500 hover:underline text-xs" onClick={() => onDelete(event.id)} title="Delete Event">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
