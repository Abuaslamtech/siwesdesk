import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploaderProps {
  accept?: string;
  label?: string;
  hint?: string;
  onFile: (file: File) => void;
}

export default function FileUploader({
  accept = '.xlsx,.xls,.csv',
  label = 'Drop your file here or click to browse',
  hint = 'Supports: .xlsx, .xls, .csv',
  onFile,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);

  const handle = (file: File) => {
    setSelected(file);
    onFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handle(file);
  };

  return (
    <div>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          dragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50/30',
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handle(file);
          }}
        />

        {selected ? (
          <div className="flex items-center justify-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-primary-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-primary-700">{selected.name}</p>
              <p className="text-xs text-slate-500">
                {(selected.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              className="ml-2 p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              type="button"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{hint}</p>
          </>
        )}
      </div>
    </div>
  );
}
