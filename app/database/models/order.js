const mongoose = require('mongoose');
const validator = require('validator');

const orderSchema = mongoose.Schema(
    {
        status: {
            type: String,
            required: [true, 'This field is required.'],
            enum: ['in_progress', 'done'],
            default: 'in_progress',
        },
        totalDiscount: {
            type: Number,
            required: [true, 'This field is required.'],
            min: [0, 'This field can not be less than 0.'],
        },
        totalPrice: {
            type: Number,
            required: [true, 'This field is required.'],
            min: [0, 'This field can not be less than 0.'],
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
        paymentType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'paymentType',
            required: [true, 'This field is required.'],
            validate: {
                async validator(v) {
                    const paymentType = await mongoose.model('paymentType').findById(v);

                    if (!paymentType) {
                        return false;
                    }

                    return true;
                },
                message: props => `PaymentType with id '${props.value}' does not exist.`,
            },
        },
        details: {
            user: {
                name: {
                    type: String,
                    required: [true, 'This field is required.'],
                    minlength: [6, 'This field should be at least 6 characters long.'],
                },
                email: {
                    type: String,
                    required: [true, 'This field is required.'],
                    validate: {
                        validator(v) {
                            return validator.isEmail(v);
                        },
                        message: 'This field should be a valid email.',
                    },
                },
                discount: {
                    type: Number,
                    min: [0, 'This field can not be less than 0.'],
                    max: [50, 'This field can not be greater than 50.'],
                    required: [true, 'This field is required.'],
                    validate: {
                        validator(v) {
                            return validator.isInt(String(v));
                        },
                        message: 'This field should be a valid integer.',
                    },
                    default: 0,
                },
            },
            books: [
                {
                    title: {
                        type: String,
                        required: [true, 'This field is required.'],
                        minlength: [6, 'This field should be at least 6 characters long.'],
                    },
                    price: {
                        type: Number,
                        required: [true, 'This field is required.'],
                        min: [0, 'This field can not be less than 0.'],
                    },
                    discount: {
                        type: Number,
                        required: [true, 'This field is required.'],
                        min: [0, 'This field can not be less than 0.'],
                        max: [50, 'This field can not be greater than 50.'],
                        validate: {
                            validator(v) {
                                return validator.isInt(String(v));
                            },
                            message: 'This field should be a valid integer.',
                        },
                        default: 0,
                    },
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
                },
            ],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                delete ret.createdAt;
                delete ret.updatedAt;
                delete ret.__v;

                return ret;
            },
        },
    },
);

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
