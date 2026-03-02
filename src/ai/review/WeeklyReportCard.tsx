'use client';
import { useState } from 'react';
import { BarChart2, Copy, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  report: string | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
}

export function WeeklyReportCard({ report, loading, error, onGenerate }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!report && !loading) {
    return (
      <button
        onClick={onGenerate}
        className="flex items-center gap-2 px-4 py-2.5 border border-border-default rounded-xl text-sm text-content-secondary hover:border-primary/40 hover:text-primary transition-colors"
      >
        <BarChart2 className="w-4 h-4" />
        Generate weekly report
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-content-primary">Weekly Report</span>
        </div>
        {report && (
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-content-muted hover:text-content-primary">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-content-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating your weekly review…
          </div>
        )}
        {error && <p className="text-sm text-status-danger">{error}</p>}
        {report && (
          <div
            className="prose prose-sm max-w-none text-content-primary"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(report) }}
          />
        )}
      </div>
    </div>
  );
}

// Minimal markdown-to-html (headers, bullets, bold)
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-sm mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-semibold text-base mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-bold text-lg mt-3 mb-1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 text-sm">$1</li>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
