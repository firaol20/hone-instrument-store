'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadAPI } from '@/lib/api';
import { toast } from 'sonner';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({ value = '', onChange, label = "Banner Image" }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>(value?.startsWith('http') ? 'url' : 'upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.uploadFile(file, 'promotions');
      const imageUrl = response.data.url;
      onChange(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</label>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div className="relative">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      ) : (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative aspect-[21/9] w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden
            ${value ? 'border-orange-500/50 bg-orange-50/10' : 'border-slate-200 bg-slate-50 hover:border-orange-500/50 hover:bg-orange-50/10'}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-orange-600" size={32} />
              <span className="text-xs font-bold text-slate-500 uppercase">Uploading...</span>
            </div>
          ) : value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="p-3 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform"
                >
                  <Upload size={20} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  className="p-3 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-white rounded-full shadow-sm text-slate-400">
                <Upload size={24} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">Click to upload banner</span>
              <span className="text-[10px] text-slate-400">Recommended: 1200 x 400px</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      )}

      {value && mode === 'url' && (
        <div className="mt-4 aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-200">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};
