import mongoose from "mongoose";


const ConnectDB = async () => {

    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("connected to MongoDB");
    } catch (error) {
        console.log(error);
    }
    
}

export default ConnectDB;