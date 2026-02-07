import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { productId } = await params;
    const { userId } = await auth();
    
    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });

    const body = await req.json();
    const { 
      name, price, originalPrice, categoryId, images, colors, sizes, 
      isFeatured, isArchived, description, stock, gender 
    } = body;

    if (!productId) return new NextResponse("Product ID required", { status: 400 });

    // --- SECURITÉ SUPPLEMENTAIRE ---
    if (stock !== undefined && Number(stock) < 0) {
        return new NextResponse("Le stock ne peut pas être négatif", { status: 400 });
    }
    // ------------------------------

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name || undefined,
        price: price ? Number(price) : undefined,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        categoryId: categoryId || undefined,
        colors: colors || undefined,
        sizes: sizes || undefined,
        description: description || undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        gender: gender || undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
        isArchived: isArchived !== undefined ? isArchived : undefined,
        images: (images && images.length > 0) ? {
          deleteMany: {},
          createMany: {
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

// Laissez les méthodes DELETE et GET telles qu'elles étaient dans ma réponse précédente (elles étaient correctes).
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  /* ... Code inchangé ... */
  try {
    const { productId } = await params;
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!productId) return new NextResponse("Product id is required", { status: 400 });

    const product = await prisma.product.delete({
      where: { id: productId }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  /* ... Code inchangé ... */
  try {
    const { productId } = await params;

    if (!productId) return new NextResponse("Product id is required", { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, category: true }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}