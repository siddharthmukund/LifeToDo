'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SignInScreen } from '@/components/auth/SignInScreen'

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-full bg-surface-base">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl
                      border-b border-border-default px-4 pt-14 pb-4 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 text-content-secondary hover:text-content-primary transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-content-primary">Sign in</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <div className="mb-8 text-center space-y-1">
          <p className="text-2xl font-bold text-content-primary">Welcome back</p>
          <p className="text-sm text-content-secondary">Your GTD data is waiting</p>
        </div>
        <SignInScreen />
      </div>
    </div>
  )
}
