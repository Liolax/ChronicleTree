import React from 'react';
import Card from '../UI/Card';

export default function MediaGallery({ media }) {
  if (!media || media.length === 0) {
    return <Card title="Media Gallery"><p className="text-gray-500">No media available.</p></Card>;
  }
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
