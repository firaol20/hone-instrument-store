import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ message = 'Something went wrong while fetching data.', onRetry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50/50 rounded-[3rem] border border-red-100/50">
      <div className="p-5 bg-white rounded-3xl text-red-500 shadow-sm mb-6 border border-red-50">
        <AlertCircle size={40} />
      </div>
      <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2">
        Data Sync Failure
      </h3>
      <p className="text-sm font-medium text-slate-500 max-w-sm mb-8">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-10 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl shadow-slate-200"
        >
          <RotateCcw size={16} /> Retry Sync
        </button>
      )}
    </div>
  );
};

export default ErrorState;
