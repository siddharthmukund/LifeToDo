'use client'

import { EmailVerificationPrompt } from '@/components/auth/EmailVerificationPrompt'
import { AuthGate } from '@/auth/AuthGate'

export default function VerifyPage() {
  return (
    <div className="flex flex-col min-h-full bg-surface-base pt-14">
      <AuthGate>
        <EmailVerificationPrompt />
      </AuthGate>
    </div>
  )
}
