import React from 'react';
import Card from '../UI/Card';

export default function MediaGallery({ media, onEdit, onDelete }) {
  if (!media || media.length === 0) {
    return <Card title="Media Gallery"><p className="text-gray-500">No media available.</p></Card>;
  }
  return (
    <Card title="Media Gallery">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map(item => (
          <div key={item.id} className="relative group">
            <img src={item.url} alt="media" className="rounded-lg w-full h-48 object-cover" />
            {(onEdit || onDelete) && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100"
                    title="Edit"
                    onClick={() => onEdit(item)}
                  >
                    <i className="fas fa-edit text-blue-600"></i>
                  </button>
                )}
                {onDelete && (
                  <button
                    className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100"
                    title="Delete"
                    onClick={() => onDelete(item.id)}
                  >
                    <i className="fas fa-trash text-red-600"></i>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
