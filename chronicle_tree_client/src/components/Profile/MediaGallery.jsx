import React from 'react';
import { FaEdit, FaTrash, FaFilePdf, FaFileAlt } from 'react-icons/fa';

export default function MediaGallery({ media, onEdit, onDelete }) {
  if (!media || media.length === 0) {
    return <div className="text-gray-400 text-center py-6">No media available.</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {media.map(item => {
        // Detect file type
        const isPdf = item.content_type === 'application/pdf' || (item.filename && item.filename.match(/\.pdf($|\?)/i));
        const isImage = item.content_type && item.content_type.startsWith('image/');
        return (
          <div key={item.id} className="relative group aspect-square bg-white rounded-md border border-slate-100 shadow hover:shadow-lg transition overflow-hidden flex flex-col">
            {/* Media Preview */}
            {isPdf ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <FaFilePdf className="text-red-500 text-5xl mb-2" />
                <span className="text-xs text-gray-600 truncate w-full text-center mb-2">{item.title || 'Untitled Media'}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1 px-3 rounded-md mb-2"
                >
                  View PDF
                </a>
              </div>
            ) : isImage ? (
              <React.Fragment>
                <img src={item.url} alt={item.title || 'media'} className="w-full h-40 object-cover rounded-t-md" />
                <span className="block text-xs text-gray-600 px-2 py-1 truncate text-center">{item.title || 'Untitled Media'}</span>
              </React.Fragment>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <FaFileAlt className="text-gray-400 text-4xl mb-2" />
                <span className="text-xs text-gray-600 truncate w-full text-center mb-2">{item.title || 'File'}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1 px-3 rounded-md mb-2"
                >
                  Download
                </a>
              </div>
            )}
            {/* Edit/Delete Controls */}
            {(onEdit || onDelete) && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {onEdit && (
                  <button
                    className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100"
                    title="Edit"
                    onClick={() => onEdit(item)}
                  >
                    <FaEdit className="text-blue-600" />
                  </button>
                )}
                {onDelete && (
                  <button
                    className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100"
                    title="Delete"
                    onClick={() => onDelete(item.id)}
                  >
                    <FaTrash className="text-red-600" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
