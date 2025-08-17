'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileRemove: () => void;
  disabled?: boolean;
  error?: string | null;
}

const ACCEPTED_TYPES = ['.txt', '.docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUpload({ 
  onFileSelect, 
  selectedFile, 
  onFileRemove, 
  disabled = false,
  error = null 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(fileExtension)) {
      return `Invalid file type. Please upload ${ACCEPTED_TYPES.join(' or ')} files only.`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size too large. Maximum size allowed is ${formatFileSize(MAX_FILE_SIZE)}.`;
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'File is empty. Please select a valid file.';
    }

    return null;
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setValidationError(null);
    
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setValidationError(null);
    onFileRemove();
  }, [onFileRemove]);

  const displayError = error || validationError;

  return (
    <div className="w-full">
      {/* File Upload Area */}
      {!selectedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
            ${isDragOver && !disabled 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
            ${displayError ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="flex flex-col items-center space-y-6">
            <div className={`
              p-4 rounded-2xl transition-all duration-300
              ${isDragOver && !disabled ? 'bg-blue-200' : displayError ? 'bg-red-100' : 'bg-blue-100'}
            `}>
              {displayError ? (
                <AlertCircle className="h-16 w-16 text-red-600" />
              ) : (
                <Upload className={`h-16 w-16 transition-colors ${
                  isDragOver && !disabled ? 'text-blue-700' : 'text-blue-600'
                }`} />
              )}
            </div>
            
            <div className="space-y-3">
              <p className={`text-2xl font-bold ${
                displayError ? 'text-red-700' : 'text-gray-900'
              }`}>
                {isDragOver && !disabled
                  ? 'Drop your file here'
                  : displayError
                  ? 'File Upload Error'
                  : 'Upload Meeting Transcript'
                }
              </p>
              
              {!displayError && (
                <>
                  <p className="text-lg text-gray-600 max-w-md">
                    Drag and drop your file here, or click to browse your computer
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">
                      Supported: {ACCEPTED_TYPES.join(', ')} • Max size: {formatFileSize(MAX_FILE_SIZE)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Display */
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-2xl mr-4">
                <File className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-800 mb-1">{selectedFile.name}</p>
                <p className="text-sm text-green-600 font-medium">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            
            {!disabled && (
              <button
                onClick={handleRemoveFile}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-xl transition-all duration-200"
                title="Remove file"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-2xl mr-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-800 mb-1">Upload Error</p>
              <p className="text-red-700 leading-relaxed">{displayError}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Requirements */}
      {!selectedFile && !displayError && (
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <h4 className="text-sm font-bold text-gray-800 mb-2 text-center">File Requirements</h4>
          <div className="text-sm text-gray-600 text-center space-y-1">
            <p>• Supported formats: {ACCEPTED_TYPES.join(', ')}</p>
            <p>• Maximum size: {formatFileSize(MAX_FILE_SIZE)}</p>
            <p>• Files must contain readable text content</p>
          </div>
        </div>
      )}
    </div>
  );
}