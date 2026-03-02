// src/auth/index.ts
export type { AuthUser, AuthStateName, AuthProviderType } from './types'
export { useAuthStore } from './authStore'
export { useAuth } from './useAuth'
export { useRequireAuth } from './useRequireAuth'
export { AuthProvider } from './AuthProvider'
export { AuthGate } from './AuthGate'
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  signOut,
  sendPasswordReset,
  resendVerificationEmail,
  linkAuthProvider,
  mapFirebaseUser,
  getAuthErrorMessage,
  isMobileOrPWA,
  handlePostAuthMigration,
} from './authService'
