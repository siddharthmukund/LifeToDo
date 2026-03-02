'use client';
import { useState } from 'react';
import { FileText } from 'lucide-react';
import { ContentDraftSheet } from './ContentDraftSheet';
import { useAI } from '../useAI';

interface Props {
  taskTitle: string;
  userRole?: string;
  isADHDMode?: boolean;
  size?: 'sm' | 'md';
}

export function DraftButton({ taskTitle, userRole, isADHDMode = false, size = 'sm' }: Props) {
  const { isAvailable } = useAI();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAvailable) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Draft with AI"
        className={`
          flex items-center justify-center rounded-lg text-content-muted hover:text-primary hover:bg-primary/5 transition-colors
          ${size === 'sm' ? 'p-1.5' : 'p-2'}
        `}
      >
        <FileText className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </button>
      <ContentDraftSheet
        taskTitle={taskTitle}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userRole={userRole}
        isADHDMode={isADHDMode}
      />
    </>
  );
}
