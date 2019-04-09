const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [6, 'This field should be at least 6 characters long.'],
        },
        email: {
            type: String,
            required: [true, 'This field is required.'],
            unique: true,
            validate: {
                validator(v) {
                    return validator.isEmail(v);
                },
                message: 'This field should be a valid email.',
            },
        },
        password: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [6, 'This field should be at least 6 characters long.'],
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        discount: {
            type: Number,
            min: 0,
            max: 50,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.password;
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;

                return ret;
            },
        },
    },
);

userSchema.plugin(uniqueValidator, {
    message: 'This {PATH} is already exists.',
});

userSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;

    return next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
