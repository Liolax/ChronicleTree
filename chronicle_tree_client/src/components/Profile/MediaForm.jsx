import React, { useState } from 'react';
import api from '../../api/api';
import Button from '../UI/Button';

export default function MediaForm({ personId, media, onMediaAdded, onMediaUpdated, onCancel }) {
  const [title, setTitle] = useState(media?.title || '');
  const [description, setDescription] = useState(media?.description || '');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isEdit = typeof media === 'object' && media !== null && media.id !== undefined;
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      // The backend expects the media params to be nested under 'media' key
      formData.append('media[title]', title);
      formData.append('media[description]', description);
      if (file) formData.append('media[file]', file);
      let response;
      if (isEdit && media?.id) {
        // Only allow editing if media.id exists
        response = await api.put(`/media/${media.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onMediaUpdated && onMediaUpdated(response.data);
      } else {
        response = await api.post(`/people/${personId}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onMediaAdded && onMediaAdded(response.data);
      }
      onCancel && onCancel(); // Always close modal after submit
    } catch (err) {
      console.error('Media save error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.response?.data?.errors?.[0] ||
                          'Error saving media. Please check your file and try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = e => {
    const f = e.target.files[0];
    setError('');
    
    if (f) {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (f.size > maxSize) {
        setError('File size must be less than 10MB');
        setFile(null);
        setPreviewUrl(null);
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'];
      if (!allowedTypes.includes(f.type)) {
        setError('File type not supported. Please use JPG, PNG, GIF, PDF, MP4, WEBM, MP3, or WAV files.');
        setFile(null);
        setPreviewUrl(null);
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const renderExistingPreview = () => {
    if (!isEdit || !media?.url) return null;
    if (media.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <img src={media.url} alt="Current" className="w-full max-h-40 object-contain rounded mb-2" />;
    } else if (media.url.match(/\.(mp4|webm|ogg)$/i)) {
      return <video src={media.url} controls className="w-full max-h-40 rounded mb-2" />;
    } else if (media.url.match(/\.(mp3|wav|ogg)$/i)) {
      return <audio src={media.url} controls className="w-full mb-2" />;
    }
    return null;
  };

  const renderFilePreview = () => {
    if (!previewUrl) return null;
    if (file?.type?.startsWith('image/')) {
      return <img src={previewUrl} alt="Preview" className="w-full max-h-40 object-contain rounded mb-2" />;
    } else if (file?.type?.startsWith('video/')) {
      return <video src={previewUrl} controls className="w-full max-h-40 rounded mb-2" />;
    } else if (file?.type?.startsWith('audio/')) {
      return <audio src={previewUrl} controls className="w-full mb-2" />;
    }
    return null;
  };

  // Only add required if not editing
  const fileInputProps = {
    id: 'media-file',
    type: 'file',
    accept: 'image/*,video/*,audio/*',
    onChange: handleFileChange,
    disabled: isSubmitting
  };
  if (!isEdit) fileInputProps.required = true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form onSubmit={handleSubmit} aria-label={isEdit ? 'Edit Media' : 'Add Media'} className="space-y-4 bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={onCancel} disabled={isSubmitting} aria-label="Close">&times;</button>
        {isEdit && (
          <>
            <h3 className="text-lg font-semibold mb-4">Edit Media</h3>
            {/* Show existing media preview at the top of the modal when editing */}
            {renderExistingPreview()}
          </>
        )}
        {!isEdit && <h3 className="text-lg font-semibold mb-4">Add Media</h3>}
        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        <div>
          <label className="block mb-1 font-medium" htmlFor="media-title">Title</label>
          <input
            id="media-title"
            className="w-full border rounded p-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="media-description">Description</label>
          <textarea
            id="media-description"
            className="w-full border rounded p-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="media-file">{isEdit ? 'Replace File' : 'Media File'}</label>
          <div className="text-xs text-gray-500 mb-2">
            Supported: Images (JPG, PNG, GIF), Documents (PDF), Video (MP4, WEBM), Audio (MP3, WAV). Max 10MB each.
          </div>
          {/* Only show preview below file input if a new file is selected */}
          {renderFilePreview()}
          <input {...fileInputProps} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={onCancel} variant="grey" disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (isEdit ? 'Save' : 'Add')}</Button>
        </div>
      </form>
    </div>
  );
}
