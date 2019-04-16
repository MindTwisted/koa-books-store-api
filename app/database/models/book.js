const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const bookSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [6, 'This field should be at least 6 characters long.'],
            unique: true,
        },
        description: {
            type: String,
            required: [true, 'This field is required.'],
            minlength: [20, 'This field should be at least 20 characters long.'],
        },
        imagePath: {
            type: String,
            default: null,
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
        },
        authors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'author',
            },
        ],
        genres: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'genre',
            },
        ],
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

bookSchema.plugin(uniqueValidator, {
    message: 'This {PATH} is already exists.',
});

const Book = mongoose.model('book', bookSchema);

module.exports = Book;
