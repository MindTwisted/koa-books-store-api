const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');

const cartSchema = mongoose.Schema(
    {
        count: {
            type: Number,
            required: [true, 'This field is required.'],
            min: [1, 'This field can not be less than 1.'],
            validate: {
                validator(v) {
                    return validator.isInt(String(v));
                },
                message: 'This field should be a valid integer.',
            },
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'book',
            required: [true, 'This field is required.'],
            validate: {
                async validator(v) {
                    const book = await mongoose.model('book').findById(v);

                    if (!book) {
                        return false;
                    }

                    return true;
                },
                message: props => `Book with id '${props.value}' does not exist.`,
            },
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: [true, 'This field is required.'],
            validate: {
                async validator(v) {
                    const user = await mongoose.model('user').findById(v);

                    if (!user) {
                        return false;
                    }

                    return true;
                },
                message: props => `User with id '${props.value}' does not exist.`,
            },
        },
    },
    {
        collection: 'cart',
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.user;
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;

                return ret;
            },
        },
    },
);

cartSchema.index({ user: 1, book: 1 }, { unique: true });

cartSchema.plugin(uniqueValidator, {
    message: 'This book is already exists in the cart of current user.',
});

const Cart = mongoose.model('cart', cartSchema);

module.exports = Cart;
