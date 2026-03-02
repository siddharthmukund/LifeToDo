import { Loader2, Sparkles } from 'lucide-react';

interface Props {
  message?: string;
  className?: string;
}

export function AILoadingIndicator({ message = 'AI is thinking…', className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2 text-sm text-content-muted ${className}`}>
      <div className="relative">
        <Sparkles className="w-4 h-4 text-primary" />
        <Loader2 className="w-3 h-3 animate-spin absolute -bottom-0.5 -right-0.5 text-primary" />
      </div>
      <span>{message}</span>
    </div>
  );
}
