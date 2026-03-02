// src/lib/firebase.ts
// Firebase app singleton — lazy-initialised, client-side only.
// Import `firebaseAuth` and `firestore` from here in 'use client' components.
// Never import this from server components or API routes.

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/**
 * True when all required Firebase environment variables are present.
 * When false, all auth operations degrade gracefully (local-only mode).
 */
export const FIREBASE_CONFIGURED = !!(
  firebaseConfig.apiKey && firebaseConfig.projectId
)

// Lazy singletons — only initialised once, reused across hot-reloads in dev
let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _firestore: Firestore | null = null

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app
  _app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
  return _app
}

/** Firebase Auth instance — client-side only */
export function getFirebaseAuth(): Auth {
  if (_auth) return _auth
  _auth = getAuth(getFirebaseApp())
  return _auth
}

/** Firestore instance — client-side only */
export function getFirebaseFirestore(): Firestore {
  if (_firestore) return _firestore
  _firestore = getFirestore(getFirebaseApp())
  return _firestore
}
