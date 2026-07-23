import { useEffect } from 'react';
import { Loader2, Cpu } from 'lucide-react';
import {
  useGetModelStatus,
  getGetModelStatusQueryKey,
} from '@workspace/api-client-react';

interface ModelWarmingProps {
  onReady: () => void;
}

export function ModelWarming({ onReady }: ModelWarmingProps) {
  const { data: status, isLoading } = useGetModelStatus({
    query: {
      queryKey: getGetModelStatusQueryKey(),
      refetchInterval: (query) => {
        const data = query.state.data;
        return data?.ready ? false : 1000;
      },
    },
  });

  useEffect(() => {
    if (status?.ready) {
      onReady();
    }
  }, [status?.ready, onReady]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center relative">
          <Cpu className="w-10 h-10 text-primary" />
          <Loader2 className="w-24 h-24 animate-spin text-primary/30 absolute" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Initializing model
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Connecting to server...' : status?.message || 'Warming up the CNN...'}
          </p>
        </div>

        <div className="pt-4">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse w-2/3" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          This may take a few moments on first launch
        </p>
      </div>
    </div>
  );
}
