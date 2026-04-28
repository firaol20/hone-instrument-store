import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div 
    className={`animate-pulse bg-slate-200 rounded ${className}`} 
    style={style}
  />
);

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="w-full space-y-4">
    <div className="flex gap-4 border-b border-slate-100 pb-4">
      {[...Array(cols)].map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 pt-4">
        {[...Array(cols)].map((_, j) => (
          <Skeleton key={j} className="h-10 flex-1 rounded-xl" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="w-12 h-12 rounded-3xl" />
      <Skeleton className="w-16 h-6 rounded-full" />
    </div>
    <Skeleton className="w-3/4 h-10" />
    <Skeleton className="w-1/2 h-4" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-full flex flex-col items-center justify-center gap-6">
    <div className="w-full flex justify-between">
      <Skeleton className="w-32 h-6" />
      <Skeleton className="w-24 h-6" />
    </div>
    <div className="w-full flex items-end justify-between gap-4 h-48">
      {[...Array(7)].map((_, i) => (
        <Skeleton 
          key={i} 
          className="flex-1 rounded-t-xl" 
          style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }} 
        />
      ))}
    </div>
  </div>
);
