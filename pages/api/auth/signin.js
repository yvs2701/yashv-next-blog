import jsonwebtoken from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../../../models/userModel'
import connectDB from '../../../utils/connectMongo'

const signin = async (req, res, next) => {
    if (req.method === 'GET') {
        if (req.body.hasOwnProperty('token')) {
            if (req.body.token && req.body.hasOwnProperty('jwt')) {
                // user has sent a jwt
                return new Promise((resolve, reject) => {
                    try {
                        jsonwebtoken.verify(req.body.jwt, process.env.SECRET, async (err, user) => {
                            if (err && err.name === 'TokenExpiredError')
                                res.status('400').send({ success: false, message: "Token has expired. Please login with credentials!", error: err })
                            else if (err)
                                res.status('400').send({ success: false, error: err })
                            else {
                                const matching = await matchPsswd(user)
                                res.status(200).send(matching)
                            }
                            resolve()
                        })
                    } catch (err) {
                        res.status(500).send({ success: false, message: "Some error occured !", error: err })
                        resolve()
                    }
                })
            } else if (req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')) {
                try {
                    const matching = await matchPsswd(req.body)
                    if (matching.success && req.body.hasOwnProperty('rememberme') && req.body.rememberme) {
                        const payload = { username: req.body.username, password: req.body.password }
                        matching.jwt = jsonwebtoken.sign(payload, process.env.SECRET, { expiresIn: '28d' })
                    }
                    res.status(200).send({ matching })
                } catch (err) {
                    res.status(500).send({ success: false, message: "Some error occured !", error: err })
                }
            }
            else res.status(400).send({ success: false, message: "Username and/or password or token is missing!" })
        } else res.status(400).send({ success: false, message: "token field required in request" })
    } else res.status(405).send({ success: false, message: "Cannot sign up using \'POST\'" })
}

const matchPsswd = async (user) => {
    console.log('CONNECTING TO MONGO...')
    connectDB()
    console.log('CONNECTED TO MONGO.')

    try {
        const result = await User.findOne({ username: user.username }, 'password verified').exec()
        if (result == null)
            return { success: false, message: "No such user exists." } // no such user exists
        else if (!result.verified)
            return { success: false, message: "User email has not been verified." }

        const matches = await bcrypt.compare(user.password, result.password)
        if (matches)
            return { success: true, message: "User authenticated!" }
        return { success: false, message: "Invalid username or password!" }
    }
    catch (err) {
        throw new Error(err)
    }
}

export default signin
