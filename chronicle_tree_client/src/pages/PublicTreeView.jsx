import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PublicTreeView() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Redirect to Rails share page for public access
    const rootParam = searchParams.get('root');
    if (rootParam) {
      const railsApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const railsShareUrl = `${railsApiUrl}/tree?root=${rootParam}`;
      // Store current frontend URL for Rails to redirect back to
      const currentUrl = window.location.origin;
      const railsShareUrlWithReturn = `${railsShareUrl}&return_url=${encodeURIComponent(currentUrl)}`;
      window.location.href = railsShareUrlWithReturn;
    } else {
      // No root parameter, redirect to login
      window.location.href = '/login';
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg text-gray-600">Redirecting to shared tree...</p>
      </div>
    </div>
  );
}
