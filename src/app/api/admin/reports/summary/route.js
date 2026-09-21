import { NextResponse } from 'next/server'
import { AdminService } from '@/server/services/admin-service'
import { requireAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    await requireAdmin()
    const summary = await AdminService.getReportsSummary()
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching reports:', error)
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
