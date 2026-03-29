'use client'
import dynamic from 'next/dynamic'
import type { Review } from '@/types'

const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })

export function WeeklyReviewDashboard({ data }: { data: Review[] }) {
  const chartData = data.map(r => ({
    date: new Date(r.completedAt).toISOString().split('T')[0],
    items: r.itemsProcessed,
  }))

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Review history</h2>
      <BarChart width={320} height={180} data={chartData}>
        <XAxis dataKey="date" />
        <Bar dataKey="items" fill="var(--primary)" />
      </BarChart>
    </div>
  )
}
