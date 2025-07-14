import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true }, // Clerk user ID
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    imageUrl: { type: String, required: true },
    cartItems: { type: Object, default: {} }
  },
  { minimize: false }
);

// Capital "User" is conventional
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
