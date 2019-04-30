const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const paymentTypeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [6, 'This field should be at least 6 characters long.'],
            unique: true,
        },
    },
    {
        collection: 'payment_types',
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

paymentTypeSchema.plugin(uniqueValidator, {
    message: 'This {PATH} is already exists.',
});

const PaymentType = mongoose.model('paymentType', paymentTypeSchema);

module.exports = PaymentType;
