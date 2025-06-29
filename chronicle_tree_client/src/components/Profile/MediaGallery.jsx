import React from 'react';
import Card from '../UI/Card';

export default function MediaGallery() {
  // Placeholder data
  const media = [
    { id: 1, type: 'image', url: 'https://via.placeholder.com/150' },
    { id: 2, type: 'image', url: 'https://via.placeholder.com/150' },
    { id: 3, type: 'image', url: 'https://via.placeholder.com/150' },
  ];

  return (
    <Card title="Media Gallery">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map(item => (
          <div key={item.id}>
            <img src={item.url} alt="media" className="rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  );
}
