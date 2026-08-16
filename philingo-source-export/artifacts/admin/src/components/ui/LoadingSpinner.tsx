import React from 'react';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${s} animate-spin rounded-full border-4 border-[#1B4FD8] border-t-transparent`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1B4FD8] border-t-transparent" />
    </div>
  );
}
