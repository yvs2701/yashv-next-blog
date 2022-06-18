import connectDB from "../../../../utils/connectMongo";
import User from "../../../../models/userModel";

const verifyUser = async (req, res) => {
    try {
        console.log('CONNECTING TO MONGO...')
        await connectDB()
        console.log('CONNECTED TO MONGO.')

        // verifying user
        User.findOne({ token: req.query.token }, async (err, user) => {
            if (err)
                res.status(500).send(err)
            else if (user == null) // user is null varibale (no such user found)
                res.status(404).send()
            else {
                await User.findByIdAndUpdate(user._id, { verified: true }).exec()
                console.log("Verified user: " + user._id)
                res.status(200).send("User verified!")
            }
        })

    } catch (err) {
        console.error(err)
        res.status(500).send(err)
    }
}

export default verifyUser
