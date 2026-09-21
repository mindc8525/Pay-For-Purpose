import { NextResponse } from 'next/server'
import { requireAuth, createClient } from '@/lib/supabase/server'
import { WinnerService } from '@/server/services/winner-service'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export async function POST(request, { params }) {
  try {
    const user = await requireAuth()
    const { id: winnerId } = await params

    const contentType = request.headers.get('content-type') || ''
    let proofUrl = ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'File exceeds maximum size of 5MB' },
          { status: 400 }
        )
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Allowed formats: JPEG, PNG, WebP, PDF' },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const base64Data = buffer.toString('base64')
      proofUrl = `data:${file.type};base64,${base64Data}`
    } else {
      const body = await request.json()
      if (!body.proof_url) {
        return NextResponse.json(
          { error: 'proof_url is required' },
          { status: 400 }
        )
      }
      proofUrl = body.proof_url
    }

    const updatedWinner = await WinnerService.uploadProof(winnerId, user.id, proofUrl)

    return NextResponse.json({
      success: true,
      winner: updatedWinner,
      message: 'Proof uploaded successfully. Pending admin review.',
    })
  } catch (error) {
    console.error('Error uploading proof:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Winner record not found or forbidden' }, { status: 404 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload proof' },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    const user = await requireAuth()
    const { id: winnerId } = await params
    const supabase = await createClient()

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'ADMIN'

    const { data: winner, error } = await supabase
      .from('winners')
      .select('id, user_id, proof_url, verification_status, payout_status, match_type, calculated_prize, created_at')
      .eq('id', winnerId)
      .single()

    if (error || !winner) {
      return NextResponse.json({ error: 'Winner record not found' }, { status: 404 })
    }

    // Only allow owner or admin
    if (winner.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      id: winner.id,
      proof_url: winner.proof_url,
      verification_status: winner.verification_status,
      payout_status: winner.payout_status,
      match_type: winner.match_type,
      calculated_prize: winner.calculated_prize,
    })
  } catch (error) {
    console.error('Error fetching proof:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to fetch proof' }, { status: 500 })
  }
}
