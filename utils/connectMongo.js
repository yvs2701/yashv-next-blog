import mongoose from 'mongoose'

const connectMongo = () => {
    if (mongoose.connection.readyState === 1) // DB is already connected
        return mongoose.connection
    // else
    return mongoose.connect(process.env.MONGO_URI)
}

export default connectMongo
