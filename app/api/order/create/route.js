import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User"; 
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request); // Clerk user ID
    const { address, items } = await request.json();

    if (!address || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid address or cart items" });
    }

    // Calculate total amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json({ success: false, message: `Product not found for ID: ${item.product}` });
      }
      amount += product.offerPrice * item.quantity;
    }

    const totalAmount = amount + Math.floor(amount * 0.02);

    
    await Order.create({
      userId,         
      address,        
      items,          
      amount: totalAmount,
      date: new Date()
    });

    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items,
        amount: totalAmount,
        date: Date.now()
      }
    });


    const user = await User.findOne({ userId }); 
    if (user) {
      user.cartItems = {};
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Order Placed Successfully" });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Server Error" });
  }
}
