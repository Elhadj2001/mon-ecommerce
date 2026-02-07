import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    // 1. Récupération des paramètres (Next.js 15)
    const { productId } = await params;
    
    // 2. Authentification
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });

    // 3. Récupération du body
    const body = await req.json();

    // 4. Déstructuration
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

    if (!productId) return new NextResponse("Product ID required", { status: 400 });

    // --- CORRECTION MAJEURE ICI ---
    // On a supprimé les lignes "if (!name)..." qui bloquaient la mise à jour partielle du stock.
    // Désormais, on prépare la mise à jour en vérifiant ce qui est présent.

    // 5. Mise à jour transactionnelle intelligente
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        // Champs scalaires : on ne met à jour que si la valeur est fournie (non undefined)
        name: name || undefined,
        price: price ? Number(price) : undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryId: categoryId || undefined,
        colors: colors || undefined,
        sizes: sizes || undefined,
        description: description || undefined,
        
        // Pour le stock, on vérifie "undefined" car 0 est une valeur valide
        stock: stock !== undefined ? Number(stock) : undefined,
        
        gender: gender || undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        isArchived: isArchived !== undefined ? isArchived : undefined,

        // GESTION DES IMAGES
        // On ne touche aux images que si un tableau 'images' est envoyé dans le body.
        // Si on change juste le stock, 'images' est undefined, donc ce bloc est ignoré.
        images: (images && images.length > 0) ? {
          deleteMany: {}, // Supprime les anciennes
          createMany: {   // Crée les nouvelles
            data: [
                ...images.map((image: { url: string; color?: string }) => ({
                    url: image.url,
                    color: image.color || null
                }))
            ]
          }
        } : undefined,
      },
    });

    return NextResponse.json(updatedProduct);
    
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// --- MÉTHODE DELETE (Standard) ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!productId) return new NextResponse("Product id is required", { status: 400 });

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

// --- MÉTHODE GET (Standard) ---
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