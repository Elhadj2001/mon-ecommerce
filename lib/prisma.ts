// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // Affiche les requêtes SQL dans la console (utile pour apprendre)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma