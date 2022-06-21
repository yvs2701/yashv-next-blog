import jsonwebtoken from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../../../models/userModel'
import connectDB from '../../../utils/connectMongo'

const matchPsswd = async (user) => {
    console.log('CONNECTING TO MONGO...')
    connectDB()
    console.log('CONNECTED TO MONGO.')

    try {
        let result = await User.findOne({ username: user.username })
            .select({ _id: 0, __v: 0, token: 0, createdAt: 0, updatedAt: 0 })
            .lean() // lean() returns plain javascript object result
        if (result == null)
            return { success: false, message: "No such user exists." } // no such user exists
        else if (!result.verified)
            return { success: false, message: "User email has not been verified." }

        const matches = await bcrypt.compare(user.password, result.password)
        if (matches) {
            // end user must not see this data
            delete result.password
            delete result.verified
            return { success: true, message: "User authenticated!", user: result }
        } // else
        return { success: false, message: "Invalid username or password!" }
    } catch (err) {
        console.error(err)
        throw new Error(err)
    }
}

const signin = async (req, res) => {
    if (req.method === 'GET') {
        if (req.body.hasOwnProperty('jwt')) {
            // user has sent a jwt
            return new Promise((resolve, reject) => {
                try {
                    jsonwebtoken.verify(req.body.jwt, process.env.SECRET, async (err, user) => {
                        if (err && err.name === 'TokenExpiredError')
                            res.status('400').send({ success: false, message: "Token has expired. Please login with credentials!", error: err })
                        else if (err)
                            res.status('400').send({ success: false, error: err })
                        else {
                            try {
                                const matching = await matchPsswd(user)
                                res.status(200).send(matching)
                            } catch (e) {
                                console.error(err)
                                res.status(500).send({ success: false, message: "Some error occured !", error: e })
                                resolve()
                            }
                        }
                        resolve()
                    })
                } catch (err) {
                    console.error(err)
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
                res.status(200).send(matching)
            } catch (err) {
                console.error(err)
                res.status(500).send({ success: false, message: "Some error occured !", error: err })
            }
        }
        else res.status(400).send({ success: false, message: "Username and/or password or token is missing!" })
    } else res.status(405).send({ success: false, message: "Cannot sign up using \'POST\'" })
}

export default signin
