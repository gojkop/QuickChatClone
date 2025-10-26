// src/components/common/Skeleton.jsx
// Skeleton loading placeholders

import React from 'react';

export const Skeleton = ({ className = '', variant = 'rect' }) => {
  const baseClass = 'animate-pulse bg-gray-200';
  
  const variantClass = {
    rect: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4'
  }[variant];

  return <div className={`${baseClass} ${variantClass} ${className}`} />;
};

export const SkeletonQuestionRow = () => (
  <div className="flex items-center gap-3 p-3 border-b border-gray-100">
    <Skeleton variant="circle" className="w-4 h-4 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-4 w-12" />
  </div>
);

export const SkeletonQuestionDetail = () => (
  <div className="h-full p-6 space-y-6">
    <div className="space-y-3">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>

    <Skeleton className="h-64 w-full" />
    
    <div className="grid grid-cols-3 gap-3">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-1">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonQuestionRow key={i} />
    ))}
  </div>
);

export default Skeleton;