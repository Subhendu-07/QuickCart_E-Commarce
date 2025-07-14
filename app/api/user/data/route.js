import { getAuth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; 
import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    console.log("👉 Clerk userId:", userId);

    await connectDB();

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId); 

      user = await User.create({
        clerkId: userId,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`,
        email: clerkUser.emailAddresses[0].emailAddress,
        imageUrl: clerkUser.imageUrl,
        cartItems: {}
      });

      console.log("✅ User created in MongoDB:", user);
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
