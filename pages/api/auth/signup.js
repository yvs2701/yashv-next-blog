import connectDB from '../../../utils/connectMongo'
import User from '../../../models/userModel'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

const handler = async (req, res) => {
    if (req.method === 'POST') {
        try {
            console.log('CONNECTING TO MONGO...')
            connectDB()
            console.log('CONNECTED TO MONGO.')

            console.log('CREATING USER...')
            // + prefixed before the environment variables convertes string to integer
            bcrypt.hash(req.body.password, +process.env.SALT_ROUNDS, (err, hash) => {
                if (err)
                    throw new Error(err)
                else {
                    req.body.password = hash
                    req.body.token = crypto.createHash("md5").update((Date.now() + Math.random()).toString(32)).digest("hex")
                    console.log("User password hashed and token generated.")

                    const user = new User(req.body)
                    user.save().then(async user => {
                        console.log('INSERTED A USER.')
                        // send an email after registering the user
                        const OAuth2Client = new google.auth.OAuth2(process.env.Oauth_Id, process.env.Oauth_Secret, process.env.Oauth_Redirect_URI)
                        OAuth2Client.setCredentials({ refresh_token: process.env.Oauth_Refresh_Token })
                        const accessToken = await OAuth2Client.getAccessToken()

                        let transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                type: 'OAuth2',
                                user: process.env.EMAILER,
                                clientId: process.env.Oauth_Id,
                                clientSecret: process.env.Oauth_Secret,
                                refreshToken: process.env.Oauth_Refresh_Token,
                                accessToken: accessToken
                            },
                        });

                        await transporter.sendMail({
                            from: "Yashv-Next-Blog", // sender address
                            to: user.email, // email has already been validated as validator runs before pre('save')
                            subject: "Yashv-Next-Blog | Registration confirmation", // Subject line
                            text: `Confirm your registeration at http://localhost:3000/api/auth/activate/${user.token}`, // plain text body
                            html:
                                `<html>
                                <body>
                                    <h3 
                                        style="
                                            padding-top: 30px;
                                            padding-bottom: 10px;
                                            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;"
                                    >
                                        Hi ${user.username},
                                        <br/>
                                        To continue to our blogs, there's only one last step left!
                                    </h3>
                                    <a 
                                        href="http://localhost:3000/api/auth/activate/${user.token}" 
                                        style="
                                            background-color: rgb(0, 0, 0);
                                            color: rgb(255, 255, 255);
                                            padding: 15px 20px;
                                            font-size: 0.875rem;
                                            border-radius: 3px; 
                                            color: white;
                                            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                                            font-weight: 500;
                                            line-height: 1.75;
                                            letter-spacing: 0.02857em;
                                            text-transform: uppercase;
                                            text-decoration: none;
                                            margin-top: 50px;
                                            margin-bottom: 50px"
                                    >
                                        Confirm your registration
                                    </a>
                                    <br><br><br>
                                    <small>This email is automatic, please do not answer it.</small>
                                </body>
                            </html>`,
                        });
                        res.status(201).json({ success: true })
                    }).catch((err) => {
                        console.error(err)
                        if (err.code == 11000) // duplicate User fields
                            res.status(409).json({ success: false, message: `${Object.keys(err.keyValue)[0]} already exists`, error: err }) // error 409, conflict: Resource ALREADY EXISTS or is of older version
                        else
                            res.status(500).json({ success: false, message: "Some error occured!", error: err })
                    })
                }
            })
        } catch (err) {
            console.error(err);
            res.status(502).json({ success: false, message: "Some error occured!", error: err });
        }
    } else {
        res.status(405).send({ success: false, message: "Cannot sign up using \'GET\'" })
    }
}

export default handler
