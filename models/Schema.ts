import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 5 },
  dailyInvocations: { type: Number, required: true },
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


