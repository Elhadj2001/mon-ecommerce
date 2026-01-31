import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// Importe auth si tu utilises Clerk ou NextAuth pour sécuriser
// import { auth } from "@clerk/nextjs"; 

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // 1. On récupère l'ID du produit (Next.js 15 oblige à await params)
    const { productId } = await params;
    
    // 2. On récupère les données envoyées par le formulaire (ex: { stock: 50 })
    const body = await req.json();
    
    // Sécurité basique (facultatif mais recommandé)
    // const { userId } = auth();
    // if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    if (!productId) {
      return new NextResponse("Product ID required", { status: 400 });
    }

    // 3. Mise à jour dans la base de données
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        // On met à jour tout ce qui est envoyé (stock, prix, nom, etc.)
        ...body,
        // Conversion de sécurité si on envoie des nombres en string
        stock: body.stock ? Number(body.stock) : undefined,
        price: body.price ? Number(body.price) : undefined,
      },
    });

    return NextResponse.json(updatedProduct);
    
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Garde tes autres méthodes (GET, DELETE) en dessous si elles existent déjà...
export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
    // ... ton code GET existant
    // N'oublie pas d'ajouter "await params" ici aussi si ce n'est pas fait
    const { productId } = await params;
    
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: true, category: true }
    });
    
    return NextResponse.json(product);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
    // ... ton code DELETE existant
    const { productId } = await params;
    
    const product = await prisma.product.delete({
        where: { id: productId }
    });
    
    return NextResponse.json(product);
}