import { Loader2 } from 'lucide-react';

export function AnalyzingState() {
  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent animate-scan" />
      </div>
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-1">
            Analyzing image
          </p>
          <p className="text-sm text-muted-foreground font-mono">
            Running deepfake detection model...
          </p>
        </div>
      </div>
    </div>
  );
}
