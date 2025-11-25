import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://shivam_21:shivam2089@cluster0.jkq6lu9.mongodb.net/RushBasket').then(() => console.log("DB Connected"))
} 