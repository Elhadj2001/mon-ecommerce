// prisma/seed.ts
import { PrismaClient } from '@prisma/client' // <--- On utilise 'import' maintenant

const prisma = new PrismaClient()

async function main() {
  // On nettoie la base de données pour éviter les doublons
  try {
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    console.log('🧹 Base de données nettoyée')
  } catch (error) {
    // Si c'est la première fois, les tables peuvent être vides, on ignore l'erreur
    console.log('Première initialisation...')
  }

  // 1. Créer une catégorie
  const category = await prisma.category.create({
    data: {
      name: 'Vêtements',
    },
  })

  // 2. Créer des produits
  await prisma.product.createMany({
    data: [
      {
        name: 'T-shirt Basique',
        description: 'Un t-shirt en coton bio de haute qualité.',
        price: 25.00,
        stock: 100,
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
        categoryId: category.id,
        isFeatured: true,
      },
      {
        name: 'Jean Slim',
        description: 'Coupe moderne et tissu confortable.',
        price: 49.99,
        stock: 50,
        images: ['https://images.unsplash.com/photo-1542272617-08f086303294?auto=format&fit=crop&w=800&q=80'],
        categoryId: category.id,
      },
      {
        name: 'Veste en Jean',
        description: 'Style rétro indémodable.',
        price: 89.99,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80'],
        categoryId: category.id,
      },
    ],
  })

  console.log('🌱 3 Produits ajoutés avec succès !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })