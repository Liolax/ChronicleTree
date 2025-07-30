// Add this to your React app to completely clear React Query cache
// You can run this in the browser console or add it as a temporary button

// Method 1: Clear all React Query cache
// Open browser developer tools (F12) and run this in the console:
/*
// Get the query client from the React DevTools or window (if exposed)
// If you have React Query DevTools installed:
window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.queryClient?.clear?.();

// Or if the queryClient is exposed on window:
window.queryClient?.clear?.();

// Or force reload with cache bypass:
location.reload(true);
*/

// Method 2: Add this component temporarily to force cache clear
const CacheClearButton = () => {
  const queryClient = useQueryClient();
  
  const clearAllCache = () => {
    queryClient.clear();
    queryClient.invalidateQueries();
    console.log('React Query cache cleared!');
    // Force reload after clearing
    window.location.reload();
  };
  
  return (
    <button 
      onClick={clearAllCache}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        background: 'red',
        color: 'white',
        padding: '10px',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      Clear Cache & Reload
    </button>
  );
};

// Method 3: Invalidate specific queries
const invalidateTreeQueries = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ['full-tree'] });
  queryClient.invalidateQueries({ queryKey: ['tree'] });
  queryClient.invalidateQueries({ queryKey: ['people'] });
};

export { CacheClearButton, invalidateTreeQueries };