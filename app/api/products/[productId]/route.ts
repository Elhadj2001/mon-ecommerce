import { NextResponse } from "next/server";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productUpdateSchema } from "@/lib/validations/product";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    if (!productId) return new NextResponse("Product ID required", { status: 400 });

    const parsed = productUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation', issues: z.flattenError(parsed.error) },
        { status: 400 },
      );
    }
    const {
      name, price, originalPrice, categoryId, images, colors, sizes,
      isFeatured, isArchived, isFreeShipping, description, stock, gender,
    } = parsed.data;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name ?? undefined,
        price: price !== undefined ? Number(price) : undefined,
        originalPrice: originalPrice !== undefined && originalPrice !== null ? Number(originalPrice) : undefined,
        categoryId: categoryId ?? undefined,
        colors: colors ?? undefined,
        sizes: sizes ?? undefined,
        description: description ?? undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        gender: gender ?? undefined,
        isFeatured: isFeatured ?? undefined,
        isArchived: isArchived ?? undefined,
        isFreeShipping: isFreeShipping ?? undefined,
        images: images && images.length > 0 ? {
          deleteMany: {},
          createMany: {
            data: images.map((image) => ({
              url: image.url,
              color: image.color ?? null,
            })),
          },
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
  try {
    const { productId } = await params;
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

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