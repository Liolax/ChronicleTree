import React from 'react';

// Utility to combine classes
const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      {...props}
    />
  );
}

const PersonCardSkeleton = () => (
  <div className="flex flex-col space-y-3 p-4 border border-slate-200 rounded-lg max-w-sm mx-auto">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
    <div className="space-y-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
      <Skeleton className="h-4 w-[70%]" />
    </div>
  </div>
);

const TreeNodeSkeleton = () => (
  <div className="p-3 border rounded-lg flex items-center space-x-3 bg-white">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="space-y-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export default Skeleton;
export { PersonCardSkeleton, TreeNodeSkeleton };