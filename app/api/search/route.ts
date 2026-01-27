import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } }
        ],
      },
      take: 8, // On limite pour la performance
      include: {
        category: true
      }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}