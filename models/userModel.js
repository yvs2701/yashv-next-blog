import { Schema, model, models } from 'mongoose'

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "No username specified!"],
        unique: [true, "The username has already been taken!"]
    },
    email: {
        type: String,
        required: [true, "No email specified!"],
        unique: [true, "The email has already been registered!"],
        validate: {
            validator: (mail_addr) => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail_addr),
            message: (props) => `email address: ${props.path} is either invalid or looks dangerous.`
        }
    },
    password: {
        type: String,
        required: [true, "No password entered!"]
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

const User = models.User || model('User', userSchema)
export default User
