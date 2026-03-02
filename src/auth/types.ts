// src/auth/types.ts
// Auth domain types — kept separate from the main types barrel so the auth
// module can be imported without pulling in all GTD types.

export type AuthProviderType = 'email' | 'google.com' | 'apple.com'

/**
 * States in the auth state machine.
 *
 * ANONYMOUS            — no Firebase session; local-only mode
 * SIGNING_UP           — createUserWithEmailAndPassword in flight
 * SIGNING_IN           — signInWith* in flight
 * EMAIL_VERIFICATION_PENDING — email/password signup done; awaiting verification
 * AUTHENTICATED        — Firebase session active
 * SIGNING_OUT          — signOut in flight
 * LINKING_PROVIDER     — linkWithPopup/Redirect in flight
 * DELETING_ACCOUNT     — account deletion requested, in cooling period or executing
 * AUTH_ERROR           — last operation failed; stays until user retries
 */
export type AuthStateName =
  | 'ANONYMOUS'
  | 'SIGNING_UP'
  | 'SIGNING_IN'
  | 'EMAIL_VERIFICATION_PENDING'
  | 'AUTHENTICATED'
  | 'SIGNING_OUT'
  | 'LINKING_PROVIDER'
  | 'DELETING_ACCOUNT'
  | 'AUTH_ERROR'

/** Normalised user object — Firebase-agnostic shape exposed to the app */
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  /** Provider IDs currently linked to this account */
  providers: AuthProviderType[]
}

export interface AuthStoreState {
  user: AuthUser | null
  authState: AuthStateName
  /** Last auth error message, user-facing string */
  error: string | null
  /** True until the first onAuthStateChanged fires after mount */
  isLoading: boolean
  /**
   * Permanent local UUID that exists before and after authentication.
   * Stored in localStorage['ltd-anon-id'] as offline identity fallback.
   */
  anonId: string | null
}

export interface AuthStoreActions {
  setUser: (user: AuthUser | null) => void
  setAuthState: (state: AuthStateName) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setAnonId: (id: string) => void
}
