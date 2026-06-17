'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  RefreshCw 
} from 'lucide-react';
import api from '../lib/api';

export interface UploadResult {
  key: string;
  url: string;
  fileName: string;
  mimetype: string;
  size: number;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'failed';
  error?: string;
  result?: UploadResult;
}

interface FileUploaderProps {
  uploadType: 'course-material' | 'assignment-submission';
  onUploadSuccess?: (uploadedFiles: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  accept?: string; // e.g. "image/*,application/pdf,video/*"
  maxSizeMB?: number; // default 50
}

export default function FileUploader({
  uploadType,
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  accept = '*/*',
  maxSizeMB = 50
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper to get file icon based on mimetype
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (mimetype.startsWith('video/')) return <Video className="h-5 w-5 text-indigo-500" />;
    if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('document')) {
      return <FileText className="h-5 w-5 text-emerald-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  // Trigger file upload for a specific file
  const uploadSingleFile = async (fileObj: UploadingFile) => {
    // If already uploading or completed, skip
    if (fileObj.status === 'uploading' || fileObj.status === 'completed') return;

    setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 0, error: undefined } : f));

    const formData = new FormData();
    formData.append('file', fileObj.file);

    try {
      const response = await api.post(`/upload/${uploadType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || fileObj.file.size;
          const progress = Math.round((progressEvent.loaded * 100) / total);
          setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress } : f));
        },
      });

      const result: UploadResult = response.data.file;

      setFiles(prev => {
        const updated = prev.map(f => f.id === fileObj.id ? { ...f, status: 'completed' as const, progress: 100, result } : f);
        // Call callback with all completed results so far
        const completedResults = updated
          .filter(f => f.status === 'completed' && f.result)
          .map(f => f.result!);
        onUploadSuccess?.(completedResults);
        return updated;
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Upload failed';
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'failed' as const, error: errorMsg } : f));
      onUploadError?.(errorMsg);
    }
  };

  // Process and add files
  const processFiles = (incomingFiles: FileList | File[]) => {
    const validFiles: UploadingFile[] = [];
    const sizeLimit = maxSizeMB * 1024 * 1024;
    let errors: string[] = [];

    // Check count limits
    const currentFilesCount = files.length;
    const remainingSlots = maxFiles - currentFilesCount;

    if (remainingSlots <= 0) {
      const errMsg = `Maximum limit of ${maxFiles} files reached.`;
      onUploadError?.(errMsg);
      return;
    }

    const filesToProcess = Array.from(incomingFiles).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      // Validate size
      if (file.size > sizeLimit) {
        errors.push(`${file.name} is too large. Max size is ${maxSizeMB}MB.`);
        return;
      }

      // Check MIME type match if accept is specified and not wildcard
      if (accept !== '*/*') {
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileType = file.type;
        const fileName = file.name;
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            const baseType = type.substring(0, type.length - 2);
            return fileType.startsWith(baseType);
          }
          if (type.startsWith('.')) {
            return fileName.toLowerCase().endsWith(type.toLowerCase());
          }
          return fileType === type;
        });

        if (!isAccepted) {
          errors.push(`${file.name} is not an accepted file type.`);
          return;
        }
      }

      validFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        progress: 0,
        status: 'idle',
      });
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join(' '));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      // Trigger uploads automatically
      validFiles.forEach(f => uploadSingleFile(f));
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [files]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50/50 dark:hover:bg-gray-900/30'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          className="hidden" 
          multiple={maxFiles > 1}
          accept={accept}
        />
        <div className="p-4 bg-blue-50 dark:bg-blue-950/45 rounded-2xl mb-4 text-blue-600 dark:text-blue-400">
          <UploadCloud className="h-8 w-8" />
        </div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-150 text-center">
          Drag & drop files here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Supports: {accept === '*/*' ? 'Any file' : accept.replace(/\*/g, '').toUpperCase()} (Max size: {maxSizeMB}MB)
        </p>
      </motion.div>

      {/* File List / Queue */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 max-h-60 overflow-y-auto pr-1"
          >
            {files.map(fileObj => (
              <motion.div
                key={fileObj.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-sm"
              >
                {/* File Icon & Info */}
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className="flex-shrink-0">
                    {getFileIcon(fileObj.file.type)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {fileObj.file.name}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {formatBytes(fileObj.file.size)}
                      </p>
                    </div>

                    {/* Progress / Status Bar */}
                    <div className="w-full mt-2">
                      {fileObj.status === 'uploading' && (
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-blue-600 h-full rounded-full" 
                              style={{ width: `${fileObj.progress}%` }}
                              layoutId={`progress-${fileObj.id}`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 flex-shrink-0">
                            {fileObj.progress}%
                          </span>
                        </div>
                      )}
                      {fileObj.status === 'completed' && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Uploaded successfully
                        </span>
                      )}
                      {fileObj.status === 'failed' && (
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1" title={fileObj.error}>
                          <AlertCircle className="h-3 w-3" /> {fileObj.error || 'Failed'}
                        </span>
                      )}
                      {fileObj.status === 'idle' && (
                        <span className="text-[10px] font-medium text-gray-500">
                          Waiting...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {fileObj.status === 'failed' && (
                    <button
                      onClick={() => uploadSingleFile(fileObj)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400 rounded-lg transition"
                      title="Retry"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-455 rounded-lg transition"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
