import { renderHook, act } from '@testing-library/react'
import { useInbox } from '@/hooks/useInbox'
import { db } from '@/lib/db'

beforeEach(async () => {
  await db.inbox_items.clear()
})

test('inbox filters reduce list', async () => {
  await db.inbox_items.add({
    id: 'x', text: 'test', capturedAt: new Date(), source: 'text', status: 'raw', syncStatus: 'local',
    nlpMetadata: { dueDate: null, projects: [], contexts: ['ctx-phone'] }
  })
  const { result } = renderHook(() => useInbox())
  // initial load via explicit refresh (hook uses loadInbox internally)
  await act(async () => { await result.current.refresh() })
  act(() => result.current.setFilter('contextId','ctx-phone'))
  await act(async () => { await result.current.refresh() })
  expect(result.current.items.length).toBe(1)
})
