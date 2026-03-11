import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/mail";

export async function GET() {
    const result = await sendOrderEmail("votre.email@gmail.com", "TEST-12345", 5000);
    return NextResponse.json(result);
}