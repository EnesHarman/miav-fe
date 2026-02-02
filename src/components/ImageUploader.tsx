import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { storageService } from '@/services/storage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  uploadedUrls: string[];
  onUrlsChange: (urls: string[]) => void;
  maxFiles?: number;
}

interface PreviewFile {
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

export function ImageUploader({ uploadedUrls, onUrlsChange, maxFiles = 5 }: ImageUploaderProps) {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      uploaded: false,
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    // Also remove from uploadedUrls if already uploaded
    const fileToRemove = files[index];
    if (fileToRemove.url) {
      onUrlsChange(uploadedUrls.filter((url) => url !== fileToRemove.url));
    }
  };

  const uploadAllFiles = async () => {
    const filesToUpload = files.filter((f) => !f.uploaded);
    if (filesToUpload.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [...uploadedUrls];

    for (let i = 0; i < files.length; i++) {
      if (files[i].uploaded) continue;

      setFiles((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], uploading: true };
        return updated;
      });

      try {
        const result = await storageService.uploadFile(files[i].file);
        newUrls.push(result.url);

        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploading: false, uploaded: true, url: result.url };
          return updated;
        });
      } catch (error) {
        console.error('Upload failed:', error);
        toast.error(`Failed to upload ${files[i].file.name}`);
        
        setFiles((prev) => {
          const updated = [...prev];
          updated[i] = { ...updated[i], uploading: false };
          return updated;
        });
      }
    }

    onUrlsChange(newUrls);
    setIsUploading(false);
    toast.success('Images uploaded successfully!');
  };

  const allUploaded = files.length > 0 && files.every((f) => f.uploaded);
  const pendingUploads = files.filter((f) => !f.uploaded).length;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'}
          ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Upload className="h-6 w-6 text-accent-foreground" />
          </div>
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the images here...</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop images here</p>
              <p className="text-sm text-muted-foreground">or click to select files</p>
            </>
          )}
          <p className="text-xs text-muted-foreground">
            {files.length}/{maxFiles} images
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={file.preview} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                <img
                  src={file.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {file.uploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                {file.uploaded && (
                  <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    ✓ Uploaded
                  </div>
                )}
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-2 right-2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                  Profile
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingUploads > 0 && (
        <Button onClick={uploadAllFiles} disabled={isUploading} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {pendingUploads} image{pendingUploads > 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}

      {allUploaded && (
        <p className="text-sm text-center text-primary font-medium">
          ✓ All images uploaded successfully
        </p>
      )}
    </div>
  );
}
