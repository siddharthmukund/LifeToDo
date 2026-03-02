import { WifiOff } from 'lucide-react';

interface Props { feature?: string; }

export function AIOfflineNotice({ feature = 'AI features' }: Props) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-content-muted">
      <WifiOff className="w-3.5 h-3.5" />
      <span>{feature} require internet connection</span>
    </div>
  );
}
