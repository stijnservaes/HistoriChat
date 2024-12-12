import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 5 },
  clerkId: { type: String, required: true },
  dailyInvocations: { type: Number, required: true, default: 0 },
  maxAllowedInvocations: { type: Number, required: true, default: 20 },
});

const messageSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    byUser: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
export const Message = mongoose.model("Message", messageSchema);
