import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = await req.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';

    if (!name || name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Nom invalide (2-80 caractères)" }, { status: 400 });
    }

    const category = await prisma.category.create({ data: { name } });
    return NextResponse.json(category);
  } catch (error) {
    logger.error('[CATEGORIES_POST]', error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(categories);
  } catch (error) {
    logger.error('[CATEGORIES_GET]', error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
