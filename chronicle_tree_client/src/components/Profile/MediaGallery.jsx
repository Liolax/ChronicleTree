import React, { useState } from 'react';
import { FaEdit, FaTrash, FaFilePdf, FaFileAlt } from 'react-icons/fa';

export default function MediaGallery({ media, onEdit, onDelete }) {
  const [modalMedia, setModalMedia] = useState(null);

  if (!media || media.length === 0) {
    return <div className="text-gray-400 text-center py-6">No media available.</div>;
  }

  const handleOpenModal = (item) => {
    setModalMedia(item);
  };
  const handleCloseModal = () => {
    setModalMedia(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {media.map(item => {
          // Detect file type
          const isPdf = item.content_type === 'application/pdf' || (item.filename && item.filename.match(/\.pdf($|\?)/i));
          const isImage = item.content_type && item.content_type.startsWith('image/');
          return (
            <div key={item.id} className="relative group aspect-square bg-white rounded-md border border-slate-100 shadow hover:shadow-lg transition overflow-hidden flex flex-col">
              {/* Media Preview */}
              {isPdf ? (
                <div className="flex-1 flex flex-col items-center justify-center p-4 cursor-pointer" onClick={() => handleOpenModal(item)}>
                  <FaFilePdf className="text-red-500 text-5xl mb-2" />
                  <span className="text-xs text-gray-600 truncate w-full text-center mb-2">{item.title || 'Untitled Media'}</span>
                  <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1 px-3 rounded-md mb-2">View PDF</span>
                </div>
              ) : isImage ? (
                <React.Fragment>
                  <img src={item.url} alt={item.title || 'media'} className="w-full h-40 object-cover rounded-t-md cursor-pointer" onClick={() => handleOpenModal(item)} />
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
      {/* Modal for previewing media */}
      {modalMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={handleCloseModal}>&times;</button>
            <div className="flex flex-col items-center">
              {modalMedia.content_type && modalMedia.content_type.startsWith('image/') ? (
                <img src={modalMedia.url} alt={modalMedia.title || 'media'} className="max-w-full max-h-[70vh] rounded mb-4" />
              ) : modalMedia.content_type === 'application/pdf' ? (
                <iframe src={modalMedia.url} title={modalMedia.title || 'PDF'} className="w-full h-[70vh] rounded mb-4" />
              ) : null}
              <div className="text-lg font-semibold mb-2">{modalMedia.title}</div>
              <div className="text-gray-600 mb-2 text-sm">{modalMedia.description}</div>
              <a href={modalMedia.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open in new tab</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
