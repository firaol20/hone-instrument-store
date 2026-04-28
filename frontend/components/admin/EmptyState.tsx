import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
      <div className="p-5 bg-white rounded-3xl text-slate-400 shadow-sm mb-6">
        <Icon size={40} />
      </div>
      <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 max-w-sm mb-8">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-10 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-slate-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
