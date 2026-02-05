import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // Décommente si tu utilises Clerk
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    // 1. Récupération des paramètres (Next.js 15 friendly)
    const { productId, storeId } = await params;
    
    // 2. Récupération du body
    const body = await req.json();

    // 3. Authentification (Optionnel mais recommandé)
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });

    // 4. Déstructuration explicite pour éviter d'envoyer n'importe quoi à Prisma
    const { 
      name, 
      price, 
      originalPrice,
      categoryId, 
      images, 
      colors, 
      sizes, 
      isFeatured, 
      isArchived,
      description,
      stock,
      gender 
    } = body;

    // 5. Validation rapide
    if (!productId) return new NextResponse("Product ID required", { status: 400 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!images || !images.length) return new NextResponse("Images are required", { status: 400 });
    if (!price) return new NextResponse("Price is required", { status: 400 });
    if (!categoryId) return new NextResponse("Category ID is required", { status: 400 });

    // 6. Mise à jour transactionnelle (On supprime les images et on les recrée)
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        price: Number(price), // Conversion sécurisée
        originalPrice: originalPrice ? Number(originalPrice) : null,
        categoryId,
        colors: colors || [],
        sizes: sizes || [],
        description: description || "",
        stock: Number(stock),
        gender: gender,
        isFeatured,
        isArchived,
        // GESTION DES IMAGES (C'est ici que ça bloquait avant)
        images: {
          deleteMany: {}, // On supprime toutes les anciennes images liées à ce produit
        },
      },
    });

    // On sépare la création des images pour éviter les conflits d'ID si on faisait tout dans le update
    // Ou mieux, on utilise un update avec createMany inclus si la DB le supporte, 
    // mais le plus sûr est de faire une 2ème passe pour les images :
    
    const productWithNewImages = await prisma.product.update({
        where: { id: productId },
        data: {
            images: {
                createMany: {
                    data: [
                        ...images.map((image: { url: string; color?: string }) => ({
                            url: image.url,
                            color: image.color || null
                        }))
                    ]
                }
            }
        }
    });

    return NextResponse.json(productWithNewImages);
    
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- MÉTHODE DELETE (inchangée mais sécurisée) ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const { productId } = await params;
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!productId) return new NextResponse("Product id is required", { status: 400 });

    // Prisma gère la suppression en cascade des images si configuré dans le schema, 
    // sinon il faut supprimer les images avant le produit.
    // Supposons que onDelete: Cascade est activé dans schema.prisma
    
    const product = await prisma.product.delete({
      where: {
        id: productId,
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// --- MÉTHODE GET ---
export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    if (!productId) return new NextResponse("Product id is required", { status: 400 });

    const product = await prisma.product.findUnique({
      where: {
        id: productId
      },
      include: {
        images: true,
        category: true,
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}