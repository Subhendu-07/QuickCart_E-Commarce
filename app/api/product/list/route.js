import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const products = await Product.find({});
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("❌ Product fetch error:", error.message);
    return NextResponse.json({ success: false, message: error.message });
  }
}
