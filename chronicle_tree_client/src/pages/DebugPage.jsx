import React, { useEffect } from 'react';
import { debugRelationships } from '../utils/debug-relationships';

function DebugPage() {
  useEffect(() => {
    debugRelationships();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Relationships</h1>
      <p>Check the console for debug output.</p>
    </div>
  );
}

export default DebugPage;