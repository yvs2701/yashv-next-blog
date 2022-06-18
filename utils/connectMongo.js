import mongoose from 'mongoose'

const connectMongo = async () => {
    if (mongoose.connection.readyState === 1) // DB is already connected
        return mongoose.connection
    // else
    return await mongoose.connect(process.env.MONGO_URI)
}

export default connectMongo
