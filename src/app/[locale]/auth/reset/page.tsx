'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PasswordResetScreen } from '@/components/auth/PasswordResetScreen'

export default function ResetPage() {
  return (
    <div className="flex flex-col min-h-full bg-surface-base">
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl
                      border-b border-border-default px-4 pt-14 pb-4 flex items-center gap-3">
        <Link href="/auth/signin" className="p-2 -ml-2 text-content-secondary hover:text-content-primary">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-content-primary">Reset password</h1>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <PasswordResetScreen />
      </div>
    </div>
  )
}
