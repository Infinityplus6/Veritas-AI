import { useListSamples } from '@workspace/api-client-react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleSelectorProps {
  onSampleSelect: (imageUrl: string) => void;
  disabled?: boolean;
}

export function SampleSelector({ onSampleSelect, disabled }: SampleSelectorProps) {
  const { data: samples, isLoading } = useListSamples();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!samples || samples.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Or try a sample image
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {samples.map((sample) => (
          <button
            key={sample.id}
            data-testid={`sample-${sample.id}`}
            onClick={() => onSampleSelect(sample.url)}
            disabled={disabled}
            className={cn(
              'relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200',
              'hover:border-primary hover:scale-105',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              disabled && 'opacity-50 pointer-events-none'
            )}
          >
            <img
              src={sample.url}
              alt={`Sample ${sample.id}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
              <span className="text-xs font-mono text-white/90">
                {sample.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
