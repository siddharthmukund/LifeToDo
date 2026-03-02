// src/app/api/account/delete/route.ts
// Server-side: records a pending deletion in Firestore so it persists across devices.
// Mirrors the local Dexie record created by deletionService.scheduleAccountDeletion().
// D8 deliverable.
import { NextRequest, NextResponse } from 'next/server'

async function getAdminFirestore() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  if (!projectId) return null

  const admin = await import('firebase-admin')
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    })
  }
  return admin.firestore()
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const uid: string | undefined = body?.uid
  const scheduledDeletionAt: string | undefined = body?.scheduledDeletionAt

  if (!uid) {
    return NextResponse.json({ error: 'uid required' }, { status: 400 })
  }

  const firestore = await getAdminFirestore()
  if (firestore) {
    try {
      await firestore
        .collection('users').doc(uid)
        .collection('data').doc('deletion')
        .set({
          uid,
          requestedAt: new Date().toISOString(),
          scheduledDeletionAt: scheduledDeletionAt ?? null,
          status: 'pending',
        })
    } catch (err) {
      // Non-fatal — local Dexie record is the source of truth
      console.error('[account/delete] Firestore write failed:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
