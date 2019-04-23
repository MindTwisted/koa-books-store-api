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
        image: {
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
                validate: {
                    async validator(v) {
                        const author = await mongoose.model('author').findById(v);

                        if (!author) {
                            return false;
                        }

                        return true;
                    },
                    message: props => `Author with id '${props.value}' does not exist.`,
                },
            },
        ],
        genres: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'genre',
                validate: {
                    async validator(v) {
                        const genre = await mongoose.model('genre').findById(v);

                        if (!genre) {
                            return false;
                        }

                        return true;
                    },
                    message: props => `Genre with id '${props.value}' does not exist.`,
                },
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
