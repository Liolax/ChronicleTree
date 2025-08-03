import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function PublicProfileView() {
  const { id } = useParams();
  
  useEffect(() => {
    // Redirect to Rails share page for public access
    if (id) {
      const railsApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const railsShareUrl = `${railsApiUrl}/profile/${id}`;
      window.location.href = railsShareUrl;
    } else {
      // No ID parameter, redirect to login
      window.location.href = '/login';
    }
  }, [id]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg text-gray-600">Redirecting to shared profile...</p>
      </div>
    </div>
  );
}
