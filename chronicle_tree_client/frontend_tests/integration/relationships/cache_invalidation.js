/**
 * Temporary script to manually invalidate React Query cache
 * Run this in the browser console when on the Chronicle Tree website
 */

// Check if React Query exists
if (window.__REACT_QUERY_STATE__) {
  console.log('React Query detected - clearing cache...');
  
  // Clear all cache
  const queryClient = window.__REACT_QUERY_STATE__.queryClient;
  if (queryClient) {
    queryClient.clear();
    console.log('✅ React Query cache cleared!');
    window.location.reload();
  }
} else {
  console.log('Manual cache clearing - clearing all browser storage...');
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage  
  sessionStorage.clear();
  
  // Clear indexedDB (if any)
  if (window.indexedDB) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        indexedDB.deleteDatabase(db.name);
      });
    });
  }
  
  console.log('✅ All browser storage cleared!');
  window.location.reload();
}