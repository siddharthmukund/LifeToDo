import { Modal } from '@/components/ui/Modal'
import { ClarifyFlow } from '@/components/clarify/ClarifyFlow'
import type { InboxItem, ClarifyDecision } from '@/types'

interface ClarifyModalProps {
  item: InboxItem | null
  onComplete: (decision: ClarifyDecision) => void
  onClose: () => void
}

export function ClarifyModal({ item, onComplete, onClose }: ClarifyModalProps) {
  return (
    <Modal open={!!item} onClose={onClose} className="max-w-md">
      {item && (
        <ClarifyFlow
          item={item}
          onComplete={onComplete}
          onSkip={onClose}
        />
      )}
    </Modal>
  )
}
