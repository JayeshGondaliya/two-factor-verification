import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://jayeshgondaliya9929:Jayesh7574@cluster0.g3w2u.mongodb.net/two_factor_auth?retryWrites=true&w=majority&appName=Cluster0") ;
    console.log("mongodb connected from server");
  } catch (error) {
    console.log("❌ DB Connection Failed", error);
  }
};

export default connectDB;
