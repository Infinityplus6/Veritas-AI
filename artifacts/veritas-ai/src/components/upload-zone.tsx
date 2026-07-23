import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onImageSelect: (base64: string, file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onImageSelect, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageSelect(base64, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile, disabled]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div
      data-testid="upload-zone"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-12 transition-all duration-200',
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <input
        data-testid="input-file"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-1">
            Drop an image here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse your files
          </p>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          PNG, JPG, WebP up to 10MB
        </p>
      </div>
    </div>
  );
}
