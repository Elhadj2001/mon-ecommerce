import { NextResponse } from 'next/server'

// Ce point d'entrée redirige vers /api/checkout/custom
// Gardé ici pour éviter les erreurs 404 sur d'éventuels anciens appels
export async function POST() {
  return NextResponse.json(
    { error: "Utilisez /api/checkout/custom pour les nouvelles commandes." },
    { status: 308 }
  )
}
