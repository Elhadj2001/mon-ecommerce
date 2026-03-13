import { NextResponse } from 'next/server'

// Route webhook placeholder — à implémenter si nécessaire
export async function POST() {
  return NextResponse.json({ received: true }, { status: 200 })
}
