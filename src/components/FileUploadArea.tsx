import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Assuming utils.ts exists for cn

interface UploadableFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface FileUploadAreaProps {
  onUploadSuccess?: (uploadedFiles: File[]) => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[]; // e.g., ['image/png', 'application/pdf']
  maxFiles?: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onUploadSuccess,
  maxFileSize = 5 * 1024 * 1024, // Default 5MB
  allowedFileTypes,
  maxFiles = 5, // Default max 5 files
}) => {
  const [stagedFiles, setStagedFiles] = useState<UploadableFile[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('FileUploadArea loaded');

  const handleFileValidation = (file: File): string | null => {
    if (maxFileSize && file.size > maxFileSize) {
      return `File is too large (max ${formatFileSize(maxFileSize)}).`;
    }
    if (allowedFileTypes && allowedFileTypes.length > 0 && !allowedFileTypes.includes(file.type)) {
      return `File type not allowed. Allowed types: ${allowedFileTypes.join(', ')}.`;
    }
    return null;
  };

  const addFilesToStage = (files: FileList | File[]) => {
    const newUploadableFiles: UploadableFile[] = [];
    let currentFileCount = stagedFiles.length;

    Array.from(files).forEach(file => {
      if (currentFileCount >= maxFiles) {
        toast.error(`Cannot add more files. Maximum is ${maxFiles}.`);
        return;
      }
      const validationError = handleFileValidation(file);
      if (validationError) {
        toast.error(`Error with ${file.name}: ${validationError}`);
        return;
      }
      newUploadableFiles.push({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending',
      });
      currentFileCount++;
    });

    if (newUploadableFiles.length > 0) {
      setStagedFiles(prev => [...prev, ...newUploadableFiles]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Optional: Add more specific drag over effects if needed
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToStage(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToStage(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input for same file selection
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const simulateUpload = (fileId: string) => {
    setStagedFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, status: 'uploading', progress: 0 } : f))
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setStagedFiles(prev =>
          prev.map(f => (f.id === fileId ? { ...f, progress } : f))
        );
      } else {
        clearInterval(interval);
        setStagedFiles(prev =>
          prev.map(f => (f.id === fileId ? { ...f, status: 'success', progress: 100 } : f))
        );
        // Find the original File object for the callback
        const uploadedFile = stagedFiles.find(f => f.id === fileId)?.file;
        if (uploadedFile) {
          toast.success(`${uploadedFile.name} uploaded successfully!`);
        }
      }
    }, 200);
  };

  const handleUploadAll = async () => {
    const filesToUpload = stagedFiles.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) {
      toast.info("No files to upload or all files are already processed.");
      return;
    }

    filesToUpload.forEach(file => simulateUpload(file.id));

    // Simulate waiting for all uploads to complete
    // In a real scenario, you'd await actual upload promises
    // For this simulation, we check status after a delay
    setTimeout(() => {
      const successfullyUploadedFiles = stagedFiles
        .filter(f => f.status === 'success')
        .map(f => f.file);
      if (onUploadSuccess && successfullyUploadedFiles.length > 0) {
        onUploadSuccess(successfullyUploadedFiles);
      }
    }, filesToUpload.length * 2500); // Adjusted timing
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Files</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/70 transition-colors",
            isDraggingOver ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-600"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className={cn("w-12 h-12 mb-3", isDraggingOver ? "text-primary" : "text-gray-400")} />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max {maxFiles} files. Max size per file: {formatFileSize(maxFileSize)}.
            {allowedFileTypes && ` Types: ${allowedFileTypes.join(', ')}`}
          </p>
          <Input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept={allowedFileTypes?.join(',')}
          />
        </div>

        {stagedFiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Files to Upload ({stagedFiles.filter(f => f.status === 'pending' || f.status === 'uploading').length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {stagedFiles.map(uploadableFile => (
                <div key={uploadableFile.id} className="flex items-center p-3 border rounded-md bg-background_alt dark:bg-background_alt_dark shadow-sm">
                  <FileText className="w-8 h-8 mr-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-medium truncate" title={uploadableFile.file.name}>
                      {uploadableFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadableFile.file.size)}
                      {uploadableFile.status === 'error' && uploadableFile.error && (
                        <span className="ml-2 text-red-500">{uploadableFile.error}</span>
                      )}
                    </p>
                    {(uploadableFile.status === 'uploading' || uploadableFile.status === 'success') && (
                      <Progress value={uploadableFile.progress} className="h-2 mt-1" />
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {uploadableFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(uploadableFile.id)}
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    {uploadableFile.status === 'uploading' && (
                      <span className="text-xs text-blue-500">Uploading...</span>
                    )}
                    {uploadableFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {uploadableFile.status === 'error' && (
                       <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {stagedFiles.some(f => f.status === 'pending') && (
              <Button onClick={handleUploadAll} className="w-full" disabled={stagedFiles.every(f => f.status !== 'pending')}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload All Pending
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploadArea;